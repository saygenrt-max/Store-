import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Printer, 
  Eye, 
  Trash2, 
  FileSpreadsheet, 
  Calendar, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { Sale } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';
import { exportToExcelCSV } from '../utils/excelExport';

interface SalesHistoryProps {
  sales: Sale[];
  onViewInvoice: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onOpenNewSale: () => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  sales,
  onViewInvoice,
  onDeleteSale,
  onOpenNewSale
}) => {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PAID' | 'PARTIAL' | 'DUE'>('all');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchSearch =
        sale.id.toLowerCase().includes(search.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(search.toLowerCase()) ||
        sale.customerMobile.includes(search);

      if (!matchSearch) return false;
      if (dateFilter && sale.date !== dateFilter) return false;
      if (statusFilter !== 'all' && sale.status !== statusFilter) return false;

      return true;
    });
  }, [sales, search, dateFilter, statusFilter]);

  const totalSalesSum = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  }, [filteredSales]);

  const totalPaidSum = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.paidAmount, 0);
  }, [filteredSales]);

  const totalDueSum = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.dueAmount, 0);
  }, [filteredSales]);

  const handleExportExcel = () => {
    const headers = ['চালান নং', 'গ্রাহকের নাম', 'মোবাইল', 'তারিখ', 'মোট আইটেম', 'সাবটোটাল (৳)', 'ছাড় (৳)', 'সর্বমোট (৳)', 'নগদ জমা (৳)', 'বাকি (৳)', 'অবস্থা'];
    const rows = filteredSales.map(s => [
      s.id,
      s.customerName,
      s.customerMobile,
      `${formatDateBn(s.date)} ${s.time}`,
      s.items.length,
      s.subtotal,
      s.discount,
      s.grandTotal,
      s.paidAmount,
      s.dueAmount,
      s.status
    ]);
    exportToExcelCSV('Sales_History_PSM', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History size={22} className="text-blue-600" />
            <span>বিক্রয় ইতিহাস ও চালান মেমো (Sales History)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            দোকানের সমস্ত পূর্ববর্তী বিক্রয় মেমো, চালানের বিবরণ, আদায় ও বকেয়ার সম্পূর্ণ হিসাব।
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
            onClick={onOpenNewSale}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <ShoppingBag size={16} />
            <span>+ নতুন বিক্রি</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip for Current Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">নির্বাচিত বিক্রয় সর্বমোট:</span>
          <p className="text-lg font-bold text-blue-700 mt-0.5">{formatCurrency(totalSalesSum)}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">মোট নগদ আদায়:</span>
          <p className="text-lg font-bold text-emerald-700 mt-0.5">{formatCurrency(totalPaidSum)}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">মোট বাকি টাকা:</span>
          <p className="text-lg font-bold text-rose-600 mt-0.5">{formatCurrency(totalDueSum)}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="চালান নং, গ্রাহকের নাম বা মোবাইল খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none transition"
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

          <div className="flex bg-slate-100 p-1 rounded-xl font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              সব ({sales.length})
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'PAID' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              পরিশোধিত
            </button>
            <button
              onClick={() => setStatusFilter('PARTIAL')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'PARTIAL' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              আংশিক
            </button>
            <button
              onClick={() => setStatusFilter('DUE')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'DUE' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              বাকি
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">চালান নং</th>
                <th className="p-3.5">গ্রাহকের নাম ও মোবাইল</th>
                <th className="p-3.5">তারিখ ও সময়</th>
                <th className="p-3.5 text-center">আইটেম</th>
                <th className="p-3.5 text-right">সর্বমোট বিল</th>
                <th className="p-3.5 text-right">নগদ জমা</th>
                <th className="p-3.5 text-right">বকেয়া</th>
                <th className="p-3.5 text-center">অবস্থা</th>
                <th className="p-3.5 text-center">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    কোনো বিক্রয়ের চালান পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-700">
                      {sale.id}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{sale.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{sale.customerMobile}</p>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      <p>{formatDateBn(sale.date)}</p>
                      <p className="text-[10px] text-slate-400">{sale.time}</p>
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-700">
                      {sale.items.length} টি
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      {formatCurrency(sale.grandTotal)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-700">
                      {formatCurrency(sale.paidAmount)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-rose-600">
                      {formatCurrency(sale.dueAmount)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        sale.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sale.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sale.status === 'PAID' ? 'পরিশোধ' : sale.status === 'PARTIAL' ? 'আংশিক' : 'বাকি'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold flex items-center gap-1 transition"
                          title="চালান দেখুন ও প্রিন্ট করুন"
                        >
                          <Printer size={13} />
                          <span>চালান</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`আপনি কি চালান "${sale.id}" মুছে ফেলতে চান?`)) {
                              onDeleteSale(sale.id);
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
