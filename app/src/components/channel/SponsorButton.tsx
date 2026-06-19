"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { type Address, parseEther } from "viem";
import { useTip } from "@/hooks/useVault";
import { Heart } from "lucide-react";

interface SponsorButtonProps {
  creator: Address;
}

export function SponsorButton({ creator }: SponsorButtonProps) {
  const { isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [ethAmount, setEthAmount] = useState("0.01");
  const { tip, isPending, isConfirming, isSuccess } = useTip(creator);

  const isLoading = isPending || isConfirming;

  const handleTip = () => {
    try {
      const wei = parseEther(ethAmount);
      tip(wei);
    } catch {
      alert("Invalid ETH amount");
    }
  };

  if (isSuccess && open) setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={!isConnected}
        className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        <Heart size={14} />
        Sponsor
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Support this creator</h2>
            <label className="block text-sm text-zinc-400 mb-1">Amount (ETH)</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTip}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
