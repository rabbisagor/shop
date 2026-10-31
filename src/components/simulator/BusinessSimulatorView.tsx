import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Building,
  Calculator,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  HelpCircle,
  Info,
  RotateCcw,
  Scale,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatNumber } from '../../utils/numberConverter';

interface SimulatorPreset {
  name: string;
  desc: string;
  capital: number;
  advance: number;
  decoration: number;
  rent: number;
  staff: number;
  electricity: number;
  otherExp: number;
  dailySales: number;
  marginPercent: number;
  wastagePercent: number;
  creditPercent: number;
}

const PRESETS: SimulatorPreset[] = [
  {
    name: 'ছোট পাড়ার দোকান (Corner Grocery)',
    desc: 'আবাসিক গলির ভেতরের ছোট আকারের নিত্যপণ্যের দোকান',
    capital: 300000,
    advance: 80000,
    decoration: 40000,
    rent: 10000,
    staff: 0, // মালিক নিজেই চালান
    electricity: 2500,
    otherExp: 2000,
    dailySales: 15000,
    marginPercent: 12,
    wastagePercent: 2,
    creditPercent: 10,
  },
  {
    name: 'বাজারের মাঝারি দোকান (Market Store)',
    desc: 'বাজারের ব্যস্ত মোড়ের চাল, তেল ও ডালের বড় দোকান',
    capital: 800000,
    advance: 250000,
    decoration: 100000,
    rent: 25000,
    staff: 15000, // ১ জন কর্মচারী
    electricity: 5000,
    otherExp: 4000,
    dailySales: 45000,
    marginPercent: 11,
    wastagePercent: 2.5,
    creditPercent: 8,
  },
  {
    name: 'মডার্ন মিনি সুপারমার্কেট (Mini Mart)',
    desc: 'সেলফ-সার্ভিস রেক, এসি ও কম্পিউটারাইজড আধুনিক সুপার শপ',
    capital: 2000000,
    advance: 600000,
    decoration: 350000,
    rent: 55000,
    staff: 40000, // ৩ জন স্টাফ
    electricity: 18000,
    otherExp: 10000,
    dailySales: 120000,
    marginPercent: 14,
    wastagePercent: 3,
    creditPercent: 3,
  },
];

export const BusinessSimulatorView: React.FC = () => {
  const { settings } = useApp();
  const useBn = settings.useBengaliNumerals;

  const [presetIndex, setPresetIndex] = useState(0);

  // Simulator Inputs
  const [capital, setCapital] = useState(PRESETS[0].capital);
  const [advance, setAdvance] = useState(PRESETS[0].advance);
  const [decoration, setDecoration] = useState(PRESETS[0].decoration);
  const [rent, setRent] = useState(PRESETS[0].rent);
  const [staff, setStaff] = useState(PRESETS[0].staff);
  const [electricity, setElectricity] = useState(PRESETS[0].electricity);
  const [otherExp, setOtherExp] = useState(PRESETS[0].otherExp);
  const [dailySales, setDailySales] = useState(PRESETS[0].dailySales);
  const [marginPercent, setMarginPercent] = useState(PRESETS[0].marginPercent);
  const [wastagePercent, setWastagePercent] = useState(PRESETS[0].wastagePercent);
  const [creditPercent, setCreditPercent] = useState(PRESETS[0].creditPercent);

  const applyPreset = (idx: number) => {
    setPresetIndex(idx);
    const p = PRESETS[idx];
    setCapital(p.capital);
    setAdvance(p.advance);
    setDecoration(p.decoration);
    setRent(p.rent);
    setStaff(p.staff);
    setElectricity(p.electricity);
    setOtherExp(p.otherExp);
    setDailySales(p.dailySales);
    setMarginPercent(p.marginPercent);
    setWastagePercent(p.wastagePercent);
    setCreditPercent(p.creditPercent);
  };

  // Calculations
  const simulation = useMemo(() => {
    // Initial Working Capital available for Goods
    const inventoryCapital = Math.max(0, capital - advance - decoration);

    // Monthly Figures (30 days)
    const monthlySales = dailySales * 30;
    const monthlyWastageLoss = (monthlySales * wastagePercent) / 100;
    const effectiveMonthlySales = monthlySales - monthlyWastageLoss;

    // Gross Profit from Sales
    const monthlyGrossProfit = (effectiveMonthlySales * marginPercent) / 100;

    // Fixed & Operating Expenses
    const monthlyTotalExpense = rent + staff + electricity + otherExp;

    // Net Monthly Profit
    const monthlyNetProfit = monthlyGrossProfit - monthlyTotalExpense;

    // Annual Projections
    const annualNetProfit = monthlyNetProfit * 12;
    const returnOnInvestment = capital > 0 ? (annualNetProfit / capital) * 100 : 0;

    // Break-even Daily Sales calculation
    // Monthly Expense = BreakEvenSales * 30 * (Margin% - Wastage%) / 100
    const netMarginRatio = Math.max(0.01, (marginPercent - wastagePercent) / 100);
    const monthlyRequiredSalesForBreakEven = monthlyTotalExpense / netMarginRatio;
    const breakEvenDailySales = monthlyRequiredSalesForBreakEven / 30;

    // Cash at risk in credit
    const monthlyCreditTrapped = (monthlySales * creditPercent) / 100;

    return {
      inventoryCapital,
      monthlySales,
      monthlyWastageLoss,
      monthlyGrossProfit,
      monthlyTotalExpense,
      monthlyNetProfit,
      annualNetProfit,
      returnOnInvestment,
      breakEvenDailySales,
      monthlyCreditTrapped,
    };
  }, [capital, advance, decoration, rent, staff, electricity, otherExp, dailySales, marginPercent, wastagePercent, creditPercent]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>মুদি ব্যবসা আর্থিক সিমুলেটর (Business Simulator)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-bold">
              ব্রেক-ইভেন ও ক্যাশ ফ্লো
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            দোকান খোলার আগে বিভিন্ন মূলধন ও বিক্রয়ের সম্ভাব্য লাভ, লোকসান ও খরচের বাস্তবসম্মত প্রক্ষেপণ
          </p>
        </div>
      </div>

      {/* Disclaimer Notice Banner (Crucial Requirement) */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>সতর্কীকরণ ও পরামর্শ:</strong> সিমুলেটরে প্রদর্শিত সমস্ত ফলাফল কেবল আর্থিক হিসাবরক্ষণ মডেলের
          প্রক্ষেপণ (Simulation Projections), কোনো নিশ্চিত আয়ের প্রতিশ্রুতি নয়। বাস্তব ব্যবসায় এলাকার প্রতিযোগিতা,
          গ্রাহকের অভ্যাস, পণ্যের অপচয় ও পরিচালন দক্ষতার ওপর লাভ-ক্ষতি নির্ভর করে।
        </p>
      </div>

      {/* Preset Scenario Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applyPreset(idx)}
            className={`p-3.5 rounded-2xl border text-left transition ${
              presetIndex === idx
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-xs font-bold ${
                  presetIndex === idx ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {preset.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                পুঁজি ৳{formatNumber(preset.capital / 100000, useBn)} লাখ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {preset.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Two Column Layout: Left Inputs + Right Projected Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Input Sliders (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>ব্যবসার প্যারামিটার ও বাজেট কনফিগার করুন</span>
            </h3>
            <button
              onClick={() => applyPreset(presetIndex)}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>রিসেট</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Initial Capital */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  প্রাথমিক মোট মূলধন (Total Capital)
                </span>
                <span className="font-mono font-bold text-emerald-600">
                  {formatNumber(capital, useBn, { isCurrency: true })}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="50000"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Advance & Decoration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">দোকানের অ্যাডভান্স (৳)</label>
                <input
                  type="number"
                  step="5000"
                  value={advance}
                  onChange={(e) => setAdvance(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">ডেকোরেশন ও র‍্যাক (৳)</label>
                <input
                  type="number"
                  step="5000"
                  value={decoration}
                  onChange={(e) => setDecoration(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>
            </div>

            {/* Monthly Rent & Staff */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">মাসিক দোকান ভাড়া (৳)</label>
                <input
                  type="number"
                  step="1000"
                  value={rent}
                  onChange={(e) => setRent(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">কর্মচারীর মাসিক বেতন (৳)</label>
                <input
                  type="number"
                  step="1000"
                  value={staff}
                  onChange={(e) => setStaff(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>
            </div>

            {/* Electricity & Other Expenses */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">বিদ্যুৎ ও ইউটিলিটি বিল (৳)</label>
                <input
                  type="number"
                  step="500"
                  value={electricity}
                  onChange={(e) => setElectricity(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">ব্যাগ, চা ও অন্যান্য খরচ (৳)</label>
                <input
                  type="number"
                  step="500"
                  value={otherExp}
                  onChange={(e) => setOtherExp(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Daily Sales Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  দৈনিক গড় বিক্রি (Daily Sales)
                </span>
                <span className="font-mono font-bold text-blue-600">
                  {formatNumber(dailySales, useBn, { isCurrency: true })} / দিন
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="300000"
                step="2000"
                value={dailySales}
                onChange={(e) => setDailySales(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Margin & Wastage % */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-sans">গড় লাভ মার্জিন (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-sans">নষ্ট/পচন ক্ষতি (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={wastagePercent}
                  onChange={(e) => setWastagePercent(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-rose-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-sans">বাকিতে বিক্রি (%)</label>
                <input
                  type="number"
                  step="1"
                  value={creditPercent}
                  onChange={(e) => setCreditPercent(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-amber-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projected Financial Outcomes (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <span>মাসিক ব্যবসায়িক ফলাফল প্রক্ষেপণ</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Monthly Forecast</span>
            </div>

            {/* Net Monthly Profit Highlight */}
            <div
              className={`p-5 rounded-2xl border text-center space-y-1 ${
                simulation.monthlyNetProfit >= 0
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
              }`}
            >
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                আনুমানিক মাসিক নিট মুনাফা (Net Profit)
              </span>
              <div
                className={`text-3xl font-black font-mono ${
                  simulation.monthlyNetProfit >= 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-rose-700 dark:text-rose-300'
                }`}
              >
                {formatNumber(simulation.monthlyNetProfit, useBn, { isCurrency: true })}
              </div>
              <p className="text-[11px] text-slate-500">
                বার্ষিক সম্ভাব্য আয়: ৳{formatNumber(Math.round(simulation.annualNetProfit), useBn)} · ROI: {formatNumber(simulation.returnOnInvestment.toFixed(1), useBn)}%
              </p>
            </div>

            {/* Break-even Sales Point */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ব্রেক-ইভেন পয়েন্ট (Break-Even Sales):
                </span>
                <span className="font-mono font-bold text-blue-600 text-sm">
                  {formatNumber(Math.round(simulation.breakEvenDailySales), useBn, { isCurrency: true })} / দিন
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                দোকানের কোনো লাভ বা ক্ষতি ছাড়া শুধুমাত্র ভাড়া, বিদ্যুৎ ও যাবতীয় খরচ তুলতে প্রতিদিন কমপক্ষে ৳
                {formatNumber(Math.round(simulation.breakEvenDailySales), useBn)} টাকার পণ্য বিক্রি করতে হবে।
              </p>
            </div>

            {/* Detailed Monthly Cash Flow Breakdown */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600 dark:text-slate-300 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-sans">মাসিক মোট বিক্রয় (৩০ দিন):</span>
                <span>{formatNumber(simulation.monthlySales, useBn, { isCurrency: true })}</span>
              </div>

              <div className="flex justify-between text-rose-600 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-sans">নষ্ট/অপচয় ক্ষতি ({wastagePercent}%):</span>
                <span>- {formatNumber(simulation.monthlyWastageLoss, useBn, { isCurrency: true })}</span>
              </div>

              <div className="flex justify-between text-slate-800 dark:text-slate-200 font-bold py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-sans">গ্রস প্রফিট (মোট লাভ {marginPercent}%):</span>
                <span>{formatNumber(simulation.monthlyGrossProfit, useBn, { isCurrency: true })}</span>
              </div>

              <div className="flex justify-between text-rose-600 py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-sans">মাসিক মোট পরিচালন খরচ:</span>
                <span>- {formatNumber(simulation.monthlyTotalExpense, useBn, { isCurrency: true })}</span>
              </div>

              <div className="flex justify-between text-amber-600 py-1">
                <span className="font-sans">বাকিতে আটকে থাকা টাকা ({creditPercent}%):</span>
                <span>~ {formatNumber(simulation.monthlyCreditTrapped, useBn, { isCurrency: true })}</span>
              </div>
            </div>

            {/* Working Capital Reserve check */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 space-y-1">
              <span className="font-bold block">মালামাল ক্রয়ের জন্য অবশিষ্ট পুঁজি:</span>
              <p className="font-mono font-bold text-sm text-blue-800 dark:text-blue-200">
                {formatNumber(simulation.inventoryCapital, useBn, { isCurrency: true })}
              </p>
              <p className="text-[11px] text-blue-800/80 leading-relaxed pt-1">
                দোকান অ্যাডভান্স (৳{formatNumber(advance, useBn)}) এবং ডেকোরেশন (৳{formatNumber(decoration, useBn)})
                খরচের পর প্রথম চালানের মালামাল কেনার জন্য এই টাকা থাকবে।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
