import React from 'react';
import { AlertCircle, ArrowUpRight, Coins, HandCoins, Wallet } from 'lucide-react';
import { ARC_MAINNET } from '../constants';
import { useWeb3 } from '../context/Web3Context';
import type { KaiaFiPage } from '../components/Sidebar';

interface DashboardProps {
  onNavigate: (page: KaiaFiPage) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { account, balanceError, chainId, isConnected, vaultUsdcBalance, walletUsdcBalance } = useWeb3();
  const isArc = chainId === ARC_MAINNET.chainId;
  const stats = [
    { label: 'Wallet USDC', value: isConnected && isArc ? walletUsdcBalance ?? 'Unavailable' : '—', note: 'Live wallet balance', icon: Wallet },
    { label: 'Deposited USDC', value: isConnected && isArc ? vaultUsdcBalance ?? 'Unavailable' : '—', note: 'In your KaiaFi vault', icon: Coins },
    { label: 'Lending APY', value: 'Unavailable', note: 'No lending market configured', icon: HandCoins },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">Arc Mainnet</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Overview</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Your USDC vault position and the current KaiaFi market availability.
          </p>
        </div>
        {isConnected && isArc && account && (
          <a href={`${ARC_MAINNET.explorerUrl}/address/${account}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 hover:text-emerald-900">
            View wallet on Arc Explorer <ArrowUpRight size={15} />
          </a>
        )}
      </section>

      <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertCircle size={19} className="mt-0.5 shrink-0 text-amber-700" />
        <div>
          <p className="text-sm font-semibold text-amber-950">Lending and borrowing are not yet available</p>
          <p className="mt-1 text-sm leading-5 text-amber-900">
            The original lending prototype has unsafe risk and debt accounting. The Arc vault supports USDC deposit and withdrawal only; it does not lend funds or earn interest.
          </p>
        </div>
      </div>

      {balanceError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load Arc balances: {balanceError}
        </div>
      )}

      <section aria-label="Account summary" className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Icon size={18} className="text-emerald-700" />
            </div>
            <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">{value === 'Unavailable' ? value : `${value}${value === '—' ? '' : ' USDC'}`}</p>
            <p className="mt-1 text-xs text-slate-500">{note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">USDC market</h2>
              <p className="mt-1 text-sm text-slate-500">Arc · ERC-20 interface · 6 decimals</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Market not configured</span>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            No verified lending pool is deployed. Rates, liquidity, and borrowing capacity are intentionally not shown.
          </p>
          <button type="button" onClick={() => onNavigate('markets')} className="mt-5 text-sm font-semibold text-emerald-800 hover:text-emerald-900">
            View market details
          </button>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Position overview</h2>
          <p className="mt-1 text-sm text-slate-500">On-chain values only</p>
          {!isConnected || !isArc ? (
            <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              Connect a wallet on Arc Mainnet to read your USDC balance and vault position.
            </p>
          ) : !vaultUsdcBalance || Number(vaultUsdcBalance) === 0 ? (
            <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              No USDC deposit found for this wallet.
            </p>
          ) : (
            <p className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
              USDC held in the KaiaFi vault: <strong>{vaultUsdcBalance}</strong>. This is custody only, not a lending position.
            </p>
          )}
          <button type="button" onClick={() => onNavigate('portfolio')} className="mt-4 text-sm font-semibold text-emerald-800 hover:text-emerald-900">
            View portfolio
          </button>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
