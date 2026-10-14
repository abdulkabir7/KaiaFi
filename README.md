# KaiaFi

KaiaFi is an early-stage lending and borrowing interface being prepared for Arc. The current application is a pre-launch shell: it can connect a browser wallet and display Arc mainnet configuration, but it does not provide lending services or submit transactions.

## What KaiaFi does

The current frontend introduces a planned USDC lending market on Arc and clearly identifies that market as unavailable. This is not a live DeFi protocol.

## Current MVP features

- Arc mainnet network details and wallet switching.
- A clear empty state for the unconfigured USDC market.
- Supply and borrow actions remain disabled.
- No fabricated liquidity, rates, balances, positions, or transaction results.

## Arc mainnet integration

The frontend uses the official Arc mainnet configuration:

| Setting | Value |
| --- | --- |
| Chain ID | `5042` |
| RPC | `https://rpc.mainnet.arc.io` |
| Explorer | [explorer.arc.io](https://explorer.arc.io) |
| Native gas currency | USDC (18 decimals) |
| USDC ERC-20 interface | [`0x3600000000000000000000000000000000000000`](https://explorer.arc.io/address/0x3600000000000000000000000000000000000000), 6 decimals |

Arc's native USDC gas balance and its ERC-20 interface represent the same USDC balance. Do not treat them as separate balances. Verify current network and token details in the [Arc connection documentation](https://docs.arc.io/arc/references/connect-to-arc) and [official contract address list](https://docs.arc.io/arc/references/contract-addresses) before integrating transactions.

This configuration is currently used only for wallet network setup and display. There is no deployed KaiaFi contract on Arc and no frontend contract integration.

## Architecture and technology

- Frontend: React, TypeScript, Vite, and Tailwind CSS.
- Wallet/network access: injected EVM wallet through ethers.js.
- Contracts: Solidity 0.8.20 and Hardhat.

The Solidity contracts in this repository are prototypes. Their risk checks, debt accounting, market data, and liquidation behavior are not suitable for real assets. They must not be deployed for public use.

## Deployment details

- Arc contracts: none deployed.
- Contract addresses or transaction hashes: none.
- Contract verification: none.
- Frontend: not yet deployed.

The repository is [github.com/abdulkabir7/KaiaFi](https://github.com/abdulkabir7/KaiaFi). The frontend deployment will be handled separately by the project owner.

## Setup

Requirements: Node.js 20.19 or later (or 22.12 or later) and npm.

```bash
npm install
npm run dev
```

## Environment variables

The current frontend does not require environment variables. `.env.example` documents that no deployment key or secret should be added for the current pre-launch app.

## Local development

```bash
npm run dev
npm run build
npm run lint
npm run compile
npm test
```

`npm run build` creates the static Vite site in `dist/`, suitable for a Vercel project using the default Vite settings.

## Contracts, tests, and deployment

Compile the prototype contracts with `npm run compile` and run the existing local Hardhat tests with `npm test`. The current tests are limited and do not establish that the contracts are safe or production-ready.

Mainnet deployment is intentionally not configured. The existing lending implementation includes placeholder health-factor and market values, incomplete borrowing/liquidation accounting, and no reliable cross-asset valuation. It must be redesigned and independently reviewed before any deployment script or transaction flow is enabled. Do not use real funds with these contracts.

## Known limitations and security

- No Arc lending market or KaiaFi contracts have been deployed.
- The frontend does not read on-chain balances, market data, or lending positions.
- Supply, borrow, repayment, and withdrawal are unavailable.
- The Solidity prototype has not been audited and is not production-ready.
- Existing contract tests are not comprehensive enough to establish protocol safety.

## License

No license is currently specified in this repository.
