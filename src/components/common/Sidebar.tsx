import React from 'react';
import {
  AlertTriangle,
  BadgePercent,
  BookOpen,
  Boxes,
  CalendarClock,
  CircleDollarSign,
  FileSpreadsheet,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toBengaliNumerals } from '../../utils/numberConverter';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, metrics, settings } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      labelBn: 'ড্যাশবোর্ড',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products',
      labelBn: 'পণ্য তালিকা',
      icon: Package,
      badge: null,
    },
    {
      id: 'knowledge',
      labelBn: 'পণ্য সম্পর্কে জানুন',
      icon: BookOpen,
      badge: 'এনসাইক্লোপিডিয়া',
      isPill: false,
    },
    {
      id: 'inventory',
      labelBn: 'স্টক ম্যানেজমেন্ট',
      icon: Boxes,
      badge:
        metrics.lowStockProducts.length > 0
          ? `${metrics.lowStockProducts.length} কম`
          : null,
      badgeColor: 'text-amber-600 dark:text-amber-400 font-semibold',
    },
    {
      id: 'purchases',
      labelBn: 'কেনাকাটা',
      icon: ShoppingCart,
      badge: null,
    },
    {
      id: 'pos',
      labelBn: 'বিক্রয় / POS',
      icon: CircleDollarSign,
      badge: 'ক্যাশ মেমো',
    },
    {
      id: 'expiry',
      labelBn: 'মেয়াদ ব্যবস্থাপনা',
      icon: CalendarClock,
      badge:
        metrics.expiredProducts.length > 0
          ? `${metrics.expiredProducts.length} মেয়াদোত্তীর্ণ`
          : metrics.expiringSoonProducts.length > 0
          ? `${metrics.expiringSoonProducts.length} সন্নিকটে`
          : null,
      badgeColor:
        metrics.expiredProducts.length > 0
          ? 'text-rose-600 dark:text-rose-400 font-bold'
          : 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'suppliers',
      labelBn: 'সরবরাহকারী',
      icon: Truck,
      badge: null,
    },
    {
      id: 'customers',
      labelBn: 'ক্রেতা ও বাকি হিসাব',
      icon: Users,
      badge:
        metrics.totalCustomerDues > 0
          ? `বাকি ৳${settings.useBengaliNumerals ? toBengaliNumerals(Math.round(metrics.totalCustomerDues)) : Math.round(metrics.totalCustomerDues)}`
          : null,
      badgeColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'expenses',
      labelBn: 'আয়-ব্যয় ও লাভ',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'reports',
      labelBn: 'রিপোর্ট ও রসিদ',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'academy',
      labelBn: 'ব্যবসা শেখার একাডেমি',
      icon: GraduationCap,
      badge: '১৮টি পাঠ',
      badgeColor: 'text-emerald-600 dark:text-emerald-400 font-bold',
    },
    {
      id: 'simulator',
      labelBn: 'ব্যবসা সিমুলেটর',
      icon: Gauge,
      badge: 'অনুশীলন',
    },
    {
      id: 'settings',
      labelBn: 'সেটিংস ও ব্যাকআপ',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Component */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
              মেনু ও নেভিগেশন
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.labelBn}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] truncate shrink-0 ml-1.5 ${
                      isActive ? 'text-emerald-100' : item.badgeColor || 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>ভার্সন ১.০.০</span>
            <span>অফলাইন রেডি</span>
          </div>
        </div>
      </aside>
    </>
  );
};
