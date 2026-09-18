import React from 'react';
import { 
  Users, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight, 
  CreditCard, 
  Receipt, 
  UserCheck, 
  Plus, 
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { Customer, Sale, Payment } from '../types';
import { formatCurrency, formatDateBn, getCurrentDhakaDateTime } from '../utils/formatters';
import { exportToExcelCSV } from '../utils/excelExport';

interface DashboardProps {
  customers: Customer[];
  sales: Sale[];
  payments: Payment[];
  onOpenNewSale: () => void;
  onOpenAddPayment: () => void;
  onOpenAddCustomer: () => void;
  onSelectCustomer: (customer: Customer) => void;
  onViewInvoice: (sale: Sale) => void;
  onViewReceipt: (payment: Payment) => void;
  onNavigateToTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  customers,
  sales,
  payments,
  onOpenNewSale,
  onOpenAddPayment,
  onOpenAddCustomer,
  onSelectCustomer,
  onViewInvoice,
  onViewReceipt,
  onNavigateToTab
}) => {
  const { date: todayDate } = getCurrentDhakaDateTime();

  // Aggregate Metrics
  const totalCustomers = customers.length;
  const totalSalesAmount = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalCollectedAmount = payments.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalDueAmount = customers.reduce((acc, c) => acc + (c.currentDue > 0 ? c.currentDue : 0), 0);
  const dueCustomers = customers.filter(c => c.currentDue > 0);
  const dueCustomersCount = dueCustomers.length;

  // Today's Metrics
  const todaySalesList = sales.filter(s => s.date === todayDate);
  const todaySalesAmount = todaySalesList.reduce((acc, s) => acc + s.grandTotal, 0);

  const todayPaymentsList = payments.filter(p => p.paymentDate === todayDate);
  const todayCollectedAmount = todayPaymentsList.reduce((acc, p) => acc + p.paidAmount, 0);

  const todayDueAmount = todaySalesList.reduce((acc, s) => acc + s.dueAmount, 0);
  const todayTotalTransactions = todaySalesList.length + todayPaymentsList.length;

  // Recent data
  const recentSales = [...sales].slice(0, 5);
  const recentPayments = [...payments].slice(0, 5);
  const recentCustomers = [...customers].slice(0, 5);

  const handleExportSummaryExcel = () => {
    const headers = ['হিসাব বিবরণী', 'পরিমাণ (৳)', 'তারিখ (Asia/Dhaka)'];
    const rows = [
      ['মোট গ্রাহক সংখ্যা', totalCustomers, todayDate],
      ['বাকি থাকা গ্রাহক সংখ্যা', dueCustomersCount, todayDate],
      ['মোট বিক্রির পরিমাণ', totalSalesAmount, todayDate],
      ['মোট আদায় করা টাকা', totalCollectedAmount, todayDate],
      ['মোট বকেয়া / পাওনা', totalDueAmount, todayDate],
      ['আজকের মোট বিক্রি', todaySalesAmount, todayDate],
      ['আজকের মোট আদায়', todayCollectedAmount, todayDate],
      ['আজকের নতুন বাকি', todayDueAmount, todayDate],
      ['আজকের মোট লেনদেন সংখ্যা', todayTotalTransactions, todayDate]
    ];
    exportToExcelCSV(`PSM_Dashboard_Summary_${todayDate}`, headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
            Asia/Dhaka লাইভ হিসাব খাতা
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-2">
            দোকান ম্যানেজমেন্ট ড্যাশবোর্ড
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            হার্ডওয়্যার, পিভিসি পাইপ, ইলেকট্রিক্যাল ওয়্যার, সুইচ, বাল্ব ও সিমেন্ট বিক্রয় ও কাস্টমার বাকি লেনদেনের সার্বিক অবস্থা।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-quick-sale-btn"
            onClick={onOpenNewSale}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Plus size={16} />
            <span>নতুন বিক্রি (Sale)</span>
          </button>
          <button
            id="dash-quick-pay-btn"
            onClick={onOpenAddPayment}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Receipt size={16} />
            <span>টাকা জমা (Payment)</span>
          </button>
          <button
            id="dash-export-excel-btn"
            onClick={handleExportSummaryExcel}
            className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-2"
            title="Excel এ ডাউনলোড করুন"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">এক্সেল রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* 1. Primary Metrics Grid (4 Main Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">মোট গ্রাহক</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCustomers} জন</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
              বাকি: {dueCustomersCount} জন
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">সকল নিবন্ধিত পাইকারি ও খুচরা ক্রেতা</p>
        </div>

        {/* Card 2: Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">মোট বিক্রি</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{formatCurrency(totalSalesAmount)}</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-indigo-700 font-medium">
            <ArrowUpRight size={14} className="mr-0.5" />
            <span>আজকের বিক্রি: {formatCurrency(todaySalesAmount)}</span>
          </div>
        </div>

        {/* Card 3: Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">মোট আদায় করা টাকা</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{formatCurrency(totalCollectedAmount)}</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-700 font-medium">
            <TrendingUp size={14} className="mr-0.5" />
            <span>আজকের আদায়: {formatCurrency(todayCollectedAmount)}</span>
          </div>
        </div>

        {/* Card 4: Total Due (Paoana) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 transition bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">মোট বাকি / পাওনা</span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">{formatCurrency(totalDueAmount)}</span>
          </div>
          <p className="text-xs text-rose-500 font-medium mt-2">
            আজকের নতুন বকেয়া: {formatCurrency(todayDueAmount)}
          </p>
        </div>
      </div>

      {/* 2. Today's Highlight Summary Row */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300">
              আজকের ব্যবসার তাৎক্ষণিক চিত্র ({formatDateBn(todayDate)})
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300">
            মোট {todayTotalTransactions} টি লেনদেন সম্পন্ন
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-center sm:text-left">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <p className="text-xs text-slate-400">আজকের মোট বিক্রি</p>
            <p className="text-xl font-bold text-blue-400 mt-1">{formatCurrency(todaySalesAmount)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{todaySalesList.length} টি বিক্রয় মেমো</p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <p className="text-xs text-slate-400">আজকের ক্যাশ/অনলাইন আদায়</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(todayCollectedAmount)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{todayPaymentsList.length} টি টাকা জমার রসিদ</p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <p className="text-xs text-slate-400">আজকের নতুন বাকি</p>
            <p className="text-xl font-bold text-rose-400 mt-1">{formatCurrency(todayDueAmount)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">বাকি চালান থেকে যুক্ত</p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <p className="text-xs text-slate-400">বকেয়া থাকা মোট খরিদ্দার</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{dueCustomersCount} জন</p>
            <button 
              onClick={() => onNavigateToTab('due_management')}
              className="text-[11px] text-blue-300 hover:text-blue-200 underline mt-0.5 block"
            >
              বাকি খাতা দেখুন →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Three Columns: Recent Sales, Recent Payments, Top Due Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Recent Sales */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag size={18} className="text-blue-600" />
                <span>সাম্প্রতিক বিক্রয়</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('sales_history')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                সব দেখুন <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {recentSales.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">কোনো বিক্রয়ের তথ্য নেই</p>
              ) : (
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    onClick={() => onViewInvoice(sale)}
                    className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-100 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{sale.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{sale.id} • {formatDateBn(sale.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">{formatCurrency(sale.grandTotal)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        sale.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                        sale.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {sale.status === 'PAID' ? 'পরিশোধ' : sale.status === 'PARTIAL' ? 'আংশিক' : 'বাকি'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={onOpenNewSale}
            className="w-full mt-4 py-2 border border-dashed border-blue-300 text-blue-600 font-semibold text-xs rounded-xl hover:bg-blue-50 transition"
          >
            + নতুন বিক্রয় মেমো তৈরি করুন
          </button>
        </div>

        {/* Column 2: Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                <span>সাম্প্রতিক টাকা জমা</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('payments')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
              >
                সব দেখুন <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {recentPayments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">টাকা জমার কোনো এন্ট্রি নেই</p>
              ) : (
                recentPayments.map((pay) => (
                  <div
                    key={pay.id}
                    onClick={() => onViewReceipt(pay)}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-100 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{pay.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{pay.id} • {pay.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-700">+{formatCurrency(pay.paidAmount)}</p>
                      <p className="text-[10px] text-slate-500">বাকি: {formatCurrency(pay.remainingDue)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={onOpenAddPayment}
            className="w-full mt-4 py-2 border border-dashed border-emerald-300 text-emerald-700 font-semibold text-xs rounded-xl hover:bg-emerald-50 transition"
          >
            + কাস্টমারের টাকা জমা এন্ট্রি করুন
          </button>
        </div>

        {/* Column 3: Top Due Customers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle size={18} className="text-rose-600" />
                <span>শীর্ষ বকেয়া খরিদ্দার</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('due_management')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                বাকি খাতা <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {dueCustomers.length === 0 ? (
                <div className="text-center py-6">
                  <UserCheck className="mx-auto text-emerald-500 mb-1" size={24} />
                  <p className="text-xs text-emerald-600 font-semibold">কোনো বকেয়া নেই! সব পরিশোধিত।</p>
                </div>
              ) : (
                dueCustomers.slice(0, 5).map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => onSelectCustomer(cust)}
                    className="p-3 bg-slate-50 hover:bg-rose-50/60 rounded-xl border border-slate-100 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{cust.name}</p>
                      <p className="text-[11px] text-slate-500">{cust.mobile} • {cust.areaVillage || cust.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-600">{formatCurrency(cust.currentDue)}</p>
                      <span className="text-[10px] text-slate-400">প্রোফাইল দেখুন</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('customers')}
            className="w-full mt-4 py-2 border border-dashed border-slate-300 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-100 transition"
          >
            সকল খরিদ্দার ডিরেক্টরি দেখুন
          </button>
        </div>
      </div>
    </div>
  );
};
