import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ExternalLink, ListTodo } from 'lucide-react';
import { ARC_MAINNET } from '../constants';
import type { VaultActivity } from '../types';

interface ActivityProps {
  items: VaultActivity[];
}

const Activity: React.FC<ActivityProps> = ({ items }) => (
  <div className="space-y-7">
    <section>
      <p className="text-sm font-medium text-emerald-700">Arc Mainnet</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Activity</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Transactions submitted from this browser session.</p>
    </section>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="rounded-full bg-slate-100 p-3 text-slate-500"><ListTodo size={22} /></span>
          <p className="mt-4 font-medium text-slate-900">No transactions in this session</p>
          <p className="mt-1 max-w-md text-sm text-slate-500">Confirmed deposits and withdrawals made here will appear with their actual transaction hashes.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <article key={item.hash} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-800">
                  {item.action === 'Deposit' ? <ArrowDownToLine size={17} /> : <ArrowUpFromLine size={17} />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.action} {item.amount} USDC</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()} · {item.status}</p>
                </div>
              </div>
              <a href={`${ARC_MAINNET.explorerUrl}/tx/${item.hash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 hover:text-emerald-900">
                View transaction <ExternalLink size={14} />
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
    <p className="text-xs text-slate-500">Activity is held in memory for this browser session only; refreshes clear this list. The Arc Explorer remains the canonical transaction record.</p>
  </div>
);

export default Activity;
