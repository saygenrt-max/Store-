import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  History, 
  CreditCard, 
  AlertOctagon, 
  Package, 
  BarChart3, 
  Settings, 
  Code2, 
  Store 
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'customers' 
  | 'new_sale' 
  | 'sales_history' 
  | 'payments' 
  | 'due_management' 
  | 'products' 
  | 'reports' 
  | 'settings' 
  | 'php_source';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  totalDue: number;
  dueCustomersCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  setIsOpen,
  totalDue,
  dueCustomersCount
}) => {
  const menuItems = [
    { id: 'dashboard' as NavTab, label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'customers' as NavTab, label: 'গ্রাহক তালিকা ও হিসাব', icon: Users },
    { id: 'new_sale' as NavTab, label: 'নতুন বিক্রি (POS)', icon: ShoppingCart },
    { id: 'sales_history' as NavTab, label: 'বিক্রয় ইতিহাস (Sales)', icon: History },
    { id: 'payments' as NavTab, label: 'টাকা জমা ও রসিদ', icon: CreditCard },
    { 
      id: 'due_management' as NavTab, 
      label: 'বকেয়া / পাওনা খাতা', 
      icon: AlertOctagon,
      badge: dueCustomersCount > 0 ? `${dueCustomersCount} জন` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700'
    },
    { id: 'products' as NavTab, label: 'পণ্য ও স্টক (Products)', icon: Package },
    { id: 'reports' as NavTab, label: 'রিপোর্ট ও বিশ্লেষণ', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'সেটিংস ও ব্যাকআপ', icon: Settings },
    { 
      id: 'php_source' as NavTab, 
      label: 'PHP & MySQL কোড', 
      icon: Code2,
      badge: 'SQL+PHP',
      badgeColor: 'bg-blue-100 text-blue-700 font-mono text-[10px]'
    },
  ];

  const handleSelect = (tab: NavTab) => {
    setCurrentTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 left-0 h-screen z-50 md:z-20 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } no-print`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold">
              <Store size={18} />
            </div>
            <div>
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Store Accounting</p>
              <h2 className="text-sm font-bold text-white truncate max-w-[140px]">দোকান সফটওয়্যার</h2>
            </div>
          </div>
        </div>

        {/* Due Summary Alert Box in Sidebar */}
        <div className="p-3 mx-3 my-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <p className="text-[11px] text-slate-400 font-medium">মোট বর্তমান পাওনা</p>
          <p className="text-base font-bold text-rose-400 mt-0.5">৳{totalDue.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{dueCustomersCount} জন গ্রাহকের কাছে বাকি</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400">Personal Store Management v2.5</p>
          <p className="text-[10px] text-slate-500">Asia/Dhaka Standard Time</p>
        </div>
      </aside>
    </>
  );
};
