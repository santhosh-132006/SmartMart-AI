/**
 * RetailIQ - Product Master Catalogue Controller
 */

import { api } from './api.js';
import { state, formatters, showToast } from './state.js';

export async function renderProducts() {
  const container = document.getElementById('view-products');
  if (!container) return;

  try {
    const data = await api.getSalesAnalytics(state.selectedStoreId, state.datePreset);
    state.products = data.products;

    applyProductFilters();

    // Attach search and filter listeners
    const searchInput = document.getElementById('product-search-input');
    const catFilter = document.getElementById('product-category-filter');
    const statusFilter = document.getElementById('product-status-filter');

    if (searchInput) searchInput.oninput = applyProductFilters;
    if (catFilter) catFilter.onchange = applyProductFilters;
    if (statusFilter) statusFilter.onchange = applyProductFilters;

  } catch (err) {
    console.error('Error rendering products:', err);
    showToast('Failed to load products catalogue', 'danger');
  }
}

function applyProductFilters() {
  const search = (document.getElementById('product-search-input')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('product-category-filter')?.value || 'ALL';
  const status = document.getElementById('product-status-filter')?.value || 'ALL';

  const filtered = state.products.filter(p => {
    const matchSearch = !search || p.productName.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search) || p.productId.toLowerCase().includes(search);
    const matchCat = cat === 'ALL' || p.category === cat;
    const matchStatus = status === 'ALL' || p.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  const tbody = document.querySelector('#products-catalog-table tbody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted p-4">No products match your search filters.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <strong>${p.productName}</strong><br>
        <span class="font-mono text-xs text-muted">${p.sku}</span>
      </td>
      <td><span class="badge-pill info">${p.category}</span></td>
      <td>${formatters.currency(p.sellingPrice)}</td>
      <td>${formatters.currency(p.costPrice)}</td>
      <td><strong class="${p.currentStock <= p.reorderLevel ? 'text-rose' : ''}">${p.currentStock} units</strong></td>
      <td>${p.reorderLevel} units</td>
      <td>${p.dailyAvgSales} / day</td>
      <td><strong>${p.daysOfInventory} days</strong></td>
      <td>${formatters.statusBadge(p.status, p.statusLabel)}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="window.openReorderModal('${p.productId}', '${p.productName}', ${p.reorderLevel})">
          Reorder
        </button>
      </td>
    </tr>
  `).join('');
}
