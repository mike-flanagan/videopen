"use client";

import { useAccount } from "wagmi";
import { type Address, formatEther } from "viem";
import { useSubscriptionPrice, useIsSubscribed, useSubscriptionExpiry, useSubscribe } from "@/hooks/useSubscription";
import { formatDate } from "@/lib/utils";

interface SubscribeButtonProps {
  creator: Address;
}

export function SubscribeButton({ creator }: SubscribeButtonProps) {
  const { isConnected } = useAccount();
  const { data: price } = useSubscriptionPrice(creator);
  const { data: isSubscribed, refetch: refetchSubscribed } = useIsSubscribed(creator);
  const { data: expiry } = useSubscriptionExpiry(creator);
  const { subscribe, renew, isPending, isConfirming, isSuccess } = useSubscribe();

  if (isSuccess) {
    refetchSubscribed();
  }

  if (!isConnected) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-zinc-700 text-zinc-400 rounded-lg text-sm cursor-not-allowed"
      >
        Connect wallet to subscribe
      </button>
    );
  }

  if (price === undefined || price === 0n) {
    return (
      <span className="text-sm text-zinc-400 italic">Free to watch</span>
    );
  }

  const priceEth = formatEther(price);
  const isLoading = isPending || isConfirming;

  if (isSubscribed && expiry) {
    const expiryDate = formatDate(Number(expiry));
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-green-400">Subscribed until {expiryDate}</span>
        <button
          onClick={() => renew(creator, price)}
          disabled={isLoading}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? "Renewing..." : `Renew · ${priceEth} ETH/mo`}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => subscribe(creator, price)}
      disabled={isLoading}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
    >
      {isLoading ? "Subscribing..." : `Subscribe · ${priceEth} ETH/mo`}
    </button>
  );
}
