import "server-only";

import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

export class FirebaseAdminConfigError extends Error {}

function readAdminConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new FirebaseAdminConfigError(
      "Firebase Admin is not configured. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  return { projectId, clientEmail, privateKey };
}

async function getFirebaseAdminApp(): Promise<App> {
  if (adminApp) return adminApp;

  const { cert, getApps, initializeApp } = await import("firebase-admin/app");

  if (getApps().length) {
    adminApp = getApps()[0];
    return adminApp;
  }

  adminApp = initializeApp({
    credential: cert(readAdminConfig()),
  });

  return adminApp;
}

export async function getFirebaseAdminAuth(): Promise<Auth> {
  if (!adminAuth) {
    const { getAuth } = await import("firebase-admin/auth");
    adminAuth = getAuth(await getFirebaseAdminApp());
  }
  return adminAuth;
}

export async function getFirebaseAdminDb(): Promise<Firestore> {
  if (!adminDb) {
    const { getFirestore } = await import("firebase-admin/firestore");
    adminDb = getFirestore(await getFirebaseAdminApp());
  }
  return adminDb;
}
