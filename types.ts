
export enum TransactionType {
  CASH = 'CASH',
  INSTALLMENT = 'INSTALLMENT'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  installmentsCount: number; // 1 for CASH, >1 for INSTALLMENT
  category: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  cashTotal: number;
  installmentTotal: number;
  total: number;
}
