/**
 * RetailIQ - CSV Data Upload & Schema Validation Controller
 */

import { api } from './api.js';
import { showToast } from './state.js';

export function initUpload() {
  const dropzones = document.querySelectorAll('.dropzone');
  dropzones.forEach(zone => {
    const fileInput = zone.querySelector('.file-input');
    const type = zone.getAttribute('data-type');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileUpload(type, e.target.files[0]);
        }
      });
    }

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.style.borderColor = '#16a34a';
    });

    zone.addEventListener('dragleave', () => {
      zone.style.borderColor = '';
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(type, e.dataTransfer.files[0]);
      }
    });
  });

  // Download Templates Button
  const templateBtn = document.getElementById('btn-download-templates');
  if (templateBtn) {
    templateBtn.addEventListener('click', downloadSampleTemplates);
  }

  // Reload Demo Data Button on Upload View
  const reloadDemoBtn = document.getElementById('btn-upload-reload-demo');
  if (reloadDemoBtn) {
    reloadDemoBtn.addEventListener('click', async () => {
      try {
        await api.resetDemoData();
        showToast('Demo dataset successfully reloaded!', 'success');
        displayUploadResults({ success: true, message: 'Default demo dataset reloaded with 3 stores, 25 products, and 4,000+ sales records.' });
      } catch {
        showToast('Failed to reset demo data', 'danger');
      }
    });
  }
}

async function handleFileUpload(dataType, file) {
  showToast(`Validating & uploading ${file.name}...`, 'info');

  try {
    const result = await api.uploadCSV(dataType, file);
    displayUploadResults(result);

    if (result.success) {
      showToast(result.message || 'CSV imported successfully!', 'success');
    } else {
      showToast(`Validation errors found in ${file.name}`, 'danger');
    }
  } catch (err) {
    console.error('Upload failed:', err);
    showToast('Failed to upload CSV file', 'danger');
    displayUploadResults({ success: false, errors: ['Network or server communication error.'] });
  }
}

function displayUploadResults(res) {
  const panel = document.getElementById('upload-results-panel');
  const content = document.getElementById('upload-results-content');
  if (!panel || !content) return;

  panel.style.display = 'block';

  if (res.success) {
    content.innerHTML = `
      <div class="alert-item-card positive">
        <div class="flex items-center gap-2">
          <span class="badge-pill info">✓ Validation Passed</span>
          <strong class="text-main">${res.message}</strong>
        </div>
      </div>
    `;
  } else {
    const errList = (res.errors || []).map(e => `<li>${e}</li>`).join('');
    content.innerHTML = `
      <div class="alert-item-card high">
        <div class="flex items-center gap-2 mb-2">
          <span class="badge-pill danger">⚠️ Validation Failed (${(res.errors || []).length} errors)</span>
          <strong>The uploaded file contains invalid entries:</strong>
        </div>
        <ul class="list-disc pl-5 text-sm space-y-1 text-main">
          ${errList}
        </ul>
      </div>
    `;
  }
}

function downloadSampleTemplates() {
  const productsCSV = "Product ID,Product Name,Category,Price,Cost,Reorder Level,Target Stock\nPRD-101,Ultra Wireless Earbuds,Audio,4999,2500,20,50\nPRD-102,Smart Fitness Band,Smart Office & Wearables,2999,1400,15,40";
  const storesCSV = "Store ID,Store Name,Location,Address,Manager,Phone,Email\nSTR-101,Nexus Apex Store,Indiranagar Bengaluru,100ft Road,Sameer Rao,+91 98000 11111,apex@nexusiq.retail";
  const salesCSV = "Date,Store ID,Product ID,Units Sold,Revenue\n2026-09-01,STR-001,PRD-001,5,44975\n2026-09-01,STR-002,PRD-006,2,59980";
  const inventoryCSV = "Store ID,Product ID,Stock Quantity,Reorder Level,Date\nSTR-001,PRD-001,12,25,2026-09-01\nSTR-002,PRD-006,8,15,2026-09-01";

  downloadFile('products_template.csv', productsCSV);
  setTimeout(() => downloadFile('stores_template.csv', storesCSV), 300);
  setTimeout(() => downloadFile('sales_template.csv', salesCSV), 600);
  setTimeout(() => downloadFile('inventory_template.csv', inventoryCSV), 900);

  showToast('Downloaded 4 CSV templates', 'success');
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
