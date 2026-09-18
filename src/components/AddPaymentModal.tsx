import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Receipt, 
  CheckCircle2, 
  CreditCard, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle 
} from 'lucide-react';
import { Customer, Payment } from '../types';
import { formatCurrency, getCurrentDhakaDateTime } from '../utils/formatters';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onCreatePayment: (paymentData: any) => Payment;
  onViewReceipt: (payment: Payment) => void;
  initialCustomer?: Customer | null;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  customers,
  onCreatePayment,
  onViewReceipt,
  initialCustomer
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Cheque'>('Cash');
  const [notes, setNotes] = useState<string>('');

  const { date: todayDate, time: todayTime } = getCurrentDhakaDateTime();
  const [paymentDate, setPaymentDate] = useState<string>(todayDate);
  const [paymentTime, setPaymentTime] = useState<string>(todayTime);

  useEffect(() => {
    if (initialCustomer) {
      setSelectedCustomerId(initialCustomer.id);
      if (initialCustomer.currentDue > 0) {
        setPaidAmount(initialCustomer.currentDue);
      }
    } else {
      // Find first customer with due, or first customer
      const firstDue = customers.find(c => c.currentDue > 0);
      if (firstDue) {
        setSelectedCustomerId(firstDue.id);
        setPaidAmount(firstDue.currentDue);
      } else if (customers.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(customers[0].id);
      }
    }
  }, [initialCustomer, customers]);

  const customer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const previousDue = customer ? customer.currentDue : 0;
  const remainingDue = Math.max(0, previousDue - (Number(paidAmount) || 0));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('অনুগ্রহ করে গ্রাহক নির্বাচন করুন।');
      return;
    }
    if (!paidAmount || paidAmount <= 0) {
      alert('অনুগ্রহ করে জমার টাকার পরিমাণ লিখুন।');
      return;
    }

    try {
      const createdPayment = onCreatePayment({
        customerId: selectedCustomerId,
        paidAmount: Number(paidAmount),
        paymentMethod,
        notes,
        customDate: paymentDate,
        customTime: paymentTime
      });

      onClose();
      onViewReceipt(createdPayment);
    } catch (err: any) {
      alert(err.message || 'টাকা জমা প্রক্রিয়া ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-bold">
              <Receipt size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">গ্রাহকের টাকা জমা (Add Payment)</h2>
              <p className="text-xs text-emerald-300">বকেয়া কর্তন ও মানি রসিদ তৈরি</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Customer Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              গ্রাহক নির্বাচন করুন <span className="text-rose-500">*</span>
            </label>
            <select
              id="payment-customer-select"
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                const c = customers.find(item => item.id === e.target.value);
                if (c && c.currentDue > 0) {
                  setPaidAmount(c.currentDue);
                }
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.mobile}) — বর্তমান বাকি: ৳{c.currentDue}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Live Due Calculation Showcase */}
          {customer && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">পূর্বের মোট বাকি (Previous Due):</span>
                <span className="text-sm font-extrabold text-rose-600">{formatCurrency(previousDue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-emerald-700">আজকে জমা (Paid Amount):</span>
                <span className="text-sm font-extrabold text-emerald-600">-{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-bold">
                <span className="text-slate-800">জমার পর অবশিষ্ট বাকি (Remaining Due):</span>
                <span className={`text-base ${remainingDue <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(remainingDue)}
                </span>
              </div>
            </div>
          )}

          {/* Amount and Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                জমার পরিমাণ (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                id="payment-amount-input"
                type="number"
                min="1"
                step="any"
                required
                value={paidAmount || ''}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                placeholder="টাকার পরিমাণ লিখুন"
                className="w-full px-3 py-2 border border-emerald-400 bg-emerald-50/50 rounded-lg text-base font-extrabold text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                পেমেন্ট মাধ্যম (Method)
              </label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white font-medium outline-none"
              >
                <option value="Cash">নগদ ক্যাশ (Cash)</option>
                <option value="bKash">বিকাশ (bKash)</option>
                <option value="Nagad">নগদ (Nagad)</option>
                <option value="Rocket">রকেট (Rocket)</option>
                <option value="Bank">ব্যাংক ট্রান্সফার (Bank)</option>
                <option value="Cheque">চেক (Cheque)</option>
              </select>
            </div>
          </div>

          {/* Date & Time (Dhaka) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                টাকা জমার তারিখ
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                সময় (Asia/Dhaka)
              </label>
              <input
                type="time"
                step="1"
                value={paymentTime}
                onChange={(e) => setPaymentTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              মন্তব্য / বিবরণ (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="যেমন: দোকানে এসে নগদ জমা দিয়েছেন / রেফারেন্স"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
            >
              বাতিল
            </button>
            <button
              id="confirm-submit-payment-btn"
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <CheckCircle2 size={16} />
              <span>টাকা জমা নিশ্চিত ও রসিদ তৈরি করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
