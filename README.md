# KaiaFi — USDC Finance on Arc

**KaiaFi is building a simpler way to access USDC-powered financial services on Arc.** The project starts with a live, on-chain USDC vault and is designed to evolve toward transparent, non-custodial lending, borrowing, and risk-aware capital management.

The goal is simple: make on-chain finance easier to understand and use, while keeping balances and transactions verifiable on-chain.

**Live on Arc Mainnet:** USDC deposit and withdrawal vault

**Network:** Arc Mainnet

**Contract:** `0xC60013cD0edfE8452C12Bdf7EdFbf42824DeeA91`

**Deployment transaction:** [View on Arc Explorer](https://explorer.arc.io/tx/0x4dc0b989ba890c16f4671a43f909dd23238ecbbf539c05c5ba6810459f35f097)

## The Problem

DeFi can be difficult to navigate, especially for people who simply want to understand their assets and interact with financial applications without wrestling with complicated interfaces.

At the same time, building useful on-chain financial products requires more than a polished dashboard. The underlying transactions, accounting, and risk controls must be transparent and reliable.

KaiaFi approaches this challenge incrementally: start with a working Arc-native financial primitive, establish the foundation for a better user experience, and expand toward more advanced financial functionality as the necessary protocol integrations and security controls are implemented.

## What KaiaFi Does Today

- **On-chain USDC vault:** Users can deposit USDC into a deployed smart contract and withdraw their own recorded balances.
- **User-level accounting:** The vault tracks balances by depositing address.
- **Arc Mainnet integration:** Connect an injected wallet and interact with the application on Arc.
- **Transaction transparency:** Confirmed transactions can be inspected through Arc Explorer.
- **Finance-focused interface:** A unified dashboard with Overview, Lending, Borrowing, Markets, Portfolio, and Activity screens.

The lending and borrowing screens are part of the product's direction, but those financial services are not currently enabled. The deployed vault does not generate yield or provide credit.

## Why Arc?

Arc provides the settlement layer for KaiaFi's current on-chain vault and the foundation for future USDC financial services.

Rather than treating blockchain as a backend detail, KaiaFi uses Arc for the operations that matter: deploying the vault, recording deposits, enforcing withdrawal balances, and making transactions independently verifiable.

The current deployment uses Arc Mainnet and the documented USDC ERC-20 interface.

- Network: Arc Mainnet
- Chain ID: `5042`
- RPC: `https://rpc.mainnet.arc.io`
- Explorer: [explorer.arc.io](https://explorer.arc.io/)
- USDC interface: `0x3600000000000000000000000000000000000000`

## Roadmap

KaiaFi is being developed in stages, with each stage building on a verifiable foundation.

### Phase 1 — Arc-native foundation

- Deploy and verify the USDC vault on Arc Mainnet.
- Support user-specific deposit and withdrawal accounting.
- Connect the interface to wallet balances and on-chain transactions.
- Establish a reproducible development, testing, and deployment workflow.

### Phase 2 — Better financial visibility

- Add reliable, event-derived transaction history.
- Improve portfolio and position tracking.
- Introduce transparent market data from verifiable sources.
- Improve transaction feedback, error handling, and wallet recovery flows.

### Phase 3 — Risk-aware lending and borrowing

- Evaluate suitable Arc-compatible lending infrastructure and collateral markets.
- Integrate a borrowing protocol only after validating its contracts, supported assets, and deployment requirements.
- Implement reliable collateral valuation, health-factor calculations, and liquidation safeguards.
- Make borrowing costs, collateral requirements, and position risks understandable before users transact.

### Phase 4 — Smarter capital management

- Explore portfolio insights and risk notifications based on verified user and market data.
- Investigate capital-allocation recommendations with transparent assumptions.
- Add automation only where its behavior, permissions, and risks can be clearly explained.

These are planned development stages, not claims that the features are already live. The roadmap will evolve based on testing, security requirements, and the Arc ecosystem.

## Technical Architecture

- **Frontend:** React 18, TypeScript, Vite, and Tailwind CSS.
- **Wallet and blockchain interaction:** Ethers.js v5.
- **Smart contracts:** Solidity 0.8.20 and Hardhat.
- **Current on-chain component:** `ArcUsdcVault.sol`.
- **Network:** Arc Mainnet.

The repository also contains earlier lending research prototypes. They are not part of the live vault flow or the current deployment script.

## Deployed Contract

The current vault is deployed at:

`0xC60013cD0edfE8452C12Bdf7EdFbf42824DeeA91`

[Inspect the deployment transaction](https://explorer.arc.io/tx/0x4dc0b989ba890c16f4671a43f909dd23238ecbbf539c05c5ba6810459f35f097).

The vault records deposits per account and permits each account to withdraw against its own recorded balance. It does not implement lending, borrowing, interest, collateral valuation, or liquidation.

## Getting Started

Requirements: Node.js 20.19 or later, or Node.js 22.12 or later, and npm.

```bash
git clone https://github.com/abdulkabir7/KaiaFi.git
cd KaiaFi
npm install
npm run dev
```

To configure the deployed vault for the frontend, set:

```env
VITE_ARC_USDC_VAULT_ADDRESS=0xC60013cD0edfE8452C12Bdf7EdFbf42824DeeA91
```

For local deployment work, copy `.env.example` to `.env` and configure the deployment variables. Never commit private keys or local secrets.

## Development Commands

```bash
npm run build
npm run lint
npm run compile
npm test
```

The vault tests use a local mock token. Passing local tests does not replace an independent security audit.

## Security and Scope

KaiaFi is an early-stage project. The deployed vault has not undergone an independent security audit. Smart contracts and blockchain transactions carry risk, and token issuer restrictions can affect transfers.

The live product is deliberately limited to deposit and withdrawal functionality. Lending, borrowing, yield generation, and liquidation will require additional protocol integrations, risk controls, and testing before they can be offered.

## Built for the Next Stage of On-chain Finance

KaiaFi starts with a real contract on Arc and a focused proof of concept. The next step is to build on that foundation toward financial tools that are more accessible, transparent, and risk-aware.

**Build on Arc. Make finance easier to use. Keep the transactions verifiable.**
