import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Check,
  Clock,
  Filter,
  History,
  Info,
  Package,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, TransactionType } from '../../types';
import { formatDateBn, formatNumber } from '../../utils/numberConverter';

export const InventoryView: React.FC = () => {
  const {
    products,
    stockTransactions,
    recordStockTransaction,
    settings,
    setActiveTab,
    metrics,
  } = useApp();

  const useBn = settings.useBengaliNumerals;

  const [activeSubTab, setActiveSubTab] = useState<'adjust' | 'history' | 'reorder'>('adjust');

  // Transaction Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [txType, setTxType] = useState<TransactionType>('stock_in');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // History Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedProduct) {
      setErrorMsg('অনুগ্রহ করে একটি পণ্য নির্বাচন করুন');
      return;
    }

    if (quantity <= 0) {
      setErrorMsg('পরিমাণ অবশ্যই শূন্যের বেশি হতে হবে');
      return;
    }

    // Check negative stock
    if (
      (txType === 'stock_out' || txType === 'damaged' || txType === 'expired' || txType === 'return_out') &&
      selectedProduct.stock < quantity
    ) {
      const confirmNeg = window.confirm(
        `সতর্কতা: বর্তমান স্টক (${selectedProduct.stock} ${selectedProduct.unit}) থেকে চেয়ে ${quantity} বেশি দিতে চাইছেন। এতে স্টক নেগেটিভ হতে পারে। আপনি কি নিশ্চিত?`
      );
      if (!confirmNeg) return;
    }

    const success = recordStockTransaction({
      productId: selectedProduct.id,
      productName: selectedProduct.nameBn,
      type: txType,
      quantity,
      unit: selectedProduct.unit,
      unitPrice: selectedProduct.purchasePrice,
      notes,
    });

    if (success) {
      setSuccessMsg('স্টক সফলভাবে হালনাগাদ ও অডিট ট্রেইলে সংরক্ষণ করা হয়েছে!');
      setQuantity(1);
      setNotes('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg('স্টক লেনদেন সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
    }
  };

  const filteredHistory = useMemo(() => {
    return stockTransactions.filter((tx) => {
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        if (!tx.productName.toLowerCase().includes(q) && !(tx.notes || '').toLowerCase().includes(q)) {
          return false;
        }
      }
      if (historyTypeFilter !== 'all' && tx.type !== historyTypeFilter) {
        return false;
      }
      return true;
    });
  }, [stockTransactions, historySearch, historyTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header and Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>ইনভেন্টরি ও স্টক ব্যবস্থাপনা</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
              মোট স্টক: {formatNumber(metrics.totalStockQuantity, useBn)} একক
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            স্টক ইন, স্টক আউট, নষ্ট পণ্যের এন্ট্রি এবং নির্ভুল অডিট লগ
          </p>
        </div>

        {/* Sub Nav Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('adjust')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'adjust'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            স্টক এন্ট্রি / সমন্বয়
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            লেনদেনের খতিয়ান ({formatNumber(stockTransactions.length, useBn)})
          </button>
          <button
            onClick={() => setActiveSubTab('reorder')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'reorder'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            রি-অর্ডার পরামর্শ ({formatNumber(metrics.lowStockProducts.length, useBn)})
          </button>
        </div>
      </div>

      {/* Tab 1: Stock Entry & Adjustment */}
      {activeSubTab === 'adjust' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>স্টক হ্রাস-বৃদ্ধি বা নষ্ট পণ্যের হিসাব লিপিবদ্ধকরণ</span>
              <span className="text-xs font-normal text-slate-400 font-mono">Real-time Calculation</span>
            </h3>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পণ্য নির্বাচন করুন*
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameBn} (বর্তমান স্টক: {formatNumber(p.stock, useBn)} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction Type Segmented */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  লেনদেনের ধরন (Transaction Type)*
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'stock_in', label: 'স্টক ইন (নতুন আগমন)', color: 'border-emerald-500 text-emerald-700' },
                    { id: 'stock_out', label: 'স্টক আউট (হ্রাস)', color: 'border-blue-500 text-blue-700' },
                    { id: 'damaged', label: 'নষ্ট পণ্য (Damage)', color: 'border-amber-500 text-amber-700' },
                    { id: 'expired', label: 'মেয়াদোত্তীর্ণ বাদ', color: 'border-rose-500 text-rose-700' },
                    { id: 'adjustment', label: 'হিসাব সমন্বয় (Audit)', color: 'border-purple-500 text-purple-700' },
                    { id: 'return_in', label: 'ক্রেতার ফেরত (Return)', color: 'border-teal-500 text-teal-700' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTxType(item.id as TransactionType)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                        txType === item.id
                          ? `bg-slate-100 dark:bg-slate-800 border-2 font-bold ${item.color}`
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পরিমাণ ({selectedProduct?.unit || 'একক'})*
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    একক ক্রয়মূল্য (হিসাবের জন্য)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formatNumber(selectedProduct?.purchasePrice || 0, useBn, { isCurrency: true })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  কারণ / ভাউচার রেফারেন্স / মন্তব্য
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: ইঁদুরে বস্তা কেটেছে, ড্রামে পচা পেঁয়াজ বাছাই, চালানের অতিরিক্ত"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
              >
                স্টক লেনদেন কনফার্ম করুন
              </button>
            </form>
          </div>

          {/* Right Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            {selectedProduct && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  নির্বাচিত পণ্যের স্টক পূর্বাভাস
                </h4>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  <div>
                    <h5 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {selectedProduct.nameBn}
                    </h5>
                    <p className="text-xs text-slate-500 font-mono">{selectedProduct.barcode}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">বর্তমান স্টক:</span>
                      <span className="font-bold font-mono">
                        {formatNumber(selectedProduct.stock, useBn)} {selectedProduct.unit}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">লেনদেনের পর নতুন স্টক:</span>
                      <span
                        className={`font-bold font-mono text-sm ${
                          txType === 'stock_in' || txType === 'return_in'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {formatNumber(
                          txType === 'stock_in' || txType === 'return_in'
                            ? selectedProduct.stock + quantity
                            : selectedProduct.stock - quantity,
                          useBn
                        )}{' '}
                        {selectedProduct.unit}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">লেনদেনের মোট আর্থিক মূল্য:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                        {formatNumber(quantity * selectedProduct.purchasePrice, useBn, { isCurrency: true })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>ব্যবসায়িক টিপস</span>
                  </div>
                  <p className="leading-relaxed">
                    ক্ষতিগ্রস্ত বা নষ্ট পণ্য নিয়মিত এন্ট্রি দিলে মাস শেষে লাভ-ক্ষতির হিসাবে নির্ভুল চিত্র ফুটে ওঠে
                    এবং ট্যাক্স ও নিট প্রফিট হিসাবে অপচয় সমন্বয় করা যায়।
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Stock Audit History */}
      {activeSubTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="পণ্যের নাম দিয়ে অডিট হিস্ট্রি খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <select
              value={historyTypeFilter}
              onChange={(e) => setHistoryTypeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="all">সকল প্রকার লেনদেন</option>
              <option value="stock_in">স্টক আগমন (Stock In)</option>
              <option value="stock_out">বিক্রয় (Stock Out)</option>
              <option value="damaged">নষ্ট পণ্য (Damaged)</option>
              <option value="expired">মেয়াদোত্তীর্ণ (Expired)</option>
              <option value="adjustment">হিসাব সমন্বয়</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">তারিখ ও সময়</th>
                  <th className="py-2.5 px-3">পণ্যের নাম</th>
                  <th className="py-2.5 px-3">ধরন</th>
                  <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">আগের স্টক</th>
                  <th className="py-2.5 px-3 text-right">নতুন স্টক</th>
                  <th className="py-2.5 px-3">মন্তব্য / মেমো</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {filteredHistory.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {formatDateBn(tx.date, useBn, true)}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-slate-100">
                      {tx.productName}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`text-[11px] font-semibold ${
                          tx.type === 'stock_in' || tx.type === 'return_in'
                            ? 'text-emerald-600'
                            : tx.type === 'damaged' || tx.type === 'expired'
                            ? 'text-rose-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {tx.type === 'stock_in'
                          ? 'স্টক ইন'
                          : tx.type === 'stock_out'
                          ? 'বিক্রয়'
                          : tx.type === 'damaged'
                          ? 'নষ্ট পণ্য'
                          : tx.type === 'expired'
                          ? 'মেয়াদোত্তীর্ণ'
                          : 'সমন্বয়'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      {tx.type === 'stock_in' || tx.type === 'return_in' ? '+' : '-'}
                      {formatNumber(tx.quantity, useBn)} {tx.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {formatNumber(tx.previousStock, useBn)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                      {formatNumber(tx.newStock, useBn)}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-500 truncate max-w-[150px]">
                      {tx.referenceNo ? `[${tx.referenceNo}] ` : ''}
                      {tx.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Reorder Suggestions */}
      {activeSubTab === 'reorder' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                স্বয়ংক্রিয় রি-অর্ডার ও স্টক ঘাটতি পূরণের তালিকা
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                যেসব পণ্যের স্টক নির্ধারিত সতর্কবার্তা লেভেলের নিচে নেমে গেছে এবং এখনই কেনা দরকার
              </p>
            </div>
            <button
              onClick={() => setActiveTab('purchases')}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              ক্রয় চালানে যুক্ত করুন &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">পণ্যের নাম</th>
                  <th className="py-2.5 px-3">ক্যাটাগরি</th>
                  <th className="py-2.5 px-3 text-right">বর্তমান স্টক</th>
                  <th className="py-2.5 px-3 text-right">ন্যূনতম সীমা</th>
                  <th className="py-2.5 px-3 text-right">প্রস্তাবিত রি-অর্ডার পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">আনুমানিক খরচ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {metrics.lowStockProducts.concat(metrics.zeroStockProducts).map((product) => {
                  const suggestedReorder = Math.max(10, (product.minStockAlert || 8) * 3 - product.stock);
                  const estimatedCost = suggestedReorder * product.purchasePrice;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-slate-100">
                        {product.nameBn}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-300">
                        {product.category}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                        {formatNumber(product.stock, useBn)} {product.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {formatNumber(product.minStockAlert, useBn)} {product.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        + {formatNumber(suggestedReorder, useBn)} {product.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatNumber(estimatedCost, useBn, { isCurrency: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
