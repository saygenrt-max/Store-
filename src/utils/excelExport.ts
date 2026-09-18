/**
 * Utility for exporting data to Microsoft Excel compatible CSV format with UTF-8 BOM
 * This guarantees proper display of Bengali text and numbers in MS Excel.
 */

export function exportToExcelCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        let str = String(val ?? '');
        // Escape quotes
        str = str.replace(/"/g, '""');
        // Wrap in quotes if contains comma, quote, or newline
        if (str.search(/("|,|\n)/g) >= 0) {
          str = `"${str}"`;
        }
        return str;
      })
      .join(',');
  };

  const csvContent = '\uFEFF' + [processRow(headers), ...rows.map(processRow)].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
