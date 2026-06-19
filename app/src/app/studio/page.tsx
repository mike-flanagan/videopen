"use client";

import { useAccount } from "wagmi";
import { useCreatorVideos } from "@/hooks/useVideos";
import { useSubscriptionPrice, useSetSubscriptionPrice } from "@/hooks/useSubscription";
import { useVaultBalance, useWithdraw } from "@/hooks/useVault";
import { formatEth } from "@/lib/utils";
import { parseEther } from "viem";
import { useState } from "react";
import Link from "next/link";
import { Loader2, Upload, PlaySquare, Wallet } from "lucide-react";

export default function StudioPage() {
  const { address, isConnected } = useAccount();
  const { data: videoIds } = useCreatorVideos(address);
  const { data: price } = useSubscriptionPrice(address);
  const { data: vaultBalance } = useVaultBalance(address);
  const { withdraw, isPending: withdrawPending, isConfirming: withdrawConfirming } = useWithdraw();
  const { setPrice, isPending: pricePending, isConfirming: priceConfirming } = useSetSubscriptionPrice();

  const [priceInput, setPriceInput] = useState("");

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-zinc-400">
        Connect your wallet to access your studio.
      </div>
    );
  }

  const handleSetPrice = () => {
    try {
      setPrice(parseEther(priceInput));
    } catch {
      alert("Invalid ETH amount");
    }
  };

  const isWithdrawing = withdrawPending || withdrawConfirming;
  const isSettingPrice = pricePending || priceConfirming;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Creator Studio</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Vault balance */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            <Wallet size={14} />
            Earnings
          </div>
          <p className="text-2xl font-bold">{vaultBalance !== undefined ? formatEth(vaultBalance) : "—"}</p>
          <button
            onClick={withdraw}
            disabled={isWithdrawing || !vaultBalance || vaultBalance === 0n}
            className="mt-3 w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isWithdrawing && <Loader2 size={12} className="animate-spin" />}
            Withdraw
          </button>
        </div>

        {/* Videos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            <PlaySquare size={14} />
            Videos
          </div>
          <p className="text-2xl font-bold">{videoIds?.length ?? 0}</p>
          <Link
            href="/upload"
            className="mt-3 flex items-center justify-center gap-2 w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
          >
            <Upload size={12} />
            Upload new
          </Link>
        </div>

        {/* Subscription price */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            Current price
          </div>
          <p className="text-2xl font-bold">
            {price !== undefined && price > 0n ? formatEth(price) + "/mo" : "Not set"}
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              step="0.001"
              min="0"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="0.01"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none focus:border-indigo-500 min-w-0"
            />
            <button
              onClick={handleSetPrice}
              disabled={isSettingPrice || !priceInput}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isSettingPrice && <Loader2 size={10} className="animate-spin" />}
              Set
            </button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="font-semibold mb-4">Your Videos</h2>
        {!videoIds || videoIds.length === 0 ? (
          <p className="text-zinc-500 text-sm">No videos yet. <Link href="/upload" className="text-indigo-400 hover:underline">Upload your first video.</Link></p>
        ) : (
          <ul className="space-y-2 text-sm">
            {videoIds.map((id) => (
              <li key={String(id)} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <Link href={`/watch/${id}`} className="text-zinc-300 hover:text-white transition-colors">
                  Video #{String(id)}
                </Link>
                <span className="text-zinc-600 font-mono text-xs">ID: {String(id)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
