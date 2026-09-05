/**
 * SmartMart AI – Main Application Entrypoint & Router
 */

import { api } from './api.js';
import { initAuth } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { renderSalesAnalytics } from './sales.js';
import { renderSettings } from './settings.js';
import { initCopilot, sendCopilotQuery } from './copilot.js';
import { openProductDetailModal } from './product_detail.js';

let activeView = 'dashboard';
let activeStore = 'ALL';
let activePreset = 'last_30_days';

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initNavigation();
  initGlobalSelectors();
  initModals();
  loadCurrentView();
});

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      if (!view) return;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      const targetPanel = document.getElementById(`view-${view}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
        activeView = view;
        loadCurrentView();
      }
    });
  });
}

function initGlobalSelectors() {
  const storeSelect = document.getElementById('global-store-select');
  const dateSelect = document.getElementById('global-date-select');
  const themeBtn = document.getElementById('theme-toggle');

  if (storeSelect) {
    storeSelect.onchange = () => {
      activeStore = storeSelect.value;
      loadCurrentView();
    };
  }

  if (dateSelect) {
    dateSelect.onchange = () => {
      activePreset = dateSelect.value;
      loadCurrentView();
    };
  }

  if (themeBtn) {
    themeBtn.onclick = () => {
      document.documentElement.classList.toggle('dark');
    };
  }

  // Quick copilot input on dashboard
  const quickInput = document.getElementById('quick-copilot-input');
  const quickBtn = document.getElementById('btn-quick-submit');

  const handleQuickSubmit = () => {
    const q = quickInput.value.trim();
    if (!q) return;
    quickInput.value = '';

    // Switch to copilot view
    document.getElementById('nav-copilot')?.click();
    sendCopilotQuery(q);
  };

  if (quickBtn) quickBtn.onclick = handleQuickSubmit;
  if (quickInput) {
    quickInput.onkeydown = (e) => {
      if (e.key === 'Enter') handleQuickSubmit();
    };
  }

  document.getElementById('btn-quick-copilot')?.addEventListener('click', () => {
    document.getElementById('nav-copilot')?.click();
  });

  document.getElementById('btn-reload-demo')?.addEventListener('click', async () => {
    if (confirm('Reload SmartMart demo dataset?')) {
      await api.resetDemoData();
      alert('SmartMart dataset reloaded successfully.');
      loadCurrentView();
    }
  });
}

function initModals() {
  document.getElementById('btn-close-product-modal')?.addEventListener('click', () => {
    document.getElementById('product-detail-modal')?.classList.add('hidden');
  });

  document.getElementById('btn-close-audit-modal')?.addEventListener('click', () => {
    document.getElementById('stock-audit-modal')?.classList.add('hidden');
  });
}

async function loadCurrentView() {
  if (activeView === 'dashboard') {
    renderDashboard(activeStore, activePreset);
  } else if (activeView === 'copilot') {
    initCopilot(activeStore, activePreset);
  } else if (activeView === 'sales') {
    renderSalesAnalytics(activeStore, activePreset);
  } else if (activeView === 'products') {
    renderProductsView();
  } else if (activeView === 'arrivals') {
    renderArrivalsView();
  } else if (activeView === 'movements') {
    renderMovementsView();
  } else if (activeView === 'suppliers') {
    renderSuppliersView();
  } else if (activeView === 'stores') {
    renderStoresView();
  } else if (activeView === 'settings') {
    renderSettings();
  }
}

async function renderProductsView() {
  const tableBody = document.querySelector('#products-catalog-table tbody');
  const searchInput = document.getElementById('product-search-input');
  const categoryFilter = document.getElementById('product-category-filter');

  if (!tableBody) return;
  tableBody.innerHTML = '<tr><td colspan="8" class="text-center p-4">Loading 200+ supermarket products...</td></tr>';

  try {
    const products = await api.getProducts();
    const stores = await api.getStores();
    const storeMap = Object.fromEntries(stores.map(s => [s.id, s.name]));

    const renderTable = () => {
      const q = (searchInput?.value || '').toLowerCase();
      const cat = categoryFilter?.value || 'ALL';

      const filtered = products.filter(p => {
        const matchesStore = activeStore === 'ALL' || p.storeId === activeStore;
        const matchesCat = cat === 'ALL' || p.category === cat;
        const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        return matchesStore && matchesCat && matchesQuery;
      });

      if (!filtered.length) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center p-4 text-muted">No matching products found.</td></tr>';
        return;
      }

      tableBody.innerHTML = filtered.slice(0, 100).map(p => `
        <tr>
          <td>
            <div class="font-bold cursor-pointer text-brand" onclick="openProductDetailModal('${p.id}')">${p.name}</div>
            <div class="text-xs text-muted">ID: ${p.id} | Brand: ${p.brand}</div>
          </td>
          <td><span class="badge slate">${p.category}</span></td>
          <td><span class="text-xs">${storeMap[p.storeId] || p.storeId}</span></td>
          <td>₹${p.sellingPrice}</td>
          <td><span class="font-bold ${p.currentStock <= p.reorderLevel ? 'text-rose' : 'text-slate'}">${p.currentStock} units</span></td>
          <td>${p.averageDailySales} u/day</td>
          <td><span class="badge ${p.estimatedDaysRemaining <= 3 ? 'danger' : 'info'}">${p.estimatedDaysRemaining}d</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="openProductDetailModal('${p.id}')">Audit Timeline</button>
          </td>
        </tr>
      `).join('');
    };

    renderTable();
    if (searchInput) searchInput.oninput = renderTable;
    if (categoryFilter) categoryFilter.onchange = renderTable;

  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-red p-4">Failed to load products: ${err.message}</td></tr>`;
  }
}

async function renderArrivalsView() {
  const tableBody = document.querySelector('#arrivals-table tbody');
  if (!tableBody) return;

  try {
    const arrivals = await api.getStockArrivals();
    const filtered = arrivals.filter(a => activeStore === 'ALL' || a.storeId === activeStore);

    tableBody.innerHTML = filtered.map(a => `
      <tr>
        <td>${a.arrivalDate}</td>
        <td><strong class="text-brand cursor-pointer" onclick="openProductDetailModal('${a.productId}')">${a.productName}</strong></td>
        <td>${a.supplierName}</td>
        <td><span class="badge positive">+${a.quantityReceived}</span></td>
        <td>${a.previousStock}</td>
        <td>${a.newStock}</td>
        <td><code>${a.invoiceNumber}</code></td>
        <td><code>${a.batchNumber || 'BAT-2026'}</code></td>
      </tr>
    `).join('');
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-red p-4">Error loading stock arrivals.</td></tr>`;
  }
}

async function renderMovementsView() {
  const tableBody = document.querySelector('#movements-table tbody');
  if (!tableBody) return;

  try {
    const movements = await api.getStockMovements();
    const filtered = movements.filter(m => activeStore === 'ALL' || m.storeId === activeStore);

    tableBody.innerHTML = filtered.map(m => `
      <tr>
        <td>${m.dateTime}</td>
        <td><strong class="text-brand cursor-pointer" onclick="openProductDetailModal('${m.productId}')">${m.productName}</strong></td>
        <td><span class="badge ${m.movementType.includes('Received') ? 'positive' : m.movementType.includes('Sale') ? 'info' : 'warning'}">${m.movementType}</span></td>
        <td>${m.quantity}</td>
        <td>${m.previousStock}</td>
        <td>${m.newStock}</td>
        <td class="text-xs text-muted">${m.reason}</td>
      </tr>
    `).join('');
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-red p-4">Error loading stock movements.</td></tr>`;
  }
}

async function renderSuppliersView() {
  const tableBody = document.querySelector('#suppliers-table tbody');
  if (!tableBody) return;

  try {
    const suppliers = await api.getSuppliers();
    tableBody.innerHTML = suppliers.map(s => `
      <tr>
        <td><code>${s.id}</code></td>
        <td><strong>${s.name}</strong></td>
        <td>${s.contact}</td>
        <td>${s.phone}</td>
        <td>${s.city}</td>
      </tr>
    `).join('');
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-red p-4">Error loading suppliers.</td></tr>`;
  }
}

async function renderStoresView() {
  const container = document.getElementById('stores-card-grid');
  if (!container) return;

  try {
    const data = await api.getDashboard('ALL');
    container.innerHTML = (data.stores || []).map(s => `
      <div class="card p-4">
        <div class="flex-between">
          <h3 class="text-lg font-bold">${s.name}</h3>
          <span class="badge info">${s.id}</span>
        </div>
        <div class="text-xs text-muted mt-1">📍 ${s.location} | Manager: ${s.manager}</div>
        <div class="grid-2 mt-3">
          <div><span class="text-xs text-muted">Monthly Revenue</span><div class="text-base font-bold text-emerald">₹${s.totalRevenue.toLocaleString('en-IN')}</div></div>
          <div><span class="text-xs text-muted">Units Sold</span><div class="text-base font-bold">${s.unitsSold.toLocaleString('en-IN')}</div></div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="text-red p-4">Error loading store analytics.</div>`;
  }
}

window.openProductDetailModal = openProductDetailModal;
