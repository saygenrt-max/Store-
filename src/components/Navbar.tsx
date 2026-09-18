import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Menu, 
  X, 
  PlusCircle, 
  ReceiptText, 
  UserPlus, 
  Clock, 
  Search, 
  AlertCircle 
} from 'lucide-react';
import { ShopSettings, Customer } from '../types';
import { getCurrentDhakaDateTime } from '../utils/formatters';

interface NavbarProps {
  settings: ShopSettings;
  customers: Customer[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenNewSale: () => void;
  onOpenAddPayment: () => void;
  onOpenAddCustomer: () => void;
  onSelectCustomer: (cust: Customer) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  customers,
  sidebarOpen,
  setSidebarOpen,
  onOpenNewSale,
  onOpenAddPayment,
  onOpenAddCustomer,
  onSelectCustomer,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const { full } = getCurrentDhakaDateTime();
      setTimeStr(full);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const qLower = q.toLowerCase();
    const matches = customers.filter(c => 
      c.name.toLowerCase().includes(qLower) ||
      c.mobile.includes(q) ||
      c.id.toLowerCase().includes(qLower) ||
      (c.areaVillage && c.areaVillage.toLowerCase().includes(qLower))
    );
    setSearchResults(matches);
    setShowSearchResults(true);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-200">
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {settings.shopName || "Personal Store Management"}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                হার্ডওয়্যার, ইলেকট্রিক্যাল ও নির্মাণসামগ্রী দোকান
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Customer Search */}
        <div className="relative flex-1 max-w-md mx-2 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              id="global-customer-search-input"
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              placeholder="গ্রাহকের নাম, মোবাইল বা আইডি খুঁজুন..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchResults && (
            <div 
              id="customer-search-results-dropdown"
              className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 max-h-80 overflow-y-auto z-50 p-1 divide-y divide-slate-100"
            >
              <div className="p-2 text-xs font-semibold text-slate-400 flex justify-between items-center">
                <span>অনুসন্ধানের ফলাফল ({searchResults.length})</span>
                <button 
                  onClick={() => setShowSearchResults(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  বন্ধ করুন
                </button>
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  কোনো গ্রাহক পাওয়া যায়নি
                </div>
              ) : (
                searchResults.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCustomer(c);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 hover:bg-blue-50/70 rounded-lg flex items-center justify-between transition group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.mobile} • {c.id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        c.currentDue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        বাকি: ৳{c.currentDue.toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Quick POS Actions & Dhaka Clock */}
        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
            <Clock size={14} className="text-blue-600" />
            <span>{timeStr || 'Asia/Dhaka'}</span>
          </div>

          <button
            id="quick-add-customer-btn"
            onClick={onOpenAddCustomer}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
            title="নতুন গ্রাহক যুক্ত করুন"
          >
            <UserPlus size={16} className="text-slate-600" />
            <span className="hidden sm:inline">+ গ্রাহক</span>
          </button>

          <button
            id="quick-add-payment-btn"
            onClick={onOpenAddPayment}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            title="টাকা জমা নিন"
          >
            <ReceiptText size={16} className="text-emerald-600" />
            <span>টাকা জমা</span>
          </button>

          <button
            id="quick-new-sale-btn"
            onClick={onOpenNewSale}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-1.5 shadow-sm shadow-blue-200"
          >
            <PlusCircle size={16} />
            <span>+ নতুন বিক্রি</span>
          </button>
        </div>
      </div>
    </header>
  );
};
