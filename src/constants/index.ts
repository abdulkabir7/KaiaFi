import ARC_MAINNET from '../../config/arc-mainnet.json';

export { ARC_MAINNET };

export const ARC_USDC_VAULT_ADDRESS = import.meta.env.VITE_ARC_USDC_VAULT_ADDRESS ?? '';

export const APP_CONFIG = {
  name: 'KaiaFi',
  description: 'Arc USDC custody deposits and withdrawals; lending is unavailable.',
  version: '1.0.0',
  network: ARC_MAINNET.name,
  chainId: ARC_MAINNET.chainId,
  rpcUrl: ARC_MAINNET.rpcUrl,
  explorerUrl: ARC_MAINNET.explorerUrl,
};
