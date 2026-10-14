import React, { useState } from 'react';
import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, ExternalLink, Loader2 } from 'lucide-react';
import { Contract, ethers } from 'ethers';
import { ARC_MAINNET, ARC_USDC_VAULT_ADDRESS } from '../constants';
import { ARC_USDC_ERC20_ABI, ARC_USDC_VAULT_ABI } from '../contracts/abi';
import { useWeb3 } from '../context/Web3Context';
import type { VaultActivity } from '../types';

interface LendingProps {
  onActivity: (activity: VaultActivity) => void;
}

const Lending: React.FC<LendingProps> = ({ onActivity }) => {
  const {
    account, balanceError, chainId, isConnected, refreshBalances, signer,
    vaultUsdcBalance, walletUsdcBalance,
  } = useWeb3();
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; hash?: string; error?: boolean } | null>(null);
  const isArc = chainId === ARC_MAINNET.chainId;
  const vaultConfigured = ethers.utils.isAddress(ARC_USDC_VAULT_ADDRESS);
  const parsedAmount = (() => {
    try {
      return amount ? ethers.utils.parseUnits(amount, ARC_MAINNET.usdc.decimals) : null;
    } catch {
      return null;
    }
  })();
  const balance = action === 'deposit' ? walletUsdcBalance : vaultUsdcBalance;
  const amountValid = parsedAmount !== null && !parsedAmount.isZero() && Number(amount) > 0;
  const exceedsBalance = amountValid && balance !== null && parsedAmount!.gt(
    ethers.utils.parseUnits(balance, ARC_MAINNET.usdc.decimals),
  );

  const execute = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isConnected || !isArc || !signer || !account || !vaultConfigured || !parsedAmount || parsedAmount.isZero()) {
      setFeedback({
        message: 'Connect a wallet on Arc, configure the deployed vault, and enter a valid amount.',
        error: true,
      });
      return;
    }
    if (exceedsBalance) {
      setFeedback({ message: `Amount exceeds your available ${action === 'deposit' ? 'wallet' : 'vault'} balance.`, error: true });
      return;
    }

    setBusy(true);
    let submitted: { hash: string; action: VaultActivity['action'] } | null = null;
    let lastHash: string | undefined;
    setFeedback({ message: action === 'deposit' ? 'Preparing USDC deposit…' : 'Preparing withdrawal…' });
    try {
      if (action === 'deposit') {
        const token = new Contract(ARC_MAINNET.usdc.address, ARC_USDC_ERC20_ABI, signer);
        const tokenDecimals = Number(await token.decimals());
        if (tokenDecimals !== ARC_MAINNET.usdc.decimals) {
          throw new Error(`Unexpected USDC decimals: expected 6, received ${tokenDecimals}.`);
        }
        const allowance = await token.allowance(account, ARC_USDC_VAULT_ADDRESS);
        if (allowance.lt(parsedAmount)) {
          const approval = await token.approve(ARC_USDC_VAULT_ADDRESS, parsedAmount);
          lastHash = approval.hash;
          setFeedback({ message: 'Approve USDC in your wallet; waiting for confirmation…', hash: approval.hash });
          await approval.wait(1);
        }
        const vault = new Contract(ARC_USDC_VAULT_ADDRESS, ARC_USDC_VAULT_ABI, signer);
        const configuredToken: string = await vault.token();
        if (configuredToken.toLowerCase() !== ARC_MAINNET.usdc.address.toLowerCase()) {
          throw new Error('Configured vault does not use the official Arc USDC contract.');
        }
        const transaction = await vault.deposit(parsedAmount);
        submitted = { hash: transaction.hash, action: 'Deposit' };
        setFeedback({ message: 'Deposit submitted; waiting for confirmation…', hash: transaction.hash });
        onActivity({
          hash: transaction.hash,
          action: 'Deposit',
          amount,
          timestamp: Date.now(),
          status: 'Pending',
        });
        await transaction.wait(1);
        onActivity({
          hash: transaction.hash,
          action: 'Deposit',
          amount,
          timestamp: Date.now(),
          status: 'Confirmed',
        });
        setFeedback({ message: 'USDC deposit confirmed.', hash: transaction.hash });
      } else {
        const vault = new Contract(ARC_USDC_VAULT_ADDRESS, ARC_USDC_VAULT_ABI, signer);
        const configuredToken: string = await vault.token();
        if (configuredToken.toLowerCase() !== ARC_MAINNET.usdc.address.toLowerCase()) {
          throw new Error('Configured vault does not use the official Arc USDC contract.');
        }
        const transaction = await vault.withdraw(parsedAmount);
        submitted = { hash: transaction.hash, action: 'Withdraw' };
        setFeedback({ message: 'Withdrawal submitted; waiting for confirmation…', hash: transaction.hash });
        onActivity({
          hash: transaction.hash,
          action: 'Withdraw',
          amount,
          timestamp: Date.now(),
          status: 'Pending',
        });
        await transaction.wait(1);
        onActivity({
          hash: transaction.hash,
          action: 'Withdraw',
          amount,
          timestamp: Date.now(),
          status: 'Confirmed',
        });
        setFeedback({ message: 'USDC withdrawal confirmed.', hash: transaction.hash });
      }
      setAmount('');
      await refreshBalances();
    } catch (caughtError) {
      if (submitted) {
        onActivity({
          hash: submitted.hash,
          action: submitted.action,
          amount,
          timestamp: Date.now(),
          status: 'Failed',
        });
      }
      setFeedback({
        message: caughtError instanceof Error ? caughtError.message : 'The transaction failed.',
        error: true,
        hash: submitted?.hash ?? lastHash,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-medium text-emerald-700">USDC · Arc Mainnet</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Lending</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          The former lending contracts are not safe to use. This page keeps the deposit journey available through a simple, user-owned custody vault; deposits do not earn interest and are not lent out.
        </p>
      </section>
      <div role="status" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <AlertCircle size={19} className="mt-0.5 shrink-0 text-amber-700" />
        <p><strong>Not a lending market.</strong> No APY, credit, collateral, or borrowing is provided by the vault.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">USDC custody vault</h2>
              <p className="mt-1 text-sm text-slate-500">One ERC-20 token · 6 decimals · no yield</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              vaultConfigured ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>{vaultConfigured ? 'Configured' : 'Not deployed'}</span>
          </div>
          <form onSubmit={(event) => void execute(event)} className="mt-7 max-w-lg space-y-5">
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              <button type="button" onClick={() => { setAction('deposit'); setFeedback(null); }} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${action === 'deposit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>
                <ArrowDownToLine size={15} /> Deposit
              </button>
              <button type="button" onClick={() => { setAction('withdraw'); setFeedback(null); }} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${action === 'withdraw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>
                <ArrowUpFromLine size={15} /> Withdraw
              </button>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="usdc-amount" className="text-sm font-medium text-slate-700">Amount</label>
                <span className="text-xs text-slate-500">
                  {balance === null ? 'Balance unavailable' : `Available: ${balance} USDC`}
                </span>
              </div>
              <div className="flex rounded-lg border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
                <input id="usdc-amount" inputMode="decimal" autoComplete="off" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="min-w-0 flex-1 rounded-l-lg border-0 px-4 py-3 focus:ring-0" aria-describedby="usdc-amount-help" />
                <span className="flex items-center px-4 text-sm font-semibold text-slate-500">USDC</span>
              </div>
              <p id="usdc-amount-help" className="mt-2 text-xs text-slate-500">USDC ERC-20 units use 6 decimals; Arc also uses native USDC to pay gas.</p>
            </div>
            <button type="submit" disabled={busy || !vaultConfigured || !isConnected || !isArc || !amountValid || exceedsBalance} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              {busy ? <Loader2 size={16} className="animate-spin" /> : action === 'deposit' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
              {busy ? 'Waiting for wallet…' : action === 'deposit' ? 'Deposit USDC' : 'Withdraw USDC'}
            </button>
            {!isConnected && <p className="text-sm text-slate-500">Connect a wallet to deposit or withdraw.</p>}
            {isConnected && !isArc && <p className="text-sm text-amber-800">Switch to Arc Mainnet before transacting.</p>}
            {!vaultConfigured && <p className="text-sm text-slate-500">Set VITE_ARC_USDC_VAULT_ADDRESS after the vault has been deployed.</p>}
            {feedback && (
              <div role={feedback.error ? 'alert' : 'status'} className={`rounded-lg border p-3 text-sm ${feedback.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                <p>{feedback.message}</p>
                {feedback.hash && <a href={`${ARC_MAINNET.explorerUrl}/tx/${feedback.hash}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-medium text-emerald-800 hover:text-emerald-900">
                  View transaction <ExternalLink size={14} />
                </a>}
              </div>
            )}
          </form>
        </article>
        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Your balances</h2>
          <dl className="mt-5 space-y-4">
            <div className="border-t border-slate-100 pt-4">
              <dt className="text-sm text-slate-500">Wallet USDC</dt>
              <dd className="mt-1 font-semibold tabular-nums">{walletUsdcBalance ?? 'Unavailable'}{walletUsdcBalance !== null ? ' USDC' : ''}</dd>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <dt className="text-sm text-slate-500">Deposited in vault</dt>
              <dd className="mt-1 font-semibold tabular-nums">{vaultUsdcBalance ?? 'Unavailable'}{vaultUsdcBalance !== null ? ' USDC' : ''}</dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-5 text-slate-500">These values come from the connected Arc wallet and configured vault. They are not lending positions or yield-bearing balances.</p>
        </aside>
      </div>
      {balanceError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load one or more Arc balances: {balanceError}
        </div>
      )}
    </div>
  );
};

export default Lending;
