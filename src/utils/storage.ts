import { Customer, Product, Sale, Payment, ShopSettings, LedgerEntry } from '../types';
import { initialCustomers, initialProducts, initialSales, initialPayments, initialSettings } from '../data/initialData';
import { getCurrentDhakaDateTime, generateInvoiceNumber, generateReceiptNumber } from './formatters';

const STORAGE_KEYS = {
  CUSTOMERS: 'psm_customers',
  PRODUCTS: 'psm_products',
  SALES: 'psm_sales',
  PAYMENTS: 'psm_payments',
  SETTINGS: 'psm_settings'
};

export function getSettings(): ShopSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
    return initialSettings;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialSettings;
  }
}

export function saveSettings(settings: ShopSettings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getCustomers(): Customer[] {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
    return initialCustomers;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialCustomers;
  }
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
}

export function getProducts(): Product[] {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    return initialProducts;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialProducts;
  }
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function getSales(): Sale[] {
  const data = localStorage.getItem(STORAGE_KEYS.SALES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(initialSales));
    return initialSales;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialSales;
  }
}

export function saveSales(sales: Sale[]) {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
}

export function getPayments(): Payment[] {
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initialPayments));
    return initialPayments;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialPayments;
  }
}

export function savePayments(payments: Payment[]) {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
}

// ----------------- CRUD ACTIONS ----------------- //

export function addCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'createdTime' | 'totalPurchase' | 'totalPaid' | 'currentDue'> & { id?: string }): Customer {
  const customers = getCustomers();
  const { date, time } = getCurrentDhakaDateTime();
  const id = customerData.id || `CUST-${1001 + customers.length}`;

  const newCust: Customer = {
    ...customerData,
    id,
    openingBalance: Number(customerData.openingBalance) || 0,
    totalPurchase: 0,
    totalPaid: 0,
    currentDue: Number(customerData.openingBalance) || 0,
    createdAt: date,
    createdTime: time,
  };

  customers.unshift(newCust);
  saveCustomers(customers);
  return newCust;
}

export function updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return null;

  customers[index] = {
    ...customers[index],
    ...updates
  };
  saveCustomers(customers);
  return customers[index];
}

export function deleteCustomer(id: string): boolean {
  const customers = getCustomers();
  const filtered = customers.filter(c => c.id !== id);
  if (filtered.length === customers.length) return false;
  saveCustomers(filtered);
  return true;
}

export function addProduct(productData: Omit<Product, 'id'> & { id?: string }): Product {
  const products = getProducts();
  const id = productData.id || `PROD-${101 + products.length}`;
  const newProd: Product = {
    ...productData,
    id,
    purchasePrice: Number(productData.purchasePrice) || 0,
    sellingPrice: Number(productData.sellingPrice) || 0,
    stockQuantity: Number(productData.stockQuantity) || 0,
    minStockAlert: Number(productData.minStockAlert) || 5,
  };
  products.unshift(newProd);
  saveProducts(products);
  return newProd;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...updates
  };
  saveProducts(products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
}

// ----------------- SALE EXECUTION (POS) ----------------- //

export function createSale(saleData: {
  customerId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  notes?: string;
  customDate?: string;
  customTime?: string;
}): Sale {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === saleData.customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  const sales = getSales();
  const { date: defaultDate, time: defaultTime } = getCurrentDhakaDateTime();
  const saleDate = saleData.customDate || defaultDate;
  const saleTime = saleData.customTime || defaultTime;
  const invoiceId = generateInvoiceNumber(sales.length + 1);

  const dueAmount = Math.max(0, saleData.grandTotal - saleData.paidAmount);
  let status: 'PAID' | 'PARTIAL' | 'DUE' = 'DUE';
  if (dueAmount <= 0) {
    status = 'PAID';
  } else if (saleData.paidAmount > 0) {
    status = 'PARTIAL';
  }

  const previousDue = customer.currentDue;
  const newCustomerDue = previousDue + dueAmount;

  const newSale: Sale = {
    id: invoiceId,
    customerId: customer.id,
    customerName: customer.name,
    customerMobile: customer.mobile,
    customerAddress: customer.address,
    items: saleData.items,
    subtotal: saleData.subtotal,
    discount: saleData.discount,
    grandTotal: saleData.grandTotal,
    paidAmount: saleData.paidAmount,
    dueAmount,
    previousDue,
    newCustomerDue,
    status,
    date: saleDate,
    time: saleTime,
    notes: saleData.notes
  };

  // 1. Save Sale
  sales.unshift(newSale);
  saveSales(sales);

  // 2. Update Customer totals
  customer.totalPurchase = (customer.totalPurchase || 0) + saleData.grandTotal;
  customer.totalPaid = (customer.totalPaid || 0) + saleData.paidAmount;
  customer.currentDue = newCustomerDue;
  saveCustomers(customers);

  // 3. Update Product Stocks
  const products = getProducts();
  saleData.items.forEach(item => {
    const prod = products.find(p => p.id === item.productId || p.name === item.productName);
    if (prod) {
      prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
    }
  });
  saveProducts(products);

  // 4. If paid amount > 0, also log a receipt for transparency if needed
  if (saleData.paidAmount > 0) {
    const payments = getPayments();
    const receiptId = generateReceiptNumber(payments.length + 1);
    const paymentRecord: Payment = {
      id: receiptId,
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      previousDue: previousDue + saleData.grandTotal,
      paidAmount: saleData.paidAmount,
      remainingDue: newCustomerDue,
      paymentDate: saleDate,
      paymentTime: saleTime,
      paymentMethod: 'Cash',
      notes: `Sale payment for Invoice ${invoiceId}`
    };
    payments.unshift(paymentRecord);
    savePayments(payments);
  }

  return newSale;
}

// ----------------- PAYMENT EXECUTION ----------------- //

export function createPayment(paymentData: {
  customerId: string;
  paidAmount: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Cheque';
  notes?: string;
  customDate?: string;
  customTime?: string;
}): Payment {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === paymentData.customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  const payments = getPayments();
  const { date: defaultDate, time: defaultTime } = getCurrentDhakaDateTime();
  const paymentDate = paymentData.customDate || defaultDate;
  const paymentTime = paymentData.customTime || defaultTime;
  const receiptId = generateReceiptNumber(payments.length + 1);

  const previousDue = customer.currentDue;
  const remainingDue = Math.max(0, previousDue - paymentData.paidAmount);

  const newPayment: Payment = {
    id: receiptId,
    customerId: customer.id,
    customerName: customer.name,
    customerMobile: customer.mobile,
    previousDue,
    paidAmount: paymentData.paidAmount,
    remainingDue,
    paymentDate,
    paymentTime,
    paymentMethod: paymentData.paymentMethod,
    notes: paymentData.notes
  };

  // 1. Save Payment
  payments.unshift(newPayment);
  savePayments(payments);

  // 2. Update Customer
  customer.totalPaid = (customer.totalPaid || 0) + paymentData.paidAmount;
  customer.currentDue = remainingDue;
  saveCustomers(customers);

  return newPayment;
}

export function deleteSale(id: string): boolean {
  const sales = getSales();
  const sale = sales.find(s => s.id === id);
  if (!sale) return false;

  const customers = getCustomers();
  const customer = customers.find(c => c.id === sale.customerId);
  if (customer) {
    customer.totalPurchase = Math.max(0, (customer.totalPurchase || 0) - sale.grandTotal);
    customer.totalPaid = Math.max(0, (customer.totalPaid || 0) - sale.paidAmount);
    customer.currentDue = Math.max(0, (customer.currentDue || 0) - sale.dueAmount);
    saveCustomers(customers);
  }

  // Restore product stock
  const products = getProducts();
  sale.items.forEach(item => {
    const prod = products.find(p => p.id === item.productId || p.name === item.productName);
    if (prod) {
      prod.stockQuantity = prod.stockQuantity + item.quantity;
    }
  });
  saveProducts(products);

  const filtered = sales.filter(s => s.id !== id);
  saveSales(filtered);
  return true;
}

export function deletePayment(id: string): boolean {
  const payments = getPayments();
  const payment = payments.find(p => p.id === id);
  if (!payment) return false;

  const customers = getCustomers();
  const customer = customers.find(c => c.id === payment.customerId);
  if (customer) {
    customer.totalPaid = Math.max(0, (customer.totalPaid || 0) - payment.paidAmount);
    customer.currentDue = customer.currentDue + payment.paidAmount;
    saveCustomers(customers);
  }

  const filtered = payments.filter(p => p.id !== id);
  savePayments(filtered);
  return true;
}


// ----------------- CUSTOMER LEDGER ----------------- //

export function getCustomerLedger(customerId: string): LedgerEntry[] {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return [];

  const sales = getSales().filter(s => s.customerId === customerId);
  const payments = getPayments().filter(p => p.customerId === customerId);

  const ledger: LedgerEntry[] = [];

  // Opening balance if any
  if (customer.openingBalance && customer.openingBalance > 0) {
    ledger.push({
      id: `OPEN-${customer.id}`,
      date: customer.createdAt,
      time: customer.createdTime || '00:00:00',
      description: 'পূর্বের জের / প্রারম্ভিক বাকি (Opening Balance)',
      referenceId: 'OPENING',
      type: 'OPENING',
      debit: customer.openingBalance,
      credit: 0,
      balance: customer.openingBalance
    });
  }

  // Combine sales and payments
  sales.forEach(sale => {
    ledger.push({
      id: `SALE-${sale.id}`,
      date: sale.date,
      time: sale.time,
      description: `পণ্য বিক্রয় (চালান নং: ${sale.id})`,
      referenceId: sale.id,
      type: 'SALE',
      debit: sale.grandTotal,
      credit: 0,
      balance: 0 // Will recalculate chronologically
    });
  });

  payments.forEach(pay => {
    ledger.push({
      id: `PAY-${pay.id}`,
      date: pay.paymentDate,
      time: pay.paymentTime,
      description: `টাকা জমা (${pay.paymentMethod}) - রসিদ: ${pay.id}`,
      referenceId: pay.id,
      type: 'PAYMENT',
      debit: 0,
      credit: pay.paidAmount,
      balance: 0 // Will recalculate chronologically
    });
  });

  // Sort chronologically ascending
  ledger.sort((a, b) => {
    const dateTimeA = `${a.date}T${a.time}`;
    const dateTimeB = `${b.date}T${b.time}`;
    return dateTimeA.localeCompare(dateTimeB);
  });

  // Calculate rolling running balance
  let running = 0;
  ledger.forEach(entry => {
    running = running + entry.debit - entry.credit;
    entry.balance = running;
  });

  return ledger;
}

// ----------------- BACKUP & RESTORE ----------------- //

export function exportAllDataJSON(): string {
  const fullData = {
    settings: getSettings(),
    customers: getCustomers(),
    products: getProducts(),
    sales: getSales(),
    payments: getPayments(),
    exportedAt: getCurrentDhakaDateTime().full
  };
  return JSON.stringify(fullData, null, 2);
}

export function importAllDataJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.customers && Array.isArray(parsed.customers)) {
      saveCustomers(parsed.customers);
    }
    if (parsed.products && Array.isArray(parsed.products)) {
      saveProducts(parsed.products);
    }
    if (parsed.sales && Array.isArray(parsed.sales)) {
      saveSales(parsed.sales);
    }
    if (parsed.payments && Array.isArray(parsed.payments)) {
      savePayments(parsed.payments);
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      saveSettings(parsed.settings);
    }
    return true;
  } catch {
    return false;
  }
}

export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(initialSales));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initialPayments));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
}

// Convenient export aliases
export const getStoredCustomers = getCustomers;
export const getStoredProducts = getProducts;
export const getStoredSales = getSales;
export const getStoredPayments = getPayments;
export const getStoredSettings = getSettings;
export const updateSettings = saveSettings;
export const resetToSampleData = resetToDemoData;

