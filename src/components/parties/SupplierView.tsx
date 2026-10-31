import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  Phone,
  Plus,
  Search,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { formatNumber } from '../../utils/numberConverter';

export const SupplierView: React.FC = () => {
  const { suppliers, addSupplier, recordSupplierPayment, purchases, settings } = useApp();
  const useBn = settings.useBengaliNumerals;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    company: '',
    phone: '',
    address: '',
    categories: 'চাল ও চালজাত পণ্য',
    paymentTerms: 'নগদ ও চালান',
    notes: '',
  });

  const filteredSuppliers = suppliers.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    }
    return true;
  });

  const totalOutstanding = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment || paymentAmount <= 0) return;

    recordSupplierPayment(selectedSupplierForPayment.id, paymentAmount, paymentNotes);
    setSelectedSupplierForPayment(null);
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name.trim() || !newSupplier.company.trim()) return;

    addSupplier({
      ...newSupplier,
      categories: [newSupplier.categories],
    });

    setIsAddSupplierModalOpen(false);
    setNewSupplier({
      name: '',
      company: '',
      phone: '',
      address: '',
      categories: 'চাল ও চালজাত পণ্য',
      paymentTerms: 'নগদ ও চালান',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>সরবরাহকারী তালিকা ও দেনা-পাওনা লেজার</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-bold">
              {formatNumber(suppliers.length, useBn)} জন সরবরাহকারী
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            কোম্পানির ডিলার, আড়তদার ও পাইকারদের যোগাযোগের তথ্য, পূর্বের কেনাকাটা ও বকেয়া বিল
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddSupplierModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন সরবরাহকারী যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">মোট সরবরাহকারী দেনা (Payables)</span>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {formatNumber(totalOutstanding, useBn, { isCurrency: true })}
          </div>
          <span className="text-[11px] text-slate-400">ডিলারদের কাছে অবশিষ্ট বকেয়া বিল</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">মোট চালান ক্রয় (Total Sourced)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {formatNumber(
              suppliers.reduce((sum, s) => sum + s.totalPurchases, 0),
              useBn,
              { isCurrency: true }
            )}
          </div>
          <span className="text-[11px] text-slate-400">সরবরাহকারীদের থেকে মোট কেনাকাটা</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">পরিশোধিত অর্থ (Total Paid)</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatNumber(
              suppliers.reduce((sum, s) => sum + s.totalPaid, 0),
              useBn,
              { isCurrency: true }
            )}
          </div>
          <span className="text-[11px] text-slate-400">সম্পূর্ণ পরিশোধিত ভাউচার বিল</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="কোম্পানি, প্রতিনিধি বা মোবাইল নম্বর দিয়ে খুঁজুন..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
        />
      </div>

      {/* Suppliers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-3 px-4">প্রতিষ্ঠান ও প্রতিনিধির নাম</th>
                <th className="py-3 px-3">যোগাযোগ</th>
                <th className="py-3 px-3">প্রধান পণ্য বিভাগ</th>
                <th className="py-3 px-3">পেমেন্টের শর্ত</th>
                <th className="py-3 px-3 text-right">মোট ক্রয়</th>
                <th className="py-3 px-3 text-right">বকেয়া বিল</th>
                <th className="py-3 px-4 text-center">বিল পরিশোধ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {supplier.company}
                    </div>
                    <div className="text-[11px] text-slate-500">{supplier.name}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      {supplier.phone}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                      {supplier.address}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {supplier.categories.join(', ')}
                  </td>

                  <td className="py-3 px-3 text-slate-500">
                    {supplier.paymentTerms}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatNumber(supplier.totalPurchases, useBn, { isCurrency: true })}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold">
                    <span
                      className={
                        supplier.outstandingBalance > 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600'
                      }
                    >
                      {formatNumber(supplier.outstandingBalance, useBn, { isCurrency: true })}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedSupplierForPayment(supplier);
                        setPaymentAmount(supplier.outstandingBalance);
                      }}
                      disabled={supplier.outstandingBalance <= 0}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                        supplier.outstandingBalance > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      পেমেন্ট দিন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedSupplierForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  সরবরাহকারী বিল পরিশোধ
                </h3>
                <p className="text-xs text-emerald-600 font-semibold">
                  {selectedSupplierForPayment.company}
                </p>
              </div>
              <button
                onClick={() => setSelectedSupplierForPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>মোট বকেয়া বিল:</span>
                  <span className="font-bold text-rose-600">
                    {formatNumber(selectedSupplierForPayment.outstandingBalance, useBn, { isCurrency: true })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">পরিশোধের পরিমাণ (৳)*</label>
                <input
                  type="number"
                  min="1"
                  max={selectedSupplierForPayment.outstandingBalance}
                  required
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">রেফারেন্স / ভাউচার নোট</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="যেমন: ব্যাংক চেক নং, বিকাশ ট্রানজেকশন আইডি"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForPayment(null)}
                  className="px-3 py-2 text-xs rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white shadow-xs"
                >
                  পেমেন্ট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Supplier Modal */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                নতুন সরবরাহকারী বা ডিলার যুক্ত করুন
              </h3>
              <button
                onClick={() => setIsAddSupplierModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">কোম্পানি / আড়তের নাম*</label>
                <input
                  type="text"
                  required
                  value={newSupplier.company}
                  onChange={(e) => setNewSupplier({ ...newSupplier, company: e.target.value })}
                  placeholder="যেমন: মেঘনা গ্রুপ ডিস্ট্রিবিউশন"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">প্রতিনিধি / ব্যক্তির নাম*</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="যেমন: কামরুল হাসান (এসআর)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">মোবাইল নম্বর*</label>
                <input
                  type="text"
                  required
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="০১৭১১-..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ঠিকানা / এলাকা</label>
                <input
                  type="text"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="যেমন: বাবুবাজার চাল আড়ত, ঢাকা"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পণ্যের ক্যাটাগরি</label>
                <input
                  type="text"
                  value={newSupplier.categories}
                  onChange={(e) => setNewSupplier({ ...newSupplier, categories: e.target.value })}
                  placeholder="যেমন: তেল, চিনি ও আটা"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পেমেন্ট শর্তাবলী</label>
                <input
                  type="text"
                  value={newSupplier.paymentTerms}
                  onChange={(e) => setNewSupplier({ ...newSupplier, paymentTerms: e.target.value })}
                  placeholder="যেমন: ৭ দিনের ক্যাশ মেমো"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-3 py-2 text-xs rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
