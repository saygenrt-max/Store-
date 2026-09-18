import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Printer, 
  FileSpreadsheet, 
  TrendingUp, 
  CreditCard, 
  BadgeAlert, 
  ShoppingBag,
  Users
} from 'lucide-react';
import { Customer, Sale, Payment } from '../types';
import { formatCurrency, formatDateBn, getCurrentDhakaDateTime } from '../utils/formatters';
import { exportToExcelCSV } from '../utils/excelExport';

interface ReportsProps {
  customers: Customer[];
  sales: Sale[];
  payments: Payment[];
  shopName: string;
}

export const Reports: React.FC<ReportsProps> = ({
  customers,
  sales,
  payments,
  shopName
}) => {
  const { date: todayDate } = getCurrentDhakaDateTime();
  const currentMonthStr = todayDate.substring(0, 7); // "YYYY-MM"

  const [activeReportTab, setActiveReportTab] = useState<'daily' | 'monthly' | 'due'>('daily');
  const [selectedDay, setSelectedDay] = useState<string>(todayDate);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // 1. Daily Report Calculations
  const daySales = useMemo(() => {
    return sales.filter(s => s.date === selectedDay);
  }, [sales, selectedDay]);

  const dayPayments = useMemo(() => {
    return payments.filter(p => p.paymentDate === selectedDay);
  }, [payments, selectedDay]);

  const dayTotalSales = useMemo(() => daySales.reduce((acc, s) => acc + s.grandTotal, 0), [daySales]);
  const daySalesPaid = useMemo(() => daySales.reduce((acc, s) => acc + s.paidAmount, 0), [daySales]);
  const dayDirectPayments = useMemo(() => dayPayments.reduce((acc, p) => acc + p.paidAmount, 0), [dayPayments]);
  const dayTotalCashIn = daySalesPaid + dayDirectPayments;
  const dayTotalDueGiven = useMemo(() => daySales.reduce((acc, s) => acc + s.dueAmount, 0), [daySales]);

  // 2. Monthly Report Calculations
  const monthSales = useMemo(() => {
    return sales.filter(s => s.date.startsWith(selectedMonth));
  }, [sales, selectedMonth]);

  const monthPayments = useMemo(() => {
    return payments.filter(p => p.paymentDate.startsWith(selectedMonth));
  }, [payments, selectedMonth]);

  const monthTotalSales = useMemo(() => monthSales.reduce((acc, s) => acc + s.grandTotal, 0), [monthSales]);
  const monthSalesPaid = useMemo(() => monthSales.reduce((acc, s) => acc + s.paidAmount, 0), [monthSales]);
  const monthDirectPayments = useMemo(() => monthPayments.reduce((acc, p) => acc + p.paidAmount, 0), [monthPayments]);
  const monthTotalCashIn = monthSalesPaid + monthDirectPayments;
  const monthTotalDueGiven = useMemo(() => monthSales.reduce((acc, s) => acc + s.dueAmount, 0), [monthSales]);

  // 3. Due Report Calculations
  const dueCustomers = useMemo(() => {
    return customers.filter(c => c.currentDue > 0);
  }, [customers]);
  const totalStoreDue = useMemo(() => dueCustomers.reduce((acc, c) => acc + c.currentDue, 0), [dueCustomers]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportDailyExcel = () => {
    const headers = ['চালান নং', 'গ্রাহকের নাম', 'মোবাইল', 'সময়', 'আইটেম', 'সর্বমোট বিল (৳)', 'নগদ জমা (৳)', 'বাকি (৳)', 'অবস্থা'];
    const rows = daySales.map(s => [
      s.id,
      s.customerName,
      s.customerMobile,
      s.time,
      s.items.length,
      s.grandTotal,
      s.paidAmount,
      s.dueAmount,
      s.status
    ]);
    exportToExcelCSV(`Daily_Report_${selectedDay}`, headers, rows);
  };

  const handleExportMonthlyExcel = () => {
    const headers = ['তারিখ', 'চালান নং', 'গ্রাহকের নাম', 'সর্বমোট বিল (৳)', 'নগদ জমা (৳)', 'বাকি (৳)'];
    const rows = monthSales.map(s => [
      `${formatDateBn(s.date)} ${s.time}`,
      s.id,
      s.customerName,
      s.grandTotal,
      s.paidAmount,
      s.dueAmount
    ]);
    exportToExcelCSV(`Monthly_Report_${selectedMonth}`, headers, rows);
  };

  const handleExportDueExcel = () => {
    const headers = ['কাস্টমার আইডি', 'নাম', 'মোবাইল', 'ঠিকানা', 'মোট ক্রয়', 'মোট পরিশোধ', 'বর্তমান বাকি (৳)'];
    const rows = dueCustomers.map(c => [
      c.id,
      c.name,
      c.mobile,
      c.address,
      c.totalPurchase,
      c.totalPaid,
      c.currentDue
    ]);
    exportToExcelCSV(`Store_Due_Summary_Report`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Printable Report Header */}
      <div className="hidden print-only mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">{shopName}</h1>
        <h2 className="text-base font-semibold text-slate-800">
          {activeReportTab === 'daily' && `দৈনিক বিক্রয় ও হিসাব রিপোর্ট (${formatDateBn(selectedDay)})`}
          {activeReportTab === 'monthly' && `মাসিক বিক্রয় ও হিসাব বিবরণী (${selectedMonth})`}
          {activeReportTab === 'due' && 'দোকানের সর্বমোট বকেয়া ও পাওনা রিপোর্ট'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          প্রিন্ট সময়: {new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })} (Asia/Dhaka)
        </p>
      </div>

      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={22} className="text-blue-600" />
            <span>দোকানের হিসাব ও অডিট রিপোর্ট (Reports & Analytics)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            দৈনিক হিসাব, মাসিক স্টেটমেন্ট, নগদ ক্যাশ ইন এবং বকেয়ার বিস্তারিত রিপোর্ট।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeReportTab === 'daily' && (
            <button
              onClick={handleExportDailyExcel}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet size={16} />
              <span>এক্সেল ডাউনলোড</span>
            </button>
          )}
          {activeReportTab === 'monthly' && (
            <button
              onClick={handleExportMonthlyExcel}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet size={16} />
              <span>এক্সেল ডাউনলোড</span>
            </button>
          )}
          {activeReportTab === 'due' && (
            <button
              onClick={handleExportDueExcel}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet size={16} />
              <span>এক্সেল ডাউনলোড</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer size={16} />
            <span>প্রিন্ট রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit text-xs font-bold no-print">
        <button
          onClick={() => setActiveReportTab('daily')}
          className={`px-4 py-2 rounded-xl transition ${
            activeReportTab === 'daily' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          দৈনিক রিপোর্ট (Daily)
        </button>
        <button
          onClick={() => setActiveReportTab('monthly')}
          className={`px-4 py-2 rounded-xl transition ${
            activeReportTab === 'monthly' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          মাসিক রিপোর্ট (Monthly)
        </button>
        <button
          onClick={() => setActiveReportTab('due')}
          className={`px-4 py-2 rounded-xl transition ${
            activeReportTab === 'due' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          বাকি রিপোর্ট (Due Ledger)
        </button>
      </div>

      {/* 1. DAILY REPORT */}
      {activeReportTab === 'daily' && (
        <div className="space-y-5">
          {/* Day Picker */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs font-medium no-print">
            <span className="text-slate-600 font-bold">তারিখ নির্বাচন করুন:</span>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl">
              <Calendar size={15} className="text-slate-500" />
              <input
                type="date"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-transparent outline-none font-bold text-slate-800"
              />
            </div>
            {selectedDay === todayDate && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-[11px] font-bold">আজকের হিসাব</span>
            )}
          </div>

          {/* Daily 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">দিনের মোট বিক্রি</p>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">{formatCurrency(dayTotalSales)}</p>
              <p className="text-[11px] text-slate-400 mt-1">মোট {daySales.length} টি বিক্রয় মেমো</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">দিনের মোট নগদ ক্যাশ আদায়</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(dayTotalCashIn)}</p>
              <p className="text-[11px] text-slate-400 mt-1">বিক্রি জমা + পুরনো বাকি আদায়</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">আজকের নতুন বকেয়া দেওয়া</p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">{formatCurrency(dayTotalDueGiven)}</p>
              <p className="text-[11px] text-slate-400 mt-1">আজকের বিক্রিতে বাকি দেওয়া হয়েছে</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">বকেয়া আদায় রসিদ</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatCurrency(dayDirectPayments)}</p>
              <p className="text-[11px] text-slate-400 mt-1">{dayPayments.length} টি পেমেন্ট ভাউচার</p>
            </div>
          </div>

          {/* Day Sales Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs">
              দিনের সমস্ত বিক্রির চালান তালিকা ({formatDateBn(selectedDay)})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">চালান নং</th>
                    <th className="p-3">গ্রাহক</th>
                    <th className="p-3">সময়</th>
                    <th className="p-3 text-right">সর্বমোট বিল</th>
                    <th className="p-3 text-right">নগদ জমা</th>
                    <th className="p-3 text-right">বাকি</th>
                    <th className="p-3 text-center">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {daySales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">এই তারিখে কোনো বিক্রি নেই</td>
                    </tr>
                  ) : (
                    daySales.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{s.id}</td>
                        <td className="p-3 font-semibold text-slate-900">{s.customerName}</td>
                        <td className="p-3 text-slate-500">{s.time}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(s.grandTotal)}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">{formatCurrency(s.paidAmount)}</td>
                        <td className="p-3 text-right font-bold text-rose-600">{formatCurrency(s.dueAmount)}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            s.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MONTHLY REPORT */}
      {activeReportTab === 'monthly' && (
        <div className="space-y-5">
          {/* Month Picker */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs font-medium no-print">
            <span className="text-slate-600 font-bold">মাস নির্বাচন করুন:</span>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl">
              <Calendar size={15} className="text-slate-500" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent outline-none font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Monthly KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">মাসের মোট বিক্রি (Total Sales)</p>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">{formatCurrency(monthTotalSales)}</p>
              <p className="text-[11px] text-slate-400 mt-1">মোট {monthSales.length} টি চালান মেমো</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">মাসের মোট নগদ আদায় (Cash Collected)</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(monthTotalCashIn)}</p>
              <p className="text-[11px] text-slate-400 mt-1">বিক্রয়ের নগদ + বাকি আদায়</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">মাসের মোট নতুন বাকি (Total Due Given)</p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">{formatCurrency(monthTotalDueGiven)}</p>
              <p className="text-[11px] text-slate-400 mt-1">গ্রাহকদের দেওয়া বাকি হিসাব</p>
            </div>
          </div>

          {/* Monthly Sales Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs">
              মাসের সমস্ত বিক্রির চালান তালিকা ({selectedMonth})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">চালান নং</th>
                    <th className="p-3">গ্রাহক</th>
                    <th className="p-3 text-right">সর্বমোট বিল</th>
                    <th className="p-3 text-right">নগদ আদায়</th>
                    <th className="p-3 text-right">বাকি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">এই মাসে কোনো বিক্রি নেই</td>
                    </tr>
                  ) : (
                    monthSales.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-600 whitespace-nowrap">{formatDateBn(s.date)}</td>
                        <td className="p-3 font-mono font-bold text-blue-700">{s.id}</td>
                        <td className="p-3 font-semibold text-slate-900">{s.customerName}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(s.grandTotal)}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">{formatCurrency(s.paidAmount)}</td>
                        <td className="p-3 text-right font-bold text-rose-600">{formatCurrency(s.dueAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. DUE LEDGER REPORT */}
      {activeReportTab === 'due' && (
        <div className="space-y-5">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">দোকানের সর্বমোট বকেয়া পাওনা</p>
              <p className="text-2xl font-extrabold text-rose-600 mt-0.5">{formatCurrency(totalStoreDue)}</p>
            </div>
            <div className="text-right text-xs text-rose-800 font-semibold">
              মোট {dueCustomers.length} জন গ্রাহক
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">আইডি</th>
                    <th className="p-3.5">নাম ও ঠিকানা</th>
                    <th className="p-3.5">মোবাইল</th>
                    <th className="p-3.5 text-right">মোট ক্রয়</th>
                    <th className="p-3.5 text-right">মোট পরিশোধ</th>
                    <th className="p-3.5 text-right text-rose-700">বর্তমান বকেয়া পাওনা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dueCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-slate-600">{c.id}</td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-500">{c.address}</p>
                      </td>
                      <td className="p-3.5 font-bold text-blue-600">{c.mobile}</td>
                      <td className="p-3.5 text-right font-medium text-slate-700">{formatCurrency(c.totalPurchase)}</td>
                      <td className="p-3.5 text-right font-medium text-emerald-700">{formatCurrency(c.totalPaid)}</td>
                      <td className="p-3.5 text-right font-extrabold text-rose-600 text-sm">{formatCurrency(c.currentDue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
