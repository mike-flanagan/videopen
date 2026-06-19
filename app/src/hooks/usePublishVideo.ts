"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTENT_REGISTRY_ADDRESS, CONTENT_REGISTRY_ABI } from "@/lib/contracts";

export function usePublishVideo() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const publish = (contentCid: string, metadataCid: string, isGated: boolean) => {
    writeContract({
      address: CONTENT_REGISTRY_ADDRESS,
      abi: CONTENT_REGISTRY_ABI,
      functionName: "publish",
      args: [contentCid, metadataCid, isGated],
    });
  };

  return { publish, isPending, isConfirming, isSuccess, txHash, error };
}

export function useRemoveVideo() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const remove = (videoId: bigint) => {
    writeContract({
      address: CONTENT_REGISTRY_ADDRESS,
      abi: CONTENT_REGISTRY_ABI,
      functionName: "remove",
      args: [videoId],
    });
  };

  return { remove, isPending, isConfirming, isSuccess, txHash, error };
}
