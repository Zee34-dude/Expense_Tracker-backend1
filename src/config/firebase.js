import admin from "firebase-admin";

// ✅ Prevent re-initialization in hot reload / server restarts
if (!admin.apps.length) {
  const firebaseCredentials = process.env.FIREBASE_CREDENTIALS;

  if (!firebaseCredentials) {
    throw new Error("The FIREBASE_CREDENTIALS environment variable was not found. Please make sure it is set.");
  }

  try {
    const serviceAccount = JSON.parse(firebaseCredentials);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to parse FIREBASE_CREDENTIALS. Make sure it's a valid JSON string.", error);
    throw new Error("Could not initialize Firebase. Invalid credentials format.");
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
