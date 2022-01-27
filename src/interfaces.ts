export interface APIResponse {
  //API response type from backend
  success: boolean;
  data: any;
  error: {
    code?: string;
    message: string;
  };
}

export interface Wallet {
  address: string;
  isFavorite: boolean;
  creationTS: number;
}

export interface Rate {
  fiat: string;
  value: number;
}

export interface WalletDetails extends Wallet {
  balance: string;
  firstTxTS?: number;
}

