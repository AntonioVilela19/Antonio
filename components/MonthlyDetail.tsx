
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, MonthlySummary } from '../types';
import { formatCurrency, getMonthLabel } from '../utils';

interface Props {
  transactions: Transaction[];
  summary: MonthlySummary[];
  isDarkMode?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Gastos Fixos': 'border-blue-600 bg-blue-50/10',
  'Alimentação': 'border-emerald-600 bg-emerald-50/10',
  'Transporte': 'border-indigo-600 bg-indigo-50/10',
  'Lazer': 'border-amber-600 bg-amber-50/10',
  'Moradia': 'border-purple-600 bg-purple-50/10',
  'Saúde': 'border-rose-600 bg-rose-50/10',
  'Educação': 'border-cyan-600 bg-cyan-50/10',
  'Geral': 'border-slate-600 bg-slate-50/10',
};

const MonthlyDetail: React.FC<Props> = ({ transactions, summary, isDarkMode }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(summary.length > 0 ? summary[summary.length - 1].month : '');
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  useEffect(() => {
    if (!selectedMonth && summary.length > 0) {
      setSelectedMonth(summary[summary.length - 1].month);
    }
  }, [summary, selectedMonth]);

  const monthData = useMemo(() => {
    const list: Array<{ id: string; description: string; category: string; amount: number; type: TransactionType; info?: string; }> = [];
    transactions.forEach(t => {
      const startDate = new Date(t.date);
      if (t.type === TransactionType.CASH) {
        if (t.date.substring(0, 7) === selectedMonth) {
          list.push({ id: t.id, description: t.description, category: t.category, amount: t.amount, type: t.type });
        }
      } else {
        const installmentValue = t.amount / t.installmentsCount;
        for (let i = 0; i < t.installmentsCount; i++) {
          const d = new Date(startDate);
          d.setMonth(startDate.getMonth() + i);
          const mKey = d.toISOString().substring(0, 7);
          if (mKey === selectedMonth) {
            list.push({ id: `${t.id}-${i}`, description: t.description, category: t.category, amount: installmentValue, type: t.type, info: `Parcela ${i + 1}/${t.installmentsCount}` });
          }
        }
      }
    });
    return list;
  }, [selectedMonth, transactions]);

  const stats = useMemo(() => {
    const categories = Array.from(new Set(monthData.map(d => d.category)));
    const totals = monthData.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const fixedTotal = monthData
      .filter(d => d.category === 'Gastos Fixos')
      .reduce((sum, d) => sum + d.amount, 0);

    return { categories: ['Todas', ...categories].sort(), totals, fixedTotal };
  }, [monthData]);

  const filteredItems = useMemo(() => {
    return monthData.filter(d => activeCategory === 'Todas' || d.category === activeCategory)
      .sort((a, b) => b.amount - a.amount);
  }, [monthData, activeCategory]);

  const currentSummary = summary.find(s => s.month === selectedMonth);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Month Selector & Main Total */}
      <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Explorar Período</label>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus-within:border-blue-500 transition-all">
            <select 
              value={selectedMonth} 
              onChange={(e) => { setSelectedMonth(e.target.value); setActiveCategory('Todas'); }}
              className="bg-transparent text-xl font-black text-slate-900 dark:text-white outline-none cursor-pointer pr-8 uppercase"
            >
              {summary.map(s => <option key={s.month} value={s.month} className="dark:bg-slate-900">{getMonthLabel(s.month)}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:w-auto">
          <div className="bg-slate-900 dark:bg-[#0f172a] p-8 rounded-[2rem] flex flex-col items-end justify-center shadow-xl border border-slate-800 min-w-[240px]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Custo Total</span>
            <span className="text-3xl font-black text-white">{formatCurrency(currentSummary?.total || 0)}</span>
          </div>
          <div className="bg-blue-600 p-8 rounded-[2rem] flex flex-col items-end justify-center shadow-xl shadow-blue-500/20 min-w-[240px]">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Gastos Fixos</span>
            <span className="text-3xl font-black text-white">{formatCurrency(stats.fixedTotal)}</span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {stats.categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-md border-2 ${
              activeCategory === cat
                ? 'bg-blue-600 text-white border-blue-600 scale-[1.05] shadow-blue-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:border-blue-500/20'
            }`}
          >
            {cat} {cat !== 'Todas' && `(${formatCurrency(stats.totals[cat])})`}
          </button>
        ))}
      </div>

      {/* Detailed List */}
      <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Detalhamento Individual</h4>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredItems.length} Itens Encontrados</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all gap-6 border-l-8 ${CATEGORY_COLORS[item.category] || 'border-slate-600'}`}>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight">{item.description}</span>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.category}</span>
                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${item.type === TransactionType.CASH ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'}`}>
                      {item.type === TransactionType.CASH ? 'À Vista' : 'Parcelado'}
                    </span>
                    {item.info && (
                      <span className="text-[9px] px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-black uppercase tracking-widest">
                        {item.info}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end shrink-0">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Impacto Mensal</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-32 text-center opacity-30 flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-black uppercase tracking-[0.3em]">Nenhum dado para este filtro</span>
            </div>
          )}
        </div>

        {/* Dynamic Warning for fixed expenses */}
        <div className="p-8 bg-blue-600/5 dark:bg-blue-500/5 border-t border-blue-500/20">
          <p className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Dica: Seus gastos fixos representam {((stats.fixedTotal / (currentSummary?.total || 1)) * 100).toFixed(1)}% do seu custo este mês.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyDetail;
