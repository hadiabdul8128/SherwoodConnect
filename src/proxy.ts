import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json(
      { ok: false, error: "Missing Firebase ID token." },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/profile",
};
