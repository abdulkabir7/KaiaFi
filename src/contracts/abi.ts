export const ARC_USDC_ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

export const ARC_USDC_VAULT_ABI = [
  'function token() view returns (address)',
  'function balances(address account) view returns (uint256)',
  'function totalDeposited() view returns (uint256)',
  'function deposit(uint256 amount)',
  'function withdraw(uint256 amount)',
];
