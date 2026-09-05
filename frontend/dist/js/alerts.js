/**
 * RetailIQ - Dedicated Alerts & Issue Triage Controller
 */

import { api } from './api.js';
import { state, showToast } from './state.js';

export async function renderAlerts() {
  const container = document.getElementById('view-alerts');
  if (!container) return;

  try {
    const data = await api.getAlerts(state.selectedStoreId);
    state.alerts = data;

    document.getElementById('alerts-page-total').innerText = data.totalCount;
    document.getElementById('alerts-page-high').innerText = data.high.length;
    document.getElementById('alerts-page-med').innerText = data.medium.length;
    document.getElementById('alerts-page-pos').innerText = data.positive.length;

    renderAlertsList('all');

    // Attach filter listeners
    const tabs = container.querySelectorAll('.triage-tab-btn');
    tabs.forEach(tab => {
      tab.onclick = (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        const f = e.target.getAttribute('data-filter');
        renderAlertsList(f);
      };
    });

  } catch (err) {
    console.error('Error rendering alerts:', err);
    showToast('Failed to load alerts feed', 'danger');
  }
}

function renderAlertsList(filterType = 'all') {
  const feed = document.getElementById('alerts-full-feed');
  if (!feed) return;

  let list = [];
  if (filterType === 'all') {
    list = [...state.alerts.high, ...state.alerts.medium, ...state.alerts.positive];
  } else if (filterType === 'high') {
    list = state.alerts.high;
  } else if (filterType === 'medium') {
    list = state.alerts.medium;
  } else if (filterType === 'positive') {
    list = state.alerts.positive;
  }

  if (list.length === 0) {
    feed.innerHTML = '<div class="card p-6 text-center text-muted">No operational alerts found for this filter.</div>';
    return;
  }

  feed.innerHTML = list.map(alert => {
    const priorityClass = alert.priority;
    const tag = alert.priority === 'high' ? '🔴 High Priority' : (alert.priority === 'medium' ? '🟠 Medium Priority' : '🟢 Positive Signal');

    const metricsHtml = Object.entries(alert.metrics || {}).map(([k, v]) => `
      <div class="alert-metric-item">
        <span class="alert-metric-label">${k}:</span>
        <span class="alert-metric-value">${v}</span>
      </div>
    `).join('');

    return `
      <div class="alert-item-card ${priorityClass}">
        <div class="alert-top">
          <div class="flex items-center gap-2">
            <span class="badge-pill ${priorityClass === 'high' ? 'danger' : (priorityClass === 'medium' ? 'warning' : 'info')}">${tag}</span>
            <span class="alert-title">${alert.title}</span>
          </div>
          <span class="alert-store-tag">${alert.storeName}</span>
        </div>

        <div class="alert-metrics-row">
          ${metricsHtml}
        </div>

        <div class="alert-reason">${alert.reason}</div>

        <div class="alert-action-box">
          <div class="alert-action-text">
            <strong>Recommended Action:</strong> ${alert.actionRecommendation}
          </div>
          ${alert.productId ? `
            <button class="btn btn-secondary btn-sm" onclick="window.openReorderModal('${alert.productId}', '${alert.productName || 'Product'}', 30)">
              Execute Action
            </button>
          ` : ''}
        </div>

        ${alert.assumptions ? `<div class="alert-assumptions">ℹ️ Assumption: ${alert.assumptions}</div>` : ''}
      </div>
    `;
  }).join('');
}
