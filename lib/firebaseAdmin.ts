import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = admin.apps[0] ?? null;

const initializeAdminApp = () => {
  if (adminApp) {
    return adminApp;
  }

  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error) {
    console.error("Firebase Admin initialization error", error);
    adminApp = null;
  }

  return adminApp;
};


export const ensureFirebaseAdminInitialized = () => {
  const app = initializeAdminApp();
  return Boolean(app);
};

const getAdminAuth = () => {
  const app = initializeAdminApp();
  return app ? admin.auth(app) : null;
};

export const verifyIdToken = async (token: string) => {
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token", error);
    return null;
  }
};

export const getAdminDb = () => {
  const app = initializeAdminApp();
  if (!app) {
    throw new Error("Firebase Admin is not configured");
  }

  return admin.database(app);
};

export const getUidFromRequest = async (request: Request) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyIdToken(token);
  return decodedToken ? decodedToken.uid : null;
};
