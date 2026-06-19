"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

export function UploadDropzone({ onFile, disabled }: UploadDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".mov", ".webm", ".mkv", ".avi"] },
    maxFiles: 1,
    maxSize: MAX_SIZE_BYTES,
    disabled,
  });

  const rejection = fileRejections[0]?.errors[0]?.message;

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-indigo-500 bg-indigo-500/10"
          : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto mb-3 text-zinc-500" size={40} />
      <p className="text-sm text-zinc-300">
        {isDragActive ? "Drop your video here" : "Drag & drop a video, or click to browse"}
      </p>
      <p className="text-xs text-zinc-500 mt-1">MP4, MOV, WebM, MKV · Max 2 GB</p>
      {rejection && <p className="text-xs text-red-400 mt-2">{rejection}</p>}
    </div>
  );
}
