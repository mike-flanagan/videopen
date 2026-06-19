import { NextRequest, NextResponse } from "next/server";
import lighthouse from "@lighthouse-web3/sdk";

const API_KEY = process.env.LIGHTHOUSE_API_KEY;

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "Lighthouse API key not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const fileName = (file as File).name ?? "upload";
    const uploadFile = new File([arrayBuffer], fileName, { type: file.type });

    const response = await lighthouse.upload([uploadFile], API_KEY);
    const { Hash: cid, Size: size } = response.data;

    return NextResponse.json({ cid, size });
  } catch (err) {
    console.error("Lighthouse upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
