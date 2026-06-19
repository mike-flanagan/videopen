import { type VideoWithMeta } from "@/hooks/useVideos";
import { VideoCard } from "./VideoCard";

interface VideoGridProps {
  videos: VideoWithMeta[];
  loading?: boolean;
}

export function VideoGrid({ videos, loading }: VideoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 animate-pulse">
            <div className="aspect-video bg-zinc-800" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p className="text-lg">No videos yet</p>
        <p className="text-sm mt-1">Be the first to upload.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={String(video.videoId)} video={video} />
      ))}
    </div>
  );
}
