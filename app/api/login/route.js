import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();

  const correct = process.env.SAKURA_PASSWORD;
  if (!correct) {
    return NextResponse.json({ ok: false, error: "Server missing password" }, { status: 500 });
  }

  if ((password || "").trim() !== correct) {
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // ✅ httpOnly cookie (not visible to JS)
  res.cookies.set("sakura_auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/"
  });

  return res;
}
