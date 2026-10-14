# KaiaFi

KaiaFi is an early-stage USDC finance application targeting Arc Mainnet. Its original dashboard and lending-oriented navigation are preserved. The initial Arc integration is a simple user-owned USDC custody vault; it does not lend funds or pay yield.

## Features

- Dashboard with live wallet and configured-vault balances.
- USDC deposit and withdrawal into a simple custody vault that tracks each user's balance and only allows withdrawals by that depositor.
- Borrowing screen retained and clearly marked unavailable.
- Markets, portfolio, and activity screens with live values only where the implementation supports them.
- Arc Mainnet wallet connection and network switching.
- Explorer links for confirmed deposit and withdrawal transactions.

The vault is a custody proof of concept, not a lending market. Borrowing, collateral, liquidation, lending rates, and lending-market liquidity are unavailable. No lending contract is deployed by this repository's deployment command.

## Arc Mainnet

Configuration is centralized in `config/arc-mainnet.json`, imported by the frontend and Hardhat, and checked by the Arc deployment script.

| Setting | Value |
| --- | --- |
| Chain ID | `5042` |
| RPC | `https://rpc.mainnet.arc.io` |
| Explorer | [explorer.arc.io](https://explorer.arc.io) |
| Native gas asset | USDC (18 decimals) |
| ERC-20 USDC interface | [`0x3600000000000000000000000000000000000000`](https://explorer.arc.io/address/0x3600000000000000000000000000000000000000), 6 decimals |

Native USDC for gas and the ERC-20 USDC interface are two interfaces to the same balance; the frontend reads token balances using the ERC-20 interface and its 6 decimals. Values are based on the [official Arc wallet configuration](https://docs.arc.io/arc/references/connect-to-arc) and [contract address list](https://docs.arc.io/arc/references/contract-addresses).

## Architecture

- React 18, TypeScript, Vite, and Tailwind CSS.
- Ethers.js v5 with the injected wallet provider.
- Solidity 0.8.20 and Hardhat.
- `ArcUsdcVault.sol`: permissionless deployment, fixed to a six-decimal ERC-20; records deposits per account, and lets each account withdraw its own balance.
- `LendingPool.sol`, `Liquidation.sol`, `InterestRateModel.sol`: retained research prototypes, not used by the frontend and not included in the Arc deployment script.
- Circle's Borrow Kit is not integrated; no supported collateral market or Borrow Kit transaction flow is configured in this app.

## Setup

Requirements: Node.js 20.19 or later (or 22.12 or later) and npm.

```bash
npm install
npm run dev
```

## Environment variables

Copy `.env.example` to `.env` for local deployment configuration. Keep `.env` private and out of Git.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `ARC_RPC_URL` | Hardhat deployment | Arc Mainnet RPC endpoint. Required; no network fallback is used during deployment. |
| `PRIVATE_KEY` | Hardhat deployment | Private key for the deploying account. Keep local; never add it to Vercel or a `VITE_` variable. |
| `ARC_USDC_ADDRESS` | Hardhat deployment | Must match the official Arc USDC ERC-20 interface; script checks bytecode and 6 decimals. |
| `VITE_ARC_USDC_VAULT_ADDRESS` | Frontend build/runtime | Public address of the deployed `ArcUsdcVault`. Set as a Vercel environment variable after deployment. |

The frontend can be built without a vault address. In that state it preserves the screens but disables deposit/withdraw actions and displays an explicit not-deployed state.

## Build and tests

```bash
npm run build
npm run lint
npm run compile
npm test
```

The Arc vault tests use a local mock token only. Mock USDT/KAI/KRW contracts are not real Arc assets and are not used in the Arc deployment.

## Arc deployment

Review `.env.example`, copy it to `.env`, and fill in the RPC endpoint, Arc mainnet deployer private key, and the official USDC address. Then run:

```bash
npm run deploy:arc
```

The script refuses to run unless `ARC_RPC_URL`, `PRIVATE_KEY`, and `ARC_USDC_ADDRESS` are valid, the selected network is Arc Mainnet (chain ID 5042), the USDC address is the documented Arc address with deployed code, and `decimals()` returns 6. Before submitting a transaction, it prints the deployer, vault target, constructor token address, estimated gas, buffered gas limit, estimated fee, and available native USDC, and stops if the balance cannot cover the estimate. It deploys **only `ArcUsdcVault`** and writes the actual vault address, transaction hash, and block number to the ignored local `deployment.json`. It does not deploy the prototype lending contracts. The deployment has not been run by this repository's maintainer.

After verifying `deployment.json` on [Arc Explorer](https://explorer.arc.io), set `VITE_ARC_USDC_VAULT_ADDRESS` for the frontend build/deployment. Vercel deployment is managed separately by the project owner. No live frontend URL is currently claimed.

## Security and limitations

- `ArcUsdcVault` is intentionally limited to per-account USDC deposit and withdrawal. It has no lending, borrowing, yield, collateral valuation, oracle, liquidation, or admin withdrawal function.
- Deposited USDC remains in the vault contract until the recorded depositor withdraws. ERC-20 USDC issuer controls such as address freezes may affect transfers.
- The vault and prototype contracts have not been audited. Do not treat this project as production-ready or deposit funds beyond what you can afford to risk.
- The old lending prototype is unsafe: its health factor and market data were hard-coded, its borrowing limit had no reliable price valuation, per-user interest accounting was incomplete, and liquidation did not verify/settle the position.
- The activity list is session-only. The Arc Explorer is the canonical transaction record.

## Deployment status

- Arc lending/borrowing market: not deployed.
- `ArcUsdcVault`: deployment prepared; no address or transaction hash exists until the owner runs the command.
- Frontend: not deployed by this repository change.
- License: no license is specified in the repository.
