import { NextRequest, NextResponse } from "next/server";
import { Livepeer } from "livepeer";

const livepeer = new Livepeer({ apiKey: process.env.LIVEPEER_API_KEY ?? "" });

export async function POST(req: NextRequest) {
  if (!process.env.LIVEPEER_API_KEY) {
    return NextResponse.json({ error: "Livepeer API key not configured" }, { status: 500 });
  }

  const { cid, name } = await req.json() as { cid?: string; name?: string };
  if (!cid) {
    return NextResponse.json({ error: "cid required" }, { status: 400 });
  }

  const ipfsUrl = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.lighthouse.storage/ipfs"}/${cid}`;

  try {
    const result = await livepeer.asset.createViaUrl({ name: name ?? cid, url: ipfsUrl });
    const asset =
      result.twoHundredAndOneApplicationJsonData?.asset ??
      result.twoHundredApplicationJsonData?.asset;
    if (!asset) throw new Error("No asset returned");

    return NextResponse.json({
      assetId: asset.id,
      playbackId: asset.playbackId ?? asset.id,
    });
  } catch (err) {
    console.error("Livepeer transcode failed:", err);
    return NextResponse.json({ error: "Transcoding failed" }, { status: 500 });
  }
}
