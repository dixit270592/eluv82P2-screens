export interface PrintLineItem {
  description: string;
  vendor: string;
  quantity: number;
  cost: number;
  subtotal: number;
}

export interface PrintTransactionData {
  prId: string;
  department: string;
  requiredBy: string;
  status: string;
  description: string;
  vendor: string;
  deliveryLocation: string;
  lineItems: PrintLineItem[];
  total: number;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function buildPrintHtml(data: PrintTransactionData): string {
  const rows = data.lineItems
    .map(
      (item) => `
      <tr>
        <td>${item.description}</td>
        <td>${item.vendor}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${fmt(item.cost)}</td>
        <td style="text-align:right">${fmt(item.subtotal)}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${data.prId} — Purchase Request</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #101828; margin: 32px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .meta { color: #667085; font-size: 13px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 32px; margin-bottom: 28px; font-size: 13px; }
    .label { color: #98A2B3; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 8px 10px; background: #F9FAFB; border-bottom: 1px solid #E4E7EC; font-size: 11px; color: #667085; }
    td { padding: 10px; border-bottom: 1px solid #F2F4F7; }
    .total { margin-top: 16px; text-align: right; font-size: 15px; font-weight: 700; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <h1>Purchase Request</h1>
  <div class="meta">${data.prId} · ${data.department} · Needed by ${data.requiredBy}</div>
  <div class="grid">
    <div><div class="label">Status</div><div>${data.status}</div></div>
    <div><div class="label">Vendor</div><div>${data.vendor}</div></div>
    <div><div class="label">Description</div><div>${data.description}</div></div>
    <div><div class="label">Delivery Location</div><div>${data.deliveryLocation}</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Vendor</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Cost</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="5" style="color:#98A2B3;text-align:center;padding:24px">No line items</td></tr>'}</tbody>
  </table>
  <div class="total">Total: ${fmt(data.total)}</div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;
}

export function printTransaction(data: PrintTransactionData): void {
  const html = buildPrintHtml(data);
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    window.alert('Please allow pop-ups to print this transaction.');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
}
