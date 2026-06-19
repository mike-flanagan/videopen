"use client";

import { useLatestVideos } from "@/hooks/useVideos";
import { VideoGrid } from "@/components/video/VideoGrid";

export default function HomePage() {
  const { data: videos, isLoading } = useLatestVideos(24);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Latest Videos</h1>
      <VideoGrid videos={videos ?? []} loading={isLoading} />
    </div>
  );
}
