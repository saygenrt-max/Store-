import { Customer, Product, Sale, Payment, ShopSettings } from '../types';

export const initialSettings: ShopSettings = {
  shopName: "Personal Store Management",
  shopOwner: "মো: রফিকুল ইসলাম",
  shopAddress: "দোকান নং #১২, হাজি মার্কেট, কলেজ রোড, সদর বাজার",
  mobileNumber: "01712-345678",
  altMobile: "01812-987654",
  email: "store.hardwarebd@gmail.com",
  logoUrl: "",
  currencySymbol: "৳",
  footerText: "বিক্রিত মাল ১ সপ্তাহের মধ্যে ফেরত বা পরিবর্তনযোগ্য। আমাদের সাথে থাকার জন্য ধন্যবাদ।",
  invoiceHeader: "পাইকারি ও খুচরা বিক্রয় কেন্দ্র • হার্ডওয়্যার, পাইপ ও ইলেকট্রিক্যাল সামগ্রী",
  invoiceFooter: "কম্পিউটার জেনারেটেড চালান। কোনো স্বাক্ষরের প্রয়োজন নেই।",
  timezone: "Asia/Dhaka",
};

export const initialProducts: Product[] = [
  {
    id: "PROD-101",
    name: "PVC Pipe 1\" (Thread/Plain)",
    category: "Pipe",
    sku: "PVC-01",
    unit: "pcs",
    purchasePrice: 420,
    sellingPrice: 500,
    stockQuantity: 85,
    minStockAlert: 15,
    description: "উচ্চমানের টেকসই পিভিসি পাইপ (১০ ফুট)"
  },
  {
    id: "PROD-102",
    name: "BRB Electric Wire 2.5 RM (Red/Blue)",
    category: "Electrical",
    sku: "ELEC-BRB-25",
    unit: "roll",
    purchasePrice: 2100,
    sellingPrice: 2400,
    stockQuantity: 40,
    minStockAlert: 10,
    description: "বিআরবি কপার ওয়্যার, ১০০ মিটার কয়েল"
  },
  {
    id: "PROD-103",
    name: "Click 1-Gang Piano Switch",
    category: "Electrical",
    sku: "SW-CLK-01",
    unit: "pcs",
    purchasePrice: 38,
    sellingPrice: 50,
    stockQuantity: 180,
    minStockAlert: 30,
    description: "ক্লিক পিয়ানো সুইচ সিলভার কন্টাক্ট"
  },
  {
    id: "PROD-104",
    name: "Bashundhara Portland Composite Cement",
    category: "Cement",
    sku: "CMT-BASH-01",
    unit: "bag",
    purchasePrice: 510,
    sellingPrice: 560,
    stockQuantity: 250,
    minStockAlert: 50,
    description: "বসুন্ধরা ৫০ কেজি প্রিমিয়াম সিমেন্ট"
  },
  {
    id: "PROD-105",
    name: "Seven Rings Gold Cement",
    category: "Cement",
    sku: "CMT-7R-01",
    unit: "bag",
    purchasePrice: 520,
    sellingPrice: 570,
    stockQuantity: 160,
    minStockAlert: 40,
    description: "সেভেন রিংস ৫০ কেজি ব্যাগ"
  },
  {
    id: "PROD-106",
    name: "PVC Elbow 1\" 90 Degree",
    category: "Plumbing",
    sku: "PLM-ELB-01",
    unit: "pcs",
    purchasePrice: 22,
    sellingPrice: 35,
    stockQuantity: 220,
    minStockAlert: 50,
    description: "গাজী পিভিসি এলবো"
  },
  {
    id: "PROD-107",
    name: "Submersible Water Pipe 1.25\" (Heavy)",
    category: "Pipe",
    sku: "PIPE-SUB-125",
    unit: "pcs",
    purchasePrice: 780,
    sellingPrice: 920,
    stockQuantity: 35,
    minStockAlert: 8,
    description: "ডিপ টিউবওয়েল কলাম পাইপ"
  },
  {
    id: "PROD-108",
    name: "Philips LED Bulb 15W Cool Daylight",
    category: "Electrical",
    sku: "LED-PHL-15W",
    unit: "pcs",
    purchasePrice: 175,
    sellingPrice: 230,
    stockQuantity: 65,
    minStockAlert: 15,
    description: "ফিলিপস বি২২ বেস এলইডি বাল্ব (১ বছর ওয়ারেন্টি)"
  },
  {
    id: "PROD-109",
    name: "BRB Ceiling Fan 56\" White",
    category: "Electrical",
    sku: "FAN-BRB-56",
    unit: "pcs",
    purchasePrice: 3250,
    sellingPrice: 3750,
    stockQuantity: 18,
    minStockAlert: 5,
    description: "হাই স্পিড এনার্জি সেভিং সিলিং ফ্যান"
  },
  {
    id: "PROD-110",
    name: "GI Steel Wire Binding 20 Gauge",
    category: "Hardware",
    sku: "HDW-GI-20",
    unit: "kg",
    purchasePrice: 110,
    sellingPrice: 135,
    stockQuantity: 300,
    minStockAlert: 60,
    description: "রড বাঁধার জিআই তার"
  },
  {
    id: "PROD-111",
    name: "Steel Concrete Nails 2.5\"",
    category: "Hardware",
    sku: "NAIL-25",
    unit: "kg",
    purchasePrice: 120,
    sellingPrice: 150,
    stockQuantity: 95,
    minStockAlert: 20,
    description: "পাকা দেয়ালের স্টিল পেরেক"
  },
  {
    id: "PROD-112",
    name: "RFL Bathroom Water Tap (Bib Cock)",
    category: "Plumbing",
    sku: "TAP-RFL-01",
    unit: "pcs",
    purchasePrice: 160,
    sellingPrice: 220,
    stockQuantity: 45,
    minStockAlert: 12,
    description: "আরএফএল ক্রোম প্লেটেড পানির ট্যাপ"
  }
];

export const initialCustomers: Customer[] = [
  {
    id: "CUST-1001",
    name: "আব্দুল করিম কন্ট্রাক্টর",
    fatherName: "মৃত মোজাম্মেল হক",
    mobile: "01711-223344",
    altMobile: "01911-334455",
    address: "বাড়ি নং ৪, শান্তিবাগ",
    areaVillage: "শান্তিবাগ, সদর",
    openingBalance: 5000,
    totalPurchase: 45500,
    totalPaid: 32000,
    currentDue: 18500,
    notes: "বিল্ডিং কন্ট্রাক্টর, প্রতি শুক্রবার নিয়মিত হিসাব করে।",
    createdAt: "2026-09-01",
    createdTime: "10:15:00"
  },
  {
    id: "CUST-1002",
    name: "হাজী মো: বাবুল মিয়া",
    fatherName: "হাজী আব্দুল জব্বার",
    mobile: "01819-445566",
    altMobile: "",
    address: "বাবুল ভিলা, প্রধান সড়ক",
    areaVillage: "দক্ষিণপাড়া",
    openingBalance: 0,
    totalPurchase: 28400,
    totalPaid: 20000,
    currentDue: 8400,
    notes: "নতুন বাড়ির কাজ চলছে, পাইপ ও সিমেন্ট নেওয়া হচ্ছে।",
    createdAt: "2026-09-05",
    createdTime: "11:30:00"
  },
  {
    id: "CUST-1003",
    name: "মো: শফিকুল ইসলাম (ইলেকট্রিশিয়ান)",
    fatherName: "মো: জালাল উদ্দিন",
    mobile: "01912-778899",
    altMobile: "01715-998877",
    address: "উত্তর বাজার মোড়",
    areaVillage: "উত্তরগ্রাম",
    openingBalance: 2000,
    totalPurchase: 16200,
    totalPaid: 18200,
    currentDue: 0,
    notes: "নিয়মিত কাস্টমার, সমস্ত বকেয়া পরিশোধ করেছে।",
    createdAt: "2026-09-08",
    createdTime: "14:20:00"
  },
  {
    id: "CUST-1004",
    name: "মো: আনোয়ার হোসেন",
    fatherName: "মৃত খোরশেদ আলম",
    mobile: "01611-667788",
    altMobile: "",
    address: "স্কুল রোড",
    areaVillage: "কাউন্সিল পাড়া",
    openingBalance: 0,
    totalPurchase: 14750,
    totalPaid: 5000,
    currentDue: 9750,
    notes: "স্যানিটারি ফিটিংসের কাজ চলছে।",
    createdAt: "2026-09-12",
    createdTime: "09:45:00"
  },
  {
    id: "CUST-1005",
    name: "মিজানুর রহমান (মাস্টারজি)",
    fatherName: "মো: তাহের আলী",
    mobile: "01511-332211",
    altMobile: "",
    address: "মাস্টার কোয়ার্টার",
    areaVillage: "পূর্বাশা",
    openingBalance: 0,
    totalPurchase: 6500,
    totalPaid: 6500,
    currentDue: 0,
    notes: "ক্যাশ পেমেন্টে ফ্যান ও বাল্ব ক্রয়।",
    createdAt: "2026-09-15",
    createdTime: "16:00:00"
  }
];

export const initialSales: Sale[] = [
  {
    id: "INV-20260918-0001",
    customerId: "CUST-1001",
    customerName: "আব্দুল করিম কন্ট্রাক্টর",
    customerMobile: "01711-223344",
    customerAddress: "বাড়ি নং ৪, শান্তিবাগ",
    items: [
      {
        productId: "PROD-101",
        productName: "PVC Pipe 1\" (Thread/Plain)",
        quantity: 5,
        unit: "pcs",
        unitPrice: 500,
        totalPrice: 2500
      },
      {
        productId: "PROD-102",
        productName: "BRB Electric Wire 2.5 RM (Red/Blue)",
        quantity: 2,
        unit: "roll",
        unitPrice: 2400,
        totalPrice: 4800
      },
      {
        productId: "PROD-103",
        productName: "Click 1-Gang Piano Switch",
        quantity: 10,
        unit: "pcs",
        unitPrice: 50,
        totalPrice: 500
      },
      {
        productId: "PROD-104",
        productName: "Bashundhara Portland Composite Cement",
        quantity: 5,
        unit: "bag",
        unitPrice: 560,
        totalPrice: 2800
      }
    ],
    subtotal: 10600,
    discount: 300,
    grandTotal: 10300,
    paidAmount: 4000,
    dueAmount: 6300,
    previousDue: 12200,
    newCustomerDue: 18500,
    status: "PARTIAL",
    date: "2026-09-18",
    time: "10:30:00",
    notes: "আজকের সকালের মাল ডেলিভারি"
  },
  {
    id: "INV-20260917-0002",
    customerId: "CUST-1002",
    customerName: "হাজী মো: বাবুল মিয়া",
    customerMobile: "01819-445566",
    customerAddress: "বাবুল ভিলা, প্রধান সড়ক",
    items: [
      {
        productId: "PROD-105",
        productName: "Seven Rings Gold Cement",
        quantity: 20,
        unit: "bag",
        unitPrice: 570,
        totalPrice: 11400
      },
      {
        productId: "PROD-110",
        productName: "GI Steel Wire Binding 20 Gauge",
        quantity: 10,
        unit: "kg",
        unitPrice: 135,
        totalPrice: 1350
      }
    ],
    subtotal: 12750,
    discount: 250,
    grandTotal: 12500,
    paidAmount: 5000,
    dueAmount: 7500,
    previousDue: 900,
    newCustomerDue: 8400,
    status: "PARTIAL",
    date: "2026-09-17",
    time: "15:45:00",
    notes: "ছাদের কাজের সিমেন্ট ডেলিভারি"
  },
  {
    id: "INV-20260916-0003",
    customerId: "CUST-1005",
    customerName: "মিজানুর রহমান (মাস্টারজি)",
    customerMobile: "01511-332211",
    customerAddress: "মাস্টার কোয়ার্টার",
    items: [
      {
        productId: "PROD-109",
        productName: "BRB Ceiling Fan 56\" White",
        quantity: 1,
        unit: "pcs",
        unitPrice: 3750,
        totalPrice: 3750
      },
      {
        productId: "PROD-108",
        productName: "Philips LED Bulb 15W Cool Daylight",
        quantity: 4,
        unit: "pcs",
        unitPrice: 230,
        totalPrice: 920
      }
    ],
    subtotal: 4670,
    discount: 170,
    grandTotal: 4500,
    paidAmount: 4500,
    dueAmount: 0,
    previousDue: 0,
    newCustomerDue: 0,
    status: "PAID",
    date: "2026-09-16",
    time: "11:20:00",
    notes: "সম্পূর্ণ নগদ পরিশোধ"
  }
];

export const initialPayments: Payment[] = [
  {
    id: "REC-20260918-0001",
    customerId: "CUST-1001",
    customerName: "আব্দুল করিম কন্ট্রাক্টর",
    customerMobile: "01711-223344",
    previousDue: 21500,
    paidAmount: 3000,
    remainingDue: 18500,
    paymentDate: "2026-09-18",
    paymentTime: "11:45:00",
    paymentMethod: "Cash",
    notes: "দোকানে এসে নগদ ৩,০০০ টাকা জমা দেওয়া হয়েছে।"
  },
  {
    id: "REC-20260915-0002",
    customerId: "CUST-1003",
    customerName: "মো: শফিকুল ইসলাম (ইলেকট্রিশিয়ান)",
    customerMobile: "01912-778899",
    previousDue: 4000,
    paidAmount: 4000,
    remainingDue: 0,
    paymentDate: "2026-09-15",
    paymentTime: "16:10:00",
    paymentMethod: "bKash",
    notes: "বিকাশের মাধ্যমে সম্পূর্ণ বকেয়া পরিশোধ।"
  }
];
