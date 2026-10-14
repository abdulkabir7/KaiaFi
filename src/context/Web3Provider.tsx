import React, { useEffect, useState, type ReactNode } from 'react';
import { ARC_MAINNET } from '../constants';
import { Web3Context, type Web3ContextType } from './Web3Context';

interface Web3ProviderProps {
  children: ReactNode;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'The wallet request failed.';

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      const message = 'No browser wallet was found. Install a wallet that supports Arc.';
      setError(message);
      throw new Error(message);
    }

    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!Array.isArray(accounts) || typeof accounts[0] !== 'string') {
        throw new Error('The wallet did not return an account.');
      }
      const chain = await ethereum.request({ method: 'eth_chainId' });
      const parsedChainId = Number(chain);
      if (!Number.isSafeInteger(parsedChainId)) {
        throw new Error('The wallet returned an invalid chain ID.');
      }

      setAccount(accounts[0]);
      setChainId(parsedChainId);
    } catch (caughtError) {
      const message = errorMessage(caughtError);
      setError(message);
      throw caughtError;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    setError(null);
  };

  const switchNetwork = async (targetChainId: number) => {
    if (targetChainId !== ARC_MAINNET.chainId) {
      throw new Error('KaiaFi only supports the configured Arc mainnet.');
    }
    const ethereum = window.ethereum;
    if (!ethereum) {
      throw new Error('No browser wallet was found. Install a wallet that supports Arc.');
    }

    const chainIdHex = `0x${targetChainId.toString(16)}`;
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (caughtError) {
      const code = (caughtError as { code?: number }).code;
      if (code !== 4902) {
        setError(errorMessage(caughtError));
        throw caughtError;
      }

      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: ARC_MAINNET.name,
            nativeCurrency: ARC_MAINNET.nativeCurrency,
            rpcUrls: [ARC_MAINNET.rpcUrl],
            blockExplorerUrls: [ARC_MAINNET.explorerUrl],
          }],
        });
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (addError) {
        setError(errorMessage(addError));
        throw addError;
      }
    }
  };

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      return;
    }

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0];
      const nextAccount = Array.isArray(accounts) && typeof accounts[0] === 'string'
        ? accounts[0]
        : null;
      setAccount(nextAccount);
    };
    const handleChainChanged = (...args: unknown[]) => {
      const nextChainId = Number(args[0]);
      if (Number.isSafeInteger(nextChainId)) {
        setChainId(nextChainId);
      } else {
        setChainId(null);
        setError('The wallet returned an invalid chain ID.');
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    void Promise.all([
      ethereum.request({ method: 'eth_accounts' }),
      ethereum.request({ method: 'eth_chainId' }),
    ]).then(([accounts, chain]) => {
      if (Array.isArray(accounts) && typeof accounts[0] === 'string') {
        setAccount(accounts[0]);
      }
      const parsedChainId = Number(chain);
      if (Number.isSafeInteger(parsedChainId)) {
        setChainId(parsedChainId);
      }
    }).catch((caughtError: unknown) => {
      setError(errorMessage(caughtError));
    });

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const value: Web3ContextType = {
    account,
    chainId,
    isConnected: account !== null,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
