import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DollarSign,
  History,
  Phone,
  Plus,
  Search,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { formatDateBn, formatNumber } from '../../utils/numberConverter';

export const CustomerLedgerView: React.FC = () => {
  const { customers, addCustomer, recordCustomerPayment, settings } = useApp();
  const useBn = settings.useBengaliNumerals;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    address: '',
    creditLimit: 5000,
    notes: '',
  });

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalDues = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || paymentAmount <= 0) return;

    recordCustomerPayment(selectedCustomer.id, paymentAmount, paymentNotes);
    // Refresh selected customer state
    const updated = customers.find((c) => c.id === selectedCustomer.id);
    setSelectedCustomer(updated || null);
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name.trim() || !newCust.phone.trim()) return;

    addCustomer({
      name: newCust.name,
      phone: newCust.phone,
      address: newCust.address,
      creditLimit: newCust.creditLimit,
      notes: newCust.notes,
    });

    setIsAddCustomerModalOpen(false);
    setNewCust({
      name: '',
      phone: '',
      address: '',
      creditLimit: 5000,
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>ক্রেতার খাতা ও বাকি লেনদেন (Customer Ledger)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono font-bold">
              মোট বাকি: {formatNumber(totalDues, useBn, { isCurrency: true })}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            দোকানের বিশ্বস্ত ক্রেতাদের বাকির হিসাবরক্ষণ, ক্রেডিট লিমিট ও জমা নেওয়ার ডিজিটাল খাতা
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন খাতা খুলুন</span>
        </button>
      </div>

      {/* Warning Box about Credit Risk */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>মুদি ব্যবসায় বাকির ঝুঁকি নিয়ন্ত্রণ</span>
        </div>
        <p className="leading-relaxed">
          প্রতিটি কাস্টমারের জন্য একটি সর্বোচ্চ বাকির সীমা (Credit Limit) নির্ধারণ করে দিন। সীমা ছাড়িয়ে গেলে
          পূর্বের দেনা শোধ না করা পর্যন্ত নতুন বাকি বন্ধ রাখাই দেউলিয়া হওয়া থেকে দোকান রক্ষার সর্বোত্তম কৌশল।
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ক্রেতার নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-3 px-4">ক্রেতার নাম ও মোবাইল</th>
                <th className="py-3 px-3">ঠিকানা</th>
                <th className="py-3 px-3 text-right">বাকির সীমা (Limit)</th>
                <th className="py-3 px-3 text-right">মোট ক্রয়</th>
                <th className="py-3 px-3 text-right">মোট জমা দিয়েছেন</th>
                <th className="py-3 px-3 text-right">বর্তমান বাকি পাওনা</th>
                <th className="py-3 px-4 text-center">খতিয়ান ও জমা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredCustomers.map((cust) => {
                const isOverLimit = cust.outstandingBalance >= cust.creditLimit;

                return (
                  <tr key={cust.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {cust.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{cust.phone}</div>
                    </td>

                    <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                      {cust.address}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-500">
                      {formatNumber(cust.creditLimit, useBn, { isCurrency: true })}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-800 dark:text-slate-200 font-bold">
                      {formatNumber(cust.totalPurchased, useBn, { isCurrency: true })}
                    </td>

                    <td className="py-3 px-3 text-right text-emerald-600">
                      {formatNumber(cust.totalPaid, useBn, { isCurrency: true })}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-sm">
                      <span
                        className={
                          cust.outstandingBalance > 0
                            ? isOverLimit
                              ? 'text-rose-600 dark:text-rose-400 font-black'
                              : 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600'
                        }
                      >
                        {formatNumber(cust.outstandingBalance, useBn, { isCurrency: true })}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setPaymentAmount(cust.outstandingBalance);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-xs font-bold transition shadow-xs"
                      >
                        খতিয়ান ও জমা &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Ledger Drawer & Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedCustomer.name} - খাতা
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedCustomer.phone}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[11px] text-slate-400 block font-sans">বর্তমান বাকি:</span>
                  <span className="text-base font-bold text-rose-600">
                    {formatNumber(selectedCustomer.outstandingBalance, useBn, { isCurrency: true })}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[11px] text-slate-400 block font-sans">সর্বোচ্চ বাকির সীমা:</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                    {formatNumber(selectedCustomer.creditLimit, useBn, { isCurrency: true })}
                  </span>
                </div>
              </div>

              {/* Record Payment Form */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>বাকি আদায় ও জমা গ্রহণ</span>
                </h4>
                <form onSubmit={handlePaymentSubmit} className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                      জমা টাকার পরিমাণ (৳)*
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      placeholder="যত টাকা জমা দিলেন"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                      মন্তব্য
                    </label>
                    <input
                      type="text"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="যেমন: নগদ পরিশোধ, বিকাশ মারফত"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                  >
                    জমা টাকা গ্রহণ কনফার্ম করুন
                  </button>
                </form>
              </div>

              {/* Transactions History */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  আগের বাকির লেনদেন বিবরণী:
                </h4>

                {selectedCustomer.transactions.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">
                    এখনো কোনো লেনদেন রেকর্ড নেই।
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border rounded-2xl">
                    {selectedCustomer.transactions.map((tx) => (
                      <div key={tx.id} className="p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold ${
                              tx.type === 'payment_received'
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {tx.type === 'payment_received' ? 'নগদ জমা (+)' : 'বাকি নেওয়া (-)'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {formatDateBn(tx.date, useBn, true)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-slate-500 font-sans">লেনদেনের অংক:</span>
                          <span className="font-bold">
                            {formatNumber(tx.amount, useBn, { isCurrency: true })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                          <span className="font-sans">অবশিষ্ট ব্যালেন্স:</span>
                          <span>{formatNumber(tx.balanceAfter, useBn, { isCurrency: true })}</span>
                        </div>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-500 italic pt-0.5">
                            নোট: {tx.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                নতুন ক্রেতার বাকি খাতা খুলুন
              </h3>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ক্রেতার পুরো নাম*</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="যেমন: জনাব আব্দুল কাদের"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">মোবাইল নম্বর*</label>
                <input
                  type="text"
                  required
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  placeholder="০১৭১১-..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">বাসার ঠিকানা / ফ্ল্যাট নং</label>
                <input
                  type="text"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  placeholder="যেমন: বাড়ি নং ১২, রোড ৩, মিরপুর"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">সর্বোচ্চ বাকির সীমা (Credit Limit ৳)*</label>
                <input
                  type="number"
                  min="500"
                  required
                  value={newCust.creditLimit}
                  onChange={(e) => setNewCust({ ...newCust, creditLimit: parseFloat(e.target.value) || 5000 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পেশা বা পরিচয় নোট</label>
                <input
                  type="text"
                  value={newCust.notes}
                  onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
                  placeholder="যেমন: সরকারি চাকুরিজীবী, প্রতি মাসের ১ তারিখে পেনশন পান"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-3 py-2 text-xs rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white shadow-xs"
                >
                  খাতা তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
