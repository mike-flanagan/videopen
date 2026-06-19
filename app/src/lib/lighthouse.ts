// Server-side only — never import this in client components.
import lighthouse from "@lighthouse-web3/sdk";

const API_KEY = process.env.LIGHTHOUSE_API_KEY!;

export async function uploadBuffer(
  buffer: Buffer,
  fileName: string
): Promise<{ cid: string; size: number }> {
  const blob = new Blob([buffer.buffer as ArrayBuffer]);
  const file = new File([blob], fileName);
  const response = await lighthouse.upload([file], API_KEY);
  const { Name: _name, Hash: cid, Size: size } = response.data;
  return { cid, size: Number(size) };
}

export async function uploadJson(data: object, fileName: string): Promise<string> {
  const json = JSON.stringify(data);
  const { cid } = await uploadBuffer(Buffer.from(json), fileName);
  return cid;
}
