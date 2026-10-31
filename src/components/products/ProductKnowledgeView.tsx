import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Eye,
  GraduationCap,
  HelpCircle,
  Package,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GROCERY_CATEGORIES } from '../../data/categories';
import { Product } from '../../types';
import { formatNumber } from '../../utils/numberConverter';

export const ProductKnowledgeView: React.FC = () => {
  const {
    products,
    bookmarkedProductIds,
    toggleBookmarkProduct,
    settings,
    setActiveTab,
  } = useApp();

  const useBn = settings.useBengaliNumerals;

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Comparison State
  const [compareProduct1, setCompareProduct1] = useState<Product | null>(null);
  const [compareProduct2, setCompareProduct2] = useState<Product | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must have knowledge object
      if (!p.knowledge) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.nameBn.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }

      if (levelFilter !== 'all' && p.knowledge.level !== levelFilter) {
        return false;
      }

      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      if (onlyBookmarked && !bookmarkedProductIds.includes(p.id)) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, levelFilter, selectedCategory, onlyBookmarked, bookmarkedProductIds]);

  const openCompareModal = (p: Product) => {
    setCompareProduct1(p);
    // Find a counterpart product from same category or next product
    const other = products.find((item) => item.id !== p.id && item.category === p.category) || products[0];
    setCompareProduct2(other);
    setIsCompareModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/60 backdrop-blur-xs text-emerald-100 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>মুদি পণ্য এনসাইক্লোপিডিয়া ও বিজনেস গাইড</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold leading-tight">
            মুদি পণ্যের পরিচিতি, আসল-নকল যাচাই ও লাভজনক ব্যবসার রহস্য
          </h2>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            একটি সফল মুদি দোকান পরিচালনার জন্য প্রতিটি পণ্যের গুণমান, প্রচলিত সাইজ, কোন এলাকায় বেশি চলে,
            সংরক্ষণের সঠিক নিয়ম এবং সম্ভাব্য মুনাফা বোঝা অপরিহার্য।
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য সম্পর্কে জানতে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="md:col-span-3">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">সকল লার্নিং লেভেল (All Levels)</option>
              <option value="Beginner">বিগিনার লেভেল (Beginner)</option>
              <option value="Intermediate">ইন্টারমিডিয়েট (Intermediate)</option>
              <option value="Advanced">অ্যাডভান্সড (Advanced)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">সকল বিভাগ (৩০টি ক্যাটাগরি)</option>
              {GROCERY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.nameBn}>
                  {c.nameBn}
                </option>
              ))}
            </select>
          </div>

          {/* Bookmarked toggle */}
          <div className="md:col-span-2 flex items-center">
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 ${
                onlyBookmarked
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>বুকমার্ক করা ({formatNumber(bookmarkedProductIds.length, useBn)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Knowledge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const k = product.knowledge!;
          const isBookmarked = bookmarkedProductIds.includes(product.id);

          return (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-500 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Top header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {product.category}
                    </span>
                    <span>·</span>
                    <span
                      className={`font-semibold ${
                        k.level === 'Advanced'
                          ? 'text-purple-600 dark:text-purple-400'
                          : k.level === 'Intermediate'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {k.level === 'Beginner' ? 'বিগিনার' : k.level === 'Intermediate' ? 'ইন্টারমিডিয়েট' : 'অ্যাডভান্সড'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleBookmarkProduct(product.id)}
                    title={isBookmarked ? 'বুকমার্ক সরানো' : 'বুকমার্ক করা'}
                    className={`p-1 rounded-lg transition ${
                      isBookmarked
                        ? 'text-amber-500 hover:text-amber-600'
                        : 'text-slate-300 hover:text-slate-500'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition">
                    {product.nameBn}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {k.descriptionBn}
                  </p>
                </div>

                {/* Highlight badges */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">সম্ভাব্য লাভ:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {k.expectedProfitMarginBn}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">চাহিদার ধরন:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">
                      {k.demandTypeBn}
                    </span>
                  </div>
                </div>

                {/* Counterfeit Warning snippet */}
                <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                  <p className="line-clamp-2 leading-relaxed">
                    <strong>নকল সতর্কতা:</strong> {k.counterfeitWarningBn}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => openCompareModal(product)}
                  className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 font-semibold transition"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>তুলনা করুন</span>
                </button>

                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition"
                >
                  <span>পূর্ণাঙ্গ পাঠ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Product Knowledge Drawer / Modal */}
      {selectedProduct && selectedProduct.knowledge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {selectedProduct.category} · {selectedProduct.brand || 'সাধারণ পণ্য'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedProduct.nameBn}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedProduct.nameEn}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Knowledge Sections */}
            <div className="space-y-4 text-xs">
              {/* পরিচিতি ও ব্যবহার */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>পরিচিতি ও ব্যবহারবিধি</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedProduct.knowledge.descriptionBn}
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>ব্যবহার:</strong> {selectedProduct.knowledge.usageBn}
                </p>
              </div>

              {/* বাজার ও সাইজ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    প্রচলিত প্যাকেট ও সাইজ
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedProduct.knowledge.commonPackSizesBn}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    কোন ধরনের দোকানে চলে
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedProduct.knowledge.storeTypesBn}
                  </p>
                </div>
              </div>

              {/* কেনার সময় সতর্কতা ও আসল-নকল চেনার উপায় */}
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                <h4 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>নকল বা নিম্নমানের পণ্য চেনার সতর্কতা</span>
                </h4>
                <p className="text-rose-900 dark:text-rose-200 leading-relaxed">
                  {selectedProduct.knowledge.counterfeitWarningBn}
                </p>
                <p className="text-rose-800 dark:text-rose-300 leading-relaxed pt-1 border-t border-rose-200 dark:border-rose-900/40">
                  <strong>কেনার সময় যা পরীক্ষা করবেন:</strong> {selectedProduct.knowledge.qualityCheckBn}
                </p>
              </div>

              {/* সংরক্ষণ ও মেয়াদ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    সংরক্ষণের নিয়ম
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedProduct.knowledge.storageAdviceBn}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    মেয়াদ ও সাইকেল
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedProduct.knowledge.expiryAdviceBn}
                  </p>
                </div>
              </div>

              {/* পাইকারি ও খুচরা ব্যবসার কৌশল এবং সম্ভাব্য লাভ */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>ব্যবসায়িক টিপস ও সম্ভাব্য মুনাফা</span>
                </h4>
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300 pb-1 border-b border-emerald-200 dark:border-emerald-800/40">
                  <span>প্রত্যাশিত মোট লাভ মার্জিন:</span>
                  <span className="font-mono text-sm">{selectedProduct.knowledge.expectedProfitMarginBn}</span>
                </div>
                <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  {selectedProduct.knowledge.wholesaleRetailTipsBn}
                </p>
                <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed pt-1">
                  <strong>বিশেষ পরামর্শ:</strong> {selectedProduct.knowledge.businessTipsBn}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => toggleBookmarkProduct(selectedProduct.id)}
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {bookmarkedProductIds.includes(selectedProduct.id)
                  ? 'বুকমার্ক থেকে সরান'
                  : 'বুকমার্কে সংরক্ষণ করুন'}
              </button>

              <button
                onClick={() => setSelectedProduct(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold transition"
              >
                পাঠ সম্পন্ন হয়েছে
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Product Comparison Modal (Requirement from prompt) */}
      {isCompareModalOpen && compareProduct1 && compareProduct2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  পণ্য দ্বৈত তুলনা (Side-by-Side Comparison)
                </h3>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select comparison targets */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">প্রথম পণ্য</label>
                <select
                  value={compareProduct1.id}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) setCompareProduct1(found);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameBn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">দ্বিতীয় পণ্য</label>
                <select
                  value={compareProduct2.id}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) setCompareProduct2(found);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameBn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3 w-1/4">মানদণ্ড</th>
                    <th className="py-2.5 px-3 w-3/8 font-bold text-emerald-700 dark:text-emerald-400">
                      {compareProduct1.nameBn}
                    </th>
                    <th className="py-2.5 px-3 w-3/8 font-bold text-blue-700 dark:text-blue-400">
                      {compareProduct2.nameBn}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500">ক্যাটাগরি</td>
                    <td className="py-2.5 px-3">{compareProduct1.category}</td>
                    <td className="py-2.5 px-3">{compareProduct2.category}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500">ব্র্যান্ড</td>
                    <td className="py-2.5 px-3">{compareProduct1.brand || 'সাধারণ'}</td>
                    <td className="py-2.5 px-3">{compareProduct2.brand || 'সাধারণ'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500">ক্রয়মূল্য</td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {formatNumber(compareProduct1.purchasePrice, useBn, { isCurrency: true })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {formatNumber(compareProduct2.purchasePrice, useBn, { isCurrency: true })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500">খুচরা বিক্রয়মূল্য</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                      {formatNumber(compareProduct1.retailPrice, useBn, { isCurrency: true })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                      {formatNumber(compareProduct2.retailPrice, useBn, { isCurrency: true })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500">সম্ভাব্য লাভ মার্জিন</td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {compareProduct1.knowledge?.expectedProfitMarginBn || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {compareProduct2.knowledge?.expectedProfitMarginBn || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500">চাহিদার ধরন</td>
                    <td className="py-2.5 px-3">{compareProduct1.knowledge?.demandTypeBn || '-'}</td>
                    <td className="py-2.5 px-3">{compareProduct2.knowledge?.demandTypeBn || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500">সংরক্ষণের নিয়ম</td>
                    <td className="py-2.5 px-3 leading-relaxed">{compareProduct1.knowledge?.storageAdviceBn || '-'}</td>
                    <td className="py-2.5 px-3 leading-relaxed">{compareProduct2.knowledge?.storageAdviceBn || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-500">নকল চেনার সতর্কতা</td>
                    <td className="py-2.5 px-3 text-rose-700 dark:text-rose-400 leading-relaxed">
                      {compareProduct1.knowledge?.counterfeitWarningBn || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-rose-700 dark:text-rose-400 leading-relaxed">
                      {compareProduct2.knowledge?.counterfeitWarningBn || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                তুলনা বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
