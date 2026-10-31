import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  Boxes,
  Check,
  Copy,
  Download,
  Edit2,
  FileSpreadsheet,
  Filter,
  History,
  Info,
  MoreVertical,
  Package,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GROCERY_CATEGORIES } from '../../data/categories';
import { Product, UnitOfMeasure } from '../../types';
import { formatDateBn, formatNumber } from '../../utils/numberConverter';

export const ProductListView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    toggleBookmarkProduct,
    bookmarkedProductIds,
    stockTransactions,
    settings,
    setActiveTab,
  } = useApp();

  const useBn = settings.useBengaliNumerals;

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'zero'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc'>('name');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Product Form State
  const defaultFormState: Omit<Product, 'id'> = {
    nameBn: '',
    nameEn: '',
    category: 'চাল ও চালজাত পণ্য',
    subcategory: '',
    brand: '',
    manufacturer: '',
    barcode: '',
    unit: 'পিস',
    purchasePrice: 0,
    wholesalePrice: 0,
    retailPrice: 0,
    stock: 0,
    minStockAlert: 8,
    maxStockLevel: 50,
    supplierName: '',
    expiryDate: '',
    storageInstructions: '',
    status: 'active',
    notes: '',
  };

  const [formData, setFormData] = useState<Omit<Product, 'id'>>(defaultFormState);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNameBn = p.nameBn.toLowerCase().includes(q);
          const matchNameEn = p.nameEn.toLowerCase().includes(q);
          const matchBarcode = p.barcode.includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          if (!matchNameBn && !matchNameEn && !matchBarcode && !matchBrand) return false;
        }

        // Category
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Stock Filter
        if (stockFilter === 'low') {
          return p.stock > 0 && p.stock <= (p.minStockAlert || settings.lowStockThresholdDefault);
        }
        if (stockFilter === 'zero') {
          return p.stock <= 0;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.nameBn.localeCompare(b.nameBn, 'bn');
        if (sortBy === 'price_asc') return a.retailPrice - b.retailPrice;
        if (sortBy === 'price_desc') return b.retailPrice - a.retailPrice;
        if (sortBy === 'stock_asc') return a.stock - b.stock;
        if (sortBy === 'stock_desc') return b.stock - a.stock;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy, settings.lowStockThresholdDefault]);

  // Handle Add/Edit Save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameBn.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      setEditingProduct(null);
    } else {
      addProduct(formData);
      setIsAddModalOpen(false);
    }
    setFormData(defaultFormState);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID,Name (Bangla),Name (English),Category,Brand,Barcode,Unit,Purchase Price,Retail Price,Stock,Min Alert'];
    const rows = products.map((p) =>
      `"${p.id}","${p.nameBn.replace(/"/g, '""')}","${p.nameEn.replace(/"/g, '""')}","${p.category}","${p.brand}","${p.barcode}","${p.unit}",${p.purchasePrice},${p.retailPrice},${p.stock},${p.minStockAlert}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Amar_Grocery_Products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const UNITS: UnitOfMeasure[] = [
    'পিস', 'কেজি', 'গ্রাম', 'লিটার', 'মিলিলিটার', 'প্যাকেট', 'বস্তা', 'কার্টন', 'বোতল', 'ডজন', 'হালি', 'বান্ডিল'
  ];

  return (
    <div className="space-y-6">
      {/* Illustrative Price Notice Banner (Crucial Requirement from Prompt) */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>বিশেষ দ্রষ্টব্য (ডেমো ডেটা):</strong> ক্যাটালগে প্রদর্শিত সকল পণ্যের ক্রয় ও বিক্রয়মূল্য কেবল
          শেখা, পরিচালনা ও ডেমো অনুশীলনের উদ্দেশ্যে প্রস্তুতকৃত। এগুলো বর্তমান বাজারদরের যাচাইকৃত দাবি নয়;
          বাস্তব দোকান পরিচালনার ক্ষেত্রে সর্বদা নিজস্ব পাইকারি ক্রয়ের ইনভয়েস ও রসিদ অনুযায়ী মূল্য নির্ধারণ করুন।
        </div>
      </div>

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>পণ্য তালিকা ও ইনভেন্টরি ম্যানেজমেন্ট</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {formatNumber(filteredProducts.length, useBn)} টি পণ্য
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            দোকানের সমস্ত পণ্যের ক্রয় ও বিক্রয় দর, মজুত, ক্যাটাগরি ও হিস্ট্রি
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV এক্সপোর্ট</span>
          </button>

          <button
            onClick={() => {
              setFormData(defaultFormState);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পণ্য যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্যের বাংলা/ইংরেজি নাম, ব্র্যান্ড বা বারকোড দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">সকল বিভাগ (৩০টি ক্যাটাগরি)</option>
              {GROCERY_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.nameBn}>
                  {cat.nameBn}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="md:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">সব স্টক লেভেল</option>
              <option value="low">কম স্টক ({formatNumber(products.filter(p => p.stock > 0 && p.stock <= p.minStockAlert).length, useBn)}টি)</option>
              <option value="zero">স্টক শূন্য ({formatNumber(products.filter(p => p.stock <= 0).length, useBn)}টি)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="name">নাম অনুযায়ী</option>
              <option value="price_asc">বিক্রয়মূল্য: কম থেকে বেশি</option>
              <option value="price_desc">বিক্রয়মূল্য: বেশি থেকে কম</option>
              <option value="stock_asc">স্টক: কম থেকে বেশি</option>
              <option value="stock_desc">স্টক: বেশি থেকে কম</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List Table / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">পণ্য ও ব্র্যান্ড</th>
                <th className="py-3 px-3">ক্যাটাগরি</th>
                <th className="py-3 px-3">একক</th>
                <th className="py-3 px-3 text-right">ক্রয়মূল্য</th>
                <th className="py-3 px-3 text-right">খুচরা মূল্য</th>
                <th className="py-3 px-3 text-right">বর্তমান স্টক</th>
                <th className="py-3 px-3 text-center">মেয়াদ</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    কোনো পণ্য পাওয়া যায়নি। সার্চ ফিল্টার পরিবর্তন করুন।
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow = product.stock > 0 && product.stock <= product.minStockAlert;
                  const isZero = product.stock <= 0;
                  const isBookmarked = bookmarkedProductIds.includes(product.id);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Product Name & Brand */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggleBookmarkProduct(product.id)}
                            title={isBookmarked ? 'বুকমার্ক সরানো' : 'বুকমার্কে যোগ'}
                            className={`p-1 rounded-md transition ${
                              isBookmarked
                                ? 'text-amber-500 hover:text-amber-600'
                                : 'text-slate-300 hover:text-slate-500'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                              {product.nameBn}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{product.brand || 'সাধারণ'}</span>
                              <span>·</span>
                              <span className="font-mono">{product.barcode}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {product.category}
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {product.unit}
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                        {formatNumber(product.purchasePrice, useBn, { isCurrency: true })}
                      </td>

                      {/* Retail Price */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {formatNumber(product.retailPrice, useBn, { isCurrency: true })}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-3 text-right font-mono">
                        <div
                          className={`inline-flex items-center gap-1 font-bold ${
                            isZero
                              ? 'text-rose-600 dark:text-rose-400'
                              : isLow
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {isZero && <AlertTriangle className="w-3.5 h-3.5" />}
                          {formatNumber(product.stock, useBn)} {product.unit}
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 text-center text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {product.expiryDate ? formatDateBn(product.expiryDate, useBn) : '-'}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setHistoryProduct(product)}
                            title="স্টক লেনদেনের ইতিহাস"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(product)}
                            title="সম্পাদনা করুন"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => duplicateProduct(product.id)}
                            title="অনুরূপ পণ্য তৈরি (Duplicate)"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            title="মুছে ফেলুন"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingProduct ? 'পণ্য তথ্য সংশোধন করুন' : 'নতুন মুদি পণ্য যুক্ত করুন'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bangla Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পণ্যের নাম (বাংলা)*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="যেমন: মিনিকেট চাল (৫০ কেজি বস্তা)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পণ্যের নাম (English)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Miniket Rice (50kg)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ক্যাটাগরি / বিভাগ*
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {GROCERY_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.nameBn}>
                        {cat.nameBn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ব্র্যান্ড / প্রস্তুতকারক
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="যেমন: তীর, প্রাণ, রাঁধুনী, রূপচাঁদা"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বারকোড (Barcode / EAN)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="8941100..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পরিমাপের একক (Unit)*
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitOfMeasure })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ক্রয়মূল্য (৳)*
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.purchasePrice || ''}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Retail Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    খুচরা বিক্রয়মূল্য (৳)*
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.retailPrice || ''}
                    onChange={(e) => setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Initial Stock */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বর্তমান মজুত / স্টক
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Min Stock Alert */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সর্বনিম্ন স্টক অ্যালার্ট লেভেল
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockAlert || ''}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value, 10) || 8 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মেয়াদোত্তীর্ণের তারিখ (Expiry Date)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate || ''}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Supplier Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সরবরাহকারীর নাম / আড়ত
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName || ''}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="সরবরাহকারী প্রতিষ্ঠান বা এসআর"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Storage Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সংরক্ষণের নিয়ম ও সতর্কতা
                </label>
                <textarea
                  rows={2}
                  value={formData.storageInstructions || ''}
                  onChange={(e) => setFormData({ ...formData, storageInstructions: e.target.value })}
                  placeholder="যেমন: স্যাঁতসেঁতে জায়গা ও ইঁদুর থেকে রক্ষা করতে কাঠের পাটাতনের উপর রাখুন।"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                >
                  {editingProduct ? 'সংশোধন সংরক্ষণ করুন' : 'পণ্য সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                পণ্যটি মুছে ফেলতে চান?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              এই পণ্যটি মুছে ফেললে এর অতীত হিস্ট্রি ব্যতীত ক্যাটালগ থেকে বাদ পড়বে। আপনি কি নিশ্চিত?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                না, রাখুন
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Stock Transaction History Drawer */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    স্টক লেনদেনের ইতিহাস
                  </h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                    {historyProduct.nameBn}
                  </p>
                </div>
                <button
                  onClick={() => setHistoryProduct(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 font-sans">বর্তমান ব্যালেন্স:</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {formatNumber(historyProduct.stock, useBn)} {historyProduct.unit}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 pt-2">
                  সাম্প্রতিক অডিট ট্রেইল:
                </h4>

                {stockTransactions.filter((tx) => tx.productId === historyProduct.id).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    এই পণ্যের জন্য এখনো কোনো লেনদেন হয়নি।
                  </p>
                ) : (
                  stockTransactions
                    .filter((tx) => tx.productId === historyProduct.id)
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold ${
                              tx.type === 'stock_in' || tx.type === 'return_in'
                                ? 'text-emerald-600'
                                : tx.type === 'damaged' || tx.type === 'expired'
                                ? 'text-rose-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {tx.type === 'stock_in'
                              ? 'স্টক আগমন (In)'
                              : tx.type === 'stock_out'
                              ? 'বিক্রয় (Sale)'
                              : tx.type === 'damaged'
                              ? 'নষ্ট পণ্য (Damage)'
                              : tx.type === 'expired'
                              ? 'মেয়াদোত্তীর্ণ (Expired)'
                              : 'হিসাব সমন্বয় (Adjustment)'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDateBn(tx.date, useBn, true)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-slate-500">পরিমাণ:</span>
                          <span className="font-bold">
                            {tx.type === 'stock_in' || tx.type === 'return_in' ? '+' : '-'}
                            {formatNumber(tx.quantity, useBn)} {tx.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>পূর্বের স্টক: {formatNumber(tx.previousStock, useBn)}</span>
                          <span>নতুন স্টক: {formatNumber(tx.newStock, useBn)}</span>
                        </div>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                            নোট: {tx.notes}
                          </p>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>

            <button
              onClick={() => setHistoryProduct(null)}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
