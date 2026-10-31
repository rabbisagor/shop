/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductListView } from './components/products/ProductListView';
import { ProductKnowledgeView } from './components/products/ProductKnowledgeView';
import { InventoryView } from './components/inventory/InventoryView';
import { PurchaseView } from './components/purchases/PurchaseView';
import { SalesPosView } from './components/sales/SalesPosView';
import { ExpiryManagementView } from './components/inventory/ExpiryManagementView';
import { SupplierView } from './components/parties/SupplierView';
import { CustomerLedgerView } from './components/parties/CustomerLedgerView';
import { ProfitLossView } from './components/finance/ProfitLossView';
import { ReportsView } from './components/reports/ReportsView';
import { BusinessAcademyView } from './components/academy/BusinessAcademyView';
import { BusinessSimulatorView } from './components/simulator/BusinessSimulatorView';
import { SettingsView } from './components/settings/SettingsView';
import { 
  LayoutDashboard, 
  CircleDollarSign, 
  Package, 
  Boxes, 
  GraduationCap, 
  AlertCircle 
} from 'lucide-react';

const MainAppLayout: React.FC = () => {
  const { activeTab, setActiveTab, settings } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync theme class to document element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Render current tab content
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductListView />;
      case 'knowledge':
        return <ProductKnowledgeView />;
      case 'inventory':
        return <InventoryView />;
      case 'purchases':
        return <PurchaseView />;
      case 'pos':
        return <SalesPosView />;
      case 'expiry':
        return <ExpiryManagementView />;
      case 'suppliers':
        return <SupplierView />;
      case 'customers':
        return <CustomerLedgerView />;
      case 'expenses':
        return <ProfitLossView />;
      case 'reports':
        return <ReportsView />;
      case 'academy':
        return <BusinessAcademyView />;
      case 'simulator':
        return <BusinessSimulatorView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar for Desktop & Mobile Off-canvas Drawer */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Header */}
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Global Illustrative Price Notice Banner */}
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-200/60 dark:border-amber-800/40 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>শিক্ষণীয় প্ল্যাটফর্ম নোট:</strong> অ্যাপে প্রদর্শিত পণ্যের ক্রয় ও বিক্রয়মূল্য নমুনা/ডেমো হিসাব। বাস্তব দোকান পরিচালনার হিসাব-নিকাশ ও কৌশল অনুশীলনের জন্য এটি তৈরি।
            </span>
          </div>
          <button
            onClick={() => setActiveTab('simulator')}
            className="hidden sm:inline-flex shrink-0 font-medium text-amber-900 dark:text-amber-200 underline hover:no-underline"
          >
            সিমুলেটরে মুনাফা যাচাই করুন &rarr;
          </button>
        </div>

        {/* Page Content View */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {renderActiveView()}
        </main>

        {/* Mobile Quick Navigation Bar (Bottom Sticky) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
              activeTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">ড্যাশবোর্ড</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
              activeTab === 'pos'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CircleDollarSign className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">বিক্রয় (POS)</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
              activeTab === 'products'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">পণ্য</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
              activeTab === 'inventory'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Boxes className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">স্টক</span>
          </button>

          <button
            onClick={() => setActiveTab('academy')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
              activeTab === 'academy'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">একাডেমি</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
