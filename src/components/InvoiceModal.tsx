import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Store, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Phone, 
  MapPin,
  Share2
} from 'lucide-react';
import { Sale, ShopSettings } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';

interface InvoiceModalProps {
  sale: Sale | null;
  onClose: () => void;
  settings: ShopSettings;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  sale,
  onClose,
  settings
}) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Action Bar (Hidden in Print) */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">চালান / মেমো</span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded font-mono">{sale.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={15} />
              <span>A4 প্রিন্ট / PDF সংরক্ষণ</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body (Designed strictly for A4 standards) */}
        <div 
          id="printable-invoice-content"
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-slate-900"
        >
          {/* Shop Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-5 gap-4">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="Shop Logo" 
                  className="w-14 h-14 object-contain rounded-lg border border-slate-200" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Store size={26} />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
                  {settings.shopName || "Personal Store Management"}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {settings.invoiceHeader || "হার্ডওয়্যার, পিভিসি পাইপ, ইলেকট্রিক্যাল ও নির্মাণসামগ্রী বিক্রয় কেন্দ্র"}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} />
                  <span>{settings.shopAddress}</span>
                </p>
                <p className="text-xs text-slate-700 font-semibold flex items-center gap-2 mt-0.5">
                  <span>মোবাইল: {settings.mobileNumber}</span>
                  {settings.altMobile && <span>• {settings.altMobile}</span>}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto border sm:border-0 border-slate-200">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase rounded-md tracking-wider mb-1">
                বিক্রয় চালান / INVOICE
              </div>
              <p className="text-sm font-mono font-bold text-blue-700">{sale.id}</p>
              <p className="text-xs text-slate-600 mt-1">
                তারিখ: <strong>{formatDateBn(sale.date)}</strong>
              </p>
              <p className="text-xs text-slate-500">
                সময়: {sale.time} (Dhaka Time)
              </p>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="my-5 p-4 bg-slate-50/80 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">ক্রেতার তথ্য (Customer Info):</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{sale.customerName}</p>
              <p className="text-slate-600 mt-0.5">মোবাইল: <strong className="text-slate-800">{sale.customerMobile}</strong></p>
              <p className="text-slate-600 mt-0.5">ঠিকানা: {sale.customerAddress}</p>
            </div>
            <div className="sm:text-right flex flex-col justify-between">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">পেমেন্ট অবস্থা (Status):</span>
                <div className="mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    sale.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : sale.status === 'PARTIAL'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {sale.status === 'PAID' ? 'পরিশোধিত (PAID)' : sale.status === 'PARTIAL' ? 'আংশিক জমা (PARTIAL)' : 'সম্পূর্ণ বাকি (DUE)'}
                  </span>
                </div>
              </div>
              {sale.notes && (
                <p className="text-[11px] text-slate-500 italic mt-1">নোট: {sale.notes}</p>
              )}
            </div>
          </div>

          {/* Product Items Table */}
          <div className="overflow-x-auto my-4">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="border border-slate-300 p-2.5 w-10 text-center">#</th>
                  <th className="border border-slate-300 p-2.5">পণ্যের বিবরণ (Product Description)</th>
                  <th className="border border-slate-300 p-2.5 text-center w-24">পরিমাণ (Qty)</th>
                  <th className="border border-slate-300 p-2.5 text-center w-20">একক</th>
                  <th className="border border-slate-300 p-2.5 text-right w-28">একক দর (Rate)</th>
                  <th className="border border-slate-300 p-2.5 text-right w-32">মোট টাকা (Total)</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2.5 text-center text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="border border-slate-300 p-2.5 font-bold text-slate-900">{item.productName}</td>
                    <td className="border border-slate-300 p-2.5 text-center font-bold">{item.quantity}</td>
                    <td className="border border-slate-300 p-2.5 text-center text-slate-600">{item.unit}</td>
                    <td className="border border-slate-300 p-2.5 text-right font-medium">{formatCurrency(item.unitPrice)}</td>
                    <td className="border border-slate-300 p-2.5 text-right font-bold text-slate-900">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Summary Table */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 my-6">
            <div className="w-full sm:w-1/2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">বকেয়ার হিসাব সারাংশ:</p>
              <p>পূর্বের বকেয়া ছিল: <strong className="text-slate-800">{formatCurrency(sale.previousDue)}</strong></p>
              <p>বর্তমান বিক্রয়ের বাকি: <strong className="text-rose-600">{formatCurrency(sale.dueAmount)}</strong></p>
              <p className="font-bold text-rose-700 border-t border-slate-200 pt-1">
                গ্রাহকের বর্তমান সর্বমোট পাওনা: {formatCurrency(sale.newCustomerDue)}
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>পণ্যসমূহের মূল্য (Subtotal):</span>
                <span className="text-slate-900">{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>ছাড় (Discount):</span>
                <span className="text-slate-900">-{formatCurrency(sale.discount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b-2 border-slate-900 text-sm font-bold text-slate-900">
                <span>সর্বমোট বিল (Grand Total):</span>
                <span className="text-base text-blue-700">{formatCurrency(sale.grandTotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                <span>নগদ আদায় (Paid Amount):</span>
                <span className="font-bold">{formatCurrency(sale.paidAmount)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm font-extrabold text-rose-600 bg-rose-50 px-2 rounded-lg">
                <span>বকেয়া (Due Amount):</span>
                <span>{formatCurrency(sale.dueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Signature lines */}
          <div className="mt-14 pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
            <div className="text-center w-40">
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                ক্রেতার স্বাক্ষর
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 max-w-xs">
              <p>{settings.footerText || "ধন্যবাদ, আবার আসবেন।"}</p>
              <p className="mt-0.5">{settings.invoiceFooter || "কম্পিউটার জেনারেটেড চালান।"}</p>
            </div>

            <div className="text-center w-44">
              <div className="border-t border-slate-900 pt-1 font-bold text-slate-900">
                দোকান মালিক / কর্তৃপক্ষের স্বাক্ষর
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
