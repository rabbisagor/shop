import React, { useState, useRef } from 'react';
import { 
  Settings, Store, Database, Download, 
  Upload, RefreshCw, Sun, Moon, Hash, Check, AlertCircle, Copy, Code
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportAllDataAsJSON, 
    importDataFromJSON, 
    resetToDemoData,
  } = useApp();

  const [formData, setFormData] = useState({
    shopName: settings.shopName,
    shopAddress: settings.shopAddress,
    shopPhone: settings.shopPhone,
    shopProprietor: settings.shopProprietor,
    receiptFooterMessage: settings.receiptFooterMessage,
    lowStockThresholdDefault: settings.lowStockThresholdDefault,
    nearExpiryDaysThreshold: settings.nearExpiryDaysThreshold,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      lowStockThresholdDefault: Number(formData.lowStockThresholdDefault),
      nearExpiryDaysThreshold: Number(formData.nearExpiryDaysThreshold),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amar_grocery_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = importDataFromJSON(text);
        if (ok) {
          alert('ডাটা সফলভাবে রিস্টোর হয়েছে!');
        } else {
          alert('ডাটা ফাইলে ত্রুটি রয়েছে। দয়া করে সঠিক ব্যাকআপ ফাইল নির্বাচন করুন।');
        }
      } catch (err) {
        alert('ফাইলটি পড়া সম্ভব হয়নি। সঠিক JSON ফাইল দিন।');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const sampleSqlSchema = `-- আমার মুদি দোকান (Amar Grocery Manager)
-- Production Supabase / PostgreSQL Schema Definition

CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_bn TEXT NOT NULL,
  name_en TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  barcode TEXT,
  category_id TEXT REFERENCES categories(id),
  unit TEXT NOT NULL,
  purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  wholesale_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  retail_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_stock_level NUMERIC(10,2) DEFAULT 5,
  shelf_life_days INT,
  expiry_date DATE,
  storage_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  outstanding_balance NUMERIC(10,2) DEFAULT 0,
  credit_limit NUMERIC(10,2) DEFAULT 5000
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  outstanding_balance NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  total_amount NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  final_total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  profit NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  purchase_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sampleSqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-600" />
          অ্যাপ ও দোকান সেটিংস (Settings & Configuration)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          দোকানের নাম, রশিদের তথ্য, সংখ্যা ও থিম কনফিগারেশন, এবং ডাটা ব্যাকআপ ব্যবস্থাপনা করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Store Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
              <Store className="w-5 h-5 text-emerald-600" />
              দোকানের প্রোফাইল ও রশিদের তথ্য
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  দোকানের নাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    দোকানের ঠিকানা *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shopAddress}
                    onChange={e => setFormData({ ...formData, shopAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shopPhone}
                    onChange={e => setFormData({ ...formData, shopPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    স্বত্বাধিকারী / প্রোপাইটর
                  </label>
                  <input
                    type="text"
                    value={formData.shopProprietor}
                    onChange={e => setFormData({ ...formData, shopProprietor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বিক্রয় রশিদের ফুটার বার্তা
                  </label>
                  <input
                    type="text"
                    value={formData.receiptFooterMessage}
                    onChange={e => setFormData({ ...formData, receiptFooterMessage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ডিফল্ট কম স্টক সতর্কতা সীমা (একক)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.lowStockThresholdDefault}
                    onChange={e => setFormData({ ...formData, lowStockThresholdDefault: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মেয়াদ শেষ হওয়ার আগাম সতর্কতা (কত দিন আগে)
                  </label>
                  <input
                    type="number"
                    min={3}
                    value={formData.nearExpiryDaysThreshold}
                    onChange={e => setFormData({ ...formData, nearExpiryDaysThreshold: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                {savedSuccess ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" /> সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-xs"
                >
                  পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>

          {/* Database Schema Guide */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                ক্লাউড ডাটাবেজ আর্কিটেকচার (Supabase / PostgreSQL)
              </h2>
              <button
                onClick={copySql}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> কপি সম্পন্ন
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" /> SQL কপি করুন
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              ভবিষ্যতে যখন আপনার দোকান চালু করবেন এবং মাল্টি-ইউজার বা মোবাইল অ্যাপের মাধ্যমে ডাটা ক্লাউডে সিঙ্ক করতে চাইবেন, তখন নিচের ওপেন সোর্স পোস্টগ্রেস্কেল স্কিমাটি সরাসরি Supabase অথবা PostgreSQL এ এক্সিকিউট করতে পারবেন:
            </p>

            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
              {sampleSqlSchema}
            </pre>
          </div>

          {/* Vercel Ready Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="p-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 1L24 22H0L12 1Z" />
                </svg>
              </span>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  ভার্সেল ডিপ্লয়মেন্ট রেডি (Vercel Ready)
                </h3>
                <p className="text-[11px] text-slate-500">
                  vercel.json কনফিগার করা হয়েছে — এক ক্লিকে লাইভ করুন
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              আপনার এই প্রজেক্টটি Vercel-এ কোনো ঝামেলা ছাড়াই সরাসরি হোস্ট করার জন্য প্রস্তুত। গিটহাবে পুশ করে Vercel-এ ইমপোর্ট করলেই স্বয়ংক্রিয়ভাবে লাইভ হয়ে যাবে।
            </p>

            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 space-y-1">
              <div className="text-[11px] text-slate-400">// Vercel CLI দিয়ে এক ক্লিকে ডেপ্লয়:</div>
              <div className="font-bold select-all">npx vercel</div>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences & Data Backups */}
        <div className="space-y-6">
          {/* Display & Language Preferences */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-600" />
              সংখ্যা ও ডিসপ্লে মোড
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">বাংলা সংখ্যা প্রদর্শন</p>
                  <p className="text-xs text-slate-500">যেমন: ১২,৩৪৫ টাকা</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ useBengaliNumerals: !settings.useBengaliNumerals })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.useBengaliNumerals ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      settings.useBengaliNumerals ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">থিম (ডার্ক / লাইট)</p>
                  <p className="text-xs text-slate-500">রাতে ব্যবহারের উপযোগী ডার্ক মোড</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                  className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                >
                  {settings.theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              ডাটা ব্যাকআপ ও রিস্টোর
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার সমস্ত ইনভেন্টরি, ক্যাটালগ, ক্যাশ বিক্রয় এবং দেনা-পাওনার হিসাব একটি নিরাপদ ফাইলে ডাউনলোড করে রাখুন।
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                ব্যাকআপ ডাউনলোড (JSON)
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                ফাইল থেকে রিস্টোর করুন
              </button>
            </div>
          </div>

          {/* Reset System */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-5 rounded-2xl space-y-3">
            <h3 className="font-bold text-rose-800 dark:text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              ডেমো ডাটা রিসেট
            </h3>
            <p className="text-xs text-rose-600/90 dark:text-rose-400/80 leading-relaxed">
              আপনি চাইলে পুনরায় ২০৫+ ডেমো পণ্য ও প্রারম্ভিক হিসাবের অবস্থায় ফিরে যেতে পারেন।
            </p>

            {resetConfirmOpen ? (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-rose-700">আপনি কি নিশ্চিত? পূর্বের সব ব্যক্তিগত এন্ট্রি মুছে যাবে!</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      resetToDemoData();
                      setResetConfirmOpen(false);
                    }}
                    className="flex-1 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                  >
                    হ্যাঁ, রিসেট করুন
                  </button>
                  <button
                    onClick={() => setResetConfirmOpen(false)}
                    className="flex-1 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setResetConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-xl hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                ফ্যাক্টরি ডেমো ডাটা রিসেট
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
