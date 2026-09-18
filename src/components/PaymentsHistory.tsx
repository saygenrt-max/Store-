import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  Printer, 
  Receipt, 
  Trash2, 
  FileSpreadsheet, 
  Calendar 
} from 'lucide-react';
import { Payment } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';
import { exportToExcelCSV } from '../utils/excelExport';

interface PaymentsHistoryProps {
  payments: Payment[];
  onViewReceipt: (payment: Payment) => void;
  onOpenAddPayment: () => void;
  onDeletePayment: (id: string) => void;
}

export const PaymentsHistory: React.FC<PaymentsHistoryProps> = ({
  payments,
  onViewReceipt,
  onOpenAddPayment,
  onDeletePayment
}) => {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredPayments = useMemo(() => {
    return payments.filter(pay => {
      const matchSearch =
        pay.id.toLowerCase().includes(search.toLowerCase()) ||
        pay.customerName.toLowerCase().includes(search.toLowerCase()) ||
        pay.customerMobile.includes(search);

      if (!matchSearch) return false;
      if (dateFilter && pay.paymentDate !== dateFilter) return false;
      if (methodFilter !== 'all' && pay.paymentMethod !== methodFilter) return false;

      return true;
    });
  }, [payments, search, dateFilter, methodFilter]);

  const totalCollectedSum = useMemo(() => {
    return filteredPayments.reduce((acc, p) => acc + p.paidAmount, 0);
  }, [filteredPayments]);

  const handleExportExcel = () => {
    const headers = ['রসিদ নং', 'গ্রাহকের নাম', 'মোবাইল', 'তারিখ ও সময়', 'মাধ্যম', 'পূর্বের বাকি (৳)', 'জমা দেওয়া টাকা (৳)', 'অবশিষ্ট বাকি (৳)', 'নোট'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.customerName,
      p.customerMobile,
      `${formatDateBn(p.paymentDate)} ${p.paymentTime}`,
      p.paymentMethod,
      p.previousDue,
      p.paidAmount,
      p.remainingDue,
      p.notes || ''
    ]);
    exportToExcelCSV('Payment_Receipts_PSM', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard size={22} className="text-emerald-600" />
            <span>টাকা জমা ও পেমেন্ট হিস্ট্রি (Payment Collections)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            বকেয়া আদায়ের তারিখভিত্তিক তালিকা, মানি রসিদ ও কাস্টমার জমা ভাউচার।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">এক্সেল ডাউনলোড</span>
          </button>
          <button
            onClick={onOpenAddPayment}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Receipt size={16} />
            <span>+ টাকা জমা নিন</span>
          </button>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">মোট আদায়কৃত টাকা (নির্বাচিত)</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">{formatCurrency(totalCollectedSum)}</p>
        </div>
        <div className="text-right text-xs text-emerald-800 font-medium">
          মোট {filteredPayments.length} টি পেমেন্ট ট্রানজেকশন
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="রসিদ নং, গ্রাহকের নাম বা মোবাইল খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent outline-none text-slate-700 font-medium text-xs"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="text-rose-500 font-bold ml-1">✕</button>
            )}
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="all">সকল মাধ্যম (All)</option>
            <option value="Cash">Cash (ক্যাশ)</option>
            <option value="bKash">bKash (বিকাশ)</option>
            <option value="Nagad">Nagad (নগদ)</option>
            <option value="Rocket">Rocket (রকেট)</option>
            <option value="Bank">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">রসিদ নং</th>
                <th className="p-3.5">গ্রাহকের নাম ও মোবাইল</th>
                <th className="p-3.5">তারিখ ও সময়</th>
                <th className="p-3.5">মাধ্যম</th>
                <th className="p-3.5 text-right">আগের বাকি</th>
                <th className="p-3.5 text-right text-emerald-700">জমা দেওয়া টাকা</th>
                <th className="p-3.5 text-right">অবশিষ্ট বাকি</th>
                <th className="p-3.5 text-center">রসিদ প্রিন্ট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    কোনো টাকা জমার তথ্য নেই
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-emerald-800">
                      {pay.id}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{pay.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{pay.customerMobile}</p>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      <p>{formatDateBn(pay.paymentDate)}</p>
                      <p className="text-[10px] text-slate-400">{pay.paymentTime}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-600">
                      {formatCurrency(pay.previousDue)}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-emerald-700 text-sm">
                      +{formatCurrency(pay.paidAmount)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-rose-600">
                      {formatCurrency(pay.remainingDue)}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewReceipt(pay)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <Printer size={13} />
                          <span>রসিদ</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`আপনি কি রসিদ "${pay.id}" মুছে ফেলতে চান?`)) {
                              onDeletePayment(pay.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
