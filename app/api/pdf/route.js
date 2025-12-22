import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const pdfPath = path.join(process.cwd(), "protected", "sakura.pdf");

  if (!fs.existsSync(pdfPath)) {
    return NextResponse.json({ ok: false, error: "PDF not found" }, { status: 404 });
  }

  const pdfBuffer = fs.readFileSync(pdfPath);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
  });
}
