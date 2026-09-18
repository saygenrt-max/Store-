import React, { useState, useMemo } from 'react';
import { 
  X, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Receipt, 
  Plus, 
  Printer, 
  FileSpreadsheet, 
  CreditCard, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { Customer, Sale, Payment, LedgerEntry } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';
import { getCustomerLedger } from '../utils/storage';
import { exportToExcelCSV } from '../utils/excelExport';

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
  onOpenNewSaleForCustomer: (customer: Customer) => void;
  onOpenAddPaymentForCustomer: (customer: Customer) => void;
  onViewInvoice: (sale: Sale) => void;
  onViewReceipt: (payment: Payment) => void;
  sales: Sale[];
  payments: Payment[];
  shopName: string;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onOpenNewSaleForCustomer,
  onOpenAddPaymentForCustomer,
  onViewInvoice,
  onViewReceipt,
  sales,
  payments,
  shopName
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'sales' | 'payments'>('ledger');

  if (!customer) return null;

  const ledger: LedgerEntry[] = useMemo(() => {
    return getCustomerLedger(customer.id);
  }, [customer.id, sales, payments]);

  const customerSales = useMemo(() => {
    return sales.filter(s => s.customerId === customer.id);
  }, [sales, customer.id]);

  const customerPayments = useMemo(() => {
    return payments.filter(p => p.customerId === customer.id);
  }, [payments, customer.id]);

  const lastTransaction = ledger.length > 0 ? ledger[ledger.length - 1] : null;

  const handleExportLedgerExcel = () => {
    const headers = ['তারিখ', 'বিবরণ', 'চালান/রসিদ নং', 'ডেবিট / ক্রয় (৳)', 'ক্রেডিট / পরিশোধ (৳)', 'বর্তমান জের / বাকি (৳)'];
    const rows = ledger.map(l => [
      `${formatDateBn(l.date)} ${l.time}`,
      l.description,
      l.referenceId,
      l.debit > 0 ? l.debit : 0,
      l.credit > 0 ? l.credit : 0,
      l.balance
    ]);
    exportToExcelCSV(`Ledger_${customer.name}_${customer.id}`, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">{customer.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                  {customer.id}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>{customer.mobile}</span>
                {customer.areaVillage && <span>• {customer.areaVillage}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1.5 transition"
              title="খাতা প্রিন্ট করুন"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Financial Overview Stats Ribbon */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">মোট কেনাকাটা</p>
            <p className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">
              {formatCurrency(customer.totalPurchase)}
            </p>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">মোট পরিশোধ</p>
            <p className="text-base sm:text-lg font-bold text-emerald-700 mt-0.5">
              {formatCurrency(customer.totalPaid)}
            </p>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">বর্তমান পাওনা / বাকি</p>
            <p className={`text-base sm:text-lg font-extrabold mt-0.5 ${
              customer.currentDue > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {formatCurrency(customer.currentDue)}
            </p>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">লেনদেনের অবস্থা</p>
            <div className="mt-1">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                customer.currentDue <= 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {customer.currentDue <= 0 ? 'পরিশোধিত (PAID)' : 'বকেয়া রয়েছে (DUE)'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 no-print">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'ledger' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              খতিয়ান / লেজার খাতা ({ledger.length})
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'sales' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ক্রয় বিক্রয় ({customerSales.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'payments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              টাকা জমার রসিদ ({customerPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              গ্রাহকের তথ্য
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportLedgerExcel}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} />
              <span>এক্সেল ডাউনলোড</span>
            </button>
            <button
              onClick={() => onOpenAddPaymentForCustomer(customer)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition flex items-center gap-1.5"
            >
              <CreditCard size={14} />
              <span>টাকা জমা নিন</span>
            </button>
            <button
              onClick={() => onOpenNewSaleForCustomer(customer)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>নতুন বিক্রি</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Printable Header - Visible when printing */}
          <div className="hidden print-only mb-6 text-center border-b pb-4">
            <h1 className="text-xl font-bold">{shopName}</h1>
            <p className="text-xs text-slate-600">গ্রাহকের পূর্ণাঙ্গ হিসাব খতিয়ান (Customer Ledger Statement)</p>
            <div className="mt-2 text-sm flex justify-between text-left">
              <div>
                <p><strong>গ্রাহক:</strong> {customer.name} ({customer.id})</p>
                <p><strong>মোবাইল:</strong> {customer.mobile}</p>
                <p><strong>ঠিকানা:</strong> {customer.address}, {customer.areaVillage}</p>
              </div>
              <div className="text-right">
                <p><strong>মোট ক্রয়:</strong> {formatCurrency(customer.totalPurchase)}</p>
                <p><strong>মোট জমা:</strong> {formatCurrency(customer.totalPaid)}</p>
                <p><strong>বর্তমান বকেয়া:</strong> {formatCurrency(customer.currentDue)}</p>
              </div>
            </div>
          </div>

          {/* TAB 1: LEDGER (খতিয়ান) */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>হিসাবের ক্রমধারা (কালানুক্রমিক)</span>
                {lastTransaction && (
                  <span>সর্বশেষ লেনদেন: {formatDateBn(lastTransaction.date)} {lastTransaction.time}</span>
                )}
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">তারিখ ও সময়</th>
                      <th className="p-3">বিবরণ</th>
                      <th className="p-3">রেফারেন্স</th>
                      <th className="p-3 text-right text-slate-800">ডেবিট / ক্রয় (+)</th>
                      <th className="p-3 text-right text-emerald-700">ক্রেডিট / জমা (-)</th>
                      <th className="p-3 text-right text-rose-700">বর্তমান জের (বাকি)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledger.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          এখনো কোনো লেনদেন রেকর্ড নেই
                        </td>
                      </tr>
                    ) : (
                      ledger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-medium text-slate-600 whitespace-nowrap">
                            {formatDateBn(entry.date)} <span className="text-[10px] text-slate-400">{entry.time}</span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">
                            {entry.description}
                          </td>
                          <td className="p-3 font-mono text-blue-600 font-medium">
                            {entry.referenceId}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-700">
                            {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
                          </td>
                          <td className="p-3 text-right font-extrabold text-rose-600">
                            {formatCurrency(entry.balance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {ledger.length > 0 && (
                    <tfoot className="bg-slate-100/80 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={3} className="p-3 text-right">সর্বমোট:</td>
                        <td className="p-3 text-right text-slate-900">
                          {formatCurrency(ledger.reduce((a, b) => a + b.debit, 0))}
                        </td>
                        <td className="p-3 text-right text-emerald-700">
                          {formatCurrency(ledger.reduce((a, b) => a + b.credit, 0))}
                        </td>
                        <td className="p-3 text-right text-rose-600 font-extrabold">
                          {formatCurrency(customer.currentDue)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SALES (বিক্রয় মেমো) */}
          {activeTab === 'sales' && (
            <div className="space-y-3">
              {customerSales.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  কোনো বিক্রয়ের মেমো পাওয়া যায়নি
                </div>
              ) : (
                customerSales.map((sale) => (
                  <div key={sale.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 font-mono">{sale.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          sale.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {sale.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        তারিখ: {formatDateBn(sale.date)} {sale.time} • আইটেম: {sale.items.length} টি
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {sale.items.map(i => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(sale.grandTotal)}</p>
                      <p className="text-xs text-emerald-600">জমা: {formatCurrency(sale.paidAmount)}</p>
                      {sale.dueAmount > 0 && (
                        <p className="text-xs text-rose-600 font-bold">বাকি: {formatCurrency(sale.dueAmount)}</p>
                      )}
                      <button
                        onClick={() => onViewInvoice(sale)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 ml-auto"
                      >
                        চালান দেখুন <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS (টাকা জমার রসিদ) */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              {customerPayments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  টাকা জমার কোনো রসিদ নেই
                </div>
              ) : (
                customerPayments.map((pay) => (
                  <div key={pay.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-800 font-mono">{pay.id}</span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        তারিখ: {formatDateBn(pay.paymentDate)} {pay.paymentTime} • মাধ্যম: {pay.paymentMethod}
                      </p>
                      {pay.notes && <p className="text-xs text-slate-600 mt-1">নোট: {pay.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">+{formatCurrency(pay.paidAmount)}</p>
                      <p className="text-xs text-slate-500">বাকি ছিল: {formatCurrency(pay.previousDue)}</p>
                      <p className="text-xs text-slate-700 font-medium">অবশিষ্ট: {formatCurrency(pay.remainingDue)}</p>
                      <button
                        onClick={() => onViewReceipt(pay)}
                        className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 ml-auto"
                      >
                        রসিদ প্রিন্ট করুন <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: PROFILE OVERVIEW (গ্রাহকের তথ্য) */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-800 border-b pb-2">ব্যক্তিগত ও যোগাযোগের তথ্য</h4>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">গ্রাহকের নাম:</span>
                  <span className="font-bold text-slate-800">{customer.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">পিতার নাম:</span>
                  <span className="text-slate-800">{customer.fatherName || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">মোবাইল নম্বর:</span>
                  <span className="font-bold text-blue-600">{customer.mobile}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">বিকল্প মোবাইল:</span>
                  <span className="text-slate-800">{customer.altMobile || '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">এলাকা / গ্রাম:</span>
                  <span className="text-slate-800">{customer.areaVillage || '—'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-800 border-b pb-2">ঠিকানা ও হিসাব খোলার তথ্য</h4>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">স্থায়ী ঠিকানা:</span>
                  <span className="text-slate-800 text-right">{customer.address}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">হিসাব খোলার তারিখ:</span>
                  <span className="text-slate-800">{formatDateBn(customer.createdAt)} {customer.createdTime}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">প্রারম্ভিক জের (Opening):</span>
                  <span className="text-slate-800 font-bold">{formatCurrency(customer.openingBalance)}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block mb-1">অতিরিক্ত নোট:</span>
                  <p className="p-2 bg-white rounded border border-slate-200 text-slate-700">
                    {customer.notes || 'কোনো নোট উল্লেখ করা নেই।'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
