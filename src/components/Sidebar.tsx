import React from 'react';
import { Activity, BarChart3, Coins, Home, Landmark, Wallet, X } from 'lucide-react';

export type KaiaFiPage = 'overview' | 'lending' | 'borrowing' | 'markets' | 'portfolio' | 'activity';

const links: { id: KaiaFiPage; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'lending', label: 'Lending', icon: Coins },
  { id: 'borrowing', label: 'Borrowing', icon: Landmark },
  { id: 'markets', label: 'Markets', icon: BarChart3 },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
  { id: 'activity', label: 'Activity', icon: Activity },
];

interface SidebarProps {
  page: KaiaFiPage;
  open: boolean;
  onNavigate: (page: KaiaFiPage) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ page, open, onNavigate, onClose }) => (
  <>
    {open && (
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
      />
    )}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:z-auto lg:translate-x-0 ${
      open ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
        <a href="#/overview" onClick={() => onNavigate('overview')} className="flex items-center gap-3">
          <img src="/KF logo.png" alt="" className="h-11 w-11 rounded-xl object-cover" />
          <span>
            <span className="block text-lg font-semibold tracking-tight text-slate-900">KaiaFi</span>
            <span className="block text-xs text-slate-500">Lending on Arc</span>
          </span>
        </a>
        <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
          <X size={18} />
        </button>
      </div>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
        {links.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#/${id}`}
            aria-current={page === id ? 'page' : undefined}
            onClick={() => onNavigate(id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              page === id
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </a>
        ))}
      </nav>
      <div className="m-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Network</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">Arc Mainnet</p>
        <p className="mt-1 text-xs text-slate-600">USDC gas · Chain 5042</p>
      </div>
    </aside>
  </>
);

export default Sidebar;
