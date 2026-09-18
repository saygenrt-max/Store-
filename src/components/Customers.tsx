import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye, 
  FileSpreadsheet, 
  Receipt, 
  ShoppingCart,
  Phone,
  MapPin,
  Filter,
  X
} from 'lucide-react';
import { Customer } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';
import { exportToExcelCSV } from '../utils/excelExport';

interface CustomersProps {
  customers: Customer[];
  onAddCustomer: (custData: any) => void;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
  onSelectCustomer: (customer: Customer) => void;
  onOpenNewSaleForCustomer: (customer: Customer) => void;
  onOpenAddPaymentForCustomer: (customer: Customer) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const Customers: React.FC<CustomersProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onSelectCustomer,
  onOpenNewSaleForCustomer,
  onOpenAddPaymentForCustomer,
  isAddModalOpen,
  setIsAddModalOpen
}) => {
  const [search, setSearch] = useState('');
  const [filterDue, setFilterDue] = useState<'all' | 'due' | 'paid'>('all');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    mobile: '',
    altMobile: '',
    address: '',
    areaVillage: '',
    openingBalance: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      fatherName: '',
      mobile: '',
      altMobile: '',
      address: '',
      areaVillage: '',
      openingBalance: '',
      notes: ''
    });
    setEditingCustomer(null);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      fatherName: c.fatherName || '',
      mobile: c.mobile,
      altMobile: c.altMobile || '',
      address: c.address,
      areaVillage: c.areaVillage || '',
      openingBalance: String(c.openingBalance || 0),
      notes: c.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim() || !formData.address.trim()) {
      alert('অনুগ্রহ করে নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করুন।');
      return;
    }

    if (editingCustomer) {
      onUpdateCustomer(editingCustomer.id, {
        name: formData.name,
        fatherName: formData.fatherName,
        mobile: formData.mobile,
        altMobile: formData.altMobile,
        address: formData.address,
        areaVillage: formData.areaVillage,
        openingBalance: Number(formData.openingBalance) || 0,
        notes: formData.notes
      });
    } else {
      onAddCustomer({
        name: formData.name,
        fatherName: formData.fatherName,
        mobile: formData.mobile,
        altMobile: formData.altMobile,
        address: formData.address,
        areaVillage: formData.areaVillage,
        openingBalance: Number(formData.openingBalance) || 0,
        notes: formData.notes
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.includes(search) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        (c.areaVillage && c.areaVillage.toLowerCase().includes(search.toLowerCase())) ||
        c.address.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filterDue === 'due') return c.currentDue > 0;
      if (filterDue === 'paid') return c.currentDue <= 0;
      return true;
    });
  }, [customers, search, filterDue]);

  const handleExportExcel = () => {
    const headers = ['কাস্টমার আইডি', 'নাম', 'পিতার নাম', 'মোবাইল', 'বিকল্প মোবাইল', 'ঠিকানা', 'এলাকা/গ্রাম', 'প্রারম্ভিক জের', 'মোট ক্রয়', 'মোট পরিশোধ', 'বর্তমান বাকি'];
    const rows = filteredCustomers.map(c => [
      c.id,
      c.name,
      c.fatherName || '',
      c.mobile,
      c.altMobile || '',
      c.address,
      c.areaVillage || '',
      c.openingBalance,
      c.totalPurchase,
      c.totalPaid,
      c.currentDue
    ]);
    exportToExcelCSV('Customer_Directory_PSM', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-blue-600" />
            <span>গ্রাহক ব্যবস্থাপনা ও হিসাব খাতা</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            আনলিমিটেড গ্রাহক নিবন্ধন, যোগাযোগের তথ্য, ক্রয়-বিক্রয় ও বাকি লেনদেনের পূর্ণাঙ্গ রেকর্ড।
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
            id="add-new-customer-main-btn"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <UserPlus size={16} />
            <span>+ নতুন গ্রাহক যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            id="customer-table-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, মোবাইল, আইডি বা গ্রাম খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">ফিল্টার:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterDue('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filterDue === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              সকল ({customers.length})
            </button>
            <button
              onClick={() => setFilterDue('due')}
              className={`px-3 py-1 rounded-lg transition ${
                filterDue === 'due' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              বকেয়া আছে ({customers.filter(c => c.currentDue > 0).length})
            </button>
            <button
              onClick={() => setFilterDue('paid')}
              className={`px-3 py-1 rounded-lg transition ${
                filterDue === 'paid' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              পরিশোধিত ({customers.filter(c => c.currentDue <= 0).length})
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">গ্রাহক আইডি</th>
                <th className="p-3.5">নাম ও ঠিকানা</th>
                <th className="p-3.5">মোবাইল</th>
                <th className="p-3.5 text-right">মোট ক্রয়</th>
                <th className="p-3.5 text-right">মোট পরিশোধ</th>
                <th className="p-3.5 text-right">বর্তমান বাকি</th>
                <th className="p-3.5 text-center">অবস্থা</th>
                <th className="p-3.5 text-center">পদক্ষেপ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    কোনো গ্রাহক পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-700">
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
                    <td className="p-3.5 font-medium text-slate-700">
                      <p className="flex items-center gap-1">
                        <Phone size={12} className="text-emerald-600" />
                        <span>{customer.mobile}</span>
                      </p>
                      {customer.altMobile && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{customer.altMobile}</p>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-slate-900">
                      {formatCurrency(customer.totalPurchase)}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-emerald-700">
                      {formatCurrency(customer.totalPaid)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-rose-600">
                      {formatCurrency(customer.currentDue)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        customer.currentDue <= 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {customer.currentDue <= 0 ? 'PAID' : 'DUE'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectCustomer(customer)}
                          title="সম্পূর্ণ খতিয়ান ও হিসাব দেখুন"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => onOpenNewSaleForCustomer(customer)}
                          title="নতুন বিক্রি চালান"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <ShoppingCart size={15} />
                        </button>
                        <button
                          onClick={() => onOpenAddPaymentForCustomer(customer)}
                          title="টাকা জমা নিন"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Receipt size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(customer)}
                          title="এডিট করুন"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`আপনি কি সত্যিই "${customer.name}" কে মুছে ফেলতে চান?`)) {
                              onDeleteCustomer(customer.id);
                            }
                          }}
                          title="মুছে ফেলুন"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
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

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingCustomer ? 'গ্রাহকের তথ্য পরিবর্তন করুন' : 'নতুন গ্রাহক যুক্ত করুন'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    গ্রাহকের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: হাজী আব্দুল করিম"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    পিতার নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="যেমন: মৃত মোজাম্মেল হক"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="01712-XXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    বিকল্প মোবাইল (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formData.altMobile}
                    onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
                    placeholder="01812-XXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    এলাকা / গ্রাম
                  </label>
                  <input
                    type="text"
                    value={formData.areaVillage}
                    onChange={(e) => setFormData({ ...formData, areaVillage: e.target.value })}
                    placeholder="যেমন: দক্ষিণ পাড়া / বাজার মোড়"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    প্রারম্ভিক বকেয়া (Opening Due) ৳
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                    placeholder="পূর্বের বাকি থাকলে লিখুন"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  পূর্ণাঙ্গ ঠিকানা <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="বাড়ি নং, রাস্তা, এলাকার বিস্তারিত বিবরণ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  নোট বা মন্তব্য (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="যেমন: বিল্ডিং কন্ট্রাক্টর, বিশ্বস্ত খরিদ্দার"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition"
                >
                  {editingCustomer ? 'হালনাগাদ করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
