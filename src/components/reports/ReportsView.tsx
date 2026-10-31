import React, { useState } from 'react';
import { 
  FileText, Download, Printer, TrendingUp, DollarSign, Package, 
  AlertTriangle, Users, Calendar, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNumber, formatDateBn } from '../../utils/numberConverter';

type ReportTab = 'sales' | 'stock' | 'profit_loss' | 'expiry' | 'dues' | 'expenses';

export const ReportsView: React.FC = () => {
  const { 
    products, 
    sales, 
    purchases, 
    expenses, 
    customers, 
    suppliers, 
    metrics, 
    settings 
  } = useApp();

  const useBn = settings.useBengaliNumerals;
  const [activeReport, setActiveReport] = useState<ReportTab>('sales');
  const [dateRange, setDateRange] = useState<'today' | '7days' | 'month' | 'all'>('all');

  // Filter sales by date
  const now = new Date();
  const filteredSales = sales.filter(s => {
    const saleDate = new Date(s.date);
    if (dateRange === 'today') {
      return saleDate.toDateString() === now.toDateString();
    }
    if (dateRange === '7days') {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      return saleDate >= past7;
    }
    if (dateRange === 'month') {
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Filter expenses by date
  const filteredExpenses = expenses.filter(e => {
    const expDate = new Date(e.date);
    if (dateRange === 'today') return expDate.toDateString() === now.toDateString();
    if (dateRange === '7days') {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      return expDate >= past7;
    }
    if (dateRange === 'month') return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    return true;
  });

  // Filter purchases by date
  const filteredPurchases = purchases.filter(p => {
    const purDate = new Date(p.date);
    if (dateRange === 'today') return purDate.toDateString() === now.toDateString();
    if (dateRange === '7days') {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      return purDate >= past7;
    }
    if (dateRange === 'month') return purDate.getMonth() === now.getMonth() && purDate.getFullYear() === now.getFullYear();
    return true;
  });

  // Export CSV Helper with UTF-8 BOM for Bengali support
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (activeReport === 'sales') {
      const headers = ['রশিদ নং', 'তারিখ', 'ক্রেতা', 'মোট টাকা', 'ছাড়', 'নিট টাকা', 'পরিশোধের মাধ্যম', 'লাভ'];
      const rows = filteredSales.map(s => [
        s.invoiceNumber,
        new Date(s.date).toLocaleDateString('bn-BD'),
        s.customerName || 'খুচরা ক্রেতা',
        s.subtotal,
        s.discount,
        s.totalAmount,
        s.paymentMethod,
        s.profit
      ]);
      exportToCSV('bikroy_protibedon', headers, rows);
    } else if (activeReport === 'stock') {
      const headers = ['পণ্য কোড', 'পণ্যের নাম (বাংলা)', 'ক্যাটাগরি', 'একক', 'বর্তমান স্টক', 'ক্রয়মূল্য', 'খুচরা মূল্য', 'স্টকের মোট ক্রয়মূল্য', 'সম্ভাব্য বিক্রয়মূল্য'];
      const rows = products.map(p => [
        p.id,
        p.nameBn,
        p.category,
        p.unit,
        p.stock,
        p.purchasePrice,
        p.retailPrice,
        p.stock * p.purchasePrice,
        p.stock * p.retailPrice
      ]);
      exportToCSV('stock_mullayon_protibedon', headers, rows);
    } else if (activeReport === 'dues') {
      const headers = ['ধরন', 'নাম', 'ফোন নম্বর', 'বাকি/দেনা পরিমাণ (টাকা)'];
      const rows = [
        ...customers.filter(c => c.outstandingBalance > 0).map(c => ['ক্রেতার বাকি (পাওনা)', c.name, c.phone, c.outstandingBalance]),
        ...suppliers.filter(s => s.outstandingBalance > 0).map(s => ['মহাজনের দেনা (দেনা)', s.name, s.phone, s.outstandingBalance])
      ];
      exportToCSV('baki_dena_protibedon', headers, rows);
    } else if (activeReport === 'expenses') {
      const headers = ['তারিখ', 'খরচের খাত', 'বিবরণ', 'টাকা'];
      const rows = filteredExpenses.map(e => [
        new Date(e.date).toLocaleDateString('bn-BD'),
        e.category,
        e.notes || '-',
        e.amount
      ]);
      exportToCSV('khoroch_protibedon', headers, rows);
    }
  };

  // Calculations for active reports
  const totalReportSales = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalReportProfit = filteredSales.reduce((acc, s) => acc + s.profit, 0);
  const totalReportExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600" />
            রিপোর্ট ও ব্যবসায়িক বিশ্লেষণ (Reports & Analytics)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            দৈনিক হিসাব, ইনভেন্টরি মূল্যায়ন, দেনা-পাওনা এবং আর্থিক রিপোর্ট ডাউনলোড ও প্রিন্ট করুন।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            প্রিন্ট
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            CSV এক্সপোর্ট
          </button>
        </div>
      </div>

      {/* Report Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'sales', label: 'বিক্রয় রিপোর্ট' },
            { id: 'stock', label: 'স্টক ও ইনভেন্টরি' },
            { id: 'profit_loss', label: 'লাভ-ক্ষতি ও ব্যালেন্স' },
            { id: 'expiry', label: 'মেয়াদোত্তীর্ণ ও ক্ষতি' },
            { id: 'dues', label: 'দেনা ও পাওনা (খাতা)' },
            { id: 'expenses', label: 'দোকানের খরচের খতিয়ান' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as ReportTab)}
              className={`px-3.5 py-2 text-sm font-medium rounded-xl transition ${
                activeReport === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        {['sales', 'profit_loss', 'expenses'].includes(activeReport) && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {[
              { id: 'today', label: 'আজ' },
              { id: '7days', label: '৭ দিন' },
              { id: 'month', label: 'চলতি মাস' },
              { id: 'all', label: 'সব' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDateRange(f.id as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                  dateRange === f.id
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* REPORT CONTENT AREA */}
      {activeReport === 'sales' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট বিক্রয় পরিমাণ</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatNumber(totalReportSales, useBn, { isCurrency: true })}
              </p>
              <p className="text-xs text-slate-400 mt-1">{formatNumber(filteredSales.length, useBn)} টি বিক্রয় চালান</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট অর্জিত লাভ</span>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                {formatNumber(totalReportProfit, useBn, { isCurrency: true })}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                গড় লাভ মার্জিন: {formatNumber(totalReportSales > 0 ? ((totalReportProfit / totalReportSales) * 100).toFixed(1) : 0, useBn)}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">গড় বিক্রয় রশিদ মূল্য</span>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {formatNumber(filteredSales.length > 0 ? Math.round(totalReportSales / filteredSales.length) : 0, useBn, { isCurrency: true })}
              </p>
              <p className="text-xs text-slate-400 mt-1">প্রতিটি গ্রাহকের গড় কেনাকাটা</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">বিক্রয় চালান তালিকা</h3>
              <span className="text-xs text-slate-500">{formatNumber(filteredSales.length, useBn)} টি রেকর্ড</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">রশিদ নং</th>
                    <th className="px-4 py-3 font-semibold">তারিখ ও সময়</th>
                    <th className="px-4 py-3 font-semibold">ক্রেতা</th>
                    <th className="px-4 py-3 font-semibold">আইটেম সংখ্যা</th>
                    <th className="px-4 py-3 font-semibold">মোট মূল্য</th>
                    <th className="px-4 py-3 font-semibold">মাধ্যম</th>
                    <th className="px-4 py-3 font-semibold text-right">লাভ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">কোনো বিক্রয় রেকর্ড পাওয়া যায়নি</td>
                    </tr>
                  ) : (
                    filteredSales.map(sale => (
                      <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-medium text-slate-800 dark:text-slate-200">{sale.invoiceNumber}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {formatDateBn(sale.date, useBn, true)}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{sale.customerName || 'সাধারণ ক্রেতা'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatNumber(sale.items.length, useBn)} টি</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                          {formatNumber(sale.totalAmount, useBn, { isCurrency: true })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                          +{formatNumber(sale.profit, useBn, { isCurrency: true })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'stock' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট পণ্যের আইটেম</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatNumber(metrics.totalProductCount, useBn)} টি</p>
              <p className="text-xs text-slate-400 mt-1">ক্যাটালগে সক্রিয় পণ্য</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট মজুদ একক</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatNumber(metrics.totalStockQuantity, useBn)}</p>
              <p className="text-xs text-slate-400 mt-1">সব মিলিয়ে মোট মজুদের পরিমাণ</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">স্টকের মোট ক্রয়মূল্য</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatNumber(metrics.totalStockCostValue, useBn, { isCurrency: true })}
              </p>
              <p className="text-xs text-slate-400 mt-1">আবদ্ধ মূলধন (Cost Value)</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">সম্ভাব্য মোট বিক্রয়মূল্য</span>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {formatNumber(metrics.totalStockRetailValue, useBn, { isCurrency: true })}
              </p>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                প্রত্যাশিত লাভ: {formatNumber(metrics.potentialProfit, useBn, { isCurrency: true })}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">ইনভেন্টরি স্টক মূল্যায়ন তালিকা</h3>
              <span className="text-xs text-slate-500">শীর্ষ ৫০টি পণ্য দেখানো হচ্ছে</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">পণ্য</th>
                    <th className="px-4 py-3 font-semibold">ক্যাটাগরি</th>
                    <th className="px-4 py-3 font-semibold">বর্তমান স্টক</th>
                    <th className="px-4 py-3 font-semibold">ক্রয়মূল্য</th>
                    <th className="px-4 py-3 font-semibold">খুচরা মূল্য</th>
                    <th className="px-4 py-3 font-semibold">স্টক ক্রয়মূল্য</th>
                    <th className="px-4 py-3 font-semibold text-right">সম্ভাব্য বিক্রয়মূল্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.slice(0, 50).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{p.nameBn}</p>
                        <p className="text-xs text-slate-400 font-mono">{p.nameEn}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.category}</td>
                      <td className="px-4 py-3 font-medium">
                        <span className={p.stock <= p.minStockAlert ? 'text-rose-600 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                          {formatNumber(p.stock, useBn)} {p.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatNumber(p.purchasePrice, useBn, { isCurrency: true })}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatNumber(p.retailPrice, useBn, { isCurrency: true })}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatNumber(p.stock * p.purchasePrice, useBn, { isCurrency: true })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatNumber(p.stock * p.retailPrice, useBn, { isCurrency: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'profit_loss' && (
        <div className="space-y-6">
          {/* Financial summary breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
              আর্থিক লাভ-ক্ষতি বিবরণী (P&L Income Statement)
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-medium text-slate-700 dark:text-slate-300">১. মোট বিক্রয় আয় (Gross Revenue)</span>
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{formatNumber(totalReportSales, useBn, { isCurrency: true })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 pl-4 text-rose-600 dark:text-rose-400 text-sm">
                <span>(-) বিক্রিত পণ্যের প্রকৃত ক্রয়মূল্য (COGS)</span>
                <span>-{formatNumber(totalReportSales - totalReportProfit, useBn, { isCurrency: true })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-3 rounded-lg">
                <span className="font-bold text-slate-900 dark:text-slate-100">= মোট মুনাফা / গ্রস প্রফিট (Gross Profit)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{formatNumber(totalReportProfit, useBn, { isCurrency: true })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 pl-4 text-rose-600 dark:text-rose-400 text-sm">
                <span>(-) দোকানের যাবতীয় পরিচালন খরচ (Operating Expenses)</span>
                <span>-{formatNumber(totalReportExpenses, useBn, { isCurrency: true })}</span>
              </div>
              <div className={`flex justify-between items-center py-3 px-4 rounded-xl font-bold text-lg ${
                (totalReportProfit - totalReportExpenses) >= 0 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                <span>= প্রকৃত নিট লাভ (Net Profit)</span>
                <span>{formatNumber(totalReportProfit - totalReportExpenses, useBn, { isCurrency: true })}</span>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              💡 <strong>শিক্ষা নোট:</strong> দোকানদার ভাইদের মূল ভুল হয় তারা ক্যাশ বাক্সের সমস্ত নগদ টাকাকেই নিজের লাভ মনে করেন। কিন্তু বিক্রিত পণ্যের মহাজনি খরচ (COGS) এবং দোকান ভাড়া ও বিদ্যুৎ বিল বাদ দেওয়ার পর অবশিষ্ট টাকাই আপনার আসল উপার্জিত লাভ।
            </div>
          </div>
        </div>
      )}

      {activeReport === 'dues' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">ক্রেতাদের কাছে মোট বাকি পাওনা (Accounts Receivable)</span>
              <p className="text-3xl font-bold text-rose-600 mt-2">{formatNumber(metrics.totalCustomerDues, useBn, { isCurrency: true })}</p>
              <p className="text-xs text-slate-400 mt-1">দোকানের বাইরে আটকে থাকা মূলধন</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">মহাজনদের কাছে মোট দেনা (Accounts Payable)</span>
              <p className="text-3xl font-bold text-amber-600 mt-2">{formatNumber(metrics.totalSupplierPayables, useBn, { isCurrency: true })}</p>
              <p className="text-xs text-slate-400 mt-1">ডিলার বা পাইকারি বিক্রেতাকে পরিশোধযোগ্য টাকা</p>
            </div>
          </div>

          {/* Dues comparison and details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3">শীর্ষ বাকি থাকা ক্রেতাগণ</h4>
              <div className="space-y-2">
                {customers.filter(c => c.outstandingBalance > 0).map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.phone}</p>
                    </div>
                    <span className="font-bold text-rose-600">{formatNumber(c.outstandingBalance, useBn, { isCurrency: true })}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3">মহাজনদের প্রদেয় দেনা</h4>
              <div className="space-y-2">
                {suppliers.filter(s => s.outstandingBalance > 0).map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.company || s.phone}</p>
                    </div>
                    <span className="font-bold text-amber-600">{formatNumber(s.outstandingBalance, useBn, { isCurrency: true })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">দোকানের খরচের তালিকা ({formatNumber(totalReportExpenses, useBn, { isCurrency: true })})</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs">
                  <tr>
                    <th className="px-4 py-3">তারিখ</th>
                    <th className="px-4 py-3">খাত</th>
                    <th className="px-4 py-3">বিবরণ</th>
                    <th className="px-4 py-3 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredExpenses.map(e => (
                    <tr key={e.id}>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {formatDateBn(e.date, useBn, false)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{e.category}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.notes || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600">-{formatNumber(e.amount, useBn, { isCurrency: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'expiry' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">মেয়াদ সংক্রান্ত সতর্কতা ও ঝুঁকিপূর্ণ স্টক</h4>
            <p className="text-xs text-slate-500 mb-4">যেসব পণ্যের মেয়াদ শেষ হয়েছে বা শেষ হওয়ার নিকটবর্তী:</p>
            <div className="space-y-3">
              {products
                .filter(p => {
                  if (!p.expiryDate) return false;
                  const exp = new Date(p.expiryDate).getTime();
                  const diff = Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24));
                  return diff <= 60;
                })
                .map(p => {
                  const exp = new Date(p.expiryDate!).getTime();
                  const diff = Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={p.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{p.nameBn}</p>
                        <p className="text-xs text-slate-500">মজুদ: {formatNumber(p.stock, useBn)} {p.unit}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          diff <= 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {diff <= 0 ? 'মেয়াদোত্তীর্ণ!' : `${formatNumber(diff, useBn)} দিন বাকি`}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">
                          আটকে থাকা মূল্য: {formatNumber(p.stock * p.purchasePrice, useBn, { isCurrency: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
