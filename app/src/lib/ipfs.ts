const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.lighthouse.storage/ipfs";

export function cidToUrl(cid: string): string {
  return `${IPFS_GATEWAY}/${cid}`;
}

export function isValidCid(cid: string): boolean {
  // Basic CID v0 (Qm...) and CID v1 (bafy...) validation
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[a-z0-9]{55,})$/.test(cid);
}

export async function fetchMetadata(metadataCid: string): Promise<VideoMetadata> {
  const res = await fetch(cidToUrl(metadataCid));
  if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.status}`);
  return res.json();
}

export interface VideoMetadata {
  version: number;
  title: string;
  description: string;
  thumbnailCid: string;
  playbackId: string;
  duration: number;
  createdAt: number;
  creatorAddress: string;
}
