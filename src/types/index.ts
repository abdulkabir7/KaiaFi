export interface VaultActivity {
  hash: string;
  action: 'Deposit' | 'Withdraw';
  amount: string;
  timestamp: number;
  status: 'Pending' | 'Confirmed' | 'Failed';
}
