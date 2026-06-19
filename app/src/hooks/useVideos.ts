"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
  CONTENT_REGISTRY_ADDRESS,
  CONTENT_REGISTRY_ABI,
} from "@/lib/contracts";
import { fetchMetadata, type VideoMetadata } from "@/lib/ipfs";

export interface VideoWithMeta {
  videoId: bigint;
  creator: string;
  contentCid: string;
  metadataCid: string;
  publishedAt: bigint;
  isGated: boolean;
  removed: boolean;
  metadata: VideoMetadata | null;
}

export function useVideoCount() {
  return useReadContract({
    address: CONTENT_REGISTRY_ADDRESS,
    abi: CONTENT_REGISTRY_ABI,
    functionName: "videoCount",
  });
}

export function useVideo(videoId: bigint) {
  return useReadContract({
    address: CONTENT_REGISTRY_ADDRESS,
    abi: CONTENT_REGISTRY_ABI,
    functionName: "videos",
    args: [videoId],
    query: { enabled: videoId > 0n },
  });
}

export function useCreatorVideos(creator: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTENT_REGISTRY_ADDRESS,
    abi: CONTENT_REGISTRY_ABI,
    functionName: "getCreatorVideos",
    args: creator ? [creator] : undefined,
    query: { enabled: !!creator },
  });
}

// Fetch the latest N videos with their IPFS metadata
export function useLatestVideos(count = 12) {
  const { data: videoCount } = useVideoCount();

  const videoIds = videoCount
    ? Array.from({ length: Math.min(Number(videoCount), count) }, (_, i) => BigInt(Number(videoCount) - i))
    : [];

  const videoReads = useReadContracts({
    contracts: videoIds.map((id) => ({
      address: CONTENT_REGISTRY_ADDRESS,
      abi: CONTENT_REGISTRY_ABI,
      functionName: "videos" as const,
      args: [id] as const,
    })),
    query: { enabled: videoIds.length > 0 },
  });

  const rawVideos = videoReads.data ?? [];

  return useQuery({
    queryKey: ["latestVideos", videoIds.map(String)],
    enabled: rawVideos.length > 0 && rawVideos.every((r) => r.status === "success"),
    queryFn: async (): Promise<VideoWithMeta[]> => {
      const results = await Promise.all(
        rawVideos.map(async (result, i) => {
          if (result.status !== "success" || !result.result) return null;
          const [creator, contentCid, metadataCid, publishedAt, isGated, removed] = result.result as [
            string, string, string, bigint, boolean, boolean
          ];
          if (removed) return null as unknown as VideoWithMeta;
          let metadata: VideoMetadata | null = null;
          try {
            metadata = await fetchMetadata(metadataCid);
          } catch {
            // metadata fetch failure is non-fatal
          }
          const entry: VideoWithMeta = { videoId: videoIds[i], creator, contentCid, metadataCid, publishedAt, isGated, removed, metadata };
          return entry;
        })
      );
      return results.filter(Boolean) as VideoWithMeta[];
    },
  });
}
