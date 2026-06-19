// Server-side only — never import this in client components.
import { Livepeer } from "livepeer";

const livepeer = new Livepeer({ apiKey: process.env.LIVEPEER_API_KEY! });

export async function createAssetFromUrl(
  url: string,
  name: string
): Promise<{ assetId: string; playbackId: string }> {
  const result = await livepeer.asset.createViaUrl({ name, url });

  const asset =
    result.twoHundredAndOneApplicationJsonData?.asset ??
    result.twoHundredApplicationJsonData?.asset;
  if (!asset) throw new Error("Livepeer: asset creation failed");

  return {
    assetId: asset.id,
    playbackId: asset.playbackId ?? asset.id,
  };
}

export async function getPlaybackUrl(playbackId: string): Promise<string> {
  return `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`;
}
