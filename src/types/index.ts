export type UnitOfMeasure =
  | 'পিস'
  | 'কেজি'
  | 'গ্রাম'
  | 'লিটার'
  | 'মিলিলিটার'
  | 'প্যাকেট'
  | 'বস্তা'
  | 'কার্টন'
  | 'বোতল'
  | 'ডজন'
  | 'হালি'
  | 'বান্ডিল';

export type PaymentMethod =
  | 'ক্যাশ (Cash)'
  | 'বিকাশ (bKash)'
  | 'নগদ (Nagad)'
  | 'রকেট (Rocket)'
  | 'ব্যাংক (Bank)'
  | 'বাকি (Credit)'
  | 'অন্যান্য (Other)';

export type PaymentStatus = 'পরিশোধিত (Paid)' | 'বাকি (Unpaid)' | 'আংশিক পরিশোধিত (Partial)';

export type TransactionType =
  | 'stock_in' // কেনা বা আগমন
  | 'stock_out' // বিক্রয়
  | 'adjustment' // হিসাব সমন্বয়
  | 'damaged' // নষ্ট পণ্য
  | 'expired' // মেয়াদোত্তীর্ণ
  | 'return_in' // ক্রেতার ফেরত
  | 'return_out'; // সরবরাহকারীকে ফেরত

export interface ProductBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  purchasePrice: number;
  mfgDate?: string;
  expiryDate: string;
  supplierId?: string;
}

export interface Product {
  id: string;
  nameBn: string;
  nameEn: string;
  category: string;
  subcategory?: string;
  brand: string;
  manufacturer?: string;
  barcode: string;
  unit: UnitOfMeasure;
  baseUnitEquivalent?: {
    unit: UnitOfMeasure;
    ratio: number; // e.g. 1 কেজি = 1000 গ্রাম -> ratio: 1000
  };
  purchasePrice: number; // ক্রয়মূল্য (ডেমো)
  wholesalePrice: number; // পাইকারি মূল্য
  retailPrice: number; // খুচরা বিক্রয়মূল্য
  stock: number; // বর্তমান স্টক
  minStockAlert: number; // সর্বনিম্ন স্টক সতর্কবার্তা
  maxStockLevel?: number; // সর্বোচ্চ স্টক সীমা
  supplierId?: string;
  supplierName?: string;
  mfgDate?: string;
  expiryDate?: string; // নিকটতম মেয়াদ
  storageInstructions?: string; // সংরক্ষণের নিয়ম
  status: 'active' | 'discontinued';
  notes?: string;
  imageUrl?: string;
  // Learning & Business Knowledge properties
  knowledge?: {
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    descriptionBn: string; // পরিচিতি ও বিবরণ
    usageBn: string; // ব্যবহার
    commonPackSizesBn: string; // প্রচলিত প্যাকেট সাইজ ও ওজন
    storeTypesBn: string; // কোন দোকানে বেশি চলে
    storageAdviceBn: string; // সংরক্ষণের বিশেষ নিয়ম
    expiryAdviceBn: string; // মেয়াদ ও সাইকেল সংক্রান্ত ধারণা
    qualityCheckBn: string; // কেনার সময় কী পরীক্ষা করবেন
    counterfeitWarningBn: string; // নকল বা ভেজাল চেনার উপায়
    wholesaleRetailTipsBn: string; // পাইকারি ও খুচরা ব্যবসার কৌশল
    expectedProfitMarginBn: string; // সম্ভাব্য লাভের শতকরা হার
    stockManagementTipsBn: string; // স্টক ব্যবস্থাপনার পরামর্শ
    demandTypeBn: 'দৈনন্দিন অতিপ্রয়োজনীয়' | 'মাঝারি চাহিদা' | 'মৌসুমি' | 'সৌখিন পণ্য';
    seasonalDemandBn?: string; // মৌসুমি চাহিদার বিবরণ
    businessTipsBn: string; // ব্যবসায়িক বিশেষ পরামর্শ
  };
  isBookmarked?: boolean;
}

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unit: UnitOfMeasure;
  unitPrice: number;
  totalValue: number;
  date: string; // ISO format YYYY-MM-DDTHH:mm:ss
  referenceNo?: string;
  notes?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  unit: UnitOfMeasure;
  quantity: number;
  unitPurchasePrice: number;
  totalPrice: number;
  expiryDate?: string;
  batchNumber?: string;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  transportCost: number;
  otherExpenses: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  unit: UnitOfMeasure;
  quantity: number;
  unitPrice: number; // খুচরা বিক্রয়মূল্য
  costPrice: number; // ক্রয়মূল্য (COGS হিসেবের জন্য)
  discount: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  vatAmount: number;
  totalAmount: number;
  totalCost: number; // মোট ক্রয়মূল্য (COGS)
  profit: number; // গ্রস প্রফিট
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  address: string;
  categories: string[];
  paymentTerms: string;
  totalPurchases: number;
  totalPaid: number;
  outstandingBalance: number;
  notes?: string;
}

export interface CustomerTransaction {
  id: string;
  date: string;
  type: 'sale_credit' | 'payment_received';
  amount: number;
  balanceAfter: number;
  referenceInvoice?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
  totalPurchased: number;
  totalPaid: number;
  outstandingBalance: number;
  transactions: CustomerTransaction[];
  notes?: string;
}

export type ExpenseCategory =
  | 'দোকান ভাড়া (Shop Rent)'
  | 'বিদ্যুৎ বিল (Electricity)'
  | 'ইন্টারনেট বিল (Internet)'
  | 'কর্মচারীর বেতন (Staff Salary)'
  | 'পরিবহন ও যাতায়াত (Transport)'
  | 'প্যাকেজিং ও ব্যাগ (Packaging)'
  | 'দোকান রক্ষণাবেক্ষণ (Maintenance)'
  | 'চা ও আপ্যায়ন (Refreshment)'
  | 'ট্রেড লাইসেন্স ও অন্যান্য কর (Tax/Fees)'
  | 'অন্যান্য খরচ (Other Expenses)';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  recipient?: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'zero_stock' | 'expiring_soon' | 'expired' | 'unpaid_bill' | 'customer_due' | 'system';
  severity: 'warning' | 'danger' | 'info' | 'success';
  date: string;
  read: boolean;
  linkTab?: string;
  referenceId?: string;
}

export interface QuizQuestion {
  questionBn: string;
  optionsBn: string[];
  correctAnswerIndex: number;
  explanationBn: string;
}

export interface LearningLesson {
  id: number;
  titleBn: string;
  titleEn: string;
  category: 'প্রস্তুতি ও শুরু' | 'ক্রয় ও সরবরাহ' | 'মূল্য ও লাভ' | 'দোকান পরিচালনা' | 'ঝুঁকি ও আইনি বিষয়' | 'ব্যবসার সম্প্রসারণ';
  readTimeMinutes: number;
  overviewBn: string;
  detailedContentBn: string[];
  practicalExamplesBn: string[];
  actionChecklistBn: string[];
  commonMistakesBn: string[];
  quiz: QuizQuestion[];
  isCompleted?: boolean;
}

export interface SimulatorInputs {
  shopType: string;
  initialCapital: number; // প্রাথমিক মূলধন
  shopAdvance: number; // দোকানের অ্যাডভান্স
  shopDecoration: number; // ডেকোরেশন ও র‍্যাক খরচ
  monthlyRent: number; // মাসিক দোকান ভাড়া
  monthlyStaffCost: number; // কর্মচারীর মোট বেতন
  monthlyElectricity: number; // বিদ্যুৎ ও অন্যান্য ইউটিলিটি
  monthlyOtherExpense: number; // প্যাকেট, চা, যাতায়াত খরচ
  dailySales: number; // দৈনিক গড় বিক্রয়
  averageGrossMarginPercent: number; // গড় লাভের হার (%)
  damageWastagePercent: number; // নষ্ট ও অপচয়ের হার (%)
  creditSalesPercent: number; // বাকিতে বিক্রির হার (%)
}

export interface AppSettings {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopProprietor: string;
  currencySymbol: string;
  useBengaliNumerals: boolean;
  theme: 'light' | 'dark';
  defaultVatPercent: number;
  lowStockThresholdDefault: number;
  nearExpiryDaysThreshold: number;
  enableSoundEffects: boolean;
  receiptFooterMessage: string;
  supabaseConfig?: {
    url: string;
    anonKey: string;
    connected: boolean;
  };
}
