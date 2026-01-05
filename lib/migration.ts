import { database, getUserPath } from "./firebase";
import { ref, get, set, remove } from "firebase/database";

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
