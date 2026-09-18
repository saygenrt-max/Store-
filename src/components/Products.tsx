import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Layers, 
  X,
  Boxes
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { exportToExcelCSV } from '../utils/excelExport';

interface ProductsProps {
  products: Product[];
  onAddProduct: (prodData: any) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

const CATEGORIES: Product['category'][] = [
  'Pipe',
  'Plumbing',
  'Electrical',
  'Hardware',
  'Cement',
  'Construction Materials',
  'Others'
];

export const Products: React.FC<ProductsProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Pipe' as Product['category'],
    sku: '',
    unit: 'pcs',
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: '',
    minStockAlert: '5',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Pipe',
      sku: '',
      unit: 'pcs',
      purchasePrice: '',
      sellingPrice: '',
      stockQuantity: '',
      minStockAlert: '5',
      description: ''
    });
    setEditingProduct(null);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      sku: p.sku || '',
      unit: p.unit,
      purchasePrice: String(p.purchasePrice || 0),
      sellingPrice: String(p.sellingPrice),
      stockQuantity: String(p.stockQuantity || 0),
      minStockAlert: String(p.minStockAlert || 5),
      description: p.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sellingPrice) {
      alert('অনুগ্রহ করে পণ্যের নাম এবং বিক্রয় মূল্য লিখুন।');
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      sku: formData.sku,
      unit: formData.unit,
      purchasePrice: Number(formData.purchasePrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      stockQuantity: Number(formData.stockQuantity) || 0,
      minStockAlert: Number(formData.minStockAlert) || 5,
      description: formData.description
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, payload);
    } else {
      onAddProduct(payload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      return true;
    });
  }, [products, search, selectedCategory]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stockQuantity <= p.minStockAlert).length;
  }, [products]);

  const handleExportExcel = () => {
    const headers = ['আইডি', 'পণ্যের নাম', 'ক্যাটাগরি', 'SKU', 'একক', 'ক্রয় মূল্য (৳)', 'বিক্রয় মূল্য (৳)', 'বর্তমান স্টক', 'সতর্কতা স্টক'];
    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.category,
      p.sku,
      p.unit,
      p.purchasePrice || 0,
      p.sellingPrice,
      p.stockQuantity,
      p.minStockAlert
    ]);
    exportToExcelCSV('Products_Inventory_PSM', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package size={22} className="text-blue-600" />
            <span>পণ্য ও মজুদ ব্যবস্থাপনা (Products & Stock)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            পাইপ, বৈদ্যুতিক সামগ্রী, সিমেন্ট ও হার্ডওয়্যার মালের তালিকা ও লাইভ স্টক ট্র্যাকিং।
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
            id="add-new-product-btn"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus size={16} />
            <span>+ নতুন পণ্য যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Categories & Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="পণ্য, ক্যাটাগরি বা কোড দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none transition"
            />
          </div>

          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold">
              <AlertTriangle size={16} className="text-amber-600" />
              <span>{lowStockCount} টি পণ্যের স্টক সীমিত!</span>
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সব ({products.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">কোড / SKU</th>
                <th className="p-3.5">পণ্যের নাম ও বিবরণ</th>
                <th className="p-3.5">ক্যাটাগরি</th>
                <th className="p-3.5 text-right">ক্রয় দর</th>
                <th className="p-3.5 text-right">বিক্রয় দর</th>
                <th className="p-3.5 text-center">বর্তমান স্টক</th>
                <th className="p-3.5 text-center">স্টক অবস্থা</th>
                <th className="p-3.5 text-center">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    কোনো পণ্য পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-600">
                        {p.sku || p.id}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        {p.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-600">
                        {formatCurrency(p.purchasePrice)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-blue-700">
                        {formatCurrency(p.sellingPrice)}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-900">
                        {p.stockQuantity} <span className="text-[11px] text-slate-500 font-normal">{p.unit}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isLow
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isLow ? `সীমিত স্টক (≤${p.minStockAlert})` : 'মজুদ আছে'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="সম্পাদনা করুন"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`আপনি কি "${p.name}" পণ্যটি মুছে ফেলতে চান?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProduct ? 'পণ্যের তথ্য পরিবর্তন করুন' : 'নতুন পণ্য যুক্ত করুন'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  পণ্যের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: PVC Pipe 1.5 inch"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    SKU / পণ্য কোড
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="যেমন: PVC-15"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    একক (Unit)
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none"
                  >
                    <option value="pcs">pcs (পিস)</option>
                    <option value="roll">roll (রোল)</option>
                    <option value="bag">bag (ব্যাগ)</option>
                    <option value="feet">feet (ফুট)</option>
                    <option value="meter">meter (মিটার)</option>
                    <option value="kg">kg (কেজি)</option>
                    <option value="box">box (বক্স)</option>
                    <option value="set">set (সেট)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ক্রয় মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    বিক্রয় মূল্য (৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-blue-400 bg-blue-50/40 rounded-lg font-bold text-blue-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    বর্তমান মজুদ (Stock)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    মজুদ সতর্কতা সীমা (Min Alert)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    placeholder="5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  সংক্ষিপ্ত বিবরণ (Description)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="পণ্য সম্পর্কিত অতিরিক্ত তথ্য"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
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
                  {editingProduct ? 'হালনাগাদ করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
