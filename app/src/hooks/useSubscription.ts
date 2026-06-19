"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAccount } from "wagmi";
import { SUBSCRIPTION_MANAGER_ADDRESS, SUBSCRIPTION_MANAGER_ABI } from "@/lib/contracts";
import { type Address } from "viem";

export function useSubscriptionPrice(creator: Address | undefined) {
  return useReadContract({
    address: SUBSCRIPTION_MANAGER_ADDRESS,
    abi: SUBSCRIPTION_MANAGER_ABI,
    functionName: "subscriptionPrice",
    args: creator ? [creator] : undefined,
    query: { enabled: !!creator },
  });
}

export function useIsSubscribed(creator: Address | undefined) {
  const { address } = useAccount();
  return useReadContract({
    address: SUBSCRIPTION_MANAGER_ADDRESS,
    abi: SUBSCRIPTION_MANAGER_ABI,
    functionName: "isSubscribed",
    args: address && creator ? [address, creator] : undefined,
    query: { enabled: !!address && !!creator },
  });
}

export function useSubscriptionExpiry(creator: Address | undefined) {
  const { address } = useAccount();
  return useReadContract({
    address: SUBSCRIPTION_MANAGER_ADDRESS,
    abi: SUBSCRIPTION_MANAGER_ABI,
    functionName: "expiresAt",
    args: address && creator ? [address, creator] : undefined,
    query: { enabled: !!address && !!creator },
  });
}

export function useSubscribe() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const subscribe = (creator: Address, price: bigint) => {
    writeContract({
      address: SUBSCRIPTION_MANAGER_ADDRESS,
      abi: SUBSCRIPTION_MANAGER_ABI,
      functionName: "subscribe",
      args: [creator],
      value: price,
    });
  };

  const renew = (creator: Address, price: bigint) => {
    writeContract({
      address: SUBSCRIPTION_MANAGER_ADDRESS,
      abi: SUBSCRIPTION_MANAGER_ABI,
      functionName: "renew",
      args: [creator],
      value: price,
    });
  };

  return { subscribe, renew, isPending, isConfirming, isSuccess, txHash, error };
}

export function useSetSubscriptionPrice() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const setPrice = (priceWei: bigint) => {
    writeContract({
      address: SUBSCRIPTION_MANAGER_ADDRESS,
      abi: SUBSCRIPTION_MANAGER_ABI,
      functionName: "setPrice",
      args: [priceWei],
    });
  };

  return { setPrice, isPending, isConfirming, isSuccess, txHash, error };
}
