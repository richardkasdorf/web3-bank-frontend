
export interface UserBalance {
  username: string;
  balance_usdc: number;
  currency: string;
}

export interface Transaction {
  id: number;
  amount: string | number;
  type: 'DEPOSIT' | 'WITHDRAW' | string;
  tx_hash: string | null;    
  from_account_id: number | null;
  to_account_id: number | null;
  external_from_address: string | null;
  external_to_address: string | null;
  created_at: string;
}

export interface UserBalance {
  id: number;
  user_id: number;
  balance: string | number; 
  wallet_address: string;    
  blockchain: string;        
  account_type: string;
  custody_type: string;
  circle_wallet_id: string | null;
  circle_wallet_set_id: string | null;
  circle_create_date: string | null;
}



