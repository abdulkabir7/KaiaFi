import React from 'react';
import { AlertCircle, Briefcase } from 'lucide-react';
import { ARC_MAINNET } from '../constants';
import { useWeb3 } from '../context/Web3Context';

const Portfolio: React.FC = () => {
  const { account, balanceError, chainId, isConnected, vaultUsdcBalance, walletUsdcBalance } = useWeb3();
  const isArc = chainId === ARC_MAINNET.chainId;

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-medium text-emerald-700">Account</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Portfolio</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">On-chain Arc USDC balance and KaiaFi vault custody position.</p>
      </section>
      {!isConnected || !isArc ? (
        <div role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600">
          Connect a wallet on Arc Mainnet to load this account’s balances. No portfolio values are estimated or simulated.
        </div>
      ) : (
        <>
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Connected wallet</p>
            <p className="mt-2 break-all font-mono text-sm text-slate-800">{account}</p>
          </article>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Wallet USDC</p>
              <p className="mt-3 text-2xl font-semibold tabular-nums">{walletUsdcBalance ?? 'Unavailable'}{walletUsdcBalance !== null ? ' USDC' : ''}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Vault custody balance</p>
              <p className="mt-3 text-2xl font-semibold tabular-nums">{vaultUsdcBalance ?? 'Unavailable'}{vaultUsdcBalance !== null ? ' USDC' : ''}</p>
            </article>
          </div>
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <p>The vault holds withdrawable USDC only. There are no lending shares, interest, collateral positions, or debt records.</p>
          </div>
          {balanceError && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Could not load one or more Arc balances: {balanceError}
            </div>
          )}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
              <Briefcase size={18} className="text-emerald-700" />
              <h2 className="font-semibold">Positions</h2>
            </div>
            <p className="p-5 text-sm text-slate-500">No lending or borrowing positions are available for this account.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;
