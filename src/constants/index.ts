export const ARC_MAINNET = {
  name: 'Arc',
  chainId: 5042,
  rpcUrl: 'https://rpc.mainnet.arc.io',
  explorerUrl: 'https://explorer.arc.io',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  usdc: {
    address: '0x3600000000000000000000000000000000000000',
    decimals: 6,
  },
} as const;

export const APP_CONFIG = {
  name: 'KaiaFi',
  description: 'An Arc-focused lending and borrowing MVP that is not yet deployed.',
  version: '1.0.0',
  network: ARC_MAINNET.name,
  chainId: ARC_MAINNET.chainId,
  rpcUrl: ARC_MAINNET.rpcUrl,
  explorerUrl: ARC_MAINNET.explorerUrl,
};
