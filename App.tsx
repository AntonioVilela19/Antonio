
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, MonthlySummary } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FinancialDashboard from './components/FinancialDashboard';
import AnnualBreakdown from './components/AnnualBreakdown';
import MonthlyDetail from './components/MonthlyDetail';
import { generateMonthlyProjection } from './utils';

type Tab = 'dashboard' | 'monthly' | 'annual' | 'list';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('smart_finance_theme');
    return saved === 'dark' || !saved; 
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('smart_finance_txs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('smart_finance_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('smart_finance_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const monthlySummary = useMemo(() => generateMonthlyProjection(transactions), [transactions]);

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter(t => t.id !== id));
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark bg-[#0a0f1e] text-slate-100' : 'bg-slate-50 text-slate-900'} pb-20`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-900 border-slate-800'} text-white py-10 px-4 border-b shadow-lg`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.27 1 2.61 1 4 0 5.52-4.48 10-10 10S2 18.52 2 13c0-1.39.43-2.73 1-4 0 0-1.82-6.42-.42-7 1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26Z" />
                <circle cx="9" cy="12" r="0.5" fill="currentColor" />
                <circle cx="15" cy="12" r="0.5" fill="currentColor" />
                <path d="M12 16l0.5-0.5h-1l0.5 0.5z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Controle de <span className="text-blue-500">Gastos 2026</span></h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-1">Jotoim Costs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-2xl transition-all border-2 flex items-center gap-2 font-black text-xs uppercase tracking-widest ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isDarkMode ? (
                <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707m12.728 0l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>Dia</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>Noite</>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`${isDarkMode ? 'bg-[#0f172a]/90' : 'bg-white/90'} backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 px-4 transition-all shadow-sm`}>
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto no-scrollbar py-2">
          {[
            { id: 'dashboard', label: 'Resumo', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'monthly', label: 'Custo Mensal', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'annual', label: 'Projeção Anual', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'list', label: 'Base de Dados', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-3 px-6 py-4 text-xs font-black transition-all rounded-xl whitespace-nowrap uppercase tracking-widest ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-10 grid grid-cols-1 gap-10">
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-4 lg:sticky lg:top-28">
                <TransactionForm onAdd={addTransaction} />
              </div>
              <div className="lg:col-span-8">
                <FinancialDashboard summary={monthlySummary} transactions={transactions} isDarkMode={isDarkMode} />
              </div>
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="animate-fade-in-up">
              <MonthlyDetail transactions={transactions} summary={monthlySummary} isDarkMode={isDarkMode} />
            </div>
          )}

          {activeTab === 'annual' && (
            <div className="animate-fade-in-up">
              <AnnualBreakdown transactions={transactions} />
            </div>
          )}

          {activeTab === 'list' && (
            <div className="animate-fade-in-up">
              <TransactionList transactions={transactions} onDelete={deleteTransaction} />
            </div>
          )}
        </div>
      </main>

      <footer className="mt-24 py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 opacity-40">
            <div className="w-8 h-1 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
            <span className="text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Smart Wallet</span>
            <div className="w-8 h-1 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            Desenvolvido para Máxima Eficiência &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        html {
          scroll-behavior: smooth;
        }
      `}} />
    </div>
  );
};

export default App;
