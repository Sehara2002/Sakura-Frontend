import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";

function isAdmin(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  return secret && secret === process.env.ADMIN_SECRET;
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const comments = await Comment.find({})
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();

  return NextResponse.json({ comments });
}
