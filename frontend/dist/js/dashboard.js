/**
 * SmartMart AI – Main Dashboard Controller & Interactive KPI Drill-Down Inspector
 */

import { api } from './api.js';
import { openProductDetailModal } from './product_detail.js';

let cachedDashboard = null;
let cachedProducts = [];
let cachedStores = [];
let activeStoreId = 'ALL';
let activePresetVal = 'last_30_days';

export async function renderDashboard(storeId = 'ALL', preset = 'last_30_days') {
  activeStoreId = storeId;
  activePresetVal = preset;

  try {
    const [data, products, stores] = await Promise.all([
      api.getDashboard(storeId, preset),
      api.getProducts(),
      api.getStores()
    ]);

    cachedDashboard = data;
    cachedProducts = products;
    cachedStores = stores;

    if (!data || !data.kpis) return;

    // 6 Minimal Executive KPIs
    const elRevenue = document.getElementById('kpi-total-sales');
    if (elRevenue) elRevenue.textContent = `₹${data.kpis.totalSales.toLocaleString('en-IN')}`;

    const elUnits = document.getElementById('kpi-units-sold');
    if (elUnits) elUnits.textContent = data.kpis.unitsSold.toLocaleString('en-IN');

    const elInventory = document.getElementById('kpi-inventory-units');
    if (elInventory) elInventory.textContent = `${data.kpis.currentInventoryUnits.toLocaleString('en-IN')} units`;

    const elStockouts = document.getElementById('kpi-stockouts-count');
    if (elStockouts) elStockouts.textContent = data.kpis.potentialStockoutCount.toLocaleString('en-IN');

    const elLowStock = document.getElementById('kpi-low-stock-count');
    if (elLowStock) elLowStock.textContent = data.kpis.lowStockCount.toLocaleString('en-IN');

    const elOverstock = document.getElementById('kpi-overstocked-count');
    if (elOverstock) elOverstock.textContent = data.kpis.overstockedCount.toLocaleString('en-IN');

    // Attach click handlers to each of the 6 KPI cards
    attachKpiCardListeners();

  } catch (err) {
    console.error('Error rendering dashboard:', err);
  }
}

function attachKpiCardListeners() {
  const cards = document.querySelectorAll('.minimal-kpi-card[data-kpi]');
  cards.forEach(card => {
    card.onclick = () => {
      const type = card.getAttribute('data-kpi');
      if (type) openKpiDrilldown(type);
    };
  });

  // Modal close handlers
  document.getElementById('btn-close-drilldown-modal')?.addEventListener('click', closeDrilldownModal);
  
  const modalBackdrop = document.getElementById('dashboard-drilldown-modal');
  if (modalBackdrop) {
    modalBackdrop.onclick = (e) => {
      if (e.target === modalBackdrop) closeDrilldownModal();
    };
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrilldownModal();
  });
}

function closeDrilldownModal() {
  document.getElementById('dashboard-drilldown-modal')?.classList.add('hidden');
}

export function openKpiDrilldown(type) {
  const modal = document.getElementById('dashboard-drilldown-modal');
  const modalTitle = document.getElementById('drilldown-modal-title');
  const modalSubtitle = document.getElementById('drilldown-modal-subtitle');
  const modalBody = document.getElementById('drilldown-modal-body');

  if (!modal || !modalBody) return;

  const storeMap = Object.fromEntries(cachedStores.map(s => [s.id, s.name]));
  const filteredProducts = cachedProducts.filter(p => activeStoreId === 'ALL' || p.storeId === activeStoreId);

  let targetList = [];
  let title = '';
  let subtitle = '';
  let statBannerHtml = '';
  let tableHeaders = [];
  let rowRenderer = null;

  switch (type) {
    case 'lowstock': {
      title = '⚠️ Low Stock Products';
      subtitle = 'Products where Current Stock has fallen below the designated safety Reorder Level.';
      targetList = filteredProducts.filter(p => p.currentStock <= p.reorderLevel || p.status === 'low_stock');
      
      statBannerHtml = `
        <div class="drilldown-banner">
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Low Stock SKUs</span>
            <span class="drilldown-stat-val text-amber">${targetList.length}</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Active Store Filter</span>
            <span class="drilldown-stat-val">${activeStoreId === 'ALL' ? 'All Branches' : (storeMap[activeStoreId] || activeStoreId)}</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Recommended Action</span>
            <span class="drilldown-stat-val text-xs text-muted" style="max-width:260px; line-height:1.2;">Generate supplier reorders or arrange branch transfers before stock hits 0.</span>
          </div>
        </div>
      `;

      tableHeaders = ['Product & SKU', 'Store Branch', 'Current Stock', 'Reorder Level', 'Stock Deficit', 'Runway', 'Supplier', 'Actions'];
      rowRenderer = (p) => {
        const deficit = Math.max(0, p.reorderLevel - p.currentStock);
        return `
          <tr>
            <td>
              <div class="drilldown-product-cell">
                <span class="drilldown-product-name" onclick="window.openProductDetailModal('${p.id}')">${p.name}</span>
                <span class="drilldown-product-meta">SKU: ${p.id} | ${p.category} | ${p.brand || ''}</span>
              </div>
            </td>
            <td><span class="text-xs font-semibold">${storeMap[p.storeId] || p.storeId}</span></td>
            <td><strong class="text-amber">${p.currentStock} units</strong></td>
            <td>${p.reorderLevel} units</td>
            <td><span class="badge danger">-${deficit} units</span></td>
            <td><span class="badge warning">${p.estimatedDaysRemaining || 'N/A'}d</span></td>
            <td><span class="text-xs text-muted">${p.supplierName || 'Primary Supplier'}</span></td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm" onclick="window.openProductDetailModal('${p.id}')">Audit</button>
                <button class="btn btn-primary btn-sm" onclick="window.quickReorderPrompt('${p.id}', '${p.storeId}', '${p.name.replace(/'/g, "\\'")}', ${Math.max(20, deficit + 10)}, '${p.supplierName || 'Direct Supplier'}')">Reorder</button>
              </div>
            </td>
          </tr>
        `;
      };
      break;
    }

    case 'stockout': {
      title = '🔴 Stock-Out Risk Products';
      subtitle = 'Critical inventory shortages: Products with 0 stock or inventory runway ≤ 3 days requiring immediate action.';
      targetList = filteredProducts.filter(p => p.currentStock === 0 || (p.estimatedDaysRemaining != null && p.estimatedDaysRemaining <= 3.0) || p.status === 'stockout_risk');

      const zeroStockCount = targetList.filter(p => p.currentStock === 0).length;

      statBannerHtml = `
        <div class="drilldown-banner">
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Stockout Risk SKUs</span>
            <span class="drilldown-stat-val text-rose">${targetList.length}</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Completely Empty (0 Stock)</span>
            <span class="drilldown-stat-val text-rose">${zeroStockCount} items</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Immediate Priority</span>
            <span class="drilldown-stat-val text-xs text-muted" style="max-width:260px; line-height:1.2;">Stock rebalance via branch transfer or emergency supplier PO.</span>
          </div>
        </div>
      `;

      tableHeaders = ['Product & SKU', 'Store Branch', 'Stock Remaining', 'Runway', 'Daily Velocity', 'Reorder Lvl', 'Supplier', 'Actions'];
      rowRenderer = (p) => {
        const isZero = p.currentStock === 0;
        return `
          <tr>
            <td>
              <div class="drilldown-product-cell">
                <span class="drilldown-product-name" onclick="window.openProductDetailModal('${p.id}')">${p.name}</span>
                <span class="drilldown-product-meta">SKU: ${p.id} | ${p.category} | ${p.brand || ''}</span>
              </div>
            </td>
            <td><span class="text-xs font-semibold">${storeMap[p.storeId] || p.storeId}</span></td>
            <td><strong class="${isZero ? 'text-rose font-bold' : 'text-amber'}">${isZero ? '0 units (OUT)' : `${p.currentStock} units`}</strong></td>
            <td><span class="badge danger">${p.estimatedDaysRemaining || 0} days</span></td>
            <td>${p.averageDailySales} u/day</td>
            <td>${p.reorderLevel} units</td>
            <td><span class="text-xs text-muted">${p.supplierName || 'Primary Supplier'}</span></td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm" onclick="window.openProductDetailModal('${p.id}')">Audit</button>
                <button class="btn btn-primary btn-sm" onclick="window.quickReorderPrompt('${p.id}', '${p.storeId}', '${p.name.replace(/'/g, "\\'")}', ${Math.max(25, Math.round((p.averageDailySales || 2) * 14))}, '${p.supplierName || 'Direct Supplier'}')">Reorder</button>
              </div>
            </td>
          </tr>
        `;
      };
      break;
    }

    case 'overstock': {
      title = '📦 Overstocked Products';
      subtitle = 'Products with surplus inventory (> 60 days runway) that tie up supermarket working capital.';
      targetList = filteredProducts.filter(p => (p.estimatedDaysRemaining != null && p.estimatedDaysRemaining >= 60.0) || p.status === 'overstocked');

      const totalSurplus = targetList.reduce((acc, p) => acc + Math.max(0, p.currentStock - Math.round((p.averageDailySales || 1) * 30)), 0);
      const totalTiedUp = targetList.reduce((acc, p) => acc + (Math.max(0, p.currentStock - Math.round((p.averageDailySales || 1) * 30)) * p.costPrice), 0);

      statBannerHtml = `
        <div class="drilldown-banner">
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Overstocked SKUs</span>
            <span class="drilldown-stat-val text-purple">${targetList.length}</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Total Surplus Units</span>
            <span class="drilldown-stat-val">${totalSurplus.toLocaleString('en-IN')} units</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Tied-Up Working Capital</span>
            <span class="drilldown-stat-val text-emerald">₹${Math.round(totalTiedUp).toLocaleString('en-IN')}</span>
          </div>
        </div>
      `;

      tableHeaders = ['Product & SKU', 'Store Branch', 'Current Stock', '30-Day Demand', 'Surplus Units', 'Runway', 'Tied Capital', 'Actions'];
      rowRenderer = (p) => {
        const demand30 = Math.round((p.averageDailySales || 1) * 30);
        const surplus = Math.max(0, p.currentStock - demand30);
        const tiedVal = surplus * p.costPrice;
        return `
          <tr>
            <td>
              <div class="drilldown-product-cell">
                <span class="drilldown-product-name" onclick="window.openProductDetailModal('${p.id}')">${p.name}</span>
                <span class="drilldown-product-meta">SKU: ${p.id} | ${p.category} | ${p.brand || ''}</span>
              </div>
            </td>
            <td><span class="text-xs font-semibold">${storeMap[p.storeId] || p.storeId}</span></td>
            <td><strong>${p.currentStock} units</strong></td>
            <td>${demand30} units</td>
            <td><span class="badge purple">+${surplus} units</span></td>
            <td><span class="badge slate">${p.estimatedDaysRemaining}d</span></td>
            <td><strong class="text-emerald">₹${Math.round(tiedVal).toLocaleString('en-IN')}</strong></td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="window.openProductDetailModal('${p.id}')">Audit Timeline</button>
            </td>
          </tr>
        `;
      };
      break;
    }

    case 'inventory': {
      title = '🏢 Full Store Inventory Ledger';
      subtitle = 'Complete live inventory stock across all products and supermarket branches.';
      targetList = filteredProducts;

      const totalUnits = targetList.reduce((acc, p) => acc + p.currentStock, 0);
      const totalValuation = targetList.reduce((acc, p) => acc + (p.currentStock * p.costPrice), 0);

      statBannerHtml = `
        <div class="drilldown-banner">
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Total SKUs</span>
            <span class="drilldown-stat-val">${targetList.length}</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Total Stock in Units</span>
            <span class="drilldown-stat-val font-bold">${totalUnits.toLocaleString('en-IN')} units</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Total Inventory Asset Value</span>
            <span class="drilldown-stat-val text-emerald">₹${Math.round(totalValuation).toLocaleString('en-IN')}</span>
          </div>
        </div>
      `;

      tableHeaders = ['Product & SKU', 'Store Branch', 'Current Stock', 'Unit Cost', 'Asset Value', 'Selling Price', 'Status', 'Actions'];
      rowRenderer = (p) => {
        const assetVal = p.currentStock * p.costPrice;
        const statusBadge = p.currentStock === 0 ? '<span class="badge danger">Out of Stock</span>' :
                            p.currentStock <= p.reorderLevel ? '<span class="badge warning">Low Stock</span>' :
                            (p.estimatedDaysRemaining >= 60) ? '<span class="badge purple">Overstocked</span>' :
                            '<span class="badge positive">Healthy</span>';
        return `
          <tr>
            <td>
              <div class="drilldown-product-cell">
                <span class="drilldown-product-name" onclick="window.openProductDetailModal('${p.id}')">${p.name}</span>
                <span class="drilldown-product-meta">SKU: ${p.id} | ${p.category} | ${p.brand || ''}</span>
              </div>
            </td>
            <td><span class="text-xs font-semibold">${storeMap[p.storeId] || p.storeId}</span></td>
            <td><strong>${p.currentStock} units</strong></td>
            <td>₹${p.costPrice.toLocaleString('en-IN')}</td>
            <td><strong class="text-emerald">₹${Math.round(assetVal).toLocaleString('en-IN')}</strong></td>
            <td>₹${p.sellingPrice.toLocaleString('en-IN')}</td>
            <td>${statusBadge}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="window.openProductDetailModal('${p.id}')">Audit Timeline</button>
            </td>
          </tr>
        `;
      };
      break;
    }

    case 'revenue': {
      title = '💰 Revenue Performance & Product Contribution';
      subtitle = 'Products ranked by revenue contribution during this reporting period.';
      targetList = [...filteredProducts].sort((a, b) => ((b.unitsSoldThisMonth || 0) * b.sellingPrice) - ((a.unitsSoldThisMonth || 0) * a.sellingPrice));

      const totalRev = targetList.reduce((acc, p) => acc + ((p.unitsSoldThisMonth || 0) * p.sellingPrice), 0);
      const totalUnits = targetList.reduce((acc, p) => acc + (p.unitsSoldThisMonth || 0), 0);

      statBannerHtml = `
        <div class="drilldown-banner">
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Total Revenue</span>
            <span class="drilldown-stat-val text-brand">₹${Math.round(totalRev).toLocaleString('en-IN')}</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Total Volume Sold</span>
            <span class="drilldown-stat-val">${totalUnits.toLocaleString('en-IN')} units</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Top Earning Product</span>
            <span class="drilldown-stat-val text-xs text-muted" style="max-width:240px; line-height:1.2;">${targetList[0]?.name || 'N/A'}</span>
          </div>
        </div>
      `;

      tableHeaders = ['Rank', 'Product & SKU', 'Store Branch', 'Unit Price', 'Units Sold', 'Revenue Generated', 'Profit Contribution', 'Actions'];
      let rank = 1;
      rowRenderer = (p) => {
        const units = p.unitsSoldThisMonth || 0;
        const rev = units * p.sellingPrice;
        const profit = units * (p.sellingPrice - p.costPrice);
        return `
          <tr>
            <td><span class="badge slate font-mono font-bold">#${rank++}</span></td>
            <td>
              <div class="drilldown-product-cell">
                <span class="drilldown-product-name" onclick="window.openProductDetailModal('${p.id}')">${p.name}</span>
                <span class="drilldown-product-meta">SKU: ${p.id} | ${p.category}</span>
              </div>
            </td>
            <td><span class="text-xs font-semibold">${storeMap[p.storeId] || p.storeId}</span></td>
            <td>₹${p.sellingPrice.toLocaleString('en-IN')}</td>
            <td><strong>${units.toLocaleString('en-IN')}</strong></td>
            <td><strong class="text-brand">₹${Math.round(rev).toLocaleString('en-IN')}</strong></td>
            <td><span class="text-emerald font-bold">₹${Math.round(profit).toLocaleString('en-IN')}</span></td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="window.openProductDetailModal('${p.id}')">Audit Timeline</button>
            </td>
          </tr>
        `;
      };
      break;
    }

    case 'units': {
      title = '🛒 Units Sold & Velocity Ranking';
      subtitle = 'Products ranked by movement volume and sales velocity during this period.';
      targetList = [...filteredProducts].sort((a, b) => (b.unitsSoldThisMonth || 0) - (a.unitsSoldThisMonth || 0));

      const totalUnits = targetList.reduce((acc, p) => acc + (p.unitsSoldThisMonth || 0), 0);

      statBannerHtml = `
        <div class="drilldown-banner">
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Total Units Sold</span>
            <span class="drilldown-stat-val">${totalUnits.toLocaleString('en-IN')}</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Active Selling SKUs</span>
            <span class="drilldown-stat-val">${targetList.filter(p => p.unitsSoldThisMonth > 0).length}</span>
          </div>
          <div class="drilldown-stat-item">
            <span class="drilldown-stat-label">Highest Velocity SKU</span>
            <span class="drilldown-stat-val text-xs text-muted" style="max-width:240px; line-height:1.2;">${targetList[0]?.name || 'N/A'} (${targetList[0]?.unitsSoldThisMonth} units)</span>
          </div>
        </div>
      `;

      tableHeaders = ['Rank', 'Product & SKU', 'Store Branch', 'Units Sold', 'Velocity', 'Current Stock', 'Runway', 'Actions'];
      let rank = 1;
      rowRenderer = (p) => {
        const units = p.unitsSoldThisMonth || 0;
        return `
          <tr>
            <td><span class="badge slate font-mono font-bold">#${rank++}</span></td>
            <td>
              <div class="drilldown-product-cell">
                <span class="drilldown-product-name" onclick="window.openProductDetailModal('${p.id}')">${p.name}</span>
                <span class="drilldown-product-meta">SKU: ${p.id} | ${p.category}</span>
              </div>
            </td>
            <td><span class="text-xs font-semibold">${storeMap[p.storeId] || p.storeId}</span></td>
            <td><strong class="text-brand text-base">${units.toLocaleString('en-IN')} units</strong></td>
            <td>${p.averageDailySales} u/day</td>
            <td><strong>${p.currentStock} units</strong></td>
            <td><span class="badge ${p.estimatedDaysRemaining <= 3 ? 'danger' : 'slate'}">${p.estimatedDaysRemaining}d</span></td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="window.openProductDetailModal('${p.id}')">Audit Timeline</button>
            </td>
          </tr>
        `;
      };
      break;
    }
  }

  modalTitle.textContent = title;
  modalSubtitle.textContent = subtitle;

  // Categories list for filter
  const categories = Array.from(new Set(targetList.map(p => p.category))).sort();

  // Render controls and initial table
  modalBody.innerHTML = `
    ${statBannerHtml}

    <div class="drilldown-controls">
      <input type="text" id="drilldown-search" class="drilldown-search-input" placeholder="Search by product name, brand, SKU or category..." />
      <select id="drilldown-cat-filter" class="drilldown-filter-select">
        <option value="ALL">All Categories (${categories.length})</option>
        ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <span id="drilldown-count-badge" class="text-xs text-muted font-bold ml-auto">Showing ${targetList.length} products</span>
    </div>

    <div class="drilldown-table-container">
      <table class="drilldown-table">
        <thead>
          <tr>
            ${tableHeaders.map(th => `<th>${th}</th>`).join('')}
          </tr>
        </thead>
        <tbody id="drilldown-table-body">
          ${targetList.map(rowRenderer).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Search & Filter listeners
  const searchInput = document.getElementById('drilldown-search');
  const catSelect = document.getElementById('drilldown-cat-filter');
  const tbody = document.getElementById('drilldown-table-body');
  const countBadge = document.getElementById('drilldown-count-badge');

  const filterTable = () => {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const selCat = catSelect?.value || 'ALL';

    const matched = targetList.filter(p => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)) || p.category.toLowerCase().includes(q);
      const matchesCat = selCat === 'ALL' || p.category === selCat;
      return matchesQuery && matchesCat;
    });

    if (countBadge) countBadge.textContent = `Showing ${matched.length} of ${targetList.length} products`;
    if (tbody) {
      if (matched.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${tableHeaders.length}" class="text-center p-4 text-muted">No products matched your search.</td></tr>`;
      } else {
        tbody.innerHTML = matched.map(rowRenderer).join('');
      }
    }
  };

  searchInput?.addEventListener('input', filterTable);
  catSelect?.addEventListener('change', filterTable);

  modal.classList.remove('hidden');
}

// Global Quick Reorder Helper
window.quickReorderPrompt = async function(productId, storeId, productName, suggestedQty, supplier) {
  const qtyStr = prompt(`Create Supplier Purchase Reorder PO for:\nProduct: ${productName}\nStore: ${storeId}\nSupplier: ${supplier}\n\nEnter Reorder Quantity:`, suggestedQty);
  if (!qtyStr) return;

  const qty = parseInt(qtyStr, 10);
  if (isNaN(qty) || qty <= 0) {
    alert('Please enter a valid positive number of units.');
    return;
  }

  try {
    const res = await api.reorderStock(productId, storeId, qty, supplier);
    alert(`Success: ${res.message || 'Purchase Order placed successfully!'}`);
    // Refresh dashboard and modal
    await renderDashboard(activeStoreId, activePresetVal);
    openKpiDrilldown('lowstock');
  } catch (err) {
    alert('Error placing purchase order: ' + err.message);
  }
};

// Make openProductDetailModal available globally
window.openProductDetailModal = openProductDetailModal;
