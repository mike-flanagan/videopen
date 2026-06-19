import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, type Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import { SUBSCRIPTION_MANAGER_ABI, SUBSCRIPTION_MANAGER_ADDRESS } from "@/lib/contracts";

// Livepeer calls this webhook to verify access before issuing a playback token.
// Livepeer sends: { playbackId, userId (viewer wallet), accessKey }
export async function POST(req: NextRequest) {
  const body = await req.json() as { userId?: string; playbackId?: string; creatorAddress?: string };
  const { userId: viewer, creatorAddress: creator } = body;

  if (!viewer || !creator) {
    return NextResponse.json({ allowed: false }, { status: 400 });
  }

  const chain = process.env.NEXT_PUBLIC_CHAIN === "base" ? base : baseSepolia;
  const client = createPublicClient({
    chain,
    transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  });

  try {
    const isSubscribed = await client.readContract({
      address: SUBSCRIPTION_MANAGER_ADDRESS,
      abi: SUBSCRIPTION_MANAGER_ABI,
      functionName: "isSubscribed",
      args: [viewer as Address, creator as Address],
    });

    return NextResponse.json({ allowed: isSubscribed });
  } catch (err) {
    console.error("Gate check failed:", err);
    return NextResponse.json({ allowed: false }, { status: 500 });
  }
}
