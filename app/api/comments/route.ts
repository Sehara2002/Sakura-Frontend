import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";

export const dynamic = "force-dynamic"; // ✅ avoid unexpected caching

export async function POST(req: Request) {
  try {
    // ✅ env check (helps debug on Vercel)
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MONGODB_URI is missing" }, { status: 500 });
    }

    const body = await req.json();

    const name = String(body?.name || "").trim();
    const message = String(body?.message || "").trim();
    const page = String(body?.page || "general").trim();

    if (!name || !message) {
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const doc = await Comment.create({ name, message, page });

    return NextResponse.json({ ok: true, comment: doc }, { status: 200 });
  } catch (err: any) {
    // ✅ send actual error message back (critical for Vercel debugging)
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
