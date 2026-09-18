import React, { useState, useMemo } from 'react';
import { 
  BadgeAlert, 
  Search, 
  Phone, 
  Printer, 
  FileSpreadsheet, 
  CreditCard, 
  Eye, 
  MapPin, 
  ArrowUpDown,
  ShoppingBag
} from 'lucide-react';
import { Customer } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';
import { exportToExcelCSV } from '../utils/excelExport';

interface DueManagementProps {
  customers: Customer[];
  onOpenAddPaymentForCustomer: (customer: Customer) => void;
  onSelectCustomer: (customer: Customer) => void;
  onOpenNewSaleForCustomer: (customer: Customer) => void;
  shopName: string;
}

export const DueManagement: React.FC<DueManagementProps> = ({
  customers,
  onOpenAddPaymentForCustomer,
  onSelectCustomer,
  onOpenNewSaleForCustomer,
  shopName
}) => {
  const [search, setSearch] = useState('');
  const [minDue, setMinDue] = useState<string>('');
  const [sortBy, setSortBy] = useState<'due-desc' | 'due-asc' | 'name'>('due-desc');

  // Filter only customers with due > 0
  const dueCustomers = useMemo(() => {
    return customers.filter(c => c.currentDue > 0);
  }, [customers]);

  const filtered = useMemo(() => {
    return dueCustomers
      .filter(c => {
        const match =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.mobile.includes(search) ||
          c.id.toLowerCase().includes(search.toLowerCase()) ||
          (c.areaVillage && c.areaVillage.toLowerCase().includes(search.toLowerCase()));

        if (!match) return false;
        if (minDue && c.currentDue < parseFloat(minDue)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'due-desc') return b.currentDue - a.currentDue;
        if (sortBy === 'due-asc') return a.currentDue - b.currentDue;
        return a.name.localeCompare(b.name);
      });
  }, [dueCustomers, search, minDue, sortBy]);

  const totalStoreDue = useMemo(() => {
    return dueCustomers.reduce((acc, c) => acc + c.currentDue, 0);
  }, [dueCustomers]);

  const handleExportExcel = () => {
    const headers = ['কাস্টমার আইডি', 'নাম', 'মোবাইল নম্বর', 'ঠিকানা', 'মোট কেনাকাটা (৳)', 'মোট পরিশোধ (৳)', 'বর্তমান বাকি (৳)'];
    const rows = filtered.map(c => [
      c.id,
      c.name,
      c.mobile,
      `${c.areaVillage ? c.areaVillage + ', ' : ''}${c.address}`,
      c.totalPurchase,
      c.totalPaid,
      c.currentDue
    ]);
    exportToExcelCSV('Customer_Due_List_PSM', headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Title Header */}
      <div className="hidden print-only mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">{shopName}</h1>
        <h2 className="text-base font-semibold text-slate-700">দোকানের সামগ্রিক বকেয়া ও পাওনা খাতা তালিকা</h2>
        <p className="text-xs text-slate-500 mt-1">
          তারিখ: {new Date().toLocaleDateString('bn-BD')} • মোট বকেয়া: {formatCurrency(totalStoreDue)}
        </p>
      </div>

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BadgeAlert size={22} className="text-rose-600" />
            <span>বাকি / পাওনা খাতা ব্যবস্থাপনা (Due List)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            যে সকল গ্রাহকের কাছে দোকানের টাকা বকেয়া রয়েছে তাদের স্বয়ংক্রিয় হিসাব ও তাগাদা তালিকা।
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
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer size={16} />
            <span>বাকি খাতা প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Big Due Alert Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
            দোকানের মোট বকেয়া পাওনা (Total Outstanding Due)
          </span>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">
            {formatCurrency(totalStoreDue)}
          </p>
          <p className="text-xs text-rose-700 mt-1 font-medium">
            মোট <strong>{dueCustomers.length} জন</strong> গ্রাহকের কাছে এই টাকা বকেয়া রয়েছে।
          </p>
        </div>

        <div className="text-xs bg-white/80 p-3 rounded-xl border border-rose-200 text-slate-700 max-w-xs space-y-1">
          <p>💡 <strong>পরামর্শ:</strong> গ্রাহকের নামের পাশে থাকা কল বাটনে চাপ দিয়ে সরাসরি ফোন করতে পারেন অথবা সরাসরি জমা নিতে পারেন।</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between no-print">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="বকেয়া গ্রাহকের নাম, মোবাইল বা এলাকা খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-rose-500 outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">নূন্যতম বাকি:</span>
            <input
              type="number"
              value={minDue}
              onChange={(e) => setMinDue(e.target.value)}
              placeholder="যেমন: 5000"
              className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-bold outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">সাজান:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
            >
              <option value="due-desc">বাকি বেশি থেকে কম</option>
              <option value="due-asc">বাকি কম থেকে বেশি</option>
              <option value="name">নাম অনুসারে (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Due Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">আইডি</th>
                <th className="p-3.5">গ্রাহকের নাম ও ঠিকানা</th>
                <th className="p-3.5">মোবাইল</th>
                <th className="p-3.5 text-right">মোট কেনাকাটা</th>
                <th className="p-3.5 text-right">মোট পরিশোধ</th>
                <th className="p-3.5 text-right text-rose-700">বর্তমান বকেয়া পাওনা</th>
                <th className="p-3.5 text-center no-print">তাগাদা ও পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    কোনো বকেয়া হিসাব পাওয়া যায়নি!
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-600">
                      {customer.id}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => onSelectCustomer(customer)}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left transition"
                      >
                        {customer.name}
                      </button>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{customer.areaVillage ? `${customer.areaVillage}, ` : ''}{customer.address}</span>
                      </p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-700">
                      <a 
                        href={`tel:${customer.mobile}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        title="সরাসরি কল দিন"
                      >
                        <Phone size={12} className="text-emerald-600" />
                        <span>{customer.mobile}</span>
                      </a>
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(customer.totalPurchase)}
                    </td>
                    <td className="p-3.5 text-right font-medium text-emerald-700">
                      {formatCurrency(customer.totalPaid)}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-rose-600 text-sm">
                      {formatCurrency(customer.currentDue)}
                    </td>
                    <td className="p-3.5 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={`tel:${customer.mobile}`}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold flex items-center gap-1 transition"
                          title="মোবাইলে কল করুন"
                        >
                          <Phone size={12} />
                          <span>কল দিন</span>
                        </a>
                        <button
                          onClick={() => onOpenAddPaymentForCustomer(customer)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 transition shadow-xs"
                          title="টাকা জমা নিন"
                        >
                          <CreditCard size={12} />
                          <span>টাকা জমা</span>
                        </button>
                        <button
                          onClick={() => onSelectCustomer(customer)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          title="খতিয়ান খাতা দেখুন"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-slate-100/90 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={3} className="p-3.5 text-right">তালিকার সর্বমোট বকেয়া:</td>
                  <td className="p-3.5 text-right text-slate-900">
                    {formatCurrency(filtered.reduce((a, b) => a + b.totalPurchase, 0))}
                  </td>
                  <td className="p-3.5 text-right text-emerald-700">
                    {formatCurrency(filtered.reduce((a, b) => a + b.totalPaid, 0))}
                  </td>
                  <td className="p-3.5 text-right text-rose-600 font-extrabold text-sm">
                    {formatCurrency(filtered.reduce((a, b) => a + b.currentDue, 0))}
                  </td>
                  <td className="p-3.5 no-print"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
