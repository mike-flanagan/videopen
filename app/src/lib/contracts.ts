import { type Address } from "viem";

// Contract addresses — populated after deployment.
// Set NEXT_PUBLIC_REGISTRY_ADDRESS in .env.local after running `forge script Deploy`.
export const REGISTRY_ADDRESS =
  (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as Address | undefined) ?? "0x0000000000000000000000000000000000000000";

export const CONTENT_REGISTRY_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTENT_REGISTRY_ADDRESS as Address | undefined) ?? "0x0000000000000000000000000000000000000000";

export const SUBSCRIPTION_MANAGER_ADDRESS =
  (process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS as Address | undefined) ?? "0x0000000000000000000000000000000000000000";

export const SPONSORSHIP_VAULT_ADDRESS =
  (process.env.NEXT_PUBLIC_SPONSORSHIP_VAULT_ADDRESS as Address | undefined) ?? "0x0000000000000000000000000000000000000000";

// ABIs — hand-written from the compiled contracts. Replace with wagmi CLI output in production.
export const CONTENT_REGISTRY_ABI = [
  {
    name: "publish",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "contentCid", type: "string" },
      { name: "metadataCid", type: "string" },
      { name: "isGated", type: "bool" },
    ],
    outputs: [{ name: "videoId", type: "uint256" }],
  },
  {
    name: "remove",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "videoId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "videoCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "videos",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "videoId", type: "uint256" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "contentCid", type: "string" },
      { name: "metadataCid", type: "string" },
      { name: "publishedAt", type: "uint256" },
      { name: "isGated", type: "bool" },
      { name: "removed", type: "bool" },
    ],
  },
  {
    name: "getCreatorVideos",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getCreatorVideoCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "VideoPublished",
    type: "event",
    inputs: [
      { name: "videoId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "contentCid", type: "string", indexed: false },
      { name: "metadataCid", type: "string", indexed: false },
      { name: "isGated", type: "bool", indexed: false },
      { name: "publishedAt", type: "uint256", indexed: false },
    ],
  },
  {
    name: "VideoRemoved",
    type: "event",
    inputs: [
      { name: "videoId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
    ],
  },
] as const;

export const SUBSCRIPTION_MANAGER_ABI = [
  {
    name: "setPrice",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "price", type: "uint256" }],
    outputs: [],
  },
  {
    name: "subscribe",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [],
  },
  {
    name: "renew",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [],
  },
  {
    name: "isSubscribed",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "viewer", type: "address" },
      { name: "creator", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "expiresAt",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "viewer", type: "address" },
      { name: "creator", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "subscriptionPrice",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "SUBSCRIPTION_PERIOD",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "Subscribed",
    type: "event",
    inputs: [
      { name: "viewer", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "expiresAt", type: "uint256", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Renewed",
    type: "event",
    inputs: [
      { name: "viewer", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "newExpiresAt", type: "uint256", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "PriceSet",
    type: "event",
    inputs: [
      { name: "creator", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false },
    ],
  },
] as const;

export const SPONSORSHIP_VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "Deposited",
    type: "event",
    inputs: [
      { name: "creator", type: "address", indexed: true },
      { name: "sender", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Withdrawn",
    type: "event",
    inputs: [
      { name: "creator", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;
