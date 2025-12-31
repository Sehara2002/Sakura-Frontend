export const runtime = "nodejs"; // ✅ ensure Node runtime on Vercel

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  // ✅ IMPORTANT: put the PDF in a folder that is deployed (see notes below)
  const pdfPath = path.join(process.cwd(), "protected", "V2P1@4x.pdf");

  try {
    const pdfBuffer = await fs.readFile(pdfPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="sakura3.pdf"',
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err: any) {
    // ✅ Helpful debug info for Vercel logs
    return NextResponse.json(
      {
        ok: false,
        error: "PDF not found/readable",
        pdfPath,
        hint:
          "Check that the file exists in the deployed build (case-sensitive). If using Git LFS, Vercel may not have the real PDF.",
      },
      { status: 404 }
    );
  }
}
