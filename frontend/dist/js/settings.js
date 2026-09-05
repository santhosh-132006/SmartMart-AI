/**
 * SmartMart AI – Settings Controller
 */

import { api } from './api.js';
import { getCurrentUser, setCurrentUser, logoutUser, USERS } from './auth.js';

export async function renderSettings() {
  const container = document.getElementById('view-settings');
  if (!container) return;

  // 1. Render Active User & Role
  const currentUser = getCurrentUser() || USERS.owner;
  
  const badgeRole = document.getElementById('settings-badge-role');
  const avatarDisp = document.getElementById('settings-avatar-display');
  const nameDisp = document.getElementById('settings-name-display');
  const emailDisp = document.getElementById('settings-email-display');
  const scopeDisp = document.getElementById('settings-scope-display');
  const permsDisp = document.getElementById('settings-perms-display');

  if (badgeRole) {
    badgeRole.textContent = currentUser.role;
    badgeRole.className = `badge ${currentUser.roleId === 'owner' ? 'positive' : currentUser.roleId === 'manager' ? 'info' : 'slate'} font-bold`;
  }
  if (avatarDisp) avatarDisp.textContent = currentUser.avatar;
  if (nameDisp) nameDisp.textContent = currentUser.name;
  if (emailDisp) emailDisp.textContent = currentUser.email;
  if (scopeDisp) scopeDisp.textContent = currentUser.branch;
  if (permsDisp) {
    permsDisp.textContent = currentUser.roleId === 'owner'
      ? 'Full Executive Access (Financials, Margins, Network Operations, Copilot, Audit)'
      : currentUser.roleId === 'manager'
      ? 'Store Operations Access (Sales Analytics, Multi-Store Triage, Inter-Store Transfers)'
      : 'Floor Staff Access (Product Catalogue, Stock Arrivals & Movement Logs)';
  }

  // Quick Role Switcher Buttons inside Settings
  document.getElementById('btn-switch-owner')?.addEventListener('click', () => {
    setCurrentUser(USERS.owner);
    renderSettings();
  });
  document.getElementById('btn-switch-manager')?.addEventListener('click', () => {
    setCurrentUser(USERS.manager);
    renderSettings();
  });
  document.getElementById('btn-switch-employee')?.addEventListener('click', () => {
    setCurrentUser(USERS.employee);
    renderSettings();
  });

  document.getElementById('btn-settings-logout')?.addEventListener('click', () => {
    logoutUser();
  });

  // 2. Load and Bind Threshold Settings from Backend
  try {
    const settings = await api.getSettings();
    
    const currSelect = document.getElementById('settings-currency');
    const themeSelect = document.getElementById('settings-theme');
    const stockoutInput = document.getElementById('settings-stockout-days');
    const overstockInput = document.getElementById('settings-overstock-days');
    const spikeInput = document.getElementById('settings-spike-pct');
    const dropInput = document.getElementById('settings-drop-pct');

    if (currSelect) currSelect.value = settings.currency || 'INR';
    if (themeSelect) themeSelect.value = settings.theme || 'light';
    if (stockoutInput) stockoutInput.value = settings.stockoutThresholdDays || 3.0;
    if (overstockInput) overstockInput.value = settings.overstockThresholdDays || 60.0;
    if (spikeInput) spikeInput.value = settings.salesSpikeThresholdPercent || 50;
    if (dropInput) dropInput.value = settings.salesDropThresholdPercent || 40;

    // Save Settings
    const saveBtn = document.getElementById('btn-save-settings');
    const toastMsg = document.getElementById('settings-toast-msg');

    if (saveBtn) {
      saveBtn.onclick = async () => {
        try {
          await api.updateSettings({
            currency: currSelect ? currSelect.value : 'INR',
            theme: themeSelect ? themeSelect.value : 'light',
            stockoutThresholdDays: stockoutInput ? parseFloat(stockoutInput.value) : 3.0,
            overstockThresholdDays: overstockInput ? parseFloat(overstockInput.value) : 60.0,
            salesSpikeThresholdPercent: spikeInput ? parseFloat(spikeInput.value) : 50,
            salesDropThresholdPercent: dropInput ? parseFloat(dropInput.value) : 40
          });

          if (toastMsg) {
            toastMsg.classList.remove('hidden');
            setTimeout(() => toastMsg.classList.add('hidden'), 3500);
          }
        } catch (err) {
          console.error('Failed to save settings:', err);
          alert('Failed to save settings: ' + err.message);
        }
      };
    }

    // Reset Defaults
    const resetBtn = document.getElementById('btn-reset-settings');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (currSelect) currSelect.value = 'INR';
        if (themeSelect) themeSelect.value = 'light';
        if (stockoutInput) stockoutInput.value = 3.0;
        if (overstockInput) overstockInput.value = 60.0;
        if (spikeInput) spikeInput.value = 50;
        if (dropInput) dropInput.value = 40;
      };
    }

  } catch (err) {
    console.error('Error fetching settings:', err);
  }
}
