import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  DollarSign,
  Package,
  Plus,
  Receipt,
  RotateCcw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateBn, formatNumber } from '../../utils/numberConverter';

export const DashboardView: React.FC = () => {
  const {
    metrics,
    settings,
    setActiveTab,
    sales,
    purchases,
    products,
    expenses,
  } = useApp();

  const [chartPeriod, setChartPeriod] = useState<'7days' | 'monthly'>('7days');

  const useBn = settings.useBengaliNumerals;

  // Recent 5 sales
  const recentSales = sales.slice(0, 5);
  // Recent 5 purchases
  const recentPurchases = purchases.slice(0, 5);

  // Group last 7 days sales data for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString('bn-BD', { weekday: 'short' });

    const daySales = sales
      .filter((s) => s.date.slice(0, 10) === dateStr)
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const dayPurchases = purchases
      .filter((p) => p.date.slice(0, 10) === dateStr)
      .reduce((sum, p) => sum + p.totalAmount, 0);

    const dayProfit = sales
      .filter((s) => s.date.slice(0, 10) === dateStr)
      .reduce((sum, s) => sum + s.profit, 0);

    return {
      date: dateStr,
      label: dayLabel,
      sales: daySales,
      purchases: dayPurchases,
      profit: dayProfit,
    };
  });

  const maxChartValue = Math.max(
    ...last7Days.map((d) => Math.max(d.sales, d.purchases, 1000)),
    5000
  );

  // Category stock breakdown
  const categoryStock = React.useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    products.forEach((p) => {
      if (!map[p.category]) map[p.category] = { count: 0, value: 0 };
      map[p.category].count += p.stock;
      map[p.category].value += p.stock * p.purchasePrice;
    });
    return Object.entries(map)
      .map(([cat, val]) => ({ category: cat, ...val }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              দোকানের সার্বিক চিত্র ও ড্যাশবোর্ড
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">
              সক্রিয় স্টোর
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            দৈনিক বিক্রয়, কেনাকাটা, স্টক ও লাভের স্বয়ংক্রিয় হিসাব
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
          >
            <CircleDollarSign className="w-4 h-4" />
            <span>নতুন বিক্রয় / POS</span>
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
            <span>কেনাকাটা চালান</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <Boxes className="w-3.5 h-3.5 text-amber-600" />
            <span>স্টক ইন / সমন্বয়</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (8 Key Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. মোট পণ্যের সংখ্যা */}
        <div
          onClick={() => setActiveTab('products')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">মোট পণ্যের পদ</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {formatNumber(metrics.totalProductCount, useBn)} টি
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>মোট স্টক:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {formatNumber(metrics.totalStockQuantity, useBn)} একক
            </span>
          </div>
        </div>

        {/* 2. স্টকের বর্তমান ক্রয়মূল্য */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">স্টকের ক্রয়মূল্য</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {formatNumber(metrics.totalStockCostValue, useBn, { isCurrency: true })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>সম্ভাব্য বিক্রয়মূল্য:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {formatNumber(metrics.totalStockRetailValue, useBn, { isCurrency: true })}
            </span>
          </div>
        </div>

        {/* 3. আজকের মোট বিক্রি */}
        <div
          onClick={() => setActiveTab('pos')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">আজকের মোট বিক্রি</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatNumber(metrics.todaySales, useBn, { isCurrency: true })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>আজকের লাভ:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatNumber(metrics.todayProfit, useBn, { isCurrency: true })}
            </span>
          </div>
        </div>

        {/* 4. এই মাসের লাভ (Net Profit) */}
        <div
          onClick={() => setActiveTab('expenses')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">এই মাসের নিট লাভ</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              metrics.thisMonthNetProfit >= 0
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatNumber(metrics.thisMonthNetProfit, useBn, { isCurrency: true })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>মোট বিক্রি:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {formatNumber(metrics.thisMonthSales, useBn, { isCurrency: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Stock & Alert Indicators (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Low Stock Alert */}
        <div
          onClick={() => setActiveTab('inventory')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            metrics.lowStockProducts.length > 0
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-xs font-bold">কম স্টক থাকা পণ্য</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-800 dark:text-amber-300">
            {formatNumber(metrics.lowStockProducts.length, useBn)} টি
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            রি-অর্ডার তালিকা দেখুন &rarr;
          </span>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => setActiveTab('expiry')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            metrics.expiringSoonProducts.length > 0
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-xs font-bold">মেয়াদ সন্নিকটে</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-800 dark:text-amber-300">
            {formatNumber(metrics.expiringSoonProducts.length, useBn)} টি
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            আগামী ৩০ দিনের মধ্যে
          </span>
        </div>

        {/* Expired Products */}
        <div
          onClick={() => setActiveTab('expiry')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            metrics.expiredProducts.length > 0
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
            <span className="text-xs font-bold">মেয়াদোত্তীর্ণ পণ্য</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-800 dark:text-rose-300">
            {formatNumber(metrics.expiredProducts.length, useBn)} টি
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400">
            দ্রুত সেলফ থেকে সরান
          </span>
        </div>

        {/* Customer Dues */}
        <div
          onClick={() => setActiveTab('customers')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-emerald-500 transition"
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold">মোট বাকি পাওনা</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {formatNumber(metrics.totalCustomerDues, useBn, { isCurrency: true })}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            বাকি খাতা দেখুন &rarr;
          </span>
        </div>
      </div>

      {/* Interactive Charts Section: Daily Sales vs Purchase Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: গত ৭ দিনের বিক্রি ও কেনাকাটা */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                গত ৭ দিনের বিক্রি ও কেনাকাটার তুলনামূলক গ্রাফ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                সবুজ: বিক্রয়, নীল: ক্রয়, অ্যাম্বার: গ্রস প্রফিট
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> বিক্রি
              </span>
              <span className="flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" /> ক্রয়
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {last7Days.map((day, idx) => {
              const salesHeight = Math.max(8, (day.sales / maxChartValue) * 100);
              const purchaseHeight = Math.max(8, (day.purchases / maxChartValue) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                    {/* Sales Bar */}
                    <div
                      style={{ height: `${salesHeight}%` }}
                      title={`বিক্রি: ৳${day.sales}`}
                      className="w-1/2 max-w-[20px] bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all relative group"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-10 font-mono">
                        ৳{formatNumber(day.sales, useBn)}
                      </div>
                    </div>

                    {/* Purchase Bar */}
                    <div
                      style={{ height: `${purchaseHeight}%` }}
                      title={`ক্রয়: ৳${day.purchases}`}
                      className="w-1/2 max-w-[20px] bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all relative group"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-10 font-mono">
                        ৳{formatNumber(day.purchases, useBn)}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3">
            <span>সর্বোচ্চ একদিনের স্কেল: {formatNumber(maxChartValue, useBn, { isCurrency: true })}</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              বিস্তারিত সেলস রিপোর্ট দেখুন &rarr;
            </button>
          </div>
        </div>

        {/* Category-wise Stock Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              ক্যাটাগরি অনুযায়ী স্টকের ইনভেস্টমেন্ট
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              শীর্ষ ৬টি ক্যাটাগরির মূলধন বিন্যাস
            </p>

            <div className="space-y-3">
              {categoryStock.map((cat, i) => {
                const percent = Math.min(
                  100,
                  Math.round((cat.value / (metrics.totalStockCostValue || 1)) * 100)
                );
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {cat.category}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {formatNumber(cat.value, useBn, { isCurrency: true })} ({formatNumber(percent, useBn)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${
                          i === 0
                            ? 'bg-emerald-500'
                            : i === 1
                            ? 'bg-blue-500'
                            : i === 2
                            ? 'bg-purple-500'
                            : i === 3
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">মোট ৩০টি বিভাগ</span>
            <button
              onClick={() => setActiveTab('products')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              সব পণ্য দেখুন &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Top Selling Products & Profitable Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Selling */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                সর্বাধিক বিক্রিত পণ্য (Top Selling)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              সব দেখুন
            </button>
          </div>

          <div className="space-y-3">
            {metrics.topSellingProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                এখনো কোনো বিক্রয় রেকর্ড হয়নি।
              </p>
            ) : (
              metrics.topSellingProducts.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
                      {formatNumber(idx + 1, useBn)}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.product.nameBn}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {formatNumber(item.quantitySold, useBn)} {item.product.unit}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatNumber(item.revenue, useBn, { isCurrency: true })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Profitable Products */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600">
                <CircleDollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                সর্বাধিক লাভজনক পণ্য (Top Profitable)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              সব দেখুন
            </button>
          </div>

          <div className="space-y-3">
            {metrics.topProfitableProducts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                এখনো কোনো বিক্রয় রেকর্ড হয়নি।
              </p>
            ) : (
              metrics.topProfitableProducts.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-bold font-mono">
                      {formatNumber(idx + 1, useBn)}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.product.nameBn}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
                      + {formatNumber(item.profit, useBn, { isCurrency: true })}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      মোট অর্জিত মুনাফা
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Purchases & Recent Sales Dual Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              সাম্প্রতিক বিক্রয় মেমো (Recent Sales)
            </h3>
            <button
              onClick={() => setActiveTab('pos')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              POS খুলুন &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2">মেমো নং</th>
                  <th className="py-2">ক্রেতা</th>
                  <th className="py-2">পেমেন্ট</th>
                  <th className="py-2 text-right">টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-emerald-700 dark:text-emerald-400">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-2.5 font-sans text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                      {sale.customerName || 'সাধারণ ক্রেতা'}
                    </td>
                    <td className="py-2.5 font-sans">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        {sale.paymentMethod.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatNumber(sale.totalAmount, useBn, { isCurrency: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              সাম্প্রতিক কেনাকাটা (Recent Purchases)
            </h3>
            <button
              onClick={() => setActiveTab('purchases')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              নতুন চালান &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2">চালান নং</th>
                  <th className="py-2">সরবরাহকারী</th>
                  <th className="py-2">স্ট্যাটাস</th>
                  <th className="py-2 text-right">মোট টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {recentPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-blue-700 dark:text-blue-400">
                      {pur.invoiceNumber}
                    </td>
                    <td className="py-2.5 font-sans text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                      {pur.supplierName}
                    </td>
                    <td className="py-2.5 font-sans">
                      <span
                        className={`text-[11px] font-medium ${
                          pur.dueAmount === 0
                            ? 'text-emerald-600'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {pur.dueAmount === 0 ? 'পরিশোধিত' : 'বকেয়া'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatNumber(pur.totalAmount, useBn, { isCurrency: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
