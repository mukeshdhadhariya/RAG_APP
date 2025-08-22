import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Log file info
  console.log("File received:", file.name, file.size, file.type);

  return NextResponse.json({
    message: "File received successfully",
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });
}
