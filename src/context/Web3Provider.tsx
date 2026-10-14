import React, { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Contract, ethers, providers } from 'ethers';
import { ARC_MAINNET, ARC_USDC_VAULT_ADDRESS } from '../constants';
import { ARC_USDC_ERC20_ABI, ARC_USDC_VAULT_ABI } from '../contracts/abi';
import { Web3Context, type EthereumProvider, type Web3ContextType } from './Web3Context';

interface Web3ProviderProps {
  children: ReactNode;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'The wallet request failed.';

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<providers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletUsdcBalance, setWalletUsdcBalance] = useState<string | null>(null);
  const [vaultUsdcBalance, setVaultUsdcBalance] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setWallet = (ethereum: EthereumProvider, address: string | null) => {
    setAccount(address);
    if (!address) {
      setProvider(null);
      setSigner(null);
      setWalletUsdcBalance(null);
      setVaultUsdcBalance(null);
      setBalanceError(null);
      return;
    }
    const walletProvider = new providers.Web3Provider(
      ethereum as providers.ExternalProvider,
      'any',
    );
    setProvider(walletProvider);
    setSigner(walletProvider.getSigner(address));
  };

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

      setWallet(ethereum, accounts[0]);
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
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setWalletUsdcBalance(null);
    setVaultUsdcBalance(null);
    setBalanceError(null);
    setError(null);
  };

  const switchNetwork = async (targetChainId: number) => {
    setError(null);
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

  const refreshBalances = useCallback(async () => {
    if (!account || !provider || chainId !== ARC_MAINNET.chainId) {
      setWalletUsdcBalance(null);
      setVaultUsdcBalance(null);
      setBalanceError(null);
      return;
    }

    try {
      const token = new Contract(
        ARC_MAINNET.usdc.address,
        ARC_USDC_ERC20_ABI,
        provider,
      );
      const walletBalance = await token.balanceOf(account);
      setWalletUsdcBalance(ethers.utils.formatUnits(walletBalance, ARC_MAINNET.usdc.decimals));
    } catch (caughtError) {
      setWalletUsdcBalance(null);
      setBalanceError(errorMessage(caughtError));
      return;
    }

    if (!ethers.utils.isAddress(ARC_USDC_VAULT_ADDRESS)) {
      setVaultUsdcBalance(null);
      setBalanceError(null);
      return;
    }

    try {
      const vault = new Contract(ARC_USDC_VAULT_ADDRESS, ARC_USDC_VAULT_ABI, provider);
      const tokenAddress: string = await vault.token();
      if (tokenAddress.toLowerCase() !== ARC_MAINNET.usdc.address.toLowerCase()) {
        throw new Error('Configured vault does not use the official Arc USDC contract.');
      }
      const position = await vault.balances(account);
      setVaultUsdcBalance(ethers.utils.formatUnits(position, ARC_MAINNET.usdc.decimals));
      setBalanceError(null);
    } catch (caughtError) {
      setVaultUsdcBalance(null);
      setBalanceError(errorMessage(caughtError));
    }
  }, [account, chainId, provider]);

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
      setWallet(ethereum, nextAccount);
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
        setWallet(ethereum, accounts[0]);
      } else {
        setWallet(ethereum, null);
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

  useEffect(() => {
    void refreshBalances();
  }, [refreshBalances]);

  const value: Web3ContextType = {
    account,
    provider,
    signer,
    chainId,
    walletUsdcBalance,
    vaultUsdcBalance,
    balanceError,
    isConnected: account !== null,
    isConnecting,
    error,
    refreshBalances,
    connect,
    disconnect,
    switchNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
