// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  runTransaction,
} from "firebase/database";

// Firebase config should come from NEXT_PUBLIC_* variables so the client bundle inlines them.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length > 0) {
  console.warn(
    `Missing Firebase env vars: ${missingConfigKeys.join(", ")}. ` +
      "Check your local .env files or Vercel Project → Settings → Environment Variables."
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Reference to tasks in the database
export const tasksRef = ref(database, "tasks");

// Helper function to save tasks to a specific path (e.g. "weeks/2024/52")
export const saveTasks = async (
  tasks: any,
  path: string = "tasks"
): Promise<boolean> => {
  try {
    // Firebase doesn't allow undefined values. We sanitize by removing them.
    const sanitizedTasks = JSON.parse(JSON.stringify(tasks));
    await set(ref(database, path), sanitizedTasks);
    return true;
  } catch (error) {
    console.error(`Error saving tasks to ${path}:`, error);
    return false;
  }
};

// Subscribe to task changes at a specific path
export const subscribeToTasks = (
  callback: (data: any) => void,
  path: string = "tasks"
) => {
  const targetRef = ref(database, path);
  return onValue(targetRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// Fetch tasks once from a specific path
export const fetchTasksOnce = async (
  path: string = "tasks"
): Promise<any | null> => {
  try {
    const snapshot = await get(ref(database, path));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error(`Error fetching tasks from ${path}:`, error);
    return null;
  }
};

const CARRY_OVER_META_PATH = "meta/lastCarryOverDate";

export const fetchLastCarryOverDate = async (): Promise<string | null> => {
  try {
    const snapshot = await get(ref(database, CARRY_OVER_META_PATH));
    return snapshot.exists() ? (snapshot.val() as string) : null;
  } catch (error) {
    console.error("Error fetching last carry-over date:", error);
    return null;
  }
};

export const advanceLastCarryOverDate = async (
  dateKey: string
): Promise<boolean> => {
  try {
    const metaRef = ref(database, CARRY_OVER_META_PATH);
    await runTransaction(metaRef, (current) => {
      if (!current || String(current) < dateKey) {
        return dateKey;
      }
      return current;
    });
    return true;
  } catch (error) {
    console.error("Error updating last carry-over date:", error);
    return false;
  }
};

// Helper to check for legacy tasks and migrate them
export const getLegacyTasks = async (): Promise<any | null> => {
  try {
    const snapshot = await get(ref(database, "tasks"));
    return snapshot.exists() ? snapshot.val() : null;
  } catch {
    return null;
  }
};

export { database };
