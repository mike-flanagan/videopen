import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { Navbar } from "@/components/layout/Navbar";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "VideoPen — Decentralized Video",
  description: "Create, share, and earn from video — owned entirely by you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 antialiased">
        <Web3Provider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
