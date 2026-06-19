"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { usePublishVideo } from "@/hooks/usePublishVideo";
import { CheckCircle, Loader2 } from "lucide-react";

type Stage = "idle" | "uploading" | "transcoding" | "publishing" | "done";

export default function UploadPage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { publish, isPending, isConfirming, isSuccess, error: publishError } = usePublishVideo();

  const [stage, setStage] = useState<Stage>("idle");
  const [contentCid, setContentCid] = useState("");
  const [metadataCid, setMetadataCid] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGated, setIsGated] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setStage("uploading");
    setUploadProgress("Uploading to IPFS via Lighthouse…");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { cid } = await uploadRes.json() as { cid: string };
      setContentCid(cid);
      setUploadProgress(`Uploaded! CID: ${cid}`);

      setStage("transcoding");
      setUploadProgress("Sending to Livepeer for transcoding…");
      const transcodeRes = await fetch("/api/transcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cid, name: file.name }),
      });
      const transcodeData = await transcodeRes.json() as { playbackId?: string; error?: string };
      const playbackId = transcodeData.playbackId ?? "";

      // Build and upload metadata JSON
      setUploadProgress("Uploading metadata…");
      const metadata = {
        version: 1,
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        description,
        thumbnailCid: "",
        playbackId,
        duration: 0,
        createdAt: Math.floor(Date.now() / 1000),
        creatorAddress: address,
      };
      const metaFormData = new FormData();
      metaFormData.append(
        "file",
        new File([JSON.stringify(metadata)], "metadata.json", { type: "application/json" })
      );
      const metaRes = await fetch("/api/upload", { method: "POST", body: metaFormData });
      if (!metaRes.ok) throw new Error("Metadata upload failed");
      const { cid: mCid } = await metaRes.json() as { cid: string };
      setMetadataCid(mCid);
      setStage("publishing");
      setUploadProgress("Ready to publish on-chain.");
    } catch (err) {
      setError(String(err));
      setStage("idle");
    }
  }, [title, description, address]);

  const handlePublish = () => {
    if (!contentCid || !metadataCid) return;
    publish(contentCid, metadataCid, isGated);
  };

  if (isSuccess) {
    setTimeout(() => router.push("/studio"), 2000);
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
        <h2 className="text-xl font-bold">Published!</h2>
        <p className="text-zinc-400 mt-1">Your video is live on the decentralized web.</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-zinc-400">
        Connect your wallet to upload videos.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Upload a Video</h1>

      <div className="space-y-6">
        {stage === "idle" || stage === "uploading" || stage === "transcoding" ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My awesome video"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What's this video about?"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="gated"
                  checked={isGated}
                  onChange={(e) => setIsGated(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <label htmlFor="gated" className="text-sm text-zinc-300">
                  Subscribers only
                </label>
              </div>
            </div>

            <UploadDropzone onFile={handleFile} disabled={stage !== "idle"} />

            {uploadProgress && (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                {(stage === "uploading" || stage === "transcoding") && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {uploadProgress}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-2 text-sm">
              <div>
                <span className="text-zinc-500">Content CID: </span>
                <span className="font-mono text-xs text-zinc-300 break-all">{contentCid}</span>
              </div>
              <div>
                <span className="text-zinc-500">Metadata CID: </span>
                <span className="font-mono text-xs text-zinc-300 break-all">{metadataCid}</span>
              </div>
              <div>
                <span className="text-zinc-500">Title: </span>
                <span className="text-zinc-300">{title}</span>
              </div>
              <div>
                <span className="text-zinc-500">Access: </span>
                <span className="text-zinc-300">{isGated ? "Subscribers only" : "Public"}</span>
              </div>
            </div>

            <button
              onClick={handlePublish}
              disabled={isPending || isConfirming}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(isPending || isConfirming) && <Loader2 size={16} className="animate-spin" />}
              {isPending ? "Confirm in wallet…" : isConfirming ? "Publishing…" : "Publish on-chain"}
            </button>
          </div>
        )}

        {(error || publishError) && (
          <p className="text-red-400 text-sm">{error || publishError?.message}</p>
        )}
      </div>
    </div>
  );
}
