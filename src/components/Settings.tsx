import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Store, 
  Save, 
  RotateCcw, 
  Upload, 
  Database, 
  Server, 
  FileCode, 
  Copy, 
  Check, 
  Download,
  AlertCircle
} from 'lucide-react';
import { ShopSettings } from '../types';
import { resetToSampleData } from '../utils/storage';
import { PHP_FILES_SOURCE, MYSQL_SCHEMA_SQL } from '../data/phpSourceCode';

interface SettingsProps {
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => void;
  onResetData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onSaveSettings,
  onResetData
}) => {
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'php-backend' | 'database'>('shop');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyCode = (filename: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([MYSQL_SCHEMA_SQL], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'database_schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon size={22} className="text-blue-600" />
            <span>সিস্টেম ও দোকান সেটিংস (Shop & System Settings)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            দোকানের নাম, লোগো, যোগাযোগের ঠিকানা, মেমো হেডার ও PHP/MySQL ব্যাকএন্ড কনফিগারেশন।
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'shop' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            দোকানের প্রোফাইল
          </button>
          <button
            onClick={() => setActiveTab('php-backend')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'php-backend' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            PHP & MySQL কোড
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'database' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            ডাটা ব্যাকআপ ও রিসেট
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check size={16} className="text-emerald-600" />
          <span>দোকানের সকল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {/* 1. SHOP PROFILE SETTINGS */}
      {activeTab === 'shop' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  দোকানের নাম (Shop Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  প্রধান মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  বিকল্প মোবাইল নম্বর (Optional)
                </label>
                <input
                  type="text"
                  value={formData.altMobile}
                  onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  দোকানের ইমেইল (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                দোকানের পূর্ণাঙ্গ ঠিকানা <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.shopAddress}
                onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Logo Settings */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <Store size={28} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <span className="font-bold text-slate-800">দোকানের লোগো (Shop Logo)</span>
                <p className="text-[11px] text-slate-500">
                  চালান এবং রসিদে প্রিন্ট করার জন্য আপনার দোকানের লোগো আপলোড করুন।
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Invoice Custom Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  চালানের হেডার স্লোগান
                </label>
                <input
                  type="text"
                  value={formData.invoiceHeader}
                  onChange={(e) => setFormData({ ...formData, invoiceHeader: e.target.value })}
                  placeholder="যেমন: হার্ডওয়্যার, পাইপ ও ইলেকট্রিক্যাল সামগ্রী"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  চালানের ফুটার বার্তা (ধন্যবাদ বার্তা)
                </label>
                <input
                  type="text"
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  placeholder="যেমন: ধন্যবাদ, আবার আসবেন।"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Save size={16} />
                <span>সেটিংস সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. PHP BACKEND & MYSQL ARCHITECTURE */}
      {activeTab === 'php-backend' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Server size={18} className="text-indigo-600" />
                <span>PHP (XAMPP / cPanel) ও MySQL স্ক্রিপ্ট সংগ্রহশালা</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার Apache/Nginx সার্ভার ও cPanel-এ রান করার জন্য সম্পূর্ণ প্রডাকশন-রেডি PHP ফাইল ও MySQL টেবিল স্কিমা।
              </p>
            </div>

            <button
              onClick={handleDownloadSQL}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Download size={14} />
              <span>database_schema.sql ডাউনলোড</span>
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(PHP_FILES_SOURCE).map(([filename, code]) => (
              <div key={filename} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-amber-400">{filename}</span>
                  <button
                    onClick={() => handleCopyCode(filename, code)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition"
                  >
                    {copiedFile === filename ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>কোড কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                  {code}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DATABASE BACKUP & RESET */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database size={18} className="text-blue-600" />
              <span>ডাটাবেজ ব্যাকআপ ও ফ্যাক্টরি রিসেট</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              সিস্টেমের ব্রাউজার লোকাল স্টোরেজ ডাটা ব্যাকআপ সংরক্ষণ এবং প্রাথমিক ডেমো ডাটায় ফিরিয়ে নেওয়ার সুবিধা।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 text-xs block">JSON ব্যাকআপ ফাইল সংরক্ষণ</span>
              <p className="text-xs text-slate-600">
                সকল কাস্টমার, স্টক মাল, সেলস ও পেমেন্ট রসিদ এক ক্লিকে JSON আকারে ডাউনলোড করে সংরক্ষণ করতে পারেন।
              </p>
              <button
                onClick={() => {
                  const backup = {
                    customers: JSON.parse(localStorage.getItem('psm_customers') || '[]'),
                    products: JSON.parse(localStorage.getItem('psm_products') || '[]'),
                    sales: JSON.parse(localStorage.getItem('psm_sales') || '[]'),
                    payments: JSON.parse(localStorage.getItem('psm_payments') || '[]'),
                    settings: JSON.parse(localStorage.getItem('psm_settings') || '{}')
                  };
                  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `PSM_Backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download size={14} />
                <span>JSON ব্যাকআপ ডাউনলোড</span>
              </button>
            </div>

            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-3">
              <span className="font-bold text-rose-800 text-xs block flex items-center gap-1.5">
                <AlertCircle size={15} />
                <span>ফ্যাক্টরি রিসেট (নমুনা ডাটায় পুনঃস্থাপন)</span>
              </span>
              <p className="text-xs text-rose-700">
                পরীক্ষামূলক ডাটা মুছে ফেলে প্রাথমিক হার্ডওয়্যার, পাইপ ও ইলেকট্রিক্যাল নমুনা পণ্য ও কাস্টমার দিয়ে রিসেট করুন।
              </p>
              <button
                onClick={() => {
                  if (window.confirm('আপনি কি সত্যিই প্রাথমিক ডেমো ডাটায় রিসেট করতে চান? আপনার তৈরি সকল ডাটা রিসেট হবে।')) {
                    resetToSampleData();
                    onResetData();
                    alert('সফলভাবে প্রাথমিক ডাটায় রিসেট সম্পন্ন হয়েছে।');
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <RotateCcw size={14} />
                <span>প্রাথমিক ডাটায় রিসেট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
