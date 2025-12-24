// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// Firebase config with fallback values
// Note: In production, these should come from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Reference to tasks in the database
export const tasksRef = ref(database, "tasks");

// Helper function to save tasks
export const saveTasks = async (tasks: any): Promise<boolean> => {
  try {
    // Firebase doesn't allow undefined values. We sanitize by removing them.
    const sanitizedTasks = JSON.parse(JSON.stringify(tasks));
    await set(tasksRef, sanitizedTasks);
    return true;
  } catch (error) {
    console.error("Error saving tasks:", error);
    return false;
  }
};

// Subscribe to task changes
export const subscribeToTasks = (callback: (data: any) => void) => {
  return onValue(tasksRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export { database };
