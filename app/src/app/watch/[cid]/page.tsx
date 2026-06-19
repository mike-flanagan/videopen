"use client";

import { use } from "react";
import { useAccount } from "wagmi";
import { type Address } from "viem";
import { useVideo } from "@/hooks/useVideos";
import { useIsSubscribed } from "@/hooks/useSubscription";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SubscribeButton } from "@/components/channel/SubscribeButton";
import { SponsorButton } from "@/components/channel/SponsorButton";
import { cidToUrl } from "@/lib/ipfs";
import { shortenAddress, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchMetadata } from "@/lib/ipfs";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function WatchPage({ params }: { params: Promise<{ cid: string }> }) {
  const { cid: videoIdStr } = use(params);
  const videoId = BigInt(videoIdStr);

  const { data: videoData } = useVideo(videoId);
  const { address } = useAccount();

  const creator = videoData ? (videoData[0] as Address) : undefined;
  const contentCid = videoData?.[1];
  const metadataCid = videoData?.[2];
  const publishedAt = videoData?.[3];
  const isGated = videoData?.[4];
  const removed = videoData?.[5];

  const { data: isSubscribed } = useIsSubscribed(creator);

  const { data: metadata } = useQuery({
    queryKey: ["metadata", metadataCid],
    enabled: !!metadataCid,
    queryFn: () => fetchMetadata(metadataCid!),
  });

  if (!videoData || removed) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-zinc-400">
        Video not found.
      </div>
    );
  }

  const canWatch = !isGated || isSubscribed;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Player */}
      {canWatch ? (
        <VideoPlayer
          playbackId={metadata?.playbackId}
          contentCid={contentCid}
          title={metadata?.title}
        />
      ) : (
        <div className="aspect-video rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-4">
          <Lock size={48} className="text-zinc-600" />
          <div className="text-center">
            <p className="font-semibold text-lg">Subscriber-only content</p>
            <p className="text-zinc-400 text-sm mt-1">Subscribe to {creator ? shortenAddress(creator) : "this creator"} to watch</p>
          </div>
          {creator && <SubscribeButton creator={creator} />}
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 space-y-3">
        <h1 className="text-xl font-bold">{metadata?.title ?? `Video #${videoId}`}</h1>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Link href={`/channel/${creator}`} className="hover:text-white transition-colors font-medium">
              {creator ? shortenAddress(creator) : "Unknown"}
            </Link>
            <span>·</span>
            <span>{publishedAt ? formatDate(Number(publishedAt)) : ""}</span>
            {isGated && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Lock size={12} />
                Subscribers only
              </span>
            )}
          </div>

          {creator && (
            <div className="flex items-center gap-2">
              <SubscribeButton creator={creator} />
              <SponsorButton creator={creator} />
            </div>
          )}
        </div>

        {metadata?.description && (
          <div className="bg-zinc-900 rounded-xl p-4 text-sm text-zinc-300 whitespace-pre-wrap">
            {metadata.description}
          </div>
        )}

        <div className="text-xs text-zinc-600 font-mono">
          Content CID: {contentCid}
        </div>
      </div>
    </div>
  );
}
