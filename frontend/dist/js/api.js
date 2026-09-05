/**
 * SmartMart AI – REST API Client
 */

export const api = {
  async getDashboard(storeId = 'ALL', preset = 'last_30_days') {
    const res = await fetch(`/api/analytics/dashboard?storeId=${storeId}&preset=${preset}`);
    return await res.json();
  },

  async getSalesAnalytics(storeId = 'ALL', preset = 'last_30_days') {
    const res = await fetch(`/api/analytics/sales?storeId=${storeId}&preset=${preset}`);
    return await res.json();
  },

  async getInventoryIntelligence(storeId = 'ALL') {
    const res = await fetch(`/api/analytics/inventory?storeId=${storeId}`);
    return await res.json();
  },

  async getStores() {
    const res = await fetch('/api/data/stores');
    return await res.json();
  },

  async getSuppliers() {
    const res = await fetch('/api/data/suppliers');
    return await res.json();
  },

  async getProducts() {
    const res = await fetch('/api/data/products');
    return await res.json();
  },

  async getStockArrivals() {
    const res = await fetch('/api/data/stock-arrivals');
    return await res.json();
  },

  async getStockMovements() {
    const res = await fetch('/api/data/stock-movements');
    return await res.json();
  },

  async getDynamicStockCalculation(productId, storeId = 'ALL') {
    const res = await fetch(`/api/data/dynamic-stock-calculation?productId=${productId}&storeId=${storeId}`);
    return await res.json();
  },

  async getAlerts(storeId = 'ALL') {
    const res = await fetch(`/api/analytics/alerts?storeId=${storeId}`);
    return await res.json();
  },

  async queryCopilot(query, storeId = 'ALL', datePreset = 'last_30_days') {
    const res = await fetch('/api/copilot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, storeId, datePreset })
    });
    return await res.json();
  },

  async transferStock(productId, fromStoreId, toStoreId, quantity) {
    const res = await fetch('/api/inventory/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, fromStoreId, toStoreId, quantity })
    });
    return await res.json();
  },

  async reorderStock(productId, storeId, quantity, supplier = 'Direct Supplier') {
    const res = await fetch('/api/inventory/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, storeId, quantity, supplier })
    });
    return await res.json();
  },

  async resetDemoData() {
    const res = await fetch('/api/data/reset-demo', { method: 'POST' });
    return await res.json();
  }
};
