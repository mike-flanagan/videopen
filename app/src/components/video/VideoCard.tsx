"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, Clock } from "lucide-react";
import { type VideoWithMeta } from "@/hooks/useVideos";
import { cidToUrl } from "@/lib/ipfs";
import { shortenAddress, formatDate, formatDuration } from "@/lib/utils";

interface VideoCardProps {
  video: VideoWithMeta;
}

export function VideoCard({ video }: VideoCardProps) {
  const { videoId, creator, isGated, publishedAt, metadata } = video;
  const title = metadata?.title ?? `Video #${videoId}`;
  const thumbnailUrl = metadata?.thumbnailCid ? cidToUrl(metadata.thumbnailCid) : null;

  return (
    <Link href={`/watch/${videoId}`} className="group block">
      <div className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-zinc-800">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
          {isGated && (
            <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-2 py-0.5 rounded flex items-center gap-1">
              <Lock size={10} />
              Subscribers
            </div>
          )}
          {metadata?.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
              <Clock size={10} />
              {formatDuration(metadata.duration)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            <Link
              href={`/channel/${creator}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-zinc-300 transition-colors"
            >
              {shortenAddress(creator)}
            </Link>
            {" · "}
            {formatDate(Number(publishedAt))}
          </p>
        </div>
      </div>
    </Link>
  );
}
