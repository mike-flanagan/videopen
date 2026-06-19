"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SPONSORSHIP_VAULT_ADDRESS, SPONSORSHIP_VAULT_ABI } from "@/lib/contracts";
import { type Address } from "viem";

export function useVaultBalance(creator: Address | undefined) {
  return useReadContract({
    address: SPONSORSHIP_VAULT_ADDRESS,
    abi: SPONSORSHIP_VAULT_ABI,
    functionName: "balanceOf",
    args: creator ? [creator] : undefined,
    query: { enabled: !!creator },
  });
}

export function useWithdraw() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const withdraw = () => {
    writeContract({
      address: SPONSORSHIP_VAULT_ADDRESS,
      abi: SPONSORSHIP_VAULT_ABI,
      functionName: "withdraw",
    });
  };

  return { withdraw, isPending, isConfirming, isSuccess, txHash, error };
}

export function useTip(creator: Address | undefined) {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const tip = (amount: bigint) => {
    if (!creator) return;
    writeContract({
      address: SPONSORSHIP_VAULT_ADDRESS,
      abi: SPONSORSHIP_VAULT_ABI,
      functionName: "deposit",
      args: [creator],
      value: amount,
    });
  };

  return { tip, isPending, isConfirming, isSuccess, txHash, error };
}
