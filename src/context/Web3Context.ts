import { createContext, useContext } from 'react';
import { providers } from 'ethers';

export interface Web3ContextType {
  account: string | null;
  provider: providers.Web3Provider | null;
  signer: providers.JsonRpcSigner | null;
  chainId: number | null;
  walletUsdcBalance: string | null;
  vaultUsdcBalance: string | null;
  balanceError: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void;
  selectedAddress?: string | null;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
