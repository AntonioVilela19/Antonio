
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDelete }) => {
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [quickRange, setQuickRange] = useState<string>('Personalizado');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Estados para feedback visual
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const categories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return ['Todas', ...Array.from(cats)].sort();
  }, [transactions]);

  const handleQuickRangeChange = (range: string) => {
    setQuickRange(range);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let start = '';
    let end = '';

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (range) {
      case 'Hoje':
        start = formatDate(today);
        end = formatDate(today);
        break;
      case 'Últimos 7 dias':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        start = formatDate(sevenDaysAgo);
        end = formatDate(today);
        break;
      case 'Últimos 30 dias':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        start = formatDate(thirtyDaysAgo);
        end = formatDate(today);
        break;
      case 'Este Mês':
        const firstDayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        start = formatDate(firstDayMonth);
        end = formatDate(lastDayMonth);
        break;
      case 'Mês Passado':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        start = formatDate(firstDayLastMonth);
        end = formatDate(lastDayLastMonth);
        break;
      case 'Este Ano':
        const firstDayYear = new Date(today.getFullYear(), 0, 1);
        start = formatDate(firstDayYear);
        end = formatDate(today);
        break;
      default:
        if (range === 'Todos') {
            start = '';
            end = '';
        }
        return;
    }
    setStartDate(start);
    setEndDate(end);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchCategory = filterCategory === 'Todas' || t.category === filterCategory;
      const matchType =
        filterType === 'Todos' ||
        (filterType === 'À Vista' && t.type === TransactionType.CASH) ||
        (filterType === 'Parcelado' && t.type === TransactionType.INSTALLMENT);
      
      const matchStartDate = !startDate || t.date >= startDate;
      const matchEndDate = !endDate || t.date <= endDate;

      return matchCategory && matchType && matchStartDate && matchEndDate;
    });
  }, [transactions, filterCategory, filterType, startDate, endDate]);

  const clearFilters = () => {
    setFilterCategory('Todas');
    setFilterType('Todos');
    setQuickRange('Personalizado');
    setStartDate('');
    setEndDate('');
  };

  const handleDeleteWithFeedback = (id: string, description: string) => {
    setDeletingId(id);
    
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
      setToast({ show: true, message: `"${description}" removido com sucesso.` });
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    }, 400);
  };

  const getInstallmentProgress = (t: Transaction) => {
    if (t.type !== TransactionType.INSTALLMENT) return null;
    
    const now = new Date();
    const purchaseDate = new Date(t.date);
    
    const diffMonths = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + (now.getMonth() - purchaseDate.getMonth());
    
    const current = Math.max(1, Math.min(t.installmentsCount, diffMonths + 1));
    const remaining = t.installmentsCount - current;
    const progressPercent = (current / t.installmentsCount) * 100;
    
    return {
      current,
      total: t.installmentsCount,
      remaining,
      percent: progressPercent,
      isFinished: diffMonths + 1 > t.installmentsCount
    };
  };

  return (
    <div className="relative bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all border-b-8 border-b-blue-600/20">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-toast-in">
          <div className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="p-10 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-10 bg-blue-600 rounded-full shadow-lg shadow-blue-500/30"></div>
             <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Histórico de Compras</h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mt-1 italic">Gestão de Base de Dados</p>
             </div>
          </div>
          <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-6 py-2 rounded-2xl font-black uppercase tracking-[0.2em] border border-blue-200 dark:border-blue-800 shadow-md">
            {filteredTransactions.length} Movimentações
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 items-end bg-white dark:bg-[#0a0f1e] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm uppercase"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Modalidade</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm uppercase"
            >
              <option value="Todos">Todos</option>
              <option value="À Vista">À Vista</option>
              <option value="Parcelado">Parcelado</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Período</label>
            <select
              value={quickRange}
              onChange={(e) => handleQuickRangeChange(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm uppercase"
            >
              <option value="Personalizado">Personalizado</option>
              <option value="Todos">Limpar Datas</option>
              <option value="Hoje">Hoje</option>
              <option value="Últimos 7 dias">Últimos 7 dias</option>
              <option value="Últimos 30 dias">Últimos 30 dias</option>
              <option value="Este Mês">Este Mês</option>
              <option value="Mês Passado">Mês Passado</option>
              <option value="Este Ano">Este Ano</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">De:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setQuickRange('Personalizado'); }}
              className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Até:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setQuickRange('Personalizado'); }}
              className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
            />
          </div>

          <button
            onClick={clearFilters}
            className="h-[52px] px-6 text-[10px] font-black text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 rounded-2xl transition-all border-2 border-slate-200 dark:border-slate-700 hover:border-red-500/30 flex items-center justify-center gap-2 uppercase tracking-[0.2em]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
              <th className="px-10 py-6 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Data</th>
              <th className="px-10 py-6 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Descrição</th>
              <th className="px-10 py-6 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Categoria</th>
              <th className="px-10 py-6 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Tipo</th>
              <th className="px-10 py-6 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-center">Progresso Parcelas</th>
              <th className="px-10 py-6 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-right">Valor Total</th>
              <th className="px-10 py-6 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-10 rounded-[2.5rem] shadow-inner border border-dashed border-slate-200 dark:border-slate-700">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-slate-400 dark:text-slate-600 font-black text-2xl uppercase tracking-tighter">Nenhum registro para exibir</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t, index) => {
                const installmentInfo = getInstallmentProgress(t);
                return (
                  <tr 
                    key={t.id} 
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group border-l-4 border-transparent hover:border-blue-500 ${
                      deletingId === t.id ? 'animate-row-fade-out scale-95 opacity-0' : 'animate-row-fade-in'
                    }`}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="px-10 py-6 text-sm font-black text-slate-500 dark:text-slate-500 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-10 py-6 text-base font-black text-slate-900 dark:text-white">{t.description}</td>
                    <td className="px-10 py-6">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-10 py-6 whitespace-nowrap">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                        t.type === TransactionType.CASH 
                          ? 'bg-blue-600 text-white shadow-blue-500/20' 
                          : 'bg-indigo-600 text-white shadow-indigo-500/20'
                      }`}>
                        {t.type === TransactionType.CASH ? 'À Vista' : 'Parcelado'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-sm font-black text-slate-700 dark:text-slate-400 text-center uppercase tracking-widest">
                      {t.type === TransactionType.CASH ? (
                        <span className="opacity-30">-</span>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-2">
                             <span className="text-indigo-600 dark:text-indigo-400 font-black text-xs">
                               {installmentInfo?.isFinished ? 'Finalizado' : `${installmentInfo?.current} de ${installmentInfo?.total}`}
                             </span>
                             {installmentInfo?.remaining !== undefined && installmentInfo.remaining > 0 && (
                               <span className="text-[9px] text-slate-400 italic">(faltam {installmentInfo.remaining})</span>
                             )}
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                            <div 
                              className={`h-full transition-all duration-1000 ${installmentInfo?.isFinished ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${installmentInfo?.percent}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-6 text-lg font-black text-slate-900 dark:text-white text-right whitespace-nowrap">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-10 py-6 text-center">
                      <button
                        onClick={() => handleDeleteWithFeedback(t.id, t.description)}
                        disabled={deletingId !== null}
                        className="text-slate-300 hover:text-red-500 dark:text-slate-700 dark:hover:text-red-400 transition-all p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-transparent hover:border-red-100 dark:hover:border-red-900/30 shadow-sm disabled:opacity-50"
                        title="Excluir Permanentemente"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes row-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-row-fade-in {
          animation: row-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes row-fade-out {
          0% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-20px); height: 0; padding: 0; overflow: hidden; }
        }
        .animate-row-fade-out {
          animation: row-fade-out 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes toast-in {
          0% { transform: translate(-50%, 50px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-toast-in {
          animation: toast-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default TransactionList;
