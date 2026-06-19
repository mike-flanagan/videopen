"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Upload, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { isConnected } = useAccount();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-xl tracking-tight text-indigo-400">
          VideoPen
        </Link>

        <div className="flex items-center gap-3">
          {isConnected && (
            <>
              <Link
                href="/upload"
                className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <Upload size={16} />
                Upload
              </Link>
              <Link
                href="/studio"
                className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <LayoutDashboard size={16} />
                Studio
              </Link>
            </>
          )}
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </nav>
  );
}
