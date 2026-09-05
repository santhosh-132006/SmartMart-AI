/**
 * RetailIQ - Application State & Formatters
 */

export const state = {
  currentView: 'dashboard',
  selectedStoreId: 'ALL',
  datePreset: 'last_30_days',
  customStartDate: null,
  customEndDate: null,
  currency: 'INR',
  currencySymbol: '₹',
  theme: 'light',
  
  // Active Data Cache
  dashboardData: null,
  salesData: null,
  inventoryData: null,
  stores: [],
  products: [],
  alerts: { high: [], medium: [], positive: [], totalCount: 0 },
  chatHistory: []
};

export const formatters = {
  currency(amount, compact = false) {
    if (isNaN(amount) || amount === null || amount === undefined) return '—';
    const sym = '₹';

    if (compact && Math.abs(amount) >= 10000000) {
      return `${sym}${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (compact && Math.abs(amount) >= 100000) {
      return `${sym}${(amount / 100000).toFixed(2)} L`;
    }
    if (compact && Math.abs(amount) >= 1000) {
      return `${sym}${new Intl.NumberFormat('en-IN').format(Math.round(amount))}`;
    }

    return `${sym}${new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
      minimumFractionDigits: 0
    }).format(amount)}`;
  },

  number(val, compact = false) {
    if (isNaN(val) || val === null || val === undefined) return '0';
    if (compact && Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (compact && Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return new Intl.NumberFormat('en-IN').format(val);
  },

  percent(val, includeSign = true) {
    if (isNaN(val) || val === null || val === undefined) return '0.0%';
    const sign = includeSign && val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
  },

  statusBadge(status, label) {
    const map = {
      stockout_risk: 'stockout_risk',
      low_stock: 'low_stock',
      overstocked: 'overstocked',
      slow_moving: 'slow_moving',
      sales_spike: 'sales_spike',
      sales_drop: 'sales_drop',
      healthy: 'healthy'
    };
    const cls = map[status] || 'healthy';
    return `<span class="status-badge ${cls}">${label || status}</span>`;
  }
};

export const showToast = (message, type = 'info') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};
