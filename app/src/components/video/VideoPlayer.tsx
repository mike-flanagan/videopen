"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { cidToUrl } from "@/lib/ipfs";

interface VideoPlayerProps {
  playbackId?: string;
  contentCid?: string;
  title?: string;
}

export function VideoPlayer({ playbackId, contentCid, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Prefer Livepeer HLS (adaptive bitrate); fall back to raw IPFS URL
  const src = playbackId
    ? `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`
    : contentCid
    ? cidToUrl(contentCid)
    : undefined;

  const isHls = !!src && src.endsWith(".m3u8");

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (!isHls) {
      video.src = src;
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari supports HLS natively
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [src, isHls]);

  if (!src) {
    return (
      <div className="aspect-video bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500">
        Video unavailable
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        preload="metadata"
        title={title}
        playsInline
      />
    </div>
  );
}
