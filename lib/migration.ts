import { database, getUserPath } from "./firebase";
import { ref, get, set, remove, update } from "firebase/database";

export const migrateRamonData = async (uid: string, email: string) => {
  if (email !== "ramonfpesante@gmail.com") return;

  try {
    const userPath = getUserPath(uid);
    const userSnapshot = await get(ref(database, userPath));

    // If user already has data, don't migrate (assume migration done or user started fresh)
    if (userSnapshot.exists() && userSnapshot.val()?.weeks) {
      console.log("Migration: User already has data. Skipping.");
      return;
    }

    console.log("Migration: Checking for legacy data...");

    // Check for legacy tasks and meta
    const tasksSnapshot = await get(ref(database, "tasks"));
    const metaSnapshot = await get(ref(database, "meta"));
    const weeksSnapshot = await get(ref(database, "weeks"));
    const googleAuthSnapshot = await get(ref(database, "googleAuth/ramon"));

    if (
      weeksSnapshot.exists() ||
      tasksSnapshot.exists() ||
      metaSnapshot.exists()
    ) {
      console.log("Migration: Legacy data found. Starting migration...");

      const migrationData: any = {};
      if (weeksSnapshot.exists()) migrationData.weeks = weeksSnapshot.val();
      if (tasksSnapshot.exists()) migrationData.tasks = tasksSnapshot.val();
      if (metaSnapshot.exists()) migrationData.meta = metaSnapshot.val();
      if (googleAuthSnapshot.exists())
        migrationData.googleAuth = googleAuthSnapshot.val();

      // Write to user-scoped path
      await set(ref(database, userPath), migrationData);

      // Also ensure username mapping exists for loginWithUsername
      await set(ref(database, `usernames/ramon`), {
        email: "ramonfpesante@gmail.com",
      });

      console.log("Migration: Data copied successfully.");

      // Optional: We could remove legacy data, but let's keep it for a bit to be safe
      // await remove(ref(database, "weeks"));
      // await remove(ref(database, "tasks"));
      // await remove(ref(database, "meta"));
      // await remove(ref(database, "googleAuth/ramon"));
    } else {
      console.log("Migration: No legacy data found.");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

export const fixDoubleNesting = async (uid: string) => {
  try {
    const nestedPath = `users/${uid}/users/${uid}`;
    const nestedSnapshot = await get(ref(database, nestedPath));

    if (nestedSnapshot.exists()) {
      console.log(`Fixing double nesting for user ${uid}...`);
      const nestedData = nestedSnapshot.val();

      // Move each key from nested data to the correct user path
      const userPath = `users/${uid}`;
      const updates: any = {};

      Object.keys(nestedData).forEach((key) => {
        updates[`${userPath}/${key}`] = nestedData[key];
      });

      // Cleanup the nested node
      updates[nestedPath] = null;

      await update(ref(database), updates);

      console.log(`Double nesting fixed for user ${uid}.`);
    }
  } catch (error) {
    console.error("Failed to fix double nesting:", error);
  }
};

export const cleanupUndefinedNode = async () => {
  try {
    const undefinedRef = ref(database, "users/undefined");
    const snapshot = await get(undefinedRef);
    if (snapshot.exists()) {
      console.log("Cleaning up redundant 'users/undefined' node...");
      await remove(undefinedRef);
      console.log("'users/undefined' node removed.");
    }
  } catch (error) {
    console.error("Failed to cleanup undefined node:", error);
  }
};
