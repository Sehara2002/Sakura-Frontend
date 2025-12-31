import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Stat } from "@/models/Stat";
import { Comment } from "@/models/Comment";

function isAdmin(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  return secret && secret === process.env.ADMIN_SECRET;
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const stats = await Stat.find({}).lean();
  const commentCount = await Comment.countDocuments();

  const map: Record<string, number> = {};
  for (const s of stats) map[s.key] = s.value;

  return NextResponse.json({
    site_visits: map.site_visits ?? 0,
    book_opens: map.book_opens ?? 0,
    comments: commentCount ?? 0,
  });
}
