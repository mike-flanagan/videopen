# VideoPen

A decentralized platform for video — creators own their content, earn directly from viewers, and no platform authority controls distribution.

## How it works

- **Storage**: Videos are uploaded to [IPFS](https://ipfs.tech) via [Lighthouse.storage](https://lighthouse.storage) (Filecoin-backed). Metadata (title, description, thumbnail) is also stored on IPFS.
- **Transcoding**: [Livepeer](https://livepeer.org) transcodes uploaded videos into adaptive HLS streams for smooth playback.
- **Payments**: ETH subscriptions and tips flow directly from viewers to creators via smart contracts. No platform cut. Creators pull their earnings from a vault contract.
- **Identity**: Wallet address = creator identity. No registration, no passwords.
- **Chain**: [Base](https://base.org) (Ethereum L2) — low fees, fast finality.

## Architecture

```
contracts/          Solidity smart contracts (Foundry)
├── ContentRegistry     On-chain index of all published videos (IPFS CIDs)
├── SubscriptionManager Monthly ETH subscriptions from viewers to creators
├── SponsorshipVault    Pull-payment treasury for all creator earnings
└── VideoPenRegistry    Single entry-point — stores addresses of all contracts

app/                Next.js 16 frontend
├── src/lib/            Contract ABIs, IPFS helpers, wagmi config
├── src/hooks/          React hooks for reading/writing contracts
├── src/components/     UI: VideoCard, VideoPlayer, SubscribeButton, etc.
└── src/app/            Pages: home feed, watch, channel, upload, studio
```

## Quick start

### 1. Deploy contracts

```bash
cd contracts

# Install dependencies (already done)
# forge install

# Copy and fill in your deployer key
cp ../.env.example .env

# Deploy to Base Sepolia (testnet)
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --broadcast
```

The script prints all deployed contract addresses. Copy them into `app/.env.local`.

### 2. Run the frontend

```bash
cd app
cp .env.local.example .env.local
# Fill in contract addresses and API keys

npm run dev
```

Visit `http://localhost:3000`.

## Environment variables

### Frontend (`app/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CHAIN` | `base` or `base-sepolia` |
| `NEXT_PUBLIC_CONTENT_REGISTRY_ADDRESS` | Deployed ContentRegistry address |
| `NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS` | Deployed SubscriptionManager address |
| `NEXT_PUBLIC_SPONSORSHIP_VAULT_ADDRESS` | Deployed SponsorshipVault address |
| `LIGHTHOUSE_API_KEY` | [Lighthouse.storage](https://lighthouse.storage) API key (server-side) |
| `LIVEPEER_API_KEY` | [Livepeer Studio](https://livepeer.studio) API key (server-side) |
| `NEXT_PUBLIC_IPFS_GATEWAY` | IPFS gateway URL for fetching content |

### Contracts (`contracts/.env`)

| Variable | Description |
|---|---|
| `PRIVATE_KEY` | Deployer wallet private key |
| `RPC_URL` | RPC endpoint for deployment |

## Smart contracts

### ContentRegistry

Stores a mapping from auto-incrementing video IDs to `(creator, contentCid, metadataCid, isGated)`. Creators call `publish()` to register a video and `remove()` to soft-delete it. No ETH involved.

### SubscriptionManager

Creators call `setPrice(weiPerMonth)` to configure their monthly subscription price. Viewers call `subscribe(creator)` sending exactly that amount. Subscriptions last 30 days. `isSubscribed(viewer, creator)` is the access gate. All ETH is immediately forwarded to SponsorshipVault.

### SponsorshipVault

Pull-payment treasury. Accumulates ETH from subscriptions and direct tips (`deposit(creator)`). Creators call `withdraw()` to pull their full balance. Uses reentrancy guard. No platform fee in v1.

### VideoPenRegistry

Deploys all three contracts and stores their addresses. Frontend only needs this one address to discover the full protocol. Owner can update addresses when new contract versions are deployed.

## Metadata JSON schema

Every video's metadata CID points to a JSON file on IPFS:

```json
{
  "version": 1,
  "title": "string",
  "description": "string",
  "thumbnailCid": "bafy...",
  "playbackId": "livepeer-asset-id",
  "duration": 142,
  "createdAt": 1718000000,
  "creatorAddress": "0x..."
}
```

## Decentralization properties

| Layer | How decentralized |
|---|---|
| Video storage | IPFS + Filecoin via Lighthouse (creator controls pinning) |
| Metadata | IPFS (same) |
| Payments | Smart contracts on Base — no intermediary |
| Identity | Wallet address — no central auth |
| Content access | Client-side gate check (v1); Livepeer webhook enforcement (v2) |
| Frontend | Deployable to IPFS/Fleek — no Vercel dependency |
| Indexing | Direct on-chain event reads — no hosted subgraph (v1) |

## Running tests

```bash
cd contracts
forge test -v
```

21 tests across SponsorshipVault, SubscriptionManager, and ContentRegistry (including fuzz tests).
