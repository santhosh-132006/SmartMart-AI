/**
 * RetailIQ - Store Network Management Controller
 */

import { api } from './api.js';
import { state, formatters, showToast } from './state.js';

export async function renderStores() {
  const container = document.getElementById('view-stores');
  if (!container) return;

  try {
    const data = await api.getDashboard('ALL', state.datePreset);
    state.stores = data.stores;

    // 1. Render Store Cards Grid
    const cardsGrid = document.getElementById('stores-card-grid');
    if (cardsGrid) {
      cardsGrid.innerHTML = data.stores.map(store => `
        <div class="store-card">
          <div class="store-card-header">
            <div>
              <div class="text-xs font-mono text-muted">${store.storeId}</div>
              <h3 class="text-lg font-bold text-main mt-0.5">${store.storeName}</h3>
              <p class="text-xs text-muted mt-1">📍 ${store.location}</p>
            </div>
            <span class="badge-pill ${store.salesGrowthPercent >= 0 ? 'info' : 'danger'}">
              ${store.salesGrowthPercent >= 0 ? '+' : ''}${store.salesGrowthPercent}% Growth
            </span>
          </div>

          <div class="store-stats-grid">
            <div class="store-stat-box">
              <span class="store-stat-label">Total Revenue</span>
              <span class="store-stat-val text-brand">${formatters.currency(store.totalSales)}</span>
            </div>
            <div class="store-stat-box">
              <span class="store-stat-label">Units Sold</span>
              <span class="store-stat-val">${formatters.number(store.unitsSold)}</span>
            </div>
            <div class="store-stat-box">
              <span class="store-stat-label">Inventory Units</span>
              <span class="store-stat-val">${formatters.number(store.currentInventoryUnits)}</span>
            </div>
            <div class="store-stat-box">
              <span class="store-stat-label">Inventory Value</span>
              <span class="store-stat-val">${formatters.currency(store.inventoryValue, true)}</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs pt-2 border-t">
            <div class="flex gap-2">
              <span class="badge-pill danger">🔴 ${store.stockoutRiskCount} Stockout Risks</span>
              <span class="badge-pill purple">🟣 ${store.overstockedCount} Overstocked</span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.selectAndFilterStore('${store.storeId}')">
              Filter to Store &rarr;
            </button>
          </div>
        </div>
      `).join('');
    }

    // 2. Render Store Comparison Table
    const tbody = document.querySelector('#stores-comparison-table tbody');
    if (tbody) {
      tbody.innerHTML = data.stores.map(s => `
        <tr>
          <td><strong>${s.storeName}</strong></td>
          <td>📍 ${s.location}</td>
          <td><strong>${formatters.currency(s.totalSales)}</strong></td>
          <td><strong>${formatters.number(s.unitsSold)}</strong> units</td>
          <td>${formatters.currency(s.totalProfit)}</td>
          <td>${formatters.number(s.currentInventoryUnits)}</td>
          <td>${formatters.currency(s.inventoryValue)}</td>
          <td><strong class="text-rose">${s.stockoutRiskCount}</strong></td>
          <td><strong class="text-purple">${s.overstockedCount}</strong></td>
          <td>
            <span class="${s.salesGrowthPercent >= 0 ? 'text-emerald font-bold' : 'text-rose font-bold'}">
              ${s.salesGrowthPercent >= 0 ? '+' : ''}${s.salesGrowthPercent}%
            </span>
          </td>
        </tr>
      `).join('');
    }

  } catch (err) {
    console.error('Error rendering stores:', err);
    showToast('Failed to load stores network', 'danger');
  }
}
