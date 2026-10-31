import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Building,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  Minus,
  PieChart,
  Plus,
  Receipt,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { formatDateBn, formatNumber } from '../../utils/numberConverter';

export const ProfitLossView: React.FC = () => {
  const {
    sales,
    purchases,
    expenses,
    addExpense,
    deleteExpense,
    settings,
    metrics,
  } = useApp();

  const useBn = settings.useBengaliNumerals;

  const [activeTab, setActiveTab] = useState<'overview' | 'expenses'>('overview');
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'all_time'>('this_month');

  // New Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('দোকান ভাড়া (Shop Rent)');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseMethod, setExpenseMethod] = useState<PaymentMethod>('ক্যাশ (Cash)');
  const [expenseRecipient, setExpenseRecipient] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Calculations based on period
  const financialData = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const filteredSales = sales.filter((s) => {
      if (period === 'this_month') return s.date.slice(0, 7) === currentMonth;
      return true;
    });

    const filteredExpenses = expenses.filter((e) => {
      if (period === 'this_month') return e.date.slice(0, 7) === currentMonth;
      return true;
    });

    const totalSales = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCOGS = filteredSales.reduce((sum, s) => sum + s.totalCost, 0);
    const grossProfit = Math.max(0, totalSales - totalCOGS);
    const totalOperatingExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalOperatingExpenses;
    const grossMarginPercent = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
    const netMarginPercent = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    return {
      totalSales,
      totalCOGS,
      grossProfit,
      totalOperatingExpenses,
      netProfit,
      grossMarginPercent,
      netMarginPercent,
      filteredSales,
      filteredExpenses,
    };
  }, [sales, expenses, period]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;

    addExpense({
      date: new Date().toISOString().slice(0, 10),
      category: expenseCategory,
      amount: expenseAmount,
      paymentMethod: expenseMethod,
      recipient: expenseRecipient,
      notes: expenseNotes,
    });

    setIsExpenseModalOpen(false);
    setExpenseAmount(0);
    setExpenseRecipient('');
    setExpenseNotes('');
  };

  const EXPENSE_CATEGORIES: ExpenseCategory[] = [
    'দোকান ভাড়া (Shop Rent)',
    'বিদ্যুৎ বিল (Electricity)',
    'কর্মচারীর বেতন (Staff Salary)',
    'পরিবহন ও যাতায়াত (Transport)',
    'প্যাকেজিং ও ব্যাগ (Packaging)',
    'দোকান রক্ষণাবেক্ষণ (Maintenance)',
    'চা ও আপ্যায়ন (Refreshment)',
    'ট্রেড লাইসেন্স ও অন্যান্য কর (Tax/Fees)',
    'অন্যান্য খরচ (Other Expenses)',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>লাভ-ক্ষতি ও দোকানের ব্যয় বিশ্লেষণ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
              বিজ্ঞানসম্মত COGS সূত্র
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            মোট লাভ (Gross Profit) = বিক্রয় - বিক্রীত পণ্যের ক্রয়মূল্য (COGS) | নিট লাভ = মোট লাভ - পরিচালন খরচ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
          >
            <option value="this_month">চলতি মাস (This Month)</option>
            <option value="all_time">সর্বমোট সময় (All Time)</option>
          </select>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>খরচ লিপিবদ্ধ করুন</span>
          </button>
        </div>
      </div>

      {/* Financial Formula Explanation Card */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-emerald-600" />
          <span>মুদি দোকানের নির্ভুল হিসাববিজ্ঞান মূলনীতি (Accounting Formula)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold block text-emerald-700 dark:text-emerald-400">
              ১. গ্রস প্রফিট (মোট লাভ):
            </span>
            <span>মোট বিক্রি ৳{formatNumber(financialData.totalSales, useBn)} - পণ্যের ক্রয়মূল্য (COGS) ৳{formatNumber(financialData.totalCOGS, useBn)} = <strong>৳{formatNumber(financialData.grossProfit, useBn)}</strong></span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold block text-teal-700 dark:text-teal-400">
              ২. নিট প্রফিট (প্রকৃত লাভ):
            </span>
            <span>গ্রস প্রফিট ৳{formatNumber(financialData.grossProfit, useBn)} - পরিচালন খরচ ৳{formatNumber(financialData.totalOperatingExpenses, useBn)} = <strong className={financialData.netProfit >= 0 ? 'text-teal-600' : 'text-rose-600'}>৳{formatNumber(financialData.netProfit, useBn)}</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Primary Financial Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">মোট বিক্রয় (Sales)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {formatNumber(financialData.totalSales, useBn, { isCurrency: true })}
          </div>
          <span className="text-[11px] text-slate-400">নির্বাচিত সময়ের মোট ক্যাশ ও বাকি</span>
        </div>

        {/* COGS */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">বিক্রীত মালের ক্রয়মূল্য (COGS)</span>
          <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300 mt-1">
            {formatNumber(financialData.totalCOGS, useBn, { isCurrency: true })}
          </div>
          <span className="text-[11px] text-slate-400">বিক্রিত পণ্যের আসল পাইকারি খরচ</span>
        </div>

        {/* Gross Profit */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">মোট লাভ (Gross Profit)</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatNumber(financialData.grossProfit, useBn, { isCurrency: true })}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">
            মার্জিন: {formatNumber(financialData.grossMarginPercent.toFixed(1), useBn)}%
          </span>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">প্রকৃত নিট লাভ (Net Profit)</span>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              financialData.netProfit >= 0
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatNumber(financialData.netProfit, useBn, { isCurrency: true })}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            সব খরচ বাদে দোকানে অবশিষ্ট
          </span>
        </div>
      </div>

      {/* Expenses Breakdown & Audit */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              দোকানের পরিচালন ব্যয়ের খতিয়ান (Operating Expenses)
            </h3>
            <p className="text-xs text-slate-500">
              মোট খরচ: {formatNumber(financialData.totalOperatingExpenses, useBn, { isCurrency: true })}
            </p>
          </div>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন খরচ যোগ</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">তারিখ</th>
                <th className="py-2.5 px-3">খরচের খাত</th>
                <th className="py-2.5 px-3">প্রাপক / প্রতিষ্ঠান</th>
                <th className="py-2.5 px-3">পেমেন্ট মেথড</th>
                <th className="py-2.5 px-3 text-right">টাকা</th>
                <th className="py-2.5 px-3">মন্তব্য</th>
                <th className="py-2.5 px-3 text-center">বাতিল</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    কোনো খরচের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-500">
                      {formatDateBn(exp.date, useBn)}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">
                      {exp.category}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-300">
                      {exp.recipient || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">
                      {exp.paymentMethod.split(' ')[0]}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                      {formatNumber(exp.amount, useBn, { isCurrency: true })}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 truncate max-w-[150px]">
                      {exp.notes || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                দোকানের নিয়মিত খরচ লিপিবদ্ধ করুন
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  খরচের খাত*
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold outline-none"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  টাকার পরিমাণ (৳)*
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expenseAmount || ''}
                  onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                  placeholder="যেমন: ১৫০০০"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-rose-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পরিশোধের মাধ্যম
                </label>
                <select
                  value={expenseMethod}
                  onChange={(e) => setExpenseMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="ক্যাশ (Cash)">ক্যাশ (Cash)</option>
                  <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                  <option value="ব্যাংক (Bank)">ব্যাংক (Bank)</option>
                  <option value="নগদ (Nagad)">নগদ (Nagad)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  প্রাপকের নাম / কার কাছে দেওয়া হলো
                </label>
                <input
                  type="text"
                  value={expenseRecipient}
                  onChange={(e) => setExpenseRecipient(e.target.value)}
                  placeholder="যেমন: বাড়িওয়ালা, ডেসকো, পিকআপ চালক, কর্মচারী"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  মন্তব্য / বিবরণ
                </label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="যেমন: অক্টোবর মাসের ভাড়া, ১০০০ ব্যাগ ক্রয়"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                >
                  খরচ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
