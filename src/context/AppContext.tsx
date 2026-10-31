import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GROCERY_CATALOG } from '../data/catalog';
import { BUSINESS_LESSONS } from '../data/learningCurriculum';
import {
  DEFAULT_SETTINGS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_PURCHASES,
  INITIAL_SALES,
  INITIAL_STOCK_TRANSACTIONS,
  INITIAL_SUPPLIERS,
} from '../data/initialState';
import {
  AppNotification,
  AppSettings,
  Customer,
  Expense,
  LearningLesson,
  Product,
  Purchase,
  Sale,
  StockTransaction,
  Supplier,
} from '../types';
import { getDaysRemaining } from '../utils/numberConverter';

interface AppContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // State
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  purchases: Purchase[];
  sales: Sale[];
  expenses: Expense[];
  stockTransactions: StockTransaction[];
  settings: AppSettings;
  notifications: AppNotification[];
  learningLessons: LearningLesson[];
  bookmarkedProductIds: string[];

  // Product Actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => boolean;
  duplicateProduct: (id: string) => Product | null;
  toggleBookmarkProduct: (id: string) => void;

  // Inventory & Stock Actions
  recordStockTransaction: (
    tx: Omit<StockTransaction, 'id' | 'date' | 'previousStock' | 'newStock' | 'totalValue'>
  ) => boolean;

  // Purchases
  recordPurchase: (
    purchaseData: Omit<Purchase, 'id' | 'invoiceNumber' | 'date'>
  ) => Purchase;

  // Sales (POS)
  recordSale: (
    saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'date'>
  ) => Sale;

  // Suppliers & Customers
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalPurchases' | 'totalPaid' | 'outstandingBalance'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  recordSupplierPayment: (supplierId: string, amount: number, notes?: string) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'totalPurchased' | 'totalPaid' | 'outstandingBalance' | 'transactions'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  recordCustomerPayment: (customerId: string, amount: number, notes?: string) => void;

  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;

  // Learning Academy
  markLessonCompleted: (lessonId: number) => void;

  // Settings & System
  updateSettings: (updates: Partial<AppSettings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDemoData: () => void;
  exportAllDataAsJSON: () => string;
  importDataFromJSON: (jsonString: string) => boolean;

  // Computed Metrics
  metrics: {
    totalProductCount: number;
    totalStockQuantity: number;
    totalStockCostValue: number;
    totalStockRetailValue: number;
    potentialProfit: number;
    todaySales: number;
    todayPurchases: number;
    todayProfit: number;
    thisMonthSales: number;
    thisMonthPurchases: number;
    thisMonthGrossProfit: number;
    thisMonthExpenses: number;
    thisMonthNetProfit: number;
    lowStockProducts: Product[];
    zeroStockProducts: Product[];
    expiringSoonProducts: { product: Product; daysLeft: number }[];
    expiredProducts: Product[];
    topSellingProducts: { product: Product; quantitySold: number; revenue: number }[];
    topProfitableProducts: { product: Product; profit: number }[];
    totalCustomerDues: number;
    totalSupplierPayables: number;
  };
}

const STORAGE_KEYS = {
  PRODUCTS: 'amar_grocery_products_v1',
  SUPPLIERS: 'amar_grocery_suppliers_v1',
  CUSTOMERS: 'amar_grocery_customers_v1',
  PURCHASES: 'amar_grocery_purchases_v1',
  SALES: 'amar_grocery_sales_v1',
  EXPENSES: 'amar_grocery_expenses_v1',
  STOCK_TX: 'amar_grocery_stock_tx_v1',
  SETTINGS: 'amar_grocery_settings_v1',
  NOTIFICATIONS: 'amar_grocery_notifications_v1',
  LESSONS: 'amar_grocery_lessons_v1',
  BOOKMARKS: 'amar_grocery_bookmarks_v1',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Load state with fallback to demo data
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : GROCERY_CATALOG;
    } catch {
      return GROCERY_CATALOG;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOCK_TX);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_TRANSACTIONS;
    } catch {
      return INITIAL_STOCK_TRANSACTIONS;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [learningLessons, setLearningLessons] = useState<LearningLesson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
      return saved ? JSON.parse(saved) : BUSINESS_LESSONS;
    } catch {
      return BUSINESS_LESSONS;
    }
  });

  const [bookmarkedProductIds, setBookmarkedProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : ['prod_001', 'prod_016', 'prod_020', 'prod_030'];
    } catch {
      return ['prod_001', 'prod_016', 'prod_020', 'prod_030'];
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Apply Theme class on document element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist items
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_TX, JSON.stringify(stockTransactions));
  }, [stockTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(learningLessons));
  }, [learningLessons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedProductIds));
  }, [bookmarkedProductIds]);

  // Check and generate dynamic alerts & notifications
  useEffect(() => {
    const list: AppNotification[] = [];

    // Zero stock
    const zeroList = products.filter((p) => p.stock <= 0);
    if (zeroList.length > 0) {
      list.push({
        id: 'notif_zero_stock',
        title: 'স্টক শূন্য পণ্য',
        message: `${zeroList.length}টি পণ্যের স্টক সম্পূর্ণ শেষ হয়ে গেছে! জরুরি অর্ডার দিন।`,
        type: 'zero_stock',
        severity: 'danger',
        date: new Date().toISOString(),
        read: false,
        linkTab: 'inventory',
      });
    }

    // Low stock
    const lowList = products.filter((p) => p.stock > 0 && p.stock <= (p.minStockAlert || settings.lowStockThresholdDefault));
    if (lowList.length > 0) {
      list.push({
        id: 'notif_low_stock',
        title: 'কম স্টক সতর্কতা',
        message: `${lowList.length}টি পণ্যের স্টক নির্ধারিত সীমার নিচে নেমে গেছে।`,
        type: 'low_stock',
        severity: 'warning',
        date: new Date().toISOString(),
        read: false,
        linkTab: 'inventory',
      });
    }

    // Expired & Near expiry
    let expiredCount = 0;
    let nearExpiryCount = 0;
    products.forEach((p) => {
      const days = getDaysRemaining(p.expiryDate);
      if (days !== null) {
        if (days < 0) expiredCount++;
        else if (days <= settings.nearExpiryDaysThreshold) nearExpiryCount++;
      }
    });

    if (expiredCount > 0) {
      list.push({
        id: 'notif_expired',
        title: 'মেয়াদোত্তীর্ণ পণ্য রয়েছে!',
        message: `দোকানে ${expiredCount}টি মেয়াদ শেষ হওয়া পণ্য পাওয়া গেছে। সেলফ থেকে দ্রুত সরিয়ে নিন।`,
        type: 'expired',
        severity: 'danger',
        date: new Date().toISOString(),
        read: false,
        linkTab: 'expiry',
      });
    }

    if (nearExpiryCount > 0) {
      list.push({
        id: 'notif_near_expiry',
        title: 'মেয়াদ শেষের কাছাকাছি পণ্য',
        message: `${nearExpiryCount}টি পণ্যের মেয়াদ আগামী ${settings.nearExpiryDaysThreshold} দিনের মধ্যে শেষ হতে যাচ্ছে।`,
        type: 'expiring_soon',
        severity: 'warning',
        date: new Date().toISOString(),
        read: false,
        linkTab: 'expiry',
      });
    }

    // Unpaid supplier invoices
    const dueSuppliers = suppliers.filter((s) => s.outstandingBalance > 0);
    if (dueSuppliers.length > 0) {
      const totalDue = dueSuppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);
      list.push({
        id: 'notif_supplier_due',
        title: 'সরবরাহকারীর বকেয়া বিল',
        message: `${dueSuppliers.length}জন সরবরাহকারীর কাছে মোট ৳ ${totalDue.toLocaleString()} পাওনা রয়েছে।`,
        type: 'unpaid_bill',
        severity: 'info',
        date: new Date().toISOString(),
        read: false,
        linkTab: 'suppliers',
      });
    }

    // Customer dues
    const dueCustomers = customers.filter((c) => c.outstandingBalance > 0);
    if (dueCustomers.length > 0) {
      const totalCustDue = dueCustomers.reduce((sum, c) => sum + c.outstandingBalance, 0);
      list.push({
        id: 'notif_customer_due',
        title: 'গ্রাহকের বকেয়া বাকি',
        message: `${dueCustomers.length}জন কাস্টমারের কাছে বাকি পাওনা মোট ৳ ${totalCustDue.toLocaleString()}।`,
        type: 'customer_due',
        severity: 'warning',
        date: new Date().toISOString(),
        read: false,
        linkTab: 'customers',
      });
    }

    setNotifications(list);
  }, [products, suppliers, customers, settings.lowStockThresholdDefault, settings.nearExpiryDaysThreshold]);

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newId = `prod_${String(products.length + 1).padStart(3, '0')}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
    };
    setProducts((prev) => [newProduct, ...prev]);

    // Initial stock transaction entry
    if (newProduct.stock > 0) {
      const tx: StockTransaction = {
        id: `stx_${Date.now()}`,
        productId: newId,
        productName: newProduct.nameBn,
        type: 'stock_in',
        quantity: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        unit: newProduct.unit,
        unitPrice: newProduct.purchasePrice,
        totalValue: newProduct.stock * newProduct.purchasePrice,
        date: new Date().toISOString(),
        notes: 'নতুন পণ্য তৈরির প্রাথমিক স্টক',
      };
      setStockTransactions((prev) => [tx, ...prev]);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...updates };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string): boolean => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  const duplicateProduct = (id: string): Product | null => {
    const target = products.find((p) => p.id === id);
    if (!target) return null;

    const newId = `prod_${String(products.length + 1).padStart(3, '0')}`;
    const duplicated: Product = {
      ...target,
      id: newId,
      nameBn: `${target.nameBn} (কপি)`,
      nameEn: `${target.nameEn} (Copy)`,
      barcode: `${target.barcode}-DUP`,
      stock: 0,
    };
    setProducts((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  const toggleBookmarkProduct = (id: string) => {
    setBookmarkedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Stock Transaction
  const recordStockTransaction = (
    txData: Omit<StockTransaction, 'id' | 'date' | 'previousStock' | 'newStock' | 'totalValue'>
  ): boolean => {
    const targetProduct = products.find((p) => p.id === txData.productId);
    if (!targetProduct) return false;

    const currentStock = targetProduct.stock;
    let qtyChange = 0;

    switch (txData.type) {
      case 'stock_in':
      case 'return_in':
        qtyChange = txData.quantity;
        break;
      case 'stock_out':
      case 'damaged':
      case 'expired':
      case 'return_out':
        qtyChange = -txData.quantity;
        break;
      case 'adjustment':
        // direct adjustment quantity
        qtyChange = txData.quantity;
        break;
    }

    const calculatedNewStock = currentStock + qtyChange;
    if (calculatedNewStock < 0) {
      // Do not allow negative stock without confirmation
      return false;
    }

    const newTx: StockTransaction = {
      ...txData,
      id: `stx_${Date.now()}`,
      date: new Date().toISOString(),
      previousStock: currentStock,
      newStock: calculatedNewStock,
      totalValue: Math.abs(txData.quantity * txData.unitPrice),
    };

    setStockTransactions((prev) => [newTx, ...prev]);
    updateProduct(txData.productId, { stock: calculatedNewStock });
    return true;
  };

  // Record Purchase
  const recordPurchase = (
    purchaseData: Omit<Purchase, 'id' | 'invoiceNumber' | 'date'>
  ): Purchase => {
    const invNo = `PUR-${Date.now().toString().slice(-6)}`;
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `pur_${Date.now()}`,
      invoiceNumber: invNo,
      date: new Date().toISOString(),
    };

    // Update product stock and purchase prices atomically
    newPurchase.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const newStock = prod.stock + item.quantity;
        updateProduct(prod.id, {
          stock: newStock,
          purchasePrice: item.unitPurchasePrice,
          expiryDate: item.expiryDate || prod.expiryDate,
        });

        // Audit log
        const tx: StockTransaction = {
          id: `stx_${Date.now()}_${item.productId}`,
          productId: prod.id,
          productName: prod.nameBn,
          type: 'stock_in',
          quantity: item.quantity,
          previousStock: prod.stock,
          newStock,
          unit: item.unit,
          unitPrice: item.unitPurchasePrice,
          totalValue: item.totalPrice,
          date: new Date().toISOString(),
          referenceNo: invNo,
          notes: `ক্রয় চালান নং: ${invNo}`,
        };
        setStockTransactions((prev) => [tx, ...prev]);
      }
    });

    // Update supplier balance if dueAmount > 0
    if (newPurchase.supplierId) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === newPurchase.supplierId) {
            return {
              ...s,
              totalPurchases: s.totalPurchases + newPurchase.totalAmount,
              totalPaid: s.totalPaid + newPurchase.paidAmount,
              outstandingBalance: s.outstandingBalance + newPurchase.dueAmount,
            };
          }
          return s;
        })
      );
    }

    setPurchases((prev) => [newPurchase, ...prev]);
    return newPurchase;
  };

  // Record Sale (POS)
  const recordSale = (
    saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'date'>
  ): Sale => {
    const invNo = `INV-${Date.now().toString().slice(-6)}`;
    const newSale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      invoiceNumber: invNo,
      date: new Date().toISOString(),
    };

    // Deduct stock atomically
    newSale.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const newStock = Math.max(0, prod.stock - item.quantity);
        updateProduct(prod.id, { stock: newStock });

        // Audit log
        const tx: StockTransaction = {
          id: `stx_${Date.now()}_${item.productId}`,
          productId: prod.id,
          productName: prod.nameBn,
          type: 'stock_out',
          quantity: item.quantity,
          previousStock: prod.stock,
          newStock,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalValue: item.totalPrice,
          date: new Date().toISOString(),
          referenceNo: invNo,
          notes: `বিক্রয় মেমো নং: ${invNo}`,
        };
        setStockTransactions((prev) => [tx, ...prev]);
      }
    });

    // Update customer credit balance if due
    if (newSale.customerId && newSale.dueAmount > 0) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newSale.customerId) {
            const newBal = c.outstandingBalance + newSale.dueAmount;
            return {
              ...c,
              totalPurchased: c.totalPurchased + newSale.totalAmount,
              totalPaid: c.totalPaid + newSale.paidAmount,
              outstandingBalance: newBal,
              transactions: [
                {
                  id: `ctx_${Date.now()}`,
                  date: new Date().toISOString(),
                  type: 'sale_credit',
                  amount: newSale.dueAmount,
                  balanceAfter: newBal,
                  referenceInvoice: invNo,
                  notes: 'বাকিতে বিক্রয়',
                },
                ...c.transactions,
              ],
            };
          }
          return c;
        })
      );
    }

    setSales((prev) => [newSale, ...prev]);
    return newSale;
  };

  // Supplier Actions
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'totalPurchases' | 'totalPaid' | 'outstandingBalance'>): Supplier => {
    const newSup: Supplier = {
      ...supplierData,
      id: `supp_${Date.now()}`,
      totalPurchases: 0,
      totalPaid: 0,
      outstandingBalance: 0,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    return newSup;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const recordSupplierPayment = (supplierId: string, amount: number, notes?: string) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const newBal = Math.max(0, s.outstandingBalance - amount);
          return {
            ...s,
            totalPaid: s.totalPaid + amount,
            outstandingBalance: newBal,
            notes: notes ? `${s.notes || ''} [পেমেন্ট: ৳${amount} - ${notes}]` : s.notes,
          };
        }
        return s;
      })
    );
  };

  // Customer Actions
  const addCustomer = (custData: Omit<Customer, 'id' | 'totalPurchased' | 'totalPaid' | 'outstandingBalance' | 'transactions'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: `cust_${Date.now()}`,
      totalPurchased: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      transactions: [],
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const recordCustomerPayment = (customerId: string, amount: number, notes?: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newBal = Math.max(0, c.outstandingBalance - amount);
          return {
            ...c,
            totalPaid: c.totalPaid + amount,
            outstandingBalance: newBal,
            transactions: [
              {
                id: `ctx_${Date.now()}`,
                date: new Date().toISOString(),
                type: 'payment_received',
                amount,
                balanceAfter: newBal,
                notes: notes || 'বাকি পরিশোধ নগদ',
              },
              ...c.transactions,
            ],
          };
        }
        return c;
      })
    );
  };

  // Expenses
  const addExpense = (expData: Omit<Expense, 'id'>): Expense => {
    const newExp: Expense = {
      ...expData,
      id: `exp_${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Lessons
  const markLessonCompleted = (lessonId: number) => {
    setLearningLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, isCompleted: true } : l))
    );
  };

  // Settings
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Reset demo
  const resetToDemoData = () => {
    setProducts(GROCERY_CATALOG);
    setSuppliers(INITIAL_SUPPLIERS);
    setCustomers(INITIAL_CUSTOMERS);
    setPurchases(INITIAL_PURCHASES);
    setSales(INITIAL_SALES);
    setExpenses(INITIAL_EXPENSES);
    setStockTransactions(INITIAL_STOCK_TRANSACTIONS);
    setSettings(DEFAULT_SETTINGS);
    setLearningLessons(BUSINESS_LESSONS);
    setBookmarkedProductIds(['prod_001', 'prod_016', 'prod_020', 'prod_030']);
    localStorage.clear();
  };

  // Export JSON
  const exportAllDataAsJSON = (): string => {
    const backup = {
      exportedAt: new Date().toISOString(),
      shopName: settings.shopName,
      products,
      suppliers,
      customers,
      purchases,
      sales,
      expenses,
      stockTransactions,
      settings,
      learningLessons,
      bookmarkedProductIds,
    };
    return JSON.stringify(backup, null, 2);
  };

  // Import JSON
  const importDataFromJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.suppliers && Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      if (data.customers && Array.isArray(data.customers)) setCustomers(data.customers);
      if (data.purchases && Array.isArray(data.purchases)) setPurchases(data.purchases);
      if (data.sales && Array.isArray(data.sales)) setSales(data.sales);
      if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (data.stockTransactions && Array.isArray(data.stockTransactions))
        setStockTransactions(data.stockTransactions);
      if (data.settings) setSettings(data.settings);
      if (data.learningLessons && Array.isArray(data.learningLessons))
        setLearningLessons(data.learningLessons);
      if (data.bookmarkedProductIds && Array.isArray(data.bookmarkedProductIds))
        setBookmarkedProductIds(data.bookmarkedProductIds);
      return true;
    } catch {
      return false;
    }
  };

  // Computed Metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);

    // Stock totals
    const totalProductCount = products.length;
    let totalStockQuantity = 0;
    let totalStockCostValue = 0;
    let totalStockRetailValue = 0;

    const lowStockProducts: Product[] = [];
    const zeroStockProducts: Product[] = [];
    const expiringSoonProducts: { product: Product; daysLeft: number }[] = [];
    const expiredProducts: Product[] = [];

    products.forEach((p) => {
      totalStockQuantity += p.stock;
      totalStockCostValue += p.stock * p.purchasePrice;
      totalStockRetailValue += p.stock * p.retailPrice;

      if (p.stock <= 0) {
        zeroStockProducts.push(p);
      } else if (p.stock <= (p.minStockAlert || settings.lowStockThresholdDefault)) {
        lowStockProducts.push(p);
      }

      const days = getDaysRemaining(p.expiryDate);
      if (days !== null) {
        if (days < 0) {
          expiredProducts.push(p);
        } else if (days <= settings.nearExpiryDaysThreshold) {
          expiringSoonProducts.push({ product: p, daysLeft: days });
        }
      }
    });

    const potentialProfit = Math.max(0, totalStockRetailValue - totalStockCostValue);

    // Sales metrics
    let todaySales = 0;
    let todayProfit = 0;
    let thisMonthSales = 0;
    let thisMonthGrossProfit = 0;

    const productSalesMap: Record<string, { qty: number; revenue: number; profit: number }> = {};

    sales.forEach((s) => {
      const saleDate = s.date.slice(0, 10);
      const saleMonth = s.date.slice(0, 7);

      if (saleDate === today) {
        todaySales += s.totalAmount;
        todayProfit += s.profit;
      }

      if (saleMonth === thisMonth) {
        thisMonthSales += s.totalAmount;
        thisMonthGrossProfit += s.profit;
      }

      // Track item sales
      s.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { qty: 0, revenue: 0, profit: 0 };
        }
        productSalesMap[item.productId].qty += item.quantity;
        productSalesMap[item.productId].revenue += item.totalPrice;
        productSalesMap[item.productId].profit +=
          item.totalPrice - item.costPrice * item.quantity;
      });
    });

    // Purchases metrics
    let todayPurchases = 0;
    let thisMonthPurchases = 0;

    purchases.forEach((p) => {
      const pDate = p.date.slice(0, 10);
      const pMonth = p.date.slice(0, 7);
      if (pDate === today) todayPurchases += p.totalAmount;
      if (pMonth === thisMonth) thisMonthPurchases += p.totalAmount;
    });

    // Expenses metrics
    let thisMonthExpenses = 0;
    expenses.forEach((e) => {
      const eMonth = e.date.slice(0, 7);
      if (eMonth === thisMonth) thisMonthExpenses += e.amount;
    });

    const thisMonthNetProfit = thisMonthGrossProfit - thisMonthExpenses;

    // Top selling products
    const topSellingProducts = Object.entries(productSalesMap)
      .map(([prodId, stats]) => {
        const prod = products.find((p) => p.id === prodId);
        return {
          product: prod || {
            id: prodId,
            nameBn: 'অজ্ঞাত পণ্য',
            nameEn: 'Unknown',
            category: 'অন্যান্য',
            brand: '',
            barcode: '',
            unit: 'পিস' as const,
            purchasePrice: 0,
            wholesalePrice: 0,
            retailPrice: 0,
            stock: 0,
            minStockAlert: 0,
            status: 'active' as const,
          },
          quantitySold: stats.qty,
          revenue: stats.revenue,
        };
      })
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    // Top profitable products
    const topProfitableProducts = Object.entries(productSalesMap)
      .map(([prodId, stats]) => {
        const prod = products.find((p) => p.id === prodId);
        return {
          product: prod || {
            id: prodId,
            nameBn: 'অজ্ঞাত পণ্য',
            nameEn: 'Unknown',
            category: 'অন্যান্য',
            brand: '',
            barcode: '',
            unit: 'পিস' as const,
            purchasePrice: 0,
            wholesalePrice: 0,
            retailPrice: 0,
            stock: 0,
            minStockAlert: 0,
            status: 'active' as const,
          },
          profit: stats.profit,
        };
      })
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    const totalCustomerDues = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    const totalSupplierPayables = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

    return {
      totalProductCount,
      totalStockQuantity,
      totalStockCostValue,
      totalStockRetailValue,
      potentialProfit,
      todaySales,
      todayPurchases,
      todayProfit,
      thisMonthSales,
      thisMonthPurchases,
      thisMonthGrossProfit,
      thisMonthExpenses,
      thisMonthNetProfit,
      lowStockProducts,
      zeroStockProducts,
      expiringSoonProducts,
      expiredProducts,
      topSellingProducts,
      topProfitableProducts,
      totalCustomerDues,
      totalSupplierPayables,
    };
  }, [products, sales, purchases, expenses, customers, suppliers, settings.lowStockThresholdDefault, settings.nearExpiryDaysThreshold]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        products,
        suppliers,
        customers,
        purchases,
        sales,
        expenses,
        stockTransactions,
        settings,
        notifications,
        learningLessons,
        bookmarkedProductIds,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        toggleBookmarkProduct,
        recordStockTransaction,
        recordPurchase,
        recordSale,
        addSupplier,
        updateSupplier,
        recordSupplierPayment,
        addCustomer,
        updateCustomer,
        recordCustomerPayment,
        addExpense,
        deleteExpense,
        markLessonCompleted,
        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDemoData,
        exportAllDataAsJSON,
        importDataFromJSON,
        metrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
