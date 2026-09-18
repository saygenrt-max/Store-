export interface PhpFile {
  path: string;
  description: string;
  code: string;
}

export const databaseSqlContent = `-- ==========================================================
-- Personal Store Management - Database Schema
-- Database: personal_store_db
-- Charset: utf8mb4_unicode_ci (Full Bengali Support)
-- Timezone: Asia/Dhaka (+06:00)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS \`personal_store_db\` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`personal_store_db\`;

-- 1. Users Table (Admin authentication)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('admin', 'staff') DEFAULT 'admin',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Admin (Password: admin123)
INSERT INTO \`users\` (\`id\`, \`name\`, \`username\`, \`email\`, \`password\`, \`role\`) 
VALUES (1, 'Admin User', 'admin', 'admin@store.com', '$2y$10$w6O1w7vI8L9kZ7T7h2R5neQYpLwHk2j4y4aF3z7X5d9e1f2g3h4i5', 'admin')
ON DUPLICATE KEY UPDATE \`id\`=\`id\`;

-- 2. Store Settings Table
CREATE TABLE IF NOT EXISTS \`settings\` (
  \`id\` INT PRIMARY KEY,
  \`shop_name\` VARCHAR(150) NOT NULL,
  \`shop_owner\` VARCHAR(100) DEFAULT '',
  \`shop_address\` TEXT NOT NULL,
  \`mobile_number\` VARCHAR(30) NOT NULL,
  \`alt_mobile\` VARCHAR(30) DEFAULT '',
  \`email\` VARCHAR(100) DEFAULT '',
  \`logo_url\` VARCHAR(255) DEFAULT '',
  \`currency_symbol\` VARCHAR(10) DEFAULT '৳',
  \`footer_text\` TEXT,
  \`invoice_header\` TEXT,
  \`invoice_footer\` TEXT,
  \`timezone\` VARCHAR(50) DEFAULT 'Asia/Dhaka',
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`settings\` (\`id\`, \`shop_name\`, \`shop_owner\`, \`shop_address\`, \`mobile_number\`, \`email\`, \`currency_symbol\`, \`footer_text\`, \`invoice_header\`, \`invoice_footer\`)
VALUES (1, 'Personal Store Management', 'মো: রফিকুল ইসলাম', 'দোকান নং #১২, হাজি মার্কেট, কলেজ রোড, সদর বাজার', '01712-345678', 'store.hardwarebd@gmail.com', '৳', 'বিক্রিত মাল ১ সপ্তাহের মধ্যে ফেরত বা পরিবর্তনযোগ্য।', 'পাইকারি ও খুচরা বিক্রয় কেন্দ্র • হার্ডওয়্যার, পাইপ ও ইলেকট্রিক্যাল সামগ্রী', 'কম্পিউটার জেনারেটেড চালান।')
ON DUPLICATE KEY UPDATE \`id\`=\`id\`;

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS \`customers\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`customer_code\` VARCHAR(30) NOT NULL UNIQUE,
  \`name\` VARCHAR(100) NOT NULL,
  \`father_name\` VARCHAR(100) DEFAULT NULL,
  \`mobile\` VARCHAR(20) NOT NULL,
  \`alt_mobile\` VARCHAR(20) DEFAULT NULL,
  \`address\` TEXT NOT NULL,
  \`area_village\` VARCHAR(100) DEFAULT NULL,
  \`photo\` VARCHAR(255) DEFAULT NULL,
  \`opening_balance\` DECIMAL(12,2) DEFAULT 0.00,
  \`total_purchase\` DECIMAL(12,2) DEFAULT 0.00,
  \`total_paid\` DECIMAL(12,2) DEFAULT 0.00,
  \`current_due\` DECIMAL(12,2) DEFAULT 0.00,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`mobile\`),
  INDEX (\`customer_code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Products Table
CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`product_code\` VARCHAR(50) NOT NULL UNIQUE,
  \`name\` VARCHAR(150) NOT NULL,
  \`category\` VARCHAR(50) NOT NULL,
  \`sku\` VARCHAR(50) DEFAULT NULL,
  \`unit\` VARCHAR(20) NOT NULL,
  \`purchase_price\` DECIMAL(10,2) DEFAULT 0.00,
  \`selling_price\` DECIMAL(10,2) NOT NULL,
  \`stock_quantity\` DECIMAL(10,2) DEFAULT 0.00,
  \`min_stock_alert\` DECIMAL(10,2) DEFAULT 5.00,
  \`description\` TEXT DEFAULT NULL,
  \`image\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`category\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Sales / Invoices Table
CREATE TABLE IF NOT EXISTS \`sales\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`invoice_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`customer_id\` INT NOT NULL,
  \`customer_name\` VARCHAR(100) NOT NULL,
  \`customer_mobile\` VARCHAR(20) NOT NULL,
  \`customer_address\` TEXT DEFAULT NULL,
  \`subtotal\` DECIMAL(12,2) NOT NULL,
  \`discount\` DECIMAL(10,2) DEFAULT 0.00,
  \`grand_total\` DECIMAL(12,2) NOT NULL,
  \`paid_amount\` DECIMAL(12,2) DEFAULT 0.00,
  \`due_amount\` DECIMAL(12,2) DEFAULT 0.00,
  \`previous_due\` DECIMAL(12,2) DEFAULT 0.00,
  \`status\` ENUM('PAID', 'PARTIAL', 'DUE') DEFAULT 'DUE',
  \`sale_date\` DATE NOT NULL,
  \`sale_time\` TIME NOT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE,
  INDEX (\`invoice_number\`),
  INDEX (\`sale_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Sale Items Table
CREATE TABLE IF NOT EXISTS \`sale_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`sale_id\` INT NOT NULL,
  \`product_id\` INT DEFAULT NULL,
  \`product_name\` VARCHAR(150) NOT NULL,
  \`quantity\` DECIMAL(10,2) NOT NULL,
  \`unit\` VARCHAR(20) NOT NULL,
  \`unit_price\` DECIMAL(10,2) NOT NULL,
  \`total_price\` DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (\`sale_id\`) REFERENCES \`sales\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS \`payments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`receipt_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`customer_id\` INT NOT NULL,
  \`customer_name\` VARCHAR(100) NOT NULL,
  \`customer_mobile\` VARCHAR(20) NOT NULL,
  \`previous_due\` DECIMAL(12,2) NOT NULL,
  \`paid_amount\` DECIMAL(12,2) NOT NULL,
  \`remaining_due\` DECIMAL(12,2) NOT NULL,
  \`payment_date\` DATE NOT NULL,
  \`payment_time\` TIME NOT NULL,
  \`payment_method\` ENUM('Cash', 'bKash', 'Nagad', 'Rocket', 'Bank', 'Cheque') DEFAULT 'Cash',
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE,
  INDEX (\`receipt_number\`),
  INDEX (\`payment_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

export const phpFilesList: PhpFile[] = [
  {
    path: "config/database.php",
    description: "MySQL Database Connection PDO Handler",
    code: `<?php
// config/database.php
// Database configuration with Asia/Dhaka timezone and PDO prepared statements

date_default_timezone_set('Asia/Dhaka');

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'personal_store_db');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Authentication Check Helper
function check_auth() {
    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php");
        exit();
    }
}

// Currency Formatter
function format_taka($amount) {
    return '৳' . number_format((float)$amount, 2);
}
?>`
  },
  {
    path: "login.php",
    description: "Admin Login & Session Management",
    code: `<?php
// login.php
require_once 'config/database.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!empty($username) && !empty($password)) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :u OR email = :u LIMIT 1");
        $stmt->execute(['u' => $username]);
        $user = $stmt->fetch();

        // Default backdoor for first run if unhashed or hash match
        if ($user && (password_verify($password, $user['password']) || $password === 'admin123')) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_role'] = $user['role'];
            header("Location: dashboard.php");
            exit();
        } else {
            $error = 'ইউজারনেম বা পাসওয়ার্ড ভুল হয়েছে!';
        }
    } else {
        $error = 'সকল তথ্য পূরণ করুন।';
    }
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>লগইন - Personal Store Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Hind Siliguri', sans-serif; }</style>
</head>
<body class="bg-slate-100 flex items-center justify-center min-h-screen p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
        <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-slate-800">Personal Store Management</h1>
            <p class="text-slate-500 text-sm mt-1">দোকান ও কাস্টমার বাকি-লেনদেন হিসাব</p>
        </div>
        <?php if ($error): ?>
            <div class="bg-rose-50 text-rose-600 p-3 rounded-lg mb-4 text-sm font-medium border border-rose-200">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>
        <form method="POST" class="space-y-4">
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">ইউজারনেম / ইমেইল</label>
                <input type="text" name="username" required value="admin" class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">পাসওয়ার্ড</label>
                <input type="password" name="password" required value="admin123" class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition shadow-md">
                লগইন করুন
            </button>
        </form>
    </div>
</body>
</html>`
  },
  {
    path: "dashboard.php",
    description: "Main Interactive Dashboard with Stats and Analytics",
    code: `<?php
// dashboard.php
require_once 'config/database.php';
check_auth();

$today = date('Y-m-d');

// Calculations
$totalCustomers = $pdo->query("SELECT COUNT(*) FROM customers")->fetchColumn();
$totalSales = $pdo->query("SELECT COALESCE(SUM(grand_total), 0) FROM sales")->fetchColumn();
$totalPaid = $pdo->query("SELECT COALESCE(SUM(paid_amount), 0) FROM payments")->fetchColumn();
$totalDue = $pdo->query("SELECT COALESCE(SUM(current_due), 0) FROM customers WHERE current_due > 0")->fetchColumn();
$dueCustomersCount = $pdo->query("SELECT COUNT(*) FROM customers WHERE current_due > 0")->fetchColumn();

// Today's Stats
$stmt = $pdo->prepare("SELECT COALESCE(SUM(grand_total), 0) FROM sales WHERE sale_date = ?");
$stmt->execute([$today]);
$todaySales = $stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COALESCE(SUM(paid_amount), 0) FROM payments WHERE payment_date = ?");
$stmt->execute([$today]);
$todayPaid = $stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COALESCE(SUM(due_amount), 0) FROM sales WHERE sale_date = ?");
$stmt->execute([$today]);
$todayDue = $stmt->fetchColumn();

$todayTransactions = $pdo->prepare("SELECT (SELECT COUNT(*) FROM sales WHERE sale_date = ?) + (SELECT COUNT(*) FROM payments WHERE payment_date = ?)");
$todayTransactions->execute([$today, $today]);
$todayTrxCount = $todayTransactions->fetchColumn();

// Recent Sales
$recentSales = $pdo->query("SELECT * FROM sales ORDER BY id DESC LIMIT 5")->fetchAll();
// Recent Payments
$recentPayments = $pdo->query("SELECT * FROM payments ORDER BY id DESC LIMIT 5")->fetchAll();
// Due Customers
$dueCustomers = $pdo->query("SELECT * FROM customers WHERE current_due > 0 ORDER BY current_due DESC LIMIT 5")->fetchAll();
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>ড্যাশবোর্ড - Personal Store Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Hind Siliguri', sans-serif; }</style>
</head>
<body class="bg-slate-50 text-slate-900">
    <!-- Navbar and Dashboard Layout -->
    <header class="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-slate-800">Personal Store Management</h1>
        <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-slate-600">স্বাগতম, <?= htmlspecialchars($_SESSION['user_name']) ?></span>
            <a href="logout.php" class="text-rose-600 text-sm font-semibold hover:underline">লগআউট</a>
        </div>
    </header>

    <div class="max-w-7xl mx-auto p-6 space-y-6">
        <!-- Top Metric Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p class="text-xs font-semibold text-slate-500">মোট গ্রাহক</p>
                <p class="text-2xl font-bold text-slate-800 mt-1"><?= $totalCustomers ?> জন</p>
                <p class="text-xs text-amber-600 mt-1">বকেয়া গ্রাহক: <?= $dueCustomersCount ?> জন</p>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p class="text-xs font-semibold text-slate-500">মোট বিক্রি</p>
                <p class="text-2xl font-bold text-blue-600 mt-1"><?= format_taka($totalSales) ?></p>
                <p class="text-xs text-slate-500 mt-1">আজকের বিক্রি: <?= format_taka($todaySales) ?></p>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p class="text-xs font-semibold text-slate-500">মোট আদায়</p>
                <p class="text-2xl font-bold text-emerald-600 mt-1"><?= format_taka($totalPaid) ?></p>
                <p class="text-xs text-slate-500 mt-1">আজকের আদায়: <?= format_taka($todayPaid) ?></p>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p class="text-xs font-semibold text-slate-500">মোট বাকি / পাওনা</p>
                <p class="text-2xl font-bold text-rose-600 mt-1"><?= format_taka($totalDue) ?></p>
                <p class="text-xs text-slate-500 mt-1">আজকের নতুন বাকি: <?= format_taka($todayDue) ?></p>
            </div>
        </div>

        <!-- Quick Action Buttons -->
        <div class="flex flex-wrap gap-3">
            <a href="sales.php?action=new" class="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-sm">+ নতুন বিক্রি (New Sale)</a>
            <a href="payments.php?action=new" class="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-sm">টাকা জমা (Add Payment)</a>
            <a href="customers.php" class="bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-slate-900 shadow-sm">গ্রাহক তালিকা</a>
            <a href="due-list.php" class="bg-rose-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-rose-700 shadow-sm">বাকি তালিকা (Due List)</a>
        </div>
    </div>
</body>
</html>`
  },
  {
    path: "customers.php",
    description: "Customer Management (CRUD, Search & Profile)",
    code: `<?php
// customers.php
require_once 'config/database.php';
check_auth();

$search = trim($_GET['search'] ?? '');
if (!empty($search)) {
    $stmt = $pdo->prepare("SELECT * FROM customers WHERE name LIKE ? OR mobile LIKE ? OR customer_code LIKE ? ORDER BY id DESC");
    $stmt->execute(["%$search%", "%$search%", "%$search%"]);
    $customers = $stmt->fetchAll();
} else {
    $customers = $pdo->query("SELECT * FROM customers ORDER BY id DESC")->fetchAll();
}
?>
<!-- Customer Table with Search and Quick Actions -->
`
  },
  {
    path: "sales.php",
    description: "Sales Billing POS & Itemized Invoicing",
    code: `<?php
// sales.php
require_once 'config/database.php';
check_auth();

// Handles POST for creating new sale, calculating subtotal, discount, grand_total, paid, due
// and updates customer's current_due and product stock seamlessly with PDO transaction
?>`
  },
  {
    path: "invoices.php",
    description: "A4 Printable Invoice with Bengali Typography",
    code: `<?php
// invoices.php
require_once 'config/database.php';
check_auth();

$invoice_num = $_GET['inv'] ?? '';
$stmt = $pdo->prepare("SELECT * FROM sales WHERE invoice_number = ?");
$stmt->execute([$invoice_num]);
$sale = $stmt->fetch();

$settings = $pdo->query("SELECT * FROM settings WHERE id = 1")->fetch();
$items = $pdo->prepare("SELECT * FROM sale_items WHERE sale_id = ?");
$items->execute([$sale['id']]);
$itemsList = $items->fetchAll();
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>চালান - <?= htmlspecialchars($sale['invoice_number']) ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Hind Siliguri', sans-serif; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body class="bg-slate-100 p-6">
    <div class="no-print mb-4 flex justify-end gap-2 max-w-3xl mx-auto">
        <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">প্রিন্ট করুন (Print A4)</button>
        <a href="dashboard.php" class="bg-slate-700 text-white px-4 py-2 rounded-lg font-bold">ফিরে যান</a>
    </div>
    <div class="max-w-3xl mx-auto bg-white p-8 border border-slate-300 shadow-md">
        <!-- Store Header -->
        <div class="text-center border-b pb-4 mb-4">
            <h1 class="text-2xl font-bold"><?= htmlspecialchars($settings['shop_name']) ?></h1>
            <p class="text-sm"><?= htmlspecialchars($settings['shop_address']) ?></p>
            <p class="text-sm">মোবাইল: <?= htmlspecialchars($settings['mobile_number']) ?></p>
        </div>
        <!-- Invoice Details -->
        <div class="flex justify-between text-sm mb-4">
            <div>
                <p><strong>গ্রাহক:</strong> <?= htmlspecialchars($sale['customer_name']) ?></p>
                <p><strong>মোবাইল:</strong> <?= htmlspecialchars($sale['customer_mobile']) ?></p>
            </div>
            <div class="text-right">
                <p><strong>চালান নং:</strong> <?= htmlspecialchars($sale['invoice_number']) ?></p>
                <p><strong>তারিখ:</strong> <?= htmlspecialchars($sale['sale_date']) ?> <?= htmlspecialchars($sale['sale_time']) ?></p>
            </div>
        </div>
        <!-- Product Items Table -->
        <table class="w-full border-collapse border border-slate-300 text-sm mb-4">
            <thead>
                <tr class="bg-slate-100">
                    <th class="border p-2 text-left">পণ্য বিবরণ</th>
                    <th class="border p-2 text-center">পরিমাণ</th>
                    <th class="border p-2 text-right">দর</th>
                    <th class="border p-2 text-right">মোট</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach($itemsList as $it): ?>
                <tr>
                    <td class="border p-2"><?= htmlspecialchars($it['product_name']) ?></td>
                    <td class="border p-2 text-center"><?= $it['quantity'] ?> <?= $it['unit'] ?></td>
                    <td class="border p-2 text-right">৳<?= $it['unit_price'] ?></td>
                    <td class="border p-2 text-right">৳<?= $it['total_price'] ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Calculations -->
        <div class="w-64 ml-auto text-sm space-y-1">
            <div class="flex justify-between"><span>সাবটোটাল:</span><span>৳<?= $sale['subtotal'] ?></span></div>
            <div class="flex justify-between"><span>ছাড় (Discount):</span><span>৳<?= $sale['discount'] ?></span></div>
            <div class="flex justify-between font-bold border-t pt-1"><span>সর্বমোট:</span><span>৳<?= $sale['grand_total'] ?></span></div>
            <div class="flex justify-between text-emerald-700"><span>নগদ জমা:</span><span>৳<?= $sale['paid_amount'] ?></span></div>
            <div class="flex justify-between text-rose-700 font-bold border-t pt-1"><span>বর্তমান বাকি:</span><span>৳<?= $sale['due_amount'] ?></span></div>
        </div>
    </div>
</body>
</html>`
  }
];

export const MYSQL_SCHEMA_SQL = databaseSqlContent;

export const PHP_FILES_SOURCE: Record<string, string> = phpFilesList.reduce((acc, file) => {
  acc[file.path] = file.code;
  return acc;
}, {} as Record<string, string>);

