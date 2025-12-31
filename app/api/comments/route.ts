import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name || "").trim();
    const message = String(body?.message || "").trim();
    const page = String(body?.page || "general").trim();

    if (!name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }

    await dbConnect();
    const doc = await Comment.create({ name, message, page });

    return NextResponse.json({ ok: true, comment: doc });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
