import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import {
  ref,
  get,
  set,
  remove,
  DatabaseReference,
  DataSnapshot,
  getDatabase,
} from "firebase/database";
import { initializeApp } from "firebase/app";

// Load .env.production variables
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

// Assuming the Firebase path variable is called NEXT_PUBLIC_FIREBASE_DATABASE_URL
const firebaseDbPath = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

if (!firebaseDbPath) {
  console.error(
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL not found in .env.production"
  );
  process.exit(1);
}

console.log("Firebase database path from .env.production:", firebaseDbPath);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Función para renombrar un nodo en Firebase Realtime Database.
 * @param oldNodePath La ruta del nodo actual que deseas renombrar.
 * @param newNodePath La nueva ruta y nombre para el nodo.
 * @returns Una Promesa que se resuelve cuando la operación se completa.
 */
async function renameNode(
  oldNodePath: string,
  newNodePath: string
): Promise<void> {
  const oldRef: DatabaseReference = ref(database, oldNodePath);
  const newRef: DatabaseReference = ref(database, newNodePath);

  try {
    // 1. Leer los datos del nodo original
    const snapshot: DataSnapshot = await get(oldRef);

    if (snapshot.exists()) {
      const dataToRename: any = snapshot.val();
      console.log(`Datos leídos de '${oldNodePath}':`, dataToRename);

      // 2. Escribir esos datos en la nueva ubicación
      await set(newRef, dataToRename);
      console.log(`Datos escritos en '${newNodePath}'.`);

      // 3. Eliminar el nodo original
      await remove(oldRef);
      console.log(`Nodo original '${oldNodePath}' eliminado.`);

      console.log(
        `Nodo renombrado de '${oldNodePath}' a '${newNodePath}' exitosamente.`
      );
    } else {
      console.warn(`El nodo original '${oldNodePath}' no existe.`);
    }
  } catch (error) {
    console.error("Error al renombrar el nodo:", error);
    throw error; // Propagar el error para manejo externo
  }
}

renameNode("weeks/2025", "weeks/2026");
