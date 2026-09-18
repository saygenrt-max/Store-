import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Customers } from './components/Customers';
import { Products } from './components/Products';
import { SalesHistory } from './components/SalesHistory';
import { PaymentsHistory } from './components/PaymentsHistory';
import { DueManagement } from './components/DueManagement';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';

// Modals
import { NewSaleModal } from './components/NewSaleModal';
import { AddPaymentModal } from './components/AddPaymentModal';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ReceiptModal } from './components/ReceiptModal';

// Storage & Types
import { 
  getStoredCustomers, 
  getStoredProducts, 
  getStoredSales, 
  getStoredPayments, 
  getStoredSettings,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  addProduct,
  updateProduct,
  deleteProduct,
  createSale,
  deleteSale,
  createPayment,
  deletePayment,
  updateSettings
} from './utils/storage';
import { Customer, Product, Sale, Payment, ShopSettings } from './types';

export default function App() {
  // Navigation Tab matching Sidebar NavTab
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // App Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(getStoredSettings());

  // Modal States
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  
  // Active Selected Entity for Modals
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);
  const [viewingSaleInvoice, setViewingSaleInvoice] = useState<Sale | null>(null);
  const [viewingPaymentReceipt, setViewingPaymentReceipt] = useState<Payment | null>(null);

  // Initial Data Load
  const refreshData = () => {
    setCustomers(getStoredCustomers());
    setProducts(getStoredProducts());
    setSales(getStoredSales());
    setPayments(getStoredPayments());
    setSettings(getStoredSettings());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update customer selection when customers data changes
  useEffect(() => {
    if (selectedCustomerForDetail) {
      const updated = customers.find(c => c.id === selectedCustomerForDetail.id);
      if (updated) setSelectedCustomerForDetail(updated);
    }
  }, [customers]);

  // Handler: Add New Sale
  const handleOpenNewSale = (customer?: Customer) => {
    setModalCustomer(customer || null);
    setIsNewSaleModalOpen(true);
  };

  const handleCreateSale = (saleData: any) => {
    const newSale = createSale(saleData);
    refreshData();
    return newSale;
  };

  const handleDeleteSale = (id: string) => {
    deleteSale(id);
    refreshData();
  };

  // Handler: Add Payment
  const handleOpenAddPayment = (customer?: Customer) => {
    setModalCustomer(customer || null);
    setIsAddPaymentModalOpen(true);
  };

  const handleCreatePayment = (paymentData: any) => {
    const newPayment = createPayment(paymentData);
    refreshData();
    return newPayment;
  };

  const handleDeletePayment = (id: string) => {
    deletePayment(id);
    refreshData();
  };

  // Handler: Customer Management
  const handleAddCustomer = (custData: any) => {
    const newCust = addCustomer(custData);
    refreshData();
    return newCust;
  };

  const handleUpdateCustomer = (id: string, updates: Partial<Customer>) => {
    updateCustomer(id, updates);
    refreshData();
  };

  const handleDeleteCustomer = (id: string) => {
    deleteCustomer(id);
    refreshData();
    if (selectedCustomerForDetail?.id === id) {
      setSelectedCustomerForDetail(null);
    }
  };

  // Handler: Product Management
  const handleAddProduct = (prodData: any) => {
    addProduct(prodData);
    refreshData();
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    updateProduct(id, updates);
    refreshData();
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    refreshData();
  };

  // Handler: Settings
  const handleSaveSettings = (newSettings: ShopSettings) => {
    updateSettings(newSettings);
    setSettings(newSettings);
  };

  const dueCustomersCount = useMemo(() => {
    return customers.filter(c => c.currentDue > 0).length;
  }, [customers]);

  const totalStoreDue = useMemo(() => {
    return customers.reduce((acc, c) => acc + (c.currentDue || 0), 0);
  }, [customers]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        settings={settings}
        customers={customers}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onOpenNewSale={() => handleOpenNewSale()}
        onOpenAddPayment={() => handleOpenAddPayment()}
        onOpenAddCustomer={() => {
          setCurrentTab('customers');
          setIsAddCustomerModalOpen(true);
        }}
        onSelectCustomer={(cust) => setSelectedCustomerForDetail(cust)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab: NavTab) => {
            if (tab === 'new_sale') {
              handleOpenNewSale();
            } else {
              setCurrentTab(tab);
            }
          }}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          totalDue={totalStoreDue}
          dueCustomersCount={dueCustomersCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* View Switching */}
            {currentTab === 'dashboard' && (
              <Dashboard
                customers={customers}
                sales={sales}
                payments={payments}
                onOpenNewSale={() => handleOpenNewSale()}
                onOpenAddPayment={() => handleOpenAddPayment()}
                onOpenAddCustomer={() => {
                  setCurrentTab('customers');
                  setIsAddCustomerModalOpen(true);
                }}
                onSelectCustomer={(c) => setSelectedCustomerForDetail(c)}
                onViewInvoice={(s) => setViewingSaleInvoice(s)}
                onViewReceipt={(p) => setViewingPaymentReceipt(p)}
                onNavigateToTab={(tab: any) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'customers' && (
              <Customers
                customers={customers}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onSelectCustomer={(c) => setSelectedCustomerForDetail(c)}
                onOpenNewSaleForCustomer={(c) => handleOpenNewSale(c)}
                onOpenAddPaymentForCustomer={(c) => handleOpenAddPayment(c)}
                isAddModalOpen={isAddCustomerModalOpen}
                setIsAddModalOpen={setIsAddCustomerModalOpen}
              />
            )}

            {currentTab === 'products' && (
              <Products
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {currentTab === 'sales_history' && (
              <SalesHistory
                sales={sales}
                onViewInvoice={(s) => setViewingSaleInvoice(s)}
                onDeleteSale={handleDeleteSale}
                onOpenNewSale={() => handleOpenNewSale()}
              />
            )}

            {currentTab === 'payments' && (
              <PaymentsHistory
                payments={payments}
                onViewReceipt={(p) => setViewingPaymentReceipt(p)}
                onOpenAddPayment={() => handleOpenAddPayment()}
                onDeletePayment={handleDeletePayment}
              />
            )}

            {currentTab === 'due_management' && (
              <DueManagement
                customers={customers}
                onOpenAddPaymentForCustomer={(c) => handleOpenAddPayment(c)}
                onSelectCustomer={(c) => setSelectedCustomerForDetail(c)}
                onOpenNewSaleForCustomer={(c) => handleOpenNewSale(c)}
                shopName={settings.shopName}
              />
            )}

            {currentTab === 'reports' && (
              <Reports
                customers={customers}
                sales={sales}
                payments={payments}
                shopName={settings.shopName}
              />
            )}

            {(currentTab === 'settings' || currentTab === 'php_source') && (
              <Settings
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onResetData={refreshData}
              />
            )}
          </div>
        </main>
      </div>

      {/* MODAL 1: New Sale POS Modal */}
      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => {
          setIsNewSaleModalOpen(false);
          setModalCustomer(null);
        }}
        customers={customers}
        products={products}
        onCreateSale={handleCreateSale}
        onViewInvoice={(sale) => setViewingSaleInvoice(sale)}
        initialCustomer={modalCustomer}
      />

      {/* MODAL 2: Add Payment / Money Collection Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => {
          setIsAddPaymentModalOpen(false);
          setModalCustomer(null);
        }}
        customers={customers}
        onCreatePayment={handleCreatePayment}
        onViewReceipt={(pay) => setViewingPaymentReceipt(pay)}
        initialCustomer={modalCustomer}
      />

      {/* MODAL 3: Customer Detail & Ledger khata modal */}
      <CustomerDetailModal
        customer={selectedCustomerForDetail}
        onClose={() => setSelectedCustomerForDetail(null)}
        onOpenNewSaleForCustomer={(c) => {
          setSelectedCustomerForDetail(null);
          handleOpenNewSale(c);
        }}
        onOpenAddPaymentForCustomer={(c) => {
          setSelectedCustomerForDetail(null);
          handleOpenAddPayment(c);
        }}
        onViewInvoice={(s) => setViewingSaleInvoice(s)}
        onViewReceipt={(p) => setViewingPaymentReceipt(p)}
        sales={sales}
        payments={payments}
        shopName={settings.shopName}
      />

      {/* MODAL 4: A4 Printable Invoice Modal */}
      <InvoiceModal
        sale={viewingSaleInvoice}
        onClose={() => setViewingSaleInvoice(null)}
        settings={settings}
      />

      {/* MODAL 5: Money Collection Voucher Receipt Modal */}
      <ReceiptModal
        payment={viewingPaymentReceipt}
        onClose={() => setViewingPaymentReceipt(null)}
        settings={settings}
      />
    </div>
  );
}
