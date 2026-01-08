
import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MonthlySummary, Transaction, TransactionType } from '../types';
import { formatCurrency, getMonthLabel } from '../utils';

interface Props {
  summary: MonthlySummary[];
  transactions: Transaction[];
  isDarkMode?: boolean;
}

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#ea580c', '#4f46e5'];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Gastos Fixos': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  'Alimentação': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  'Transporte': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  'Lazer': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'Moradia': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  'Saúde': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  'Educação': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'Geral': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
};

const FinancialDashboard: React.FC<Props> = ({ summary, transactions, isDarkMode = false }) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const isSmallMobile = windowWidth < 480;
  const chartTextColor = isDarkMode ? '#cbd5e1' : '#1e293b';
  const gridColor = isDarkMode ? '#1e293b' : '#e2e8f0';

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!selectedMonthKey && summary.length > 0) {
      setSelectedMonthKey(summary[summary.length - 1].month);
    }
  }, [summary, selectedMonthKey]);

  useEffect(() => {
    setSelectedCategory(null);
  }, [selectedMonthKey]);

  const chartData = useMemo(() => summary.map((s) => ({
    name: getMonthLabel(s.month),
    'À Vista': s.cashTotal,
    'Parcelado': s.installmentTotal,
    Total: s.total,
    monthKey: s.month,
  })), [summary]);

  const detailedTransactions = useMemo(() => {
    if (!selectedMonthKey) return [];
    const list: Array<{ id: string; description: string; category: string; amount: number; type: TransactionType; info?: string; }> = [];
    transactions.forEach(t => {
      const startDate = new Date(t.date);
      if (t.type === TransactionType.CASH) {
        if (t.date.substring(0, 7) === selectedMonthKey) {
          list.push({ id: t.id, description: t.description, category: t.category, amount: t.amount, type: t.type });
        }
      } else {
        const installmentValue = t.amount / t.installmentsCount;
        for (let i = 0; i < t.installmentsCount; i++) {
          const d = new Date(startDate);
          d.setMonth(startDate.getMonth() + i);
          const monthKey = d.toISOString().substring(0, 7);
          if (monthKey === selectedMonthKey) {
            list.push({ id: `${t.id}-${i}`, description: t.description, category: t.category, amount: installmentValue, type: t.type, info: `Parcela ${i + 1}/${t.installmentsCount}` });
          }
        }
      }
    });
    return list.sort((a, b) => b.amount - a.amount);
  }, [selectedMonthKey, transactions]);

  const groupedDetailedTransactions = useMemo(() => {
    const groups: Record<string, typeof detailedTransactions> = {};
    detailedTransactions.forEach(t => {
      if (selectedCategory && t.category !== selectedCategory) return;
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return Object.entries(groups).sort((a, b) => {
      const sumA = a[1].reduce((sum, curr) => sum + curr.amount, 0);
      const sumB = b[1].reduce((sum, curr) => sum + curr.amount, 0);
      return sumB - sumA;
    });
  }, [detailedTransactions, selectedCategory]);

  const categoryPieData = useMemo(() => {
    const categoriesMap: Record<string, number> = {};
    detailedTransactions.forEach(t => {
      categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
    });
    return Object.keys(categoriesMap).map(cat => ({ name: cat, value: categoriesMap[cat] })).sort((a, b) => b.value - a.value);
  }, [detailedTransactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border-2 border-slate-200 dark:border-blue-500/30 shadow-2xl rounded-2xl z-50">
          <p className="font-black text-slate-900 dark:text-white mb-2 text-sm border-b border-slate-100 dark:border-slate-700/50 pb-2">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-black flex items-center gap-2 mb-1.5" style={{ color: entry.color || entry.fill }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[11px] font-black drop-shadow-md">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handlePieClick = (data: any) => {
    if (data && data.name) {
      setSelectedCategory(prev => prev === data.name ? null : data.name);
      const breakdownEl = document.getElementById('monthly-breakdown-section');
      if (breakdownEl) breakdownEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-2xl transition-all border-b-4 border-b-blue-600 overflow-hidden">
          <h3 className="text-lg font-black mb-6 text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
            Fluxo Mensal
          </h3>
          <div className="flex-1 w-full min-h-[300px] flex items-center justify-center relative">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }} 
                  onClick={(data) => { if (data && data.activePayload) setSelectedMonthKey(data.activePayload[0].payload.monthKey); }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartTextColor, fontWeight: '900' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartTextColor, fontWeight: '900' }} tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} width={60} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? 'rgba(51, 65, 85, 0.2)' : 'rgba(241, 245, 249, 0.6)' }} />
                  <Legend verticalAlign="top" align="center" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '20px' }} />
                  <Bar dataKey="À Vista" fill="#2563eb" radius={[6, 6, 0, 0]} stackId="a" cursor="pointer" />
                  <Bar dataKey="Parcelado" fill="#60a5fa" radius={[6, 6, 0, 0]} stackId="a" cursor="pointer" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-10 opacity-50 flex flex-col items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
                 <p className="font-black text-sm uppercase tracking-widest">Nenhum dado lançado</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-2xl transition-all border-b-4 border-b-indigo-500 overflow-hidden">
          <h3 className="text-lg font-black mb-6 text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20"></div>
            Evolução Mensal
          </h3>
          <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDarkMode ? "#6366f1" : "#1e293b"} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={isDarkMode ? "#6366f1" : "#1e293b"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartTextColor, fontWeight: '900' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartTextColor, fontWeight: '900' }} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Total" stroke={isDarkMode ? "#818cf8" : "#1e293b"} strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-10 opacity-50 flex flex-col items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                 </svg>
                 <p className="font-black text-sm uppercase tracking-widest">Aguardando registros</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col transition-all overflow-hidden min-h-[480px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter">
              <div className="w-2 h-7 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></div>
              Gastos por Categoria
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 pl-5">Clique na fatia para filtrar a lista abaixo</p>
          </div>
          <div className="bg-blue-600 px-5 py-2 rounded-2xl shadow-lg shadow-blue-500/30">
             <span className="text-white font-black text-xs uppercase tracking-[0.2em]">
               {selectedMonthKey ? getMonthLabel(selectedMonthKey) : '...'}
             </span>
          </div>
        </div>
        
        <div className="flex-1 w-full relative">
          {categoryPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie 
                  data={categoryPieData} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  label={renderCustomizedLabel} 
                  outerRadius={isSmallMobile ? 110 : 140} 
                  innerRadius={isSmallMobile ? 50 : 70} 
                  paddingAngle={4} 
                  dataKey="value" 
                  stroke={isDarkMode ? '#111827' : '#ffffff'} 
                  strokeWidth={3}
                  onClick={handlePieClick}
                  style={{ cursor: 'pointer' }}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke={selectedCategory === entry.name ? '#fff' : 'none'}
                      strokeWidth={selectedCategory === entry.name ? 4 : 0}
                      opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '40px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-900 dark:text-slate-200 font-black text-xl italic uppercase tracking-widest">Sem registros</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-bold max-w-xs">Lance seus gastos no painel lateral para visualizar esta distribuição.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {summary.length > 0 && (
          <>
            <div className="bg-white dark:bg-[#111827] p-8 rounded-[2rem] shadow-lg border border-slate-200 dark:border-slate-800 border-b-4 border-b-blue-500 transform transition-all hover:scale-[1.03]">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3">Média Mensal</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(summary.reduce((acc, s) => acc + s.total, 0) / summary.length)}
              </h4>
            </div>
            <div className="bg-white dark:bg-[#111827] p-8 rounded-[2rem] shadow-lg border border-slate-200 dark:border-slate-800 border-b-4 border-b-emerald-500 transform transition-all hover:scale-[1.03]">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3">Pico de Gasto</p>
              <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(Math.max(...summary.map(s => s.total)))}
              </h4>
            </div>
            <div className="bg-white dark:bg-[#111827] p-8 rounded-[2rem] shadow-lg border border-slate-200 dark:border-slate-800 border-b-4 border-b-slate-900 dark:border-b-slate-400 transform transition-all hover:scale-[1.03]">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3">Meses Ativos</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">
                {summary.length} <span className="text-xs font-black opacity-30">Cíclicos</span>
              </h4>
            </div>
          </>
        )}
      </div>

      <div id="monthly-breakdown-section" className="bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-8 transition-all">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
              Resumo do Mês
              {selectedCategory && (
                <span className="bg-blue-600 text-white text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-widest animate-pulse">
                  Filtro: {selectedCategory}
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-black italic">Consolidado por Categorias</p>
          </div>
          <div className="w-full md:w-auto flex items-center gap-3">
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-100 dark:border-red-800 hover:bg-red-100 transition-colors">
                Limpar Filtro
              </button>
            )}
            <div className="w-full md:w-auto flex items-center gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap px-2 tracking-widest">Filtro:</label>
              <select value={selectedMonthKey} onChange={(e) => setSelectedMonthKey(e.target.value)} className="w-full md:w-auto bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none cursor-pointer pr-4 uppercase">
                {summary.map(s => <option key={s.month} value={s.month} className="dark:bg-slate-800">{getMonthLabel(s.month)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y-8 divide-slate-100 dark:divide-slate-800/40 max-h-[800px] overflow-y-auto custom-scrollbar">
          {groupedDetailedTransactions.length > 0 ? (
            groupedDetailedTransactions.map(([category, items]) => {
              const categoryTotal = items.reduce((sum, item) => sum + item.amount, 0);
              return (
                <div key={category} className="animate-fade-in">
                  <div className="bg-slate-100/40 dark:bg-slate-800/40 px-8 py-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl border-y border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 dark:bg-blue-500 text-white p-2 rounded-xl shadow-lg shadow-blue-500/20">
                        {CATEGORY_ICONS[category] || CATEGORY_ICONS['Geral']}
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{category}</span>
                    </div>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">{formatCurrency(categoryTotal)}</span>
                  </div>
                  
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/30">
                    {items.map((dt) => (
                      <div key={dt.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 pl-12 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all gap-5 border-l-8 ${dt.type === TransactionType.INSTALLMENT ? 'border-indigo-600 bg-indigo-50/5 dark:bg-indigo-900/5' : 'border-blue-500'}`}>
                        <div className="flex items-start gap-5">
                          <div className="min-w-0 flex-1">
                            <span className="font-black text-slate-900 dark:text-white block text-lg leading-tight tracking-tight">{dt.description}</span>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${dt.type === TransactionType.CASH ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'}`}>{dt.type === TransactionType.CASH ? 'À Vista' : 'Parcelado'}</span>
                              {dt.info && <span className="text-[10px] px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-black uppercase tracking-widest border border-slate-300 dark:border-slate-600">{dt.info}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex items-center justify-between sm:block shrink-0">
                          <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</span>
                          <span className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(dt.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-32 px-10">
              <div className="bg-slate-50 dark:bg-slate-800/50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl border-4 border-dashed border-slate-100 dark:border-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-slate-900 dark:text-white font-black text-2xl uppercase tracking-tighter">Mês Vazio</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-bold uppercase tracking-widest">Nenhuma transação encontrada</p>
            </div>
          )}
        </div>

        {selectedMonthKey && (
          <div className="bg-slate-900 dark:bg-[#0f172a] p-8 flex justify-between items-center relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-full bg-blue-600/10 transform translate-x-32 skew-x-12"></div>
            <div className="flex flex-col relative z-10">
              <span className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Comprometimento Mensal</span>
              <span className="text-blue-400 text-sm font-black uppercase tracking-widest italic">{getMonthLabel(selectedMonthKey)}</span>
            </div>
            <div className="flex flex-col items-end relative z-10">
               <span className="text-white text-4xl font-black drop-shadow-2xl">{formatCurrency(summary.find(s => s.month === selectedMonthKey)?.total || 0)}</span>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: ${isDarkMode ? '#0a0f1e' : '#f1f5f9'}; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${isDarkMode ? '#1e293b' : '#cbd5e1'}; 
          border-radius: 20px;
          border: 3px solid ${isDarkMode ? '#0a0f1e' : '#f1f5f9'};
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#334155' : '#94a3b8'}; }
      `}} />
    </div>
  );
};

export default FinancialDashboard;
