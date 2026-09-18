import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Trash2, 
  User, 
  Calendar, 
  Search, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Customer, Product, Sale } from '../types';
import { formatCurrency, getCurrentDhakaDateTime } from '../utils/formatters';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  products: Product[];
  onCreateSale: (saleData: any) => Sale;
  onViewInvoice: (sale: Sale) => void;
  initialCustomer?: Customer | null;
}

interface ItemRow {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  customers,
  products,
  onCreateSale,
  onViewInvoice,
  initialCustomer
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [items, setItems] = useState<ItemRow[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const { date: todayDate, time: todayTime } = getCurrentDhakaDateTime();
  const [saleDate, setSaleDate] = useState<string>(todayDate);
  const [saleTime, setSaleTime] = useState<string>(todayTime);

  // Quick product select helper
  const [selectedProdId, setSelectedProdId] = useState<string>('');

  useEffect(() => {
    if (initialCustomer) {
      setSelectedCustomerId(initialCustomer.id);
    } else if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [initialCustomer, customers]);

  useEffect(() => {
    // Initial sample row if empty
    if (items.length === 0 && products.length > 0) {
      const p = products[0];
      setItems([{
        productId: p.id,
        productName: p.name,
        quantity: 1,
        unit: p.unit,
        unitPrice: p.sellingPrice,
        totalPrice: p.sellingPrice
      }]);
    }
  }, [products]);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.totalPrice) || 0), 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - (Number(discount) || 0));
  }, [subtotal, discount]);

  const dueAmount = useMemo(() => {
    return Math.max(0, grandTotal - (Number(paidAmount) || 0));
  }, [grandTotal, paidAmount]);

  const newTotalDueForCustomer = useMemo(() => {
    const prevDue = selectedCustomer ? selectedCustomer.currentDue : 0;
    return prevDue + dueAmount;
  }, [selectedCustomer, dueAmount]);

  if (!isOpen) return null;

  const handleAddItem = (prod?: Product) => {
    const p = prod || products[0];
    if (!p) return;
    setItems([
      ...items,
      {
        productId: p.id,
        productName: p.name,
        quantity: 1,
        unit: p.unit,
        unitPrice: p.sellingPrice,
        totalPrice: p.sellingPrice
      }
    ]);
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const p = products.find(prod => prod.id === prodId);
    if (!p) return;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: p.id,
      productName: p.name,
      unit: p.unit,
      unitPrice: p.sellingPrice,
      totalPrice: updated[index].quantity * p.sellingPrice
    };
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const validQty = Math.max(0.1, qty);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      quantity: validQty,
      totalPrice: Math.round(validQty * updated[index].unitPrice * 100) / 100
    };
    setItems(updated);
  };

  const handleUnitPriceChange = (index: number, price: number) => {
    const validPrice = Math.max(0, price);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      unitPrice: validPrice,
      totalPrice: Math.round(updated[index].quantity * validPrice * 100) / 100
    };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handlePayFull = () => {
    setPaidAmount(grandTotal);
  };

  const handlePayZero = () => {
    setPaidAmount(0);
  };

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('অনুগ্রহ করে একজন গ্রাহক নির্বাচন করুন।');
      return;
    }
    if (items.length === 0 || subtotal <= 0) {
      alert('কমপক্ষে একটি পণ্য ও দর যোগ করুন।');
      return;
    }

    try {
      const createdSale = onCreateSale({
        customerId: selectedCustomerId,
        items,
        subtotal,
        discount,
        grandTotal,
        paidAmount,
        notes,
        customDate: saleDate,
        customTime: saleTime
      });

      onClose();
      onViewInvoice(createdSale);
    } catch (err: any) {
      alert(err.message || 'বিক্রি সম্পন্ন করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">নতুন পণ্য বিক্রয় (New Sale / POS)</h2>
              <p className="text-xs text-slate-400">মেমো তৈরি ও বকেয়া স্বয়ংক্রিয়ভাবে খতিয়ানে যুক্ত হবে</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmitSale} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* 1. Customer & Sale Date Details */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                গ্রাহক নির্বাচন করুন <span className="text-rose-500">*</span>
              </label>
              <select
                id="sale-customer-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile}) — বকেয়া: ৳{c.currentDue}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">বিক্রয়ের তারিখ (Dhaka)</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">সময়</label>
              <input
                type="time"
                step="1"
                value={saleTime}
                onChange={(e) => setSaleTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Customer Live Due Status Notification */}
          {selectedCustomer && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-blue-900">{selectedCustomer.name}</span>
                <span className="text-slate-600 ml-2">({selectedCustomer.mobile}) • {selectedCustomer.address}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1">পূর্বের বাকি:</span>
                <span className={`font-bold ${selectedCustomer.currentDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatCurrency(selectedCustomer.currentDue)}
                </span>
              </div>
            </div>
          )}

          {/* 2. Product Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-100 flex items-center justify-between border-b border-slate-200 font-bold text-slate-700">
              <span>বিক্রয়কৃত পণ্য সামগ্রী (Products)</span>
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
              >
                <Plus size={14} />
                <span>+ আইটেম যোগ করুন</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-8 text-center">#</th>
                    <th className="p-2.5 min-w-[200px]">পণ্য নির্বাচন বা নাম</th>
                    <th className="p-2.5 w-24 text-center">পরিমাণ</th>
                    <th className="p-2.5 w-20 text-center">একক</th>
                    <th className="p-2.5 w-28 text-right">একক দর (৳)</th>
                    <th className="p-2.5 w-28 text-right">মোট (৳)</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2.5">
                        <select
                          value={row.productId}
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-900 bg-white font-medium outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} — [স্টক: {p.stockQuantity} {p.unit}]
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={row.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold text-slate-900 outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-center text-slate-500 font-medium">
                        {row.unit}
                      </td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.unitPrice}
                          onChange={(e) => handleUnitPriceChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-right font-bold text-slate-900 outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {formatCurrency(row.totalPrice)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Financial Calculation Summary & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Notes and Quick Payment Options */}
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  চালানের নোট বা মন্তব্য (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: সাইটে মাল ডেলিভারি, শ্রমিক বাবদ খরচ ইত্যাদি..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-2">দ্রুত পেমেন্ট সিলেক্ট:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePayFull}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs"
                  >
                    পুরো নগদ পরিশোধ (৳{grandTotal})
                  </button>
                  <button
                    type="button"
                    onClick={handlePayZero}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs"
                  >
                    সম্পূর্ণ বাকি (Due)
                  </button>
                </div>
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 font-medium">
              <div className="flex items-center justify-between text-slate-600">
                <span>পণ্যসমূহের মোট মূল্য (Subtotal):</span>
                <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>বিশেষ ছাড় (Discount ৳):</span>
                <div className="w-28">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-right font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-900 font-bold text-sm border-t pt-2 border-slate-200">
                <span>সর্বমোট বিল (Grand Total):</span>
                <span className="text-base text-blue-700">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-emerald-700">
                <span className="font-bold">নগদ আদায় / জমা (Paid Amount):</span>
                <div className="w-28">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2 py-1 border border-emerald-300 rounded text-right font-extrabold text-emerald-700 bg-emerald-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-rose-600 font-bold border-t pt-2 border-slate-200">
                <span>এই বিক্রয়ে বাকি (Due Amount):</span>
                <span className="text-base">{formatCurrency(dueAmount)}</span>
              </div>

              {selectedCustomer && (
                <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>পূর্বের বকেয়া:</span>
                    <span>{formatCurrency(selectedCustomer.currentDue)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-700">
                    <span>গ্রাহকের নতুন মোট বকেয়া হবে:</span>
                    <span>{formatCurrency(newTotalDueForCustomer)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              id="confirm-submit-sale-btn"
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"
            >
              <CheckCircle size={16} />
              <span>বিক্রি সম্পন্ন করুন ও চালান প্রিন্ট করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
