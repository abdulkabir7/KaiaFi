import React from 'react';
import { Menu, Network, Wallet } from 'lucide-react';
import { ARC_MAINNET } from '../constants';
import { useWeb3 } from '../context/Web3Context';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const {
    account, chainId, connect, disconnect, error, isConnected, isConnecting, switchNetwork,
  } = useWeb3();
  const isArc = chainId === ARC_MAINNET.chainId;

  const handleConnect = async () => {
    try {
      await connect();
    } catch {
      // The wallet context retains and displays the provider error.
    }
  };

  const handleSwitch = async () => {
    try {
      await switchNetwork(ARC_MAINNET.chainId);
    } catch {
      // The wallet context retains and displays the provider error.
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" aria-label="Open navigation" onClick={onMenuClick} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
          <Menu size={20} />
        </button>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 sm:flex">
        <Network size={14} className={isConnected && isArc ? 'text-emerald-600' : 'text-slate-400'} />
        {isConnected && !isArc ? 'Wrong network' : 'Arc Mainnet'}
        <span className="text-slate-400">·</span>
        {ARC_MAINNET.chainId}
      </div>
      {!isConnected ? (
        <button type="button" disabled={isConnecting} onClick={() => void handleConnect()} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
          <Wallet size={16} />
          {isConnecting ? 'Connecting…' : 'Connect wallet'}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          {!isArc && (
            <button type="button" onClick={() => void handleSwitch()} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100">
              Switch to Arc
            </button>
          )}
          <span title={account ?? undefined} className="hidden rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700 sm:inline">
            {account?.slice(0, 6)}…{account?.slice(-4)}
          </span>
          <button type="button" onClick={disconnect} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Disconnect
          </button>
        </div>
      )}
      {error && (
        <div role="alert" className="absolute right-3 top-full z-30 mt-2 max-w-[calc(100vw-1.5rem)] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg sm:right-6 lg:right-8">
          {error}
        </div>
      )}
    </header>
  );
};

export default Header;
