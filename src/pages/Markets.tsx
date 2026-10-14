import React from 'react';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { ARC_MAINNET } from '../constants';

const Markets: React.FC = () => (
  <div className="space-y-7">
    <section>
      <p className="text-sm font-medium text-emerald-700">Arc Mainnet</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Markets</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Verified Arc USDC contract details and current market availability.</p>
    </section>
    <div role="status" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <AlertCircle size={19} className="mt-0.5 shrink-0 text-amber-700" />
      <p>No KaiaFi lending market has been deployed. Liquidity and rates are not available.</p>
    </div>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-5 py-4 font-semibold">Asset</th><th className="px-5 py-4 font-semibold">Token address</th><th className="px-5 py-4 font-semibold">Decimals</th><th className="px-5 py-4 font-semibold">KaiaFi market</th></tr>
          </thead>
          <tbody>
            <tr>
              <td className="whitespace-nowrap px-5 py-5 font-semibold text-slate-900">USDC</td>
              <td className="whitespace-nowrap px-5 py-5 font-mono text-xs text-slate-600">{ARC_MAINNET.usdc.address}</td>
              <td className="px-5 py-5 text-slate-700">6</td>
              <td className="whitespace-nowrap px-5 py-5">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Not deployed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p className="text-sm text-slate-500">
      USDC is also Arc’s native gas asset. Its native gas balance uses 18 decimals; the ERC-20 interface above uses 6 decimals and represents the same balance.{' '}
      <a href={`${ARC_MAINNET.explorerUrl}/address/${ARC_MAINNET.usdc.address}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-emerald-800 hover:text-emerald-900">Open token on Arc Explorer <ArrowUpRight size={14} /></a>
    </p>
  </div>
);

export default Markets;
