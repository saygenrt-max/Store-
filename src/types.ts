export interface Customer {
  id: string; // e.g., "CUST-1001"
  name: string;
  fatherName?: string;
  mobile: string;
  altMobile?: string;
  address: string;
  areaVillage: string;
  photo?: string;
  openingBalance: number;
  totalPurchase: number;
  totalPaid: number;
  currentDue: number;
  notes?: string;
  createdAt: string; // ISO or YYYY-MM-DD
  createdTime: string; // HH:mm:ss
}

export interface Product {
  id: string; // e.g., "PROD-101"
  name: string;
  category: 'Electrical' | 'Hardware' | 'Pipe' | 'Plumbing' | 'Cement' | 'Construction Materials' | 'Others';
  sku: string;
  unit: string; // pcs, roll, bag, feet, meter, kg, box, set
  purchasePrice?: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  description?: string;
  image?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string; // invoice number e.g. "INV-20260918-0001"
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  previousDue: number;
  newCustomerDue: number;
  status: 'PAID' | 'PARTIAL' | 'DUE';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  notes?: string;
}

export interface Payment {
  id: string; // receipt number e.g. "REC-20260918-0001"
  customerId: string;
  customerName: string;
  customerMobile: string;
  previousDue: number;
  paidAmount: number;
  remainingDue: number;
  paymentDate: string; // YYYY-MM-DD
  paymentTime: string; // HH:mm:ss
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Cheque';
  notes?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  time: string;
  description: string;
  referenceId: string; // Invoice ID or Payment ID
  type: 'OPENING' | 'SALE' | 'PAYMENT';
  debit: number; // Increases receivable (Sale / Opening)
  credit: number; // Decreases receivable (Payment)
  balance: number; // Rolling due balance
}

export interface ShopSettings {
  shopName: string;
  shopOwner: string;
  shopAddress: string;
  mobileNumber: string;
  altMobile?: string;
  email: string;
  logoUrl?: string;
  currencySymbol: string;
  footerText: string;
  invoiceHeader: string;
  invoiceFooter: string;
  timezone: string;
}
