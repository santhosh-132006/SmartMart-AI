/**
 * SmartMart AI – Product Detail & Timeline Controller
 * Renders complete product audit view: Product Info, Stock Levels, Visual Timeline, Arrivals, Movements, Store Breakdown.
 */

import { api } from './api.js';

export async function openProductDetailModal(productId) {
  const modal = document.getElementById('product-detail-modal');
  const modalTitle = document.getElementById('modal-product-title');
  const modalBody = document.getElementById('modal-product-body');

  if (!modal || !modalBody) return;

  modal.classList.remove('hidden');
  modalBody.innerHTML = `<div class="loading-placeholder">Fetching complete audit history for ${productId}...</div>`;

  try {
    const [allProducts, arrivals, movements, stores] = await Promise.all([
      api.getProducts(),
      api.getStockArrivals(),
      api.getStockMovements(),
      api.getStores()
    ]);

    const targetProds = allProducts.filter(p => p.id === productId);
    if (!targetProds.length) {
      modalBody.innerHTML = `<div class="p-4 text-red">Product ID ${productId} not found.</div>`;
      return;
    }

    const mainP = targetProds[0];
    modalTitle.textContent = `${mainP.name} (${mainP.id}) – Complete Product Audit`;

    const prodArrivals = arrivals.filter(a => a.productId === productId);
    const prodMovements = movements.filter(m => m.productId === productId);

    // Build Store-Wise Breakdown
    const storeMap = Object.fromEntries(stores.map(s => [s.id, s.name]));
    let storeBreakdownHtml = '<div class="grid-3 mt-3">';
    targetProds.forEach(p => {
      storeBreakdownHtml += `
        <div class="card p-3">
          <div class="text-xs text-muted">${storeMap[p.storeId] || p.storeId}</div>
          <div class="text-lg font-bold mt-1">${p.currentStock} units</div>
          <div class="text-xs mt-1">Runway: <span class="font-semibold text-brand">${p.estimatedDaysRemaining}d</span> | Velocity: ${p.averageDailySales} u/day</div>
        </div>
      `;
    });
    storeBreakdownHtml += '</div>';

    // Build Visual Product Timeline
    let timelineHtml = `
      <div class="timeline-container mt-4">
        <div class="timeline-step">
          <div class="timeline-badge bg-blue">Opening</div>
          <div class="timeline-content">Opening Stock recorded as <strong>${mainP.openingStock} units</strong>.</div>
        </div>
    `;

    if (prodArrivals.length > 0) {
      const arr = prodArrivals[0];
      timelineHtml += `
        <div class="timeline-arrow">↓</div>
        <div class="timeline-step">
          <div class="timeline-badge bg-emerald">📦 Received</div>
          <div class="timeline-content">${arr.arrivalDate}: Received <strong>${arr.quantityReceived} units</strong> from ${arr.supplierName} (Invoice: ${arr.invoiceNumber}). Stock: ${arr.previousStock} → ${arr.newStock}.</div>
        </div>
      `;
    }

    timelineHtml += `
      <div class="timeline-arrow">↓</div>
      <div class="timeline-step">
        <div class="timeline-badge bg-indigo">🛒 Sales</div>
        <div class="timeline-content">Total 30-Day Sales: <strong>${mainP.unitsSoldThisMonth} units sold</strong> (Avg Daily: ${mainP.averageDailySales} u/day).</div>
      </div>
      <div class="timeline-arrow">↓</div>
      <div class="timeline-step highlight-step">
        <div class="timeline-badge bg-purple">CURRENT</div>
        <div class="timeline-content">Current Stock: <strong class="text-brand">${mainP.currentStock} units remaining</strong> (${mainP.estimatedDaysRemaining} days runway).</div>
      </div>
    </div>
    `;

    // Render Full Modal View
    modalBody.innerHTML = `
      <div class="product-detail-grid">
        <!-- Section 1: Overview -->
        <div class="card p-4">
          <h4 class="text-base font-bold mb-2">Product Master Specifications</h4>
          <table class="detail-table">
            <tr><th>Product ID</th><td>${mainP.id}</td><th>Brand</th><td>${mainP.brand}</td></tr>
            <tr><th>Category</th><td>${mainP.category}</td><th>Supplier</th><td>${mainP.supplierName}</td></tr>
            <tr><th>Selling Price</th><td>₹${mainP.sellingPrice}</td><th>Cost Price</th><td>₹${mainP.costPrice}</td></tr>
            <tr><th>Profit / Unit</th><td><span class="text-emerald font-bold">₹${mainP.profitPerUnit}</span></td><th>Reorder Level</th><td>${mainP.reorderLevel} units</td></tr>
          </table>
        </div>

        <!-- Section 2: Store-Wise Breakdown -->
        <div class="card p-4 mt-4">
          <h4 class="text-base font-bold">Store-Wise Stock & Performance</h4>
          ${storeBreakdownHtml}
        </div>

        <!-- Section 3: Visual Timeline -->
        <div class="card p-4 mt-4">
          <h4 class="text-base font-bold">Visual Stock Lifecycle Timeline</h4>
          ${timelineHtml}
        </div>

        <!-- Section 4: Recent Stock Arrival History -->
        <div class="card p-4 mt-4">
          <h4 class="text-base font-bold mb-2">Stock Arrival History</h4>
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr><th>Date</th><th>Supplier</th><th>Qty</th><th>Prev Stock</th><th>New Stock</th><th>Invoice</th></tr></thead>
              <tbody>
                ${prodArrivals.length ? prodArrivals.slice(0, 5).map(a => `
                  <tr>
                    <td>${a.arrivalDate}</td>
                    <td>${a.supplierName}</td>
                    <td><span class="badge positive">+${a.quantityReceived}</span></td>
                    <td>${a.previousStock}</td>
                    <td>${a.newStock}</td>
                    <td><code>${a.invoiceNumber}</code></td>
                  </tr>
                `).join('') : '<tr><td colspan="6" class="text-muted text-center">No stock arrival history recorded for this SKU.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

  } catch (err) {
    modalBody.innerHTML = `<div class="p-4 text-red">Error loading product details: ${err.message}</div>`;
  }
}
