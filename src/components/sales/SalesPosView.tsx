import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Barcode,
  Check,
  CircleDollarSign,
  CreditCard,
  Minus,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Search,
  ShoppingCart,
  Trash2,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GROCERY_CATEGORIES } from '../../data/categories';
import { PaymentMethod, Product, Sale, SaleItem } from '../../types';
import { formatDateBn, formatNumber } from '../../utils/numberConverter';

interface CartItem extends SaleItem {
  stock: number;
}

export const SalesPosView: React.FC = () => {
  const {
    products,
    customers,
    recordSale,
    settings,
  } = useApp();

  const useBn = settings.useBengaliNumerals;

  // Search & Categories for Quick Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ক্যাশ (Cash)');
  const [cashReceived, setCashReceived] = useState<number>(0);

  // Completed Receipt Modal for Printing
  const [printedReceipt, setPrintedReceipt] = useState<Sale | null>(null);

  // Quick Filtered Products in POS catalog
  const catalogList = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCat !== 'all' && p.category !== selectedCat) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.nameBn.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q);
          const matchCode = p.barcode.includes(q);
          if (!matchName && !matchCode) return false;
        }
        return true;
      })
      .slice(0, 36);
  }, [products, selectedCat, searchQuery]);

  // Add to Cart
  const addToCart = (product: Product) => {
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`দোকানে বর্তমান স্টক মাত্র ${product.stock} ${product.unit}! অতিরিক্ত যোগ করা যাবে না।`);
        return;
      }
      setCart(
        cart.map((item) => {
          if (item.productId === product.id) {
            const nextQty = item.quantity + 1;
            return {
              ...item,
              quantity: nextQty,
              totalPrice: nextQty * item.unitPrice,
            };
          }
          return item;
        })
      );
    } else {
      if (product.stock <= 0) {
        alert('সতর্কতা: এই পণ্যের কোনো স্টক নেই!');
        return;
      }
      const newItem: CartItem = {
        productId: product.id,
        productName: product.nameBn,
        unit: product.unit,
        quantity: 1,
        unitPrice: product.retailPrice,
        costPrice: product.purchasePrice,
        discount: 0,
        totalPrice: product.retailPrice,
        stock: product.stock,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    const target = cart.find((i) => i.productId === productId);
    if (target && newQty > target.stock) {
      alert(`সর্বোচ্চ উপলব্ধ স্টক ${target.stock} ${target.unit}!`);
      return;
    }
    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCashReceived(0);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCost = cart.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
  const vatAmount = (subtotal * (settings.defaultVatPercent || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + vatAmount - discount);
  const profit = Math.max(0, grandTotal - totalCost);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Due calculation
  const isCreditSale = paymentMethod === 'বাকি (Credit)';
  const paidAmount = isCreditSale ? Math.min(cashReceived, grandTotal) : grandTotal;
  const dueAmount = isCreditSale ? Math.max(0, grandTotal - cashReceived) : 0;
  const changeDue = !isCreditSale && cashReceived > grandTotal ? cashReceived - grandTotal : 0;

  // Complete Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert('কার্টে কোনো পণ্য নেই!');
      return;
    }

    if (isCreditSale && !selectedCustomer) {
      alert('বাকিতে বিক্রয়ের জন্য অবশ্যই নির্দিষ্ট কাস্টমার নির্বাচন করতে হবে!');
      return;
    }

    const sale = recordSale({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : 'সাধারণ ক্রেতা',
      customerPhone: selectedCustomer?.phone,
      items: cart,
      subtotal,
      discount,
      vatAmount,
      totalAmount: grandTotal,
      totalCost,
      profit,
      paidAmount,
      dueAmount,
      paymentMethod,
      notes: isCreditSale ? `বাকির খাতা এন্ট্রি: ৳${dueAmount}` : 'নগদ বিক্রয়',
    });

    setPrintedReceipt(sale);
    clearCart();
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>পয়েন্ট অব সেলস (POS) ও ক্যাশ মেমো</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
              লাইভ শপ মোড
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ঝটপট বারকোড বা নাম দিয়ে পণ্য যুক্ত করুন, ডিসকাউন্ট দিন এবং প্রিন্ট মেমো তৈরি করুন
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 text-xs font-semibold self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>কার্ট খালি করুন</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Product Picker & Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search bar & Category filter */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বারকোড স্ক্যান করুন অথবা চাল, তেল, ডাল, সাবান লিখে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCat('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                  selectedCat === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                সকল পণ্য
              </button>
              {GROCERY_CATEGORIES.slice(0, 10).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.nameBn)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                    selectedCat === cat.nameBn
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {cat.nameBn.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {catalogList.map((product) => {
              const isZero = product.stock <= 0;
              return (
                <button
                  key={product.id}
                  disabled={isZero}
                  onClick={() => addToCart(product)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isZero
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-xs active:scale-98'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-slate-400 block truncate font-sans">
                      {product.brand || product.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mt-0.5 font-sans leading-snug">
                      {product.nameBn}
                    </h4>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                      {formatNumber(product.retailPrice, useBn, { isCurrency: true })}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        isZero ? 'text-rose-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {isZero ? 'স্টক শেষ' : `${formatNumber(product.stock, useBn)} ${product.unit}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Cart & Billing Terminal (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                বিক্রয় চালান / কার্ট ({formatNumber(cart.length, useBn)} টি পণ্য)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {formatNumber(subtotal, useBn, { isCurrency: true })}
            </span>
          </div>

          {/* Customer Selection (Optional for Cash, Mandatory for Credit) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>ক্রেতার খাতা নির্বাচন (ঐচ্ছিক)</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="">সাধারণ ক্যাশ খরিদ্দার (বাকি ছাড়া)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.phone} (পূর্বের বাকি: ৳{c.outstandingBalance})
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border rounded-2xl p-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
                কার্ট খালি। বামপাশের পণ্য তালিকায় ক্লিক করুন।
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="p-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 truncate">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 truncate font-sans">
                      {item.productName}
                    </h5>
                    <div className="text-[11px] text-slate-400 font-mono">
                      ৳{formatNumber(item.unitPrice, useBn)} × {formatNumber(item.quantity, useBn)} {item.unit}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold">
                      {formatNumber(item.quantity, useBn)}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 shrink-0 w-16 text-right">
                    ৳{formatNumber(item.totalPrice, useBn)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              মূল্য পরিশোধের মাধ্যম*
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                'ক্যাশ (Cash)',
                'বিকাশ (bKash)',
                'নগদ (Nagad)',
                'রকেট (Rocket)',
                'ব্যাংক (Bank)',
                'বাকি (Credit)',
              ].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method as PaymentMethod)}
                  className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition ${
                    paymentMethod === method
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {method.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Discount & Received Cash inputs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">ছাড় / ডিসকাউন্ট (৳)</label>
              <input
                type="number"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="০"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                {isCreditSale ? 'আংশিক জমা টাকা (৳)' : 'গ্রাহকের দেওয়া টাকা (৳)'}
              </label>
              <input
                type="number"
                min="0"
                value={cashReceived || ''}
                onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                placeholder="নগদ কত দিল"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
          </div>

          {/* Final Receipt Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>উপমোট (Subtotal):</span>
              <span>{formatNumber(subtotal, useBn, { isCurrency: true })}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>ছাড় (Discount):</span>
                <span>- {formatNumber(discount, useBn, { isCurrency: true })}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold text-base pt-1.5 border-t">
              <span>সর্বমোট প্রদেয়:</span>
              <span className="text-emerald-600">{formatNumber(grandTotal, useBn, { isCurrency: true })}</span>
            </div>
            {changeDue > 0 && (
              <div className="flex justify-between text-blue-600 font-bold">
                <span>ফেরত দিন (Change):</span>
                <span>{formatNumber(changeDue, useBn, { isCurrency: true })}</span>
              </div>
            )}
            {isCreditSale && dueAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>বাকি থাকবে (Due):</span>
                <span>{formatNumber(dueAmount, useBn, { isCurrency: true })}</span>
              </div>
            )}
          </div>

          {/* Complete Button */}
          <button
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-2xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-xs ${
              cart.length === 0
                ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-md'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>বিক্রয় সম্পন্ন ও মেমো তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal (Thermal / Standard Format) */}
      {printedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-sm rounded-3xl bg-white text-slate-900 shadow-2xl p-6 my-8 space-y-4 print-container">
            {/* Action buttons (hidden on print) */}
            <div className="flex items-center justify-between pb-3 border-b no-print">
              <span className="font-bold text-xs text-slate-700">ক্যাশ মেমো রসিদ</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>
                <button
                  onClick={() => setPrintedReceipt(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thermal / Paper Receipt Body */}
            <div className="text-center space-y-1 font-sans">
              <h3 className="text-base font-bold leading-tight">{settings.shopName}</h3>
              <p className="text-[11px] text-slate-500">{settings.shopAddress}</p>
              <p className="text-[11px] text-slate-500 font-mono">মোবাইল: {settings.shopPhone}</p>
              <div className="py-1 border-t border-b border-dashed my-2 text-[11px] flex justify-between font-mono">
                <span>মেমো: {printedReceipt.invoiceNumber}</span>
                <span>{formatDateBn(printedReceipt.date, useBn, true)}</span>
              </div>
              <div className="text-left text-[11px] font-sans">
                <span>ক্রেতা: {printedReceipt.customerName}</span>
              </div>
            </div>

            {/* Items table */}
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-dashed text-slate-500">
                  <th className="py-1">বিবরণ</th>
                  <th className="py-1 text-center">পরিমাণ</th>
                  <th className="py-1 text-right">টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed font-mono">
                {printedReceipt.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 font-sans font-medium">{item.productName}</td>
                    <td className="py-1.5 text-center">
                      {formatNumber(item.quantity, useBn)} {item.unit}
                    </td>
                    <td className="py-1.5 text-right font-bold">
                      ৳{formatNumber(item.totalPrice, useBn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-dashed pt-2 space-y-1 font-mono text-[11px] text-right">
              <div>মোট বিল: ৳{formatNumber(printedReceipt.subtotal, useBn)}</div>
              {printedReceipt.discount > 0 && (
                <div>ছাড়: - ৳{formatNumber(printedReceipt.discount, useBn)}</div>
              )}
              <div className="font-bold text-sm pt-1 border-t">
                পরিশোধযোগ্য: ৳{formatNumber(printedReceipt.totalAmount, useBn)}
              </div>
              <div>পরিশোধিত ({printedReceipt.paymentMethod}): ৳{formatNumber(printedReceipt.paidAmount, useBn)}</div>
              {printedReceipt.dueAmount > 0 && (
                <div className="font-bold text-rose-600">
                  বাকি পাওনা: ৳{formatNumber(printedReceipt.dueAmount, useBn)}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-dashed text-center space-y-1 text-[10px] text-slate-500">
              <p>{settings.receiptFooterMessage}</p>
              <p className="font-mono">সফটওয়্যার: আমার মুদি দোকান (Amar Grocery Manager)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
