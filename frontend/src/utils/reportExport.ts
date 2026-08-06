import type { ManagerReportSnapshot } from '@/types/reports';
import { formatCurrency, formatDate } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const toCsv = (rows: unknown[][]) => rows.map((row) => row.map(escapeCsv).join(',')).join('\n');

const downloadTextFile = (filename: string, mimeType: string, content: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const reportFilename = (report: ManagerReportSnapshot, extension: string) => {
  const range = report.meta.dateRangeLabel.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  return `sales-report-${range || 'selected-range'}.${extension}`;
};

const htmlEscape = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const tableRows = (rows: unknown[][]) => rows.map((row) => (
  `<tr>${row.map((cell) => `<td>${htmlEscape(cell)}</td>`).join('')}</tr>`
)).join('');

const reportTables = (report: ManagerReportSnapshot, money = false) => {
  const { metrics, categories, topItems, payments, visibleInvoices, trend, hourly, meta } = report;
  const amount = (value: number) => money ? formatCurrency(value) : value;

  return [
    {
      title: 'Summary',
      rows: [
        ['Sales Performance Report'],
        ['Date Range', meta.dateRangeLabel],
        ['Dataset', meta.datasetLabel],
        ['Category', meta.categoryLabel],
        [],
        ['Metric', 'Value'],
        ['Total Amount (Gross Sales)', amount(metrics.grossSales)],
        ['Discount (Discounts Given)', amount(metrics.discounts)],
        ['Net Amount (Pre-tax Sales)', amount(metrics.revenue)],
        [`${TAX_CONFIG.label} Tax Collected`, amount(metrics.totalTax)],
        ['Grand Total (Sales + Tax)', amount(metrics.revenue + metrics.totalTax)],
        ['Bills Count (Total Orders)', metrics.orders],
        ['Qty (Total Items Sold)', metrics.itemsSold],
        ['Average Bill Amount', amount(metrics.avgOrderValue)],
        ['Average Items per Bill', metrics.avgItemsPerOrder],
        ['Cash Amount', amount(metrics.cashTotal)],
        ['Card Amount', amount(metrics.cardTotal)],
        ['Wallet Amount', amount(metrics.walletTotal)],
        ['Pending Delivery Amount', amount(metrics.pendingTotal)],
      ],
    },
    {
      title: 'Category Breakdown',
      rows: [
        ['Category', 'Amount', 'Disc', 'Net Amount', 'Qty', 'Bills Count', 'Share %'],
        ...categories.map((row) => [
          row.label,
          amount(row.revenue + row.discounts),
          amount(row.discounts),
          amount(row.revenue),
          row.quantity,
          row.orderCount,
          row.share.toFixed(2)
        ]),
      ],
    },
    {
      title: 'Top Items',
      rows: [
        ['Item', 'Category', 'Qty', 'Amount', 'Disc', 'Net Amount', 'Bills Count', 'Share %'],
        ...topItems.map((row) => [
          row.name,
          row.category,
          row.quantity,
          amount(row.revenue + row.discounts),
          amount(row.discounts),
          amount(row.revenue),
          row.orderCount,
          row.share.toFixed(2)
        ]),
      ],
    },
    {
      title: 'Hourly Sales Breakdown',
      rows: [
        ['Hour', 'Bills Count', 'Qty', 'Net Amount'],
        ...hourly.map((row) => [row.hour, row.orderCount, row.quantity, amount(row.revenue)]),
      ],
    },
    {
      title: 'Payment Summary',
      rows: [
        ['Payment Mode', 'Amount', 'Bills Count', 'Share %'],
        ...payments.map((row) => [row.label, amount(row.amount), row.orderCount, row.share.toFixed(2)]),
      ],
    },
    {
      title: 'Trend',
      rows: [
        ['Bucket', 'Amount', 'Disc', 'Net Amount', 'Bills Count', 'Qty', TAX_CONFIG.label],
        ...trend.map((row) => [
          row.label,
          amount(row.revenue + row.discounts),
          amount(row.discounts),
          amount(row.revenue),
          row.orders,
          row.itemsSold,
          amount(row.tax)
        ]),
      ],
    },
    {
      title: 'Order Details',
      rows: [
        ['Bill#', 'Date', 'Source', 'Items Count', 'Amount', 'Disc', TAX_CONFIG.label, 'Net Amount', 'Payment Mode', 'Status'],
        ...visibleInvoices.map((row) => [
          row.id,
          formatDate(row.date),
          row.source,
          row.itemCount,
          amount(row.revenue + row.discounts),
          amount(row.discounts),
          amount(row.taxAmount),
          amount(row.grandTotal),
          row.paymentMethod.toUpperCase(),
          row.paymentStatus.toUpperCase(),
        ]),
      ],
    },
  ];
};

export function exportManagerReportToCsv(report: ManagerReportSnapshot) {
  const tables = reportTables(report);
  const csvContent = tables.map((t) => (
    `# ${t.title.toUpperCase()}\n${toCsv(t.rows)}`
  )).join('\n\n');

  downloadTextFile(reportFilename(report, 'csv'), 'text/csv;charset=utf-8;', csvContent);
}

export function exportManagerReportToExcel(report: ManagerReportSnapshot) {
  const tables = reportTables(report, true);
  const htmlContent = [
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">',
    '<head><meta charset="utf-8"/><style>td { border: .5pt solid #d1d5db; padding: 4px; } th { font-weight: bold; background: #f3f4f6; }</style></head>',
    '<body>',
    tables.map((t) => (
      `<h3>${t.title}</h3><table>${t.rows.map((r, i) => (
        `<tr>${r.map((c) => i === 0 || (t.title === 'Summary' && i < 4) ? `<th>${htmlEscape(c)}</th>` : `<td>${htmlEscape(c)}</td>`).join('')}</tr>`
      )).join('')}</table>`
    )).join('<br/>'),
    '</body>',
    '</html>',
  ].join('\n');

  downloadTextFile(reportFilename(report, 'xls'), 'application/vnd.ms-excel;charset=utf-8;', htmlContent);
}

export function exportManagerReportToPdf(report: ManagerReportSnapshot) {
  const { metrics, categories, topItems, payments, visibleInvoices, hourly, meta } = report;
  const popup = window.open('', '_blank', 'width=1100,height=800');
  if (!popup) return;

  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Sales Report - ${htmlEscape(meta.dateRangeLabel)}</title>
        <style>
          @page { margin: 16mm; }
          body { font-family: Arial, sans-serif; color: #111827; margin: 0; }
          header { border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 18px; }
          h1 { margin: 0 0 6px; font-size: 24px; }
          h2 { margin: 22px 0 8px; font-size: 15px; text-transform: uppercase; letter-spacing: .08em; }
          .meta { color: #4b5563; font-size: 12px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0; }
          .card { border: 1px solid #d1d5db; padding: 10px; border-radius: 6px; }
          .label { color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
          .value { font-size: 18px; font-weight: 700; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 6px 7px; text-align: left; }
          th { background: #f3f4f6; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; }
          tfoot { font-weight: bold; background: #f9fafb; }
        </style>
      </head>
      <body>
        <header>
          <h1>Sales Performance Report</h1>
          <div class="meta">Date range: ${htmlEscape(meta.dateRangeLabel)} | Dataset: ${htmlEscape(meta.datasetLabel)} | Category: ${htmlEscape(meta.categoryLabel)}</div>
        </header>

        <section class="grid">
          <div class="card"><div class="label">Total Amount (Gross)</div><div class="value">${formatCurrency(metrics.grossSales)}</div></div>
          <div class="card"><div class="label">Total Discounts</div><div class="value">${formatCurrency(metrics.discounts)}</div></div>
          <div class="card"><div class="label">Net Sales Amount</div><div class="value">${formatCurrency(metrics.revenue)}</div></div>
          <div class="card"><div class="label">Bills Count</div><div class="value">${metrics.orders}</div></div>
          <div class="card"><div class="label">Average Bill</div><div class="value">${formatCurrency(metrics.avgOrderValue)}</div></div>
          <div class="card"><div class="label">${htmlEscape(TAX_CONFIG.label)} Collected</div><div class="value">${formatCurrency(metrics.totalTax)}</div></div>
          <div class="card"><div class="label">Cash</div><div class="value">${formatCurrency(metrics.cashTotal)}</div></div>
          <div class="card"><div class="label">Credit / Card</div><div class="value">${formatCurrency(metrics.cardTotal)}</div></div>
        </section>

        <h2>Category Breakdown</h2>
        <table>
          <thead><tr><th>Category</th><th>Amount</th><th>Disc</th><th>Net Amount</th><th>Qty</th><th>Bills Count</th><th>Share %</th></tr></thead>
          <tbody>
            ${tableRows(categories.map((row) => [
              row.label,
              formatCurrency(row.revenue + row.discounts),
              formatCurrency(row.discounts),
              formatCurrency(row.revenue),
              row.quantity,
              row.orderCount,
              `${row.share.toFixed(1)}%`
            ]))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>${formatCurrency(metrics.grossSales)}</td>
              <td>${formatCurrency(metrics.discounts)}</td>
              <td>${formatCurrency(metrics.revenue)}</td>
              <td>${metrics.itemsSold}</td>
              <td>${categories.reduce((sum, c) => sum + c.orderCount, 0)}</td>
              <td>100%</td>
            </tr>
          </tfoot>
        </table>

        <h2>Top Items</h2>
        <table>
          <thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Amount</th><th>Disc</th><th>Net Amount</th><th>Bills Count</th><th>Share %</th></tr></thead>
          <tbody>
            ${tableRows(topItems.map((row) => [
              row.name,
              row.category,
              row.quantity,
              formatCurrency(row.revenue + row.discounts),
              formatCurrency(row.discounts),
              formatCurrency(row.revenue),
              row.orderCount,
              `${row.share.toFixed(1)}%`
            ]))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total (Top Items)</td>
              <td>—</td>
              <td>${topItems.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td>${formatCurrency(topItems.reduce((sum, item) => sum + item.revenue + item.discounts, 0))}</td>
              <td>${formatCurrency(topItems.reduce((sum, item) => sum + item.discounts, 0))}</td>
              <td>${formatCurrency(topItems.reduce((sum, item) => sum + item.revenue, 0))}</td>
              <td>${topItems.reduce((sum, item) => sum + item.orderCount, 0)}</td>
              <td>${topItems.reduce((sum, item) => sum + item.share, 0).toFixed(1)}%</td>
            </tr>
          </tfoot>
        </table>

        <h2>Hourly Sales Breakdown</h2>
        <table>
          <thead><tr><th>Hour</th><th>Bills Count</th><th>Qty</th><th>Net Amount</th></tr></thead>
          <tbody>
            ${tableRows(hourly.map((row) => [row.hour, row.orderCount, row.quantity, formatCurrency(row.revenue)]))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>${metrics.orders}</td>
              <td>${metrics.itemsSold}</td>
              <td>${formatCurrency(metrics.revenue)}</td>
            </tr>
          </tfoot>
        </table>

        <h2>Payment Summary</h2>
        <table>
          <thead><tr><th>Payment Mode</th><th>Amount</th><th>Bills Count</th><th>Share %</th></tr></thead>
          <tbody>
            ${tableRows(payments.map((row) => [row.label, formatCurrency(row.amount), row.orderCount, `${row.share.toFixed(1)}%`]))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>${formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</td>
              <td>${metrics.orders}</td>
              <td>100%</td>
            </tr>
          </tfoot>
        </table>

        <h2>Order Details</h2>
        <table>
          <thead><tr><th>Bill#</th><th>Date</th><th>Source</th><th>Items Count</th><th>Amount</th><th>Disc</th><th>${htmlEscape(TAX_CONFIG.label)}</th><th>Net Amount</th><th>Payment Mode</th></tr></thead>
          <tbody>
            ${tableRows(visibleInvoices.map((row) => [
              row.id,
              formatDate(row.date),
              row.source,
              row.itemCount,
              formatCurrency(row.revenue + row.discounts),
              formatCurrency(row.discounts),
              formatCurrency(row.taxAmount),
              formatCurrency(row.grandTotal),
              row.paymentMethod.toUpperCase()
            ]))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>—</td>
              <td>—</td>
              <td>${visibleInvoices.reduce((sum, inv) => sum + inv.itemCount, 0)}</td>
              <td>${formatCurrency(visibleInvoices.reduce((sum, inv) => sum + inv.revenue + inv.discounts, 0))}</td>
              <td>${formatCurrency(visibleInvoices.reduce((sum, inv) => sum + inv.discounts, 0))}</td>
              <td>${formatCurrency(visibleInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0))}</td>
              <td>${formatCurrency(visibleInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0))}</td>
              <td>—</td>
            </tr>
          </tfoot>
        </table>
        <script>window.onload = () => { window.print(); };</script>
      </body>
    </html>
  `);
  popup.document.close();
}
