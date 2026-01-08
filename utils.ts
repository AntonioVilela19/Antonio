
import { Transaction, TransactionType, MonthlySummary } from './types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const generateMonthlyProjection = (transactions: Transaction[]): MonthlySummary[] => {
  const monthsMap: Record<string, { cash: number; installment: number }> = {};

  transactions.forEach((t) => {
    const startDate = new Date(t.date);
    
    if (t.type === TransactionType.CASH) {
      const monthKey = t.date.substring(0, 7); // YYYY-MM
      if (!monthsMap[monthKey]) monthsMap[monthKey] = { cash: 0, installment: 0 };
      monthsMap[monthKey].cash += t.amount;
    } else {
      const installmentAmount = t.amount / t.installmentsCount;
      for (let i = 0; i < t.installmentsCount; i++) {
        const d = new Date(startDate);
        d.setMonth(startDate.getMonth() + i);
        const monthKey = d.toISOString().substring(0, 7);
        
        if (!monthsMap[monthKey]) monthsMap[monthKey] = { cash: 0, installment: 0 };
        monthsMap[monthKey].installment += installmentAmount;
      }
    }
  });

  // Convert map to sorted array
  return Object.keys(monthsMap)
    .sort()
    .map((month) => ({
      month,
      cashTotal: monthsMap[month].cash,
      installmentTotal: monthsMap[month].installment,
      total: monthsMap[month].cash + monthsMap[month].installment,
    }));
};

export const getMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
};
