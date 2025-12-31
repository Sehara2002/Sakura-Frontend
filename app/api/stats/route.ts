import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Stat } from "@/models/Stat";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const key = String(body?.key || "").trim();

    const allowed = ["site_visits", "book_opens"];
    if (!allowed.includes(key)) {
      return NextResponse.json({ error: "Invalid stat key" }, { status: 400 });
    }

    await dbConnect();
    await Stat.findOneAndUpdate(
      { key },
      { $inc: { value: 1 } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
