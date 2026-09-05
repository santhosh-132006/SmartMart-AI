/**
 * SmartMart AI – Sales Analytics Controller
 */

import { api } from './api.js';

let salesTrendChartInstance = null;
let categoryChartInstance = null;

export async function renderSalesAnalytics(storeId = 'ALL', preset = 'last_30_days') {
  const container = document.getElementById('view-sales');
  if (!container) return;

  try {
    const data = await api.getSalesAnalytics(storeId, preset);
    if (!data) return;

    // 1. Summary KPIs
    const sum = data.summary || {};
    const revEl = document.getElementById('sales-kpi-revenue');
    if (revEl) revEl.textContent = `₹${Math.round(sum.totalRevenue || 0).toLocaleString('en-IN')}`;

    const unitsEl = document.getElementById('sales-kpi-units');
    if (unitsEl) unitsEl.textContent = (sum.unitsSold || 0).toLocaleString('en-IN');

    const dailyEl = document.getElementById('sales-kpi-daily');
    if (dailyEl) dailyEl.textContent = `${(sum.avgDailySales || 0).toLocaleString('en-IN')} u/day`;

    // 2. Trend Chart (Daily Revenue)
    const trendCanvas = document.getElementById('sales-trend-canvas');
    if (trendCanvas && data.trend) {
      if (salesTrendChartInstance) salesTrendChartInstance.destroy();
      const labels = data.trend.map(d => d.date.slice(5));
      const revenues = data.trend.map(d => d.revenue);

      salesTrendChartInstance = new Chart(trendCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Daily Revenue (₹)',
            data: revenues,
            backgroundColor: '#16a34a',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Revenue: ₹${Number(ctx.parsed.y).toLocaleString('en-IN')}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b' } },
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: {
                color: '#64748b',
                callback: (val) => `₹${Number(val).toLocaleString('en-IN')}`
              }
            }
          }
        }
      });
    }

    // 3. Category Breakdown Chart
    const catCanvas = document.getElementById('sales-category-canvas');
    if (catCanvas && data.categories) {
      if (categoryChartInstance) categoryChartInstance.destroy();
      const topCategories = data.categories.slice(0, 6);
      const catLabels = topCategories.map(c => c.category);
      const catRevs = topCategories.map(c => c.revenue);
      const colors = ['#16a34a', '#22c55e', '#15803d', '#4ade80', '#86efac', '#a7f3d0'];

      categoryChartInstance = new Chart(catCanvas, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{
            data: catRevs,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { boxWidth: 12, color: '#334155' } },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ₹${Number(ctx.parsed).toLocaleString('en-IN')}`
              }
            }
          }
        }
      });
    }

    // 4. Category Performance Table (All 18 Categories)
    const tableBody = document.querySelector('#sales-category-table tbody');
    if (tableBody && data.categories) {
      const totalRev = sum.totalRevenue || 1;
      tableBody.innerHTML = data.categories.map(c => {
        const share = ((c.revenue / totalRev) * 100).toFixed(1);
        return `
          <tr>
            <td>
              <div class="font-bold text-main">${c.category}</div>
            </td>
            <td><span class="badge slate font-bold">${c.skuCount} SKUs</span></td>
            <td><strong>${(c.units || 0).toLocaleString('en-IN')}</strong> units</td>
            <td><strong class="text-brand">₹${Math.round(c.revenue || 0).toLocaleString('en-IN')}</strong></td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="flex: 1; background: #E5E7EB; border-radius: 999px; height: 8px; overflow: hidden;">
                  <div style="width: ${share}%; background: #16A34A; height: 100%; border-radius: 999px;"></div>
                </div>
                <span class="text-xs font-bold text-muted">${share}%</span>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

  } catch (err) {
    console.error('Error rendering sales analytics:', err);
  }
}
