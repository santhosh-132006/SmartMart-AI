/**
 * SmartMart AI – Inventory Intelligence Controller
 */

import { api } from './api.js';

export async function renderInventoryIntelligence(storeId = 'ALL') {
  const container = document.getElementById('view-inventory');
  if (!container) return;

  try {
    const data = await api.getInventoryIntelligence(storeId);
    if (!data) return;

    // 1. Update Inventory Metric Cards
    const stockoutCount = data.counts?.stockouts || data.stockouts?.length || 0;
    const lowStockCount = data.counts?.lowStock || data.lowStock?.length || 0;
    const overstockCount = data.counts?.overstocked || data.overstocked?.length || 0;

    const elStockouts = document.getElementById('inv-kpi-stockouts');
    if (elStockouts) elStockouts.textContent = stockoutCount;

    const elLowStock = document.getElementById('inv-kpi-lowstock');
    if (elLowStock) elLowStock.textContent = lowStockCount;

    const elOverstock = document.getElementById('inv-kpi-overstock');
    if (elOverstock) elOverstock.textContent = overstockCount;

    // 2. Render Inter-Store Stock Transfers
    const transfersContainer = document.getElementById('inventory-transfers-container');
    const badgeTransfers = document.getElementById('inv-transfers-count-badge');
    const transfers = data.transferRecommendations || [];

    if (badgeTransfers) badgeTransfers.textContent = `${transfers.length} Recommendations`;

    if (transfersContainer) {
      if (transfers.length === 0) {
        transfersContainer.innerHTML = '<div class="p-4 text-center text-muted">All supermarket branch inventories are balanced. No transfers required.</div>';
      } else {
        transfersContainer.innerHTML = transfers.slice(0, 10).map((tr) => `
          <div class="transfer-card">
            <div class="transfer-info">
              <div class="transfer-title">
                <span>🔄 Transfer <strong>${tr.suggestedTransferQty} units</strong> of <strong>${tr.productName}</strong></span>
                <span class="badge slate ml-2">${tr.category}</span>
              </div>
              <div class="transfer-detail mt-1">
                From <strong>${tr.sourceStoreName}</strong> (surplus: ${tr.sourceCurrentStock} units) &rarr; To <strong>${tr.destinationStoreName}</strong> (shortage: ${tr.destinationCurrentStock} units, ${tr.destinationRunwayDays}d runway)
              </div>
              <div class="text-xs text-muted mt-1">💡 <em>${tr.reason}</em></div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.executeStockTransfer('${tr.productId}', '${tr.sourceStoreId}', '${tr.destinationStoreId}', ${tr.suggestedTransferQty})">
              Transfer Now
            </button>
          </div>
        `).join('');
      }
    }

    // 3. Render Critical Stockouts Table (Runway <= 3d)
    const stockoutsTbody = document.querySelector('#inventory-stockouts-table tbody');
    if (stockoutsTbody) {
      const stockouts = data.stockouts || [];
      if (stockouts.length === 0) {
        stockoutsTbody.innerHTML = '<tr><td colspan="8" class="text-center p-4 text-muted">No products currently at stockout risk.</td></tr>';
      } else {
        stockoutsTbody.innerHTML = stockouts.slice(0, 50).map(p => `
          <tr>
            <td>
              <div class="font-bold cursor-pointer text-brand" onclick="window.openProductDetailModal('${p.id}')">${p.name}</div>
              <div class="text-xs text-muted">ID: ${p.id} | ${p.brand || ''}</div>
            </td>
            <td><span class="badge slate">${p.category}</span></td>
            <td><span class="text-xs">${p.storeName || p.storeId}</span></td>
            <td><strong class="text-rose">${p.currentStock} units</strong></td>
            <td>${p.averageDailySales} u/day</td>
            <td><span class="badge danger">${p.daysRemaining} days</span></td>
            <td>${p.reorderLevel} units</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="window.openProductDetailModal('${p.id}')">Audit Timeline</button>
            </td>
          </tr>
        `).join('');
      }
    }

    // 4. Render Overstocked SKUs Table (Runway >= 60d)
    const overstockTbody = document.querySelector('#inventory-overstock-table tbody');
    if (overstockTbody) {
      const overstocked = data.overstocked || [];
      if (overstocked.length === 0) {
        overstockTbody.innerHTML = '<tr><td colspan="8" class="text-center p-4 text-muted">No overstocked products found.</td></tr>';
      } else {
        overstockTbody.innerHTML = overstocked.slice(0, 50).map(p => `
          <tr>
            <td>
              <div class="font-bold cursor-pointer text-brand" onclick="window.openProductDetailModal('${p.id}')">${p.name}</div>
              <div class="text-xs text-muted">ID: ${p.id}</div>
            </td>
            <td><span class="badge slate">${p.category}</span></td>
            <td><span class="text-xs">${p.storeName || p.storeId}</span></td>
            <td><strong>${p.currentStock} units</strong></td>
            <td><span class="badge purple">${p.daysRemaining} days</span></td>
            <td><span class="text-purple font-bold">${p.excessUnits || 0} units</span></td>
            <td><strong class="text-purple">₹${(p.tiedUpCapital || 0).toLocaleString('en-IN')}</strong></td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="window.openProductDetailModal('${p.id}')">Audit Timeline</button>
            </td>
          </tr>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Error rendering inventory intelligence:', err);
  }
}

// Global handler for inter-branch stock transfer
window.executeStockTransfer = async function(productId, fromStoreId, toStoreId, qty) {
  if (confirm(`Confirm inter-branch stock transfer of ${qty} units?`)) {
    try {
      await api.transferStock(productId, fromStoreId, toStoreId, qty);
      alert('Stock transfer completed successfully! Inventory runway updated.');
      renderInventoryIntelligence();
    } catch (e) {
      alert('Failed to execute stock transfer: ' + e.message);
    }
  }
};
