import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, push } from "firebase/database";

const envPath = path.resolve(process.cwd(), ".env.production");
if (!fs.existsSync(envPath)) {
  console.error(".env.production file not found");
  process.exit(1);
}

const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.error("Error loading .env.production:", envResult.error);
  process.exit(1);
}

const firebaseDbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
if (!firebaseDbUrl) {
  console.error(
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL not found in .env.production"
  );
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: firebaseDbUrl,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

type TaskRecord = Record<string, any>;
type TasksByDay = Record<string, TaskRecord[]>;

const createTaskId = (): string => {
  const key = push(ref(database, "meta/taskIds")).key;
  if (key) {
    return key;
  }
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const ensureIdsForTasksByDay = (
  tasksByDay: unknown
): { updated: boolean; data: TasksByDay; updatedCount: number } => {
  if (!tasksByDay || typeof tasksByDay !== "object" || Array.isArray(tasksByDay)) {
    return { updated: false, data: tasksByDay as TasksByDay, updatedCount: 0 };
  }

  let updated = false;
  let updatedCount = 0;
  const next: TasksByDay = {};

  for (const [day, list] of Object.entries(tasksByDay as TasksByDay)) {
    if (!Array.isArray(list)) {
      next[day] = list as TaskRecord[];
      continue;
    }

    let dayUpdated = false;
    const nextList = list.map((task) => {
      if (!task || typeof task !== "object") {
        return task;
      }
      const id = (task as TaskRecord).id;
      if (typeof id === "string" && id.trim() !== "") {
        return task;
      }
      dayUpdated = true;
      updatedCount += 1;
      return { ...task, id: createTaskId() };
    });

    if (dayUpdated) {
      updated = true;
    }
    next[day] = nextList;
  }

  return { updated, data: updated ? next : (tasksByDay as TasksByDay), updatedCount };
};

const backfillWeeks = async () => {
  const weeksSnapshot = await get(ref(database, "weeks"));
  if (!weeksSnapshot.exists()) {
    console.log("No weeks data found.");
    return { updatedWeeks: 0, updatedTasks: 0 };
  }

  const weeksData = weeksSnapshot.val() as Record<string, Record<string, TasksByDay>>;
  let updatedWeeks = 0;
  let updatedTasks = 0;

  for (const [year, weeks] of Object.entries(weeksData)) {
    if (!weeks || typeof weeks !== "object") {
      continue;
    }

    for (const [week, tasksByDay] of Object.entries(weeks)) {
      const { updated, data, updatedCount } = ensureIdsForTasksByDay(tasksByDay);
      if (!updated) {
        continue;
      }
      await set(ref(database, `weeks/${year}/${week}`), data);
      updatedWeeks += 1;
      updatedTasks += updatedCount;
      console.log(`Updated weeks/${year}/${week} (${updatedCount} task(s)).`);
    }
  }

  return { updatedWeeks, updatedTasks };
};

const backfillLegacyTasks = async () => {
  const tasksSnapshot = await get(ref(database, "tasks"));
  if (!tasksSnapshot.exists()) {
    return { updated: false, updatedTasks: 0 };
  }

  const { updated, data, updatedCount } = ensureIdsForTasksByDay(tasksSnapshot.val());
  if (!updated) {
    return { updated: false, updatedTasks: 0 };
  }

  await set(ref(database, "tasks"), data);
  console.log(`Updated tasks root (${updatedCount} task(s)).`);
  return { updated: true, updatedTasks: updatedCount };
};

const run = async () => {
  try {
    const weeksResult = await backfillWeeks();
    const legacyResult = await backfillLegacyTasks();
    const totalTasks = weeksResult.updatedTasks + legacyResult.updatedTasks;
    const totalWeeks = weeksResult.updatedWeeks;

    console.log(
      `Done. Updated ${totalTasks} task(s) across ${totalWeeks} week node(s).`
    );
  } catch (error) {
    console.error("Failed to backfill task ids:", error);
    process.exit(1);
  }
};

run();
