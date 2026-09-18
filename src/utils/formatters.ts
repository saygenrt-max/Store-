export function formatCurrency(amount: number | undefined | null): string {
  const num = Number(amount) || 0;
  return `৳${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function getCurrentDhakaDateTime(): { date: string; time: string; full: string } {
  // Asia/Dhaka is UTC+6
  const now = new Date();
  const dhakaOffsetMs = 6 * 60 * 60 * 1000;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const dhakaDate = new Date(utc + dhakaOffsetMs);

  const year = dhakaDate.getFullYear();
  const month = String(dhakaDate.getMonth() + 1).padStart(2, '0');
  const day = String(dhakaDate.getDate()).padStart(2, '0');
  const hours = String(dhakaDate.getHours()).padStart(2, '0');
  const minutes = String(dhakaDate.getMinutes()).padStart(2, '0');
  const seconds = String(dhakaDate.getSeconds()).padStart(2, '0');

  const date = `${year}-${month}-${day}`;
  const time = `${hours}:${minutes}:${seconds}`;

  return {
    date,
    time,
    full: `${date} ${time}`
  };
}

export function generateInvoiceNumber(existingCount = 1): string {
  const { date } = getCurrentDhakaDateTime();
  const dateCompact = date.replace(/-/g, '');
  const seq = String(existingCount).padStart(4, '0');
  return `INV-${dateCompact}-${seq}`;
}

export function generateReceiptNumber(existingCount = 1): string {
  const { date } = getCurrentDhakaDateTime();
  const dateCompact = date.replace(/-/g, '');
  const seq = String(existingCount).padStart(4, '0');
  return `REC-${dateCompact}-${seq}`;
}

export function generateCustomerId(existingCount = 1): string {
  return `CUST-${1000 + existingCount}`;
}

export function generateProductId(existingCount = 1): string {
  return `PROD-${100 + existingCount}`;
}

export function formatDateBn(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
