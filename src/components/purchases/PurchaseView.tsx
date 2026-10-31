import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Filter,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, PaymentStatus, Purchase, PurchaseItem, UnitOfMeasure } from '../../types';
import { formatDateBn, formatNumber } from '../../utils/numberConverter';

export const PurchaseView: React.FC = () => {
  const {
    purchases,
    recordPurchase,
    suppliers,
    products,
    settings,
  } = useApp();

  const useBn = settings.useBengaliNumerals;

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Purchase | null>(null);

  // New Purchase Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('পরিশোধিত (Paid)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ক্যাশ (Cash)');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Items in purchase invoice
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  // Item selector in modal
  const [currentProductId, setCurrentProductId] = useState<string>(products[0]?.id || '');
  const [currentQty, setCurrentQty] = useState<number>(1);
  const [currentPrice, setCurrentPrice] = useState<number>(products[0]?.purchasePrice || 0);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const handleAddProductToInvoice = () => {
    const prod = products.find((p) => p.id === currentProductId);
    if (!prod || currentQty <= 0) return;

    // Check if product already in items
    const existingIndex = purchaseItems.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...purchaseItems];
      updated[existingIndex].quantity += currentQty;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPurchasePrice;
      setPurchaseItems(updated);
    } else {
      const newItem: PurchaseItem = {
        productId: prod.id,
        productName: prod.nameBn,
        unit: prod.unit,
        quantity: currentQty,
        unitPurchasePrice: currentPrice,
        totalPrice: currentQty * currentPrice,
        expiryDate: prod.expiryDate,
      };
      setPurchaseItems([...purchaseItems, newItem]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const subtotal = purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalAmount = Math.max(0, subtotal + transportCost - discount);
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি পণ্য চালানে যুক্ত করুন');
      return;
    }

    const created = recordPurchase({
      supplierId: selectedSupplier?.id || '',
      supplierName: selectedSupplier?.company || 'সাধারন পাইকার',
      items: purchaseItems,
      subtotal,
      transportCost,
      otherExpenses: 0,
      discount,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus: dueAmount === 0 ? 'পরিশোধিত (Paid)' : paidAmount > 0 ? 'আংশিক পরিশোধিত (Partial)' : 'বাকি (Unpaid)',
      paymentMethod,
      notes,
    });

    setIsNewModalOpen(false);
    // Reset
    setPurchaseItems([]);
    setPaidAmount(0);
    setTransportCost(0);
    setDiscount(0);
    setNotes('');
    setSelectedInvoiceForPrint(created);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>কেনাকাটা ও সরবরাহকারী চালান</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-bold">
              {formatNumber(purchases.length, useBn)} টি চালান
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            পাইকারি বাজার বা কোম্পানির এসআর থেকে কেনা মালের চালান রেকর্ড ও স্টক স্বয়ংক্রিয় বৃদ্ধি
          </p>
        </div>

        <button
          onClick={() => {
            setPurchaseItems([]);
            setIsNewModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ক্রয় চালান এন্ট্রি</span>
        </button>
      </div>

      {/* Purchases List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-3 px-4">চালান নং ও তারিখ</th>
                <th className="py-3 px-3">সরবরাহকারী</th>
                <th className="py-3 px-3 text-center">পণ্যের সংখ্যা</th>
                <th className="py-3 px-3 text-right">মোট টাকা</th>
                <th className="py-3 px-3 text-right">পরিশোধিত</th>
                <th className="py-3 px-3 text-right">বকেয়া বিল</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">প্রিন্ট মেমো</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    এখনো কোনো ক্রয় চালান এন্ট্রি করা হয়নি।
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    {/* Invoice & Date */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-700 dark:text-blue-400">
                        {purchase.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        {formatDateBn(purchase.date, useBn, true)}
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">
                      {purchase.supplierName}
                    </td>

                    {/* Items count */}
                    <td className="py-3 px-3 text-center">
                      {formatNumber(purchase.items.length, useBn)} পদ
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatNumber(purchase.totalAmount, useBn, { isCurrency: true })}
                    </td>

                    {/* Paid */}
                    <td className="py-3 px-3 text-right text-emerald-600">
                      {formatNumber(purchase.paidAmount, useBn, { isCurrency: true })}
                    </td>

                    {/* Due */}
                    <td className="py-3 px-3 text-right font-bold text-rose-600">
                      {purchase.dueAmount > 0
                        ? formatNumber(purchase.dueAmount, useBn, { isCurrency: true })
                        : '-'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center font-sans">
                      <span
                        className={`text-[11px] font-semibold ${
                          purchase.dueAmount === 0
                            ? 'text-emerald-600'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {purchase.dueAmount === 0 ? 'পরিশোধিত' : 'বকেয়া'}
                      </span>
                    </td>

                    {/* Print Button */}
                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(purchase)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                        title="ইনভয়েস প্রিন্ট"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Invoice Entry Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                নতুন পণ্য ক্রয়ের চালান এন্ট্রি
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchase} className="space-y-4 text-xs">
              {/* Supplier and Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সরবরাহকারী / আড়ত নির্বাচন করুন*
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.company} ({s.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পরিশোধের মাধ্যম
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold outline-none"
                  >
                    <option value="ক্যাশ (Cash)">ক্যাশ (Cash)</option>
                    <option value="ব্যাংক (Bank)">ব্যাংক (Bank Transfer)</option>
                    <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                    <option value="নগদ (Nagad)">নগদ (Nagad)</option>
                    <option value="বাকি (Credit)">বাকি (Credit)</option>
                  </select>
                </div>
              </div>

              {/* Add Item Row Inside Modal */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  চালানে পণ্য যোগ করুন
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] text-slate-500 mb-1">পণ্য</label>
                    <select
                      value={currentProductId}
                      onChange={(e) => {
                        setCurrentProductId(e.target.value);
                        const p = products.find((x) => x.id === e.target.value);
                        if (p) setCurrentPrice(p.purchasePrice);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameBn} ({p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-1">পরিমাণ</label>
                    <input
                      type="number"
                      min="1"
                      value={currentQty}
                      onChange={(e) => setCurrentQty(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-slate-500 mb-1">একক ক্রয়মূল্য (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddProductToInvoice}
                      className="w-full py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold transition hover:opacity-90"
                    >
                      যোগ করুন
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List in Current Purchase */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">
                  চালানের পণ্য তালিকা ({formatNumber(purchaseItems.length, useBn)} পদ):
                </h4>

                {purchaseItems.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 border border-dashed rounded-xl">
                    এখনো কোনো পণ্য যোগ করা হয়নি। উপরের ড্রপডাউন থেকে পণ্য যোগ করুন।
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl">
                    {purchaseItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 text-xs">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {item.productName}
                          </div>
                          <div className="text-slate-400 font-mono text-[11px]">
                            {formatNumber(item.quantity, useBn)} {item.unit} × ৳{formatNumber(item.unitPurchasePrice, useBn)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {formatNumber(item.totalPrice, useBn, { isCurrency: true })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals & Extra Costs Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">পরিবহন ও কুলি খরচ (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={transportCost || ''}
                    onChange={(e) => setTransportCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">ডিসকাউন্ট বা ছাড় (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">নগদ পরিশোধের পরিমাণ (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    placeholder="যত টাকা আজ দিলেন"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              {/* Summary Row */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>পণ্যের মোট দাম:</span>
                  <span>{formatNumber(subtotal, useBn, { isCurrency: true })}</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold text-sm pt-1 border-t">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span>{formatNumber(totalAmount, useBn, { isCurrency: true })}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>বকেয়া বিল থাকবে:</span>
                  <span>{formatNumber(dueAmount, useBn, { isCurrency: true })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                >
                  চালান কনফার্ম ও স্টক যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal (Requirement from prompt) */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white text-slate-900 shadow-2xl p-6 my-8 space-y-4 print-container">
            {/* Top print header */}
            <div className="flex items-center justify-between pb-3 border-b no-print">
              <span className="font-bold text-sm">ক্রয় ইনভয়েস ভাউচার</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-4 border rounded-2xl space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b space-y-1">
                <h3 className="text-lg font-bold">{settings.shopName}</h3>
                <p className="text-[11px] text-slate-500">{settings.shopAddress}</p>
                <p className="text-[11px] text-slate-500 font-mono">ফোন: {settings.shopPhone}</p>
                <span className="inline-block mt-1 font-bold text-xs bg-slate-100 px-3 py-0.5 rounded-full">
                  পণ্য ক্রয় চালান ভাউচার
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">চালান নং:</span>
                  <span className="font-bold font-mono text-xs">{selectedInvoiceForPrint.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">তারিখ:</span>
                  <span className="font-mono">{formatDateBn(selectedInvoiceForPrint.date, useBn, true)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">সরবরাহকারী:</span>
                  <span className="font-bold">{selectedInvoiceForPrint.supplierName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">পেমেন্ট মেথড:</span>
                  <span>{selectedInvoiceForPrint.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-t text-slate-600 font-semibold">
                    <th className="py-2">পণ্য</th>
                    <th className="py-2 text-right">পরিমাণ</th>
                    <th className="py-2 text-right">দর</th>
                    <th className="py-2 text-right">মোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {selectedInvoiceForPrint.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 font-sans font-medium">{item.productName}</td>
                      <td className="py-2 text-right">
                        {formatNumber(item.quantity, useBn)} {item.unit}
                      </td>
                      <td className="py-2 text-right">৳{formatNumber(item.unitPurchasePrice, useBn)}</td>
                      <td className="py-2 text-right font-bold">
                        ৳{formatNumber(item.totalPrice, useBn)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t pt-2 space-y-1 font-mono text-[11px] text-right">
                <div>সাবটোটাল: ৳{formatNumber(selectedInvoiceForPrint.subtotal, useBn)}</div>
                {selectedInvoiceForPrint.transportCost > 0 && (
                  <div>পরিবহন: + ৳{formatNumber(selectedInvoiceForPrint.transportCost, useBn)}</div>
                )}
                {selectedInvoiceForPrint.discount > 0 && (
                  <div>ছাড়: - ৳{formatNumber(selectedInvoiceForPrint.discount, useBn)}</div>
                )}
                <div className="font-bold text-sm pt-1 border-t">
                  সর্বমোট: ৳{formatNumber(selectedInvoiceForPrint.totalAmount, useBn)}
                </div>
                <div className="text-emerald-700">
                  পরিশোধিত: ৳{formatNumber(selectedInvoiceForPrint.paidAmount, useBn)}
                </div>
                {selectedInvoiceForPrint.dueAmount > 0 && (
                  <div className="font-bold text-rose-600">
                    বকেয়া: ৳{formatNumber(selectedInvoiceForPrint.dueAmount, useBn)}
                  </div>
                )}
              </div>

              <div className="pt-6 flex justify-between text-[10px] text-slate-400 text-center">
                <div className="border-t pt-1 w-28">ক্রেতা / ব্যবস্থাপক</div>
                <div className="border-t pt-1 w-28">সরবরাহকারীর স্বাক্ষর</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
