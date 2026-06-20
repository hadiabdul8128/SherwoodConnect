import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import {
  FirebaseAdminConfigError,
  getFirebaseAdminAuth,
} from "./firebase-admin";

export class AuthError extends Error {
  status = 401;
}

export async function requireFirebaseUser(
  request: Request,
): Promise<DecodedIdToken> {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AuthError("Missing Firebase ID token.");
  }

  const auth = await getFirebaseAdminAuth();

  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    if (error instanceof FirebaseAdminConfigError) throw error;
    throw new AuthError("Invalid Firebase ID token.");
  }
}
