
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  transactions: Transaction[];
}

const AnnualBreakdown: React.FC<Props> = ({ transactions }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    const next = new Set(expandedCategories);
    if (next.has(cat)) {
      next.delete(cat);
    } else {
      next.add(cat);
    }
    setExpandedCategories(next);
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>(transactions.map(t => new Date(t.date).getFullYear()));
    years.add(currentYear);
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [transactions, currentYear]);

  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const lastFiveTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const breakdownData = useMemo(() => {
    const categories: string[] = Array.from(new Set<string>(transactions.map(t => t.category))).sort();
    const matrix: Record<string, number[]> = {};
    
    categories.forEach(cat => {
      matrix[cat] = new Array(12).fill(0);
    });

    transactions.forEach(t => {
      const startDate = new Date(t.date);
      const amount = t.amount;

      if (t.type === TransactionType.CASH) {
        const tYear = startDate.getFullYear();
        if (tYear === selectedYear) {
          const tMonth = startDate.getMonth();
          if (!matrix[t.category]) matrix[t.category] = new Array(12).fill(0);
          matrix[t.category][tMonth] += amount;
        }
      } else {
        const installmentAmount = amount / t.installmentsCount;
        for (let i = 0; i < t.installmentsCount; i++) {
          const d = new Date(startDate);
          d.setMonth(startDate.getMonth() + i);
          if (d.getFullYear() === selectedYear) {
            const m = d.getMonth();
            if (!matrix[t.category]) matrix[t.category] = new Array(12).fill(0);
            matrix[t.category][m] += installmentAmount;
          }
        }
      }
    });

    return { categories: Object.keys(matrix).sort(), matrix };
  }, [transactions, selectedYear]);

  const monthTotals = useMemo(() => {
    const totals = new Array(12).fill(0);
    breakdownData.categories.forEach(cat => {
      breakdownData.matrix[cat].forEach((val, idx) => {
        totals[idx] += val;
      });
    });
    return totals;
  }, [breakdownData]);

  const yearTotal = monthTotals.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header with year selection */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#111827] p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 transition-all border-b-4 border-b-blue-600">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Descritivo Anual</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Visão detalhada por categoria em {selectedYear}</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Ano:</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-transparent font-black text-slate-700 dark:text-blue-400 outline-none cursor-pointer pr-4 uppercase text-sm"
          >
            {availableYears.map(y => <option key={y} value={y} className="dark:bg-slate-900">{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: `Acumulado ${selectedYear}`, value: formatCurrency(yearTotal), color: 'border-b-slate-900' },
          { label: 'Média Mensal', value: formatCurrency(yearTotal / 12), color: 'border-b-blue-600' },
          { label: 'Mês de Pico', value: months[monthTotals.indexOf(Math.max(...monthTotals))] || '-', color: 'border-b-emerald-500' },
          { label: 'Categorias', value: breakdownData.categories.length, color: 'border-b-indigo-500' }
        ].map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-[#111827] p-6 rounded-[2rem] shadow-lg border border-slate-200 dark:border-slate-800 border-b-4 ${stat.color} transition-all hover:scale-[1.02]`}>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Annual View */}
      <div className="space-y-4">
        {/* Desktop View: Full Table */}
        <div className="hidden md:block bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative transition-all">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 dark:bg-[#0f172a] z-20 shadow-md">
                    Categoria
                  </th>
                  {months.map(m => (
                    <th key={m} className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">
                      {m}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right sticky right-0 bg-slate-100 dark:bg-[#0f172a] z-20 shadow-md">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {breakdownData.categories.map(cat => {
                  const catTotal = breakdownData.matrix[cat].reduce((a, b) => a + b, 0);
                  return (
                    <tr key={cat} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group">
                      <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-[#111827] group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-all z-10 whitespace-nowrap shadow-sm">
                        {cat}
                      </td>
                      {breakdownData.matrix[cat].map((val, idx) => (
                        <td key={idx} className={`px-6 py-5 text-xs text-right whitespace-nowrap ${val > 0 ? 'text-slate-900 dark:text-slate-100 font-black' : 'text-slate-200 dark:text-slate-800'}`}>
                          {val > 0 ? formatCurrency(val).replace('R$', '').trim() : '-'}
                        </td>
                      ))}
                      <td className="px-6 py-5 text-sm font-black text-blue-600 dark:text-blue-400 text-right sticky right-0 bg-slate-50 dark:bg-[#0f172a] group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all z-10 whitespace-nowrap shadow-sm">
                        {formatCurrency(catTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900 dark:bg-[#0f172a] text-white font-black sticky bottom-0 z-30">
                <tr>
                  <td className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] sticky left-0 bg-slate-900 dark:bg-[#0f172a] z-20">Total Mensal</td>
                  {monthTotals.map((total, idx) => (
                    <td key={idx} className="px-6 py-5 text-xs text-right whitespace-nowrap">
                      {formatCurrency(total).replace('R$', '').trim()}
                    </td>
                  ))}
                  <td className="px-6 py-5 text-sm text-right sticky right-0 bg-slate-800 dark:bg-slate-900 z-20 whitespace-nowrap text-blue-400">
                    {formatCurrency(yearTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Mobile View: Card-based Expansion List with Horizontal Scroll */}
        <div className="md:hidden space-y-4">
          {breakdownData.categories.map(cat => {
            const catTotal = breakdownData.matrix[cat].reduce((a, b) => a + b, 0);
            const isExpanded = expandedCategories.has(cat);
            return (
              <div key={cat} className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg transition-all border-b-4 border-b-slate-100 dark:border-b-slate-800">
                <button 
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between p-6 text-left active:scale-[0.98] transition-transform"
                >
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{cat}</h3>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mt-1">Acumulado: {formatCurrency(catTotal)}</p>
                  </div>
                  <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-900 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-8 pt-2 border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/40 animate-fade-in">
                    <div className="flex overflow-x-auto gap-3 py-2 no-scrollbar scroll-smooth">
                      {breakdownData.matrix[cat].map((val, idx) => (
                        val > 0 && (
                          <div key={idx} className="flex flex-col items-center bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 min-w-[100px] shrink-0 shadow-sm transform transition-all hover:scale-105 active:scale-95">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-700 w-full text-center pb-1.5 mb-1.5">{months[idx]}</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(val).replace('R$', '').trim()}</span>
                          </div>
                        )
                      ))}
                    </div>
                    {catTotal === 0 && (
                      <div className="text-center py-6 opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-widest italic">Sem lançamentos em {selectedYear}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="bg-slate-900 dark:bg-[#0f172a] p-8 rounded-[2rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
             <div className="absolute left-0 top-0 w-full h-full bg-blue-600/10 transform -skew-x-12 translate-x-1/2"></div>
             <div className="relative z-10">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-1">Total Anual</span>
               <span className="text-blue-400 text-xs font-black uppercase italic tracking-widest">{selectedYear}</span>
             </div>
             <span className="text-3xl font-black relative z-10 drop-shadow-xl">{formatCurrency(yearTotal)}</span>
          </div>
        </div>
      </div>

      {/* Últimas Transações */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 transition-all border-b-4 border-b-slate-900">
        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
          <div className="w-1.5 h-7 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
          Lançamentos Recentes
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {lastFiveTransactions.length > 0 ? (
            lastFiveTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center shadow-lg ${t.type === TransactionType.CASH ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-800 dark:text-white line-clamp-1">{t.description}</span>
                      {t.type === TransactionType.INSTALLMENT && (
                        <span className="text-[9px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full font-black uppercase tracking-tighter">
                          {t.installmentsCount}x
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mt-0.5">{t.category}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-base font-black text-slate-900 dark:text-white">{formatCurrency(t.amount)}</span>
                  <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <p className="text-slate-400 dark:text-slate-600 font-black text-xs uppercase tracking-[0.3em]">Aguardando primeiro registro...</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] italic">
          * Valores projetados conforme regime de competência mensal.
        </p>
        <div className="hidden md:flex items-center gap-3 text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.3em] opacity-50">
          Scroll Lateral Ativo
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-bounce-x { animation: bounce-x 1s infinite; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};

export default AnnualBreakdown;
