
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface Props {
  onAdd: (transaction: Transaction) => void;
}

const TransactionForm: React.FC<Props> = ({ onAdd }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [type, setType] = useState<TransactionType>(TransactionType.CASH);
  const [installments, setInstallments] = useState('1');
  const [category, setCategory] = useState('Geral');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount: parseFloat(amount),
      date,
      type,
      installmentsCount: type === TransactionType.CASH ? 1 : parseInt(installments),
      category,
    };

    onAdd(newTransaction);
    setDescription('');
    setAmount('');
    setInstallments('1');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111827] p-8 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 transition-all hover:border-blue-500/50">
      <h3 className="text-2xl font-black mb-8 text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter">
        <div className="w-1.5 h-7 bg-blue-600 rounded-full shadow-lg shadow-blue-500/30"></div>
        Novo Lançamento
      </h3>
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] px-1">Descrição do Gasto</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white rounded-2xl p-4 font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg"
            placeholder="Ex: Aluguel, Internet, Mercado..."
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] px-1">Valor Total</label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">R$</span>
             <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white rounded-2xl p-4 pl-12 font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-xl"
              placeholder="0,00"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] px-1">Data</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white rounded-2xl p-4 text-xs font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all uppercase"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] px-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white rounded-2xl p-4 text-xs font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer uppercase"
            >
              <option>Geral</option>
              <option>Gastos Fixos</option>
              <option>Alimentação</option>
              <option>Transporte</option>
              <option>Lazer</option>
              <option>Moradia</option>
              <option>Saúde</option>
              <option>Educação</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] px-1">Forma de Pagamento</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setType(TransactionType.CASH)}
              className={`flex-1 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95 ${
                type === TransactionType.CASH
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/40'
                  : 'bg-white dark:bg-[#0a0f1e] text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
              }`}
            >
              À Vista
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.INSTALLMENT)}
              className={`flex-1 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95 ${
                type === TransactionType.INSTALLMENT
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/40'
                  : 'bg-white dark:bg-[#0a0f1e] text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
              }`}
            >
              Parcelado
            </button>
          </div>
        </div>
        {type === TransactionType.INSTALLMENT && (
          <div className="flex flex-col gap-2 animate-fade-in-up">
            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] px-1">Número de Parcelas</label>
            <input
              type="number"
              min="2"
              max="60"
              required
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              className="border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white rounded-2xl p-4 font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg"
              placeholder="12"
            />
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full mt-10 bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/40 active:scale-[0.97] uppercase tracking-[0.3em] text-xs"
      >
        Efetuar Registro
      </button>
    </form>
  );
};

export default TransactionForm;
