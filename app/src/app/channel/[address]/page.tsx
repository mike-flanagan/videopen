"use client";

import { use } from "react";
import { type Address } from "viem";
import { useCreatorVideos, useLatestVideos, type VideoWithMeta } from "@/hooks/useVideos";
import { useSubscriptionPrice } from "@/hooks/useSubscription";
import { useVaultBalance } from "@/hooks/useVault";
import { useReadContracts } from "wagmi";
import { CONTENT_REGISTRY_ADDRESS, CONTENT_REGISTRY_ABI } from "@/lib/contracts";
import { useQuery } from "@tanstack/react-query";
import { fetchMetadata } from "@/lib/ipfs";
import { VideoGrid } from "@/components/video/VideoGrid";
import { SubscribeButton } from "@/components/channel/SubscribeButton";
import { SponsorButton } from "@/components/channel/SponsorButton";
import { shortenAddress, formatEth } from "@/lib/utils";
import { Users } from "lucide-react";

export default function ChannelPage({ params }: { params: Promise<{ address: string }> }) {
  const { address: rawAddress } = use(params);
  const creator = rawAddress as Address;

  const { data: videoIds } = useCreatorVideos(creator);
  const { data: price } = useSubscriptionPrice(creator);

  const videoReads = useReadContracts({
    contracts: (videoIds ?? []).map((id) => ({
      address: CONTENT_REGISTRY_ADDRESS,
      abi: CONTENT_REGISTRY_ABI,
      functionName: "videos" as const,
      args: [id] as const,
    })),
    query: { enabled: (videoIds?.length ?? 0) > 0 },
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ["channelVideos", creator, videoIds?.map(String)],
    enabled: (videoReads.data?.length ?? 0) > 0,
    queryFn: async (): Promise<VideoWithMeta[]> => {
      const results = await Promise.all(
        (videoReads.data ?? []).map(async (result, i) => {
          if (result.status !== "success" || !result.result) return null;
          const [vcreator, contentCid, metadataCid, publishedAt, isGated, removed] = result.result as [
            string, string, string, bigint, boolean, boolean
          ];
          if (removed) return null as unknown as VideoWithMeta;
          let metadata = null;
          try { metadata = await fetchMetadata(metadataCid); } catch {}
          const entry: VideoWithMeta = { videoId: videoIds![i], creator: vcreator, contentCid, metadataCid, publishedAt, isGated, removed, metadata };
          return entry;
        })
      );
      return (results.filter(Boolean) as VideoWithMeta[]).reverse();
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Channel header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold">
            {creator.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono">{shortenAddress(creator, 6)}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {videoIds?.length ?? 0} videos
            </p>
            {price && price > 0n && (
              <p className="text-sm text-indigo-400 mt-0.5">
                {formatEth(price)} / month to subscribe
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SubscribeButton creator={creator} />
          <SponsorButton creator={creator} />
        </div>
      </div>

      <VideoGrid videos={videos ?? []} loading={isLoading || videoReads.isLoading} />
    </div>
  );
}
