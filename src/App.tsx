import { useState } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle, Wallet } from 'lucide-react';
import { ARC_MAINNET } from './constants';
import { useWeb3 } from './context/Web3Context';
import { Web3Provider } from './context/Web3Provider';

function KaiaFiApp() {
  const {
    account,
    chainId,
    connect,
    disconnect,
    error: walletError,
    isConnected,
    isConnecting,
    switchNetwork,
  } = useWeb3();
  const [actionError, setActionError] = useState<string | null>(null);
  const isArc = chainId === ARC_MAINNET.chainId;

  const runWalletAction = async (action: () => Promise<void>) => {
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The wallet request failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="text-xl font-semibold tracking-tight">KaiaFi</p>
            <p className="text-xs text-slate-500">USDC lending on Arc</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-flex ${
              isConnected && !isArc
                ? 'bg-amber-100 text-amber-800'
                : isConnected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-700'
            }`}>
              {isConnected && !isArc
                ? 'Wrong network'
                : isConnected
                  ? 'Connected to Arc'
                  : 'Target: Arc mainnet'}
            </span>
            {!isConnected ? (
              <button
                type="button"
                onClick={() => void runWalletAction(connect)}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
              >
                <Wallet size={16} aria-hidden="true" />
                {isConnecting ? 'Connecting…' : 'Connect wallet'}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-slate-600 sm:inline">
                  {account?.slice(0, 6)}…{account?.slice(-4)}
                </span>
                {isArc ? (
                  <button
                    type="button"
                    onClick={disconnect}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void runWalletAction(() => switchNetwork(ARC_MAINNET.chainId))}
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    Switch to Arc
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-700">
            Pre-launch
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            A clear path to USDC lending on Arc.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            KaiaFi is being prepared for Arc. The current contracts are prototypes and
            are not suitable for real funds, so no lending or borrowing actions are enabled.
          </p>
        </section>

        {(actionError || walletError) && (
          <div role="alert" className="mt-8 flex max-w-3xl items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>{actionError ?? walletError}</p>
          </div>
        )}

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-amber-950">No live lending market</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-amber-900">
                  No KaiaFi contracts have been deployed or verified on Arc. Market
                  liquidity, rates, balances, and positions are therefore unavailable.
                  Do not send funds to the prototype contracts.
                </p>
              </div>
            </div>
            <div className="mt-7 border-t border-amber-200 pt-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">USDC</p>
                  <p className="mt-1 text-sm text-slate-600">Planned asset · market not configured</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  Unavailable
                </span>
              </div>
              <div className="mt-5 flex gap-3">
                <button type="button" disabled className="cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500">
                  Supply
                </button>
                <button type="button" disabled className="cursor-not-allowed rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-400">
                  Borrow
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Network configuration</p>
                <h2 className="mt-2 text-2xl font-semibold">{ARC_MAINNET.name}</h2>
              </div>
              {isConnected && isArc && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                  <CheckCircle size={14} aria-hidden="true" />
                  Wallet connected
                </span>
              )}
            </div>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-4">
                <dt className="text-slate-500">Chain ID</dt>
                <dd className="font-medium tabular-nums">{ARC_MAINNET.chainId}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-4">
                <dt className="text-slate-500">Gas token</dt>
                <dd className="font-medium">USDC</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-4">
                <dt className="text-slate-500">USDC contract interface</dt>
                <dd>
                  <a
                    className="inline-flex items-center gap-1 font-medium text-indigo-700 hover:text-indigo-900"
                    href={`${ARC_MAINNET.explorerUrl}/address/${ARC_MAINNET.usdc.address}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View address <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-xs leading-5 text-slate-500">
              Arc’s native USDC gas balance uses 18 decimals; the ERC-20 interface
              shown here uses 6. They represent the same USDC balance.
            </p>
          </article>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            Network details are based on the{' '}
            <a className="font-medium text-indigo-700 hover:text-indigo-900" href="https://docs.arc.io/arc/references/connect-to-arc" target="_blank" rel="noreferrer">
              official Arc documentation
            </a>
            . This interface currently reads wallet connection state only; it does not
            submit transactions or read lending positions.
          </p>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return (
    <Web3Provider>
      <KaiaFiApp />
    </Web3Provider>
  );
}

export default App;
