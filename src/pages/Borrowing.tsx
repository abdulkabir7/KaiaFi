import React from 'react';
import { AlertCircle, Shield } from 'lucide-react';

const Borrowing: React.FC = () => (
  <div className="space-y-7">
    <section>
      <p className="text-sm font-medium text-emerald-700">Arc Mainnet</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Borrowing</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Review borrowing availability and safety information. No borrow transactions are enabled.
      </p>
    </section>
    <article className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex gap-3">
        <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-700" />
        <div>
          <h2 className="font-semibold text-amber-950">Borrowing is unavailable</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-900">
            The previous pool allowed borrowing without reliable collateral valuation and returned a constant health factor. Its liquidation path did not validate or settle debt. Those contracts are not deployed or used by this application.
          </p>
        </div>
      </div>
    </article>
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ['Supported collateral', 'Not configured'],
        ['Available to borrow', 'Unavailable'],
        ['Health factor', 'Unavailable'],
      ].map(([label, value]) => (
        <article key={label} className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-lg font-semibold text-slate-700">{value}</p>
        </article>
      ))}
    </div>
    <article className="flex gap-3 rounded-xl border border-slate-200 bg-white p-5">
      <Shield size={19} className="mt-0.5 shrink-0 text-slate-500" />
      <p className="text-sm leading-6 text-slate-600">Borrowing will remain disabled until a verified protocol, oracle-backed collateral valuation, correct debt accounting, and liquidation safeguards are available.</p>
    </article>
  </div>
);

export default Borrowing;
