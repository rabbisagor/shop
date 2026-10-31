import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  Package,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Truck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatDateBn, formatNumber, getDaysRemaining } from '../../utils/numberConverter';

export const ExpiryManagementView: React.FC = () => {
  const { products, recordStockTransaction, settings, setActiveTab } = useApp();
  const useBn = settings.useBengaliNumerals;

  const [timeFilter, setTimeFilter] = useState<'all' | 'expired' | '7days' | '15days' | '30days' | '60days'>('30days');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Products with expiry information
  const expiryAnalysis = useMemo(() => {
    return products
      .map((p) => {
        const daysLeft = getDaysRemaining(p.expiryDate);
        return {
          product: p,
          daysLeft,
          isExpired: daysLeft !== null && daysLeft < 0,
        };
      })
      .filter((item) => item.daysLeft !== null);
  }, [products]);

  const filteredExpiryList = useMemo(() => {
    return expiryAnalysis
      .filter((item) => {
        if (timeFilter === 'expired') return item.isExpired;
        if (timeFilter === '7days') return item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 7;
        if (timeFilter === '15days') return item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 15;
        if (timeFilter === '30days') return item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 30;
        if (timeFilter === '60days') return item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 60;
        return true;
      })
      .sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999)); // FEFO sorting: nearest expiry first!
  }, [expiryAnalysis, timeFilter]);

  // Counts
  const expiredCount = expiryAnalysis.filter((i) => i.isExpired).length;
  const in7DaysCount = expiryAnalysis.filter((i) => i.daysLeft !== null && i.daysLeft >= 0 && i.daysLeft <= 7).length;
  const in15DaysCount = expiryAnalysis.filter((i) => i.daysLeft !== null && i.daysLeft >= 0 && i.daysLeft <= 15).length;
  const in30DaysCount = expiryAnalysis.filter((i) => i.daysLeft !== null && i.daysLeft >= 0 && i.daysLeft <= 30).length;
  const in60DaysCount = expiryAnalysis.filter((i) => i.daysLeft !== null && i.daysLeft >= 0 && i.daysLeft <= 60).length;

  const handleMarkAsExpired = (product: Product) => {
    if (product.stock <= 0) return;
    const confirm = window.confirm(
      `আপনি কি নিশ্চিত যে "${product.nameBn}" এর অবশিষ্ট ${product.stock} ${product.unit} মেয়াদোত্তীর্ণ হিসেবে বাতিল করতে চান?`
    );
    if (!confirm) return;

    recordStockTransaction({
      productId: product.id,
      productName: product.nameBn,
      type: 'expired',
      quantity: product.stock,
      unit: product.unit,
      unitPrice: product.purchasePrice,
      notes: 'মেয়াদোত্তীর্ণ হওয়ায় সেলফ থেকে নামিয়ে সম্পূর্ণ স্টক বাতিল করা হয়েছে',
    });

    setActionSuccessMsg(`"${product.nameBn}" সফলভাবে মেয়াদোত্তীর্ণ হিসেবে স্টক থেকে বাদ দেওয়া হয়েছে।`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>পণ্য মেয়াদ ব্যবস্থাপনা ও FEFO ট্র্যাকিং</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold font-mono">
              FEFO: ফার্স্ট এক্সপায়ার, ফার্স্ট আউট
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            মেয়াদ ফুরিয়ে যাওয়ার আগেই পণ্য চিহ্নিতকরণ, সরবরাহকারীকে ফেরত ও লোকসান প্রতিরোধ
          </p>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* FEFO Concept Education Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 space-y-1.5">
        <div className="font-bold flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
          <CalendarClock className="w-4 h-4 text-blue-600" />
          <span>মুদি দোকানে FEFO পদ্ধতির গুরুত্ব</span>
        </div>
        <p className="leading-relaxed">
          <strong>FEFO (First Expired, First Out):</strong> যে পণ্যের মেয়াদ আগে শেষ হবে, তাকে সেলফের সবার সামনে
          সাজিয়ে রাখতে হবে যেন ক্রেতা সেটি আগে নেয়। মেয়াদ শেষ হওয়ার অন্তত ৩০-৪৫ দিন আগেই কোম্পানির ডিলার বা এসআর-কে
          পণ্য ফেরত দিয়ে নতুন লট নিয়ে নিন।
        </p>
      </div>

      {/* Filter Tabs by Expiry Duration */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Expired */}
        <button
          onClick={() => setTimeFilter('expired')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            timeFilter === 'expired'
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-xs font-bold">মেয়াদোত্তীর্ণ</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-700 dark:text-rose-300">
            {formatNumber(expiredCount, useBn)} টি
          </div>
          <span className="text-[10px] text-rose-500">মেয়াদ শেষ হয়েছে</span>
        </button>

        {/* 7 Days */}
        <button
          onClick={() => setTimeFilter('7days')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            timeFilter === '7days'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold">&le; ৭ দিন</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300">
            {formatNumber(in7DaysCount, useBn)} টি
          </div>
          <span className="text-[10px] text-amber-500">জরুরি সতর্কবার্তা</span>
        </button>

        {/* 15 Days */}
        <button
          onClick={() => setTimeFilter('15days')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            timeFilter === '15days'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold">&le; ১৫ দিন</span>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300">
            {formatNumber(in15DaysCount, useBn)} টি
          </div>
          <span className="text-[10px] text-slate-400">ফেরতের প্রস্তুতি</span>
        </button>

        {/* 30 Days */}
        <button
          onClick={() => setTimeFilter('30days')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            timeFilter === '30days'
              ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-xs font-bold">&le; ৩০ দিন</span>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-700 dark:text-blue-300">
            {formatNumber(in30DaysCount, useBn)} টি
          </div>
          <span className="text-[10px] text-slate-400">এক মাসের মধ্যে</span>
        </button>

        {/* 60 Days */}
        <button
          onClick={() => setTimeFilter('60days')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            timeFilter === '60days'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold">&le; ৬০ দিন</span>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">
            {formatNumber(in60DaysCount, useBn)} টি
          </div>
          <span className="text-[10px] text-slate-400">দুই মাসের মধ্যে</span>
        </button>
      </div>

      {/* Expiry Products List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-3 px-4">পণ্য ও বিভাগ</th>
                <th className="py-3 px-3">ব্র্যান্ড</th>
                <th className="py-3 px-3 text-center">মেয়াদ শেষের তারিখ</th>
                <th className="py-3 px-3 text-center">অবশিষ্ট দিন</th>
                <th className="py-3 px-3 text-right">মজুত পরিমাণ</th>
                <th className="py-3 px-3 text-right">আটকে থাকা মূল্য</th>
                <th className="py-3 px-4 text-center">ব্যবস্থাপনা পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpiryList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    এই ফিল্টারে কোনো ঝুঁকিপূর্ণ বা মেয়াদ শেষের পণ্য নেই।
                  </td>
                </tr>
              ) : (
                filteredExpiryList.map((item) => {
                  const p = item.product;
                  const isExp = item.isExpired;
                  const isVeryNear = item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 15;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        isExp ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {p.nameBn}
                        </div>
                        <div className="text-[11px] text-slate-400">{p.category}</div>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {p.brand || 'সাধারণ'}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {formatDateBn(p.expiryDate, useBn)}
                      </td>

                      {/* Remaining Days */}
                      <td className="py-3 px-3 text-center font-mono">
                        {isExp ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-bold">
                            মেয়াদোত্তীর্ণ!
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isVeryNear
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {formatNumber(item.daysLeft, useBn)} দিন বাকি
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatNumber(p.stock, useBn)} {p.unit}
                      </td>

                      {/* At Risk Value */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {formatNumber(p.stock * p.purchasePrice, useBn, { isCurrency: true })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isExp ? (
                            <button
                              onClick={() => handleMarkAsExpired(p)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-xs"
                            >
                              স্টক থেকে বাতিল
                            </button>
                          ) : (
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                              FEFO অগ্রাধিকার
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
