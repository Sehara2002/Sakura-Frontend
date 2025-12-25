import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  // ✅ change this password
  const CORRECT_PASSWORD = process.env.SAKURA_PASSWORD || "present";

  if ((password || "").toLowerCase() !== CORRECT_PASSWORD.toLowerCase()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // ✅ cookie that middleware CAN read
  res.cookies.set("sakura_unlocked", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res;
}
