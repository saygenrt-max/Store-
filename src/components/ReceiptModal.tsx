import React from 'react';
import { 
  X, 
  Printer, 
  Store, 
  CheckCircle2, 
  Phone, 
  MapPin 
} from 'lucide-react';
import { Payment, ShopSettings } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';

interface ReceiptModalProps {
  payment: Payment | null;
  onClose: () => void;
  settings: ShopSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  onClose,
  settings
}) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Action Header */}
        <div className="p-3 bg-emerald-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">টাকা জমার রসিদ</span>
            <span className="text-xs bg-emerald-800 px-2 py-0.5 rounded font-mono">{payment.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={15} />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="text-emerald-300 hover:text-white p-1 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Money Receipt Content */}
        <div 
          id="printable-receipt-content"
          className="p-6 sm:p-8 bg-white text-slate-900 flex-1 overflow-y-auto"
        >
          {/* Shop Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                <Store size={18} />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 uppercase">
                {settings.shopName || "Personal Store Management"}
              </h1>
            </div>
            <p className="text-xs text-slate-600">{settings.shopAddress}</p>
            <p className="text-xs text-slate-700 font-semibold">মোবাইল: {settings.mobileNumber}</p>
            
            <div className="inline-block mt-3 px-4 py-1 bg-emerald-700 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              টাকা জমার রসিদ / MONEY RECEIPT
            </div>
          </div>

          {/* Receipt Info Ribbon */}
          <div className="my-4 flex justify-between items-center text-xs text-slate-600 border-b border-slate-200 pb-2">
            <div>
              <span>রসিদ নং: </span>
              <strong className="font-mono text-emerald-800 font-bold">{payment.id}</strong>
            </div>
            <div>
              <span>তারিখ ও সময়: </span>
              <strong className="text-slate-900">{formatDateBn(payment.paymentDate)} {payment.paymentTime}</strong>
            </div>
          </div>

          {/* Customer & Due Details Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200/80">
              <span className="text-slate-500">গ্রাহকের নাম:</span>
              <span className="font-bold text-slate-900 text-sm">{payment.customerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/80">
              <span className="text-slate-500">মোবাইল নম্বর:</span>
              <span className="font-bold text-slate-800">{payment.customerMobile}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/80">
              <span className="text-slate-500">পেমেন্ট মাধ্যম (Method):</span>
              <span className="font-bold text-blue-700">{payment.paymentMethod}</span>
            </div>

            {payment.notes && (
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-500">নোট / বিবরণ:</span>
                <span className="text-slate-700">{payment.notes}</span>
              </div>
            )}

            {/* Financial Accounting breakdown */}
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>পূর্বের মোট বাকি (Previous Due):</span>
                <span className="font-bold">{formatCurrency(payment.previousDue)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-extrabold text-sm bg-emerald-100/60 p-2 rounded-lg">
                <span>আজকে আদায়কৃত নগদ টাকা (Paid Amount):</span>
                <span>{formatCurrency(payment.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold text-xs pt-1">
                <span>বর্তমান অবশিষ্ট বাকি (Remaining Due):</span>
                <span className="font-extrabold text-sm">{formatCurrency(payment.remainingDue)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-4 flex justify-between items-end text-xs">
            <div className="text-center w-36">
              <div className="border-t border-slate-400 pt-1 text-slate-600 font-medium">
                টাকা জমাকারীর স্বাক্ষর
              </div>
            </div>

            <div className="text-center w-40">
              <div className="border-t border-emerald-900 pt-1 font-bold text-slate-900">
                আদায়কারীর স্বাক্ষর / সিল
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
