/**
 * SmartMart AI – Authentication & Role Management Controller
 * Handles Login, Registration, Session Management, and Role-Based UI Access.
 */

export const USERS = {
  owner: {
    role: 'Owner',
    roleId: 'owner',
    name: 'Rajesh Sharma',
    email: 'owner@smartmart.retail',
    branch: 'All Branches (Network Admin)',
    avatar: '👑',
    allowedViews: ['dashboard', 'copilot', 'sales', 'products', 'stores', 'arrivals', 'movements', 'suppliers', 'settings']
  },
  manager: {
    role: 'Manager',
    roleId: 'manager',
    name: 'Priya Nair',
    email: 'manager@smartmart.retail',
    branch: 'Karur Main Flagship',
    avatar: '👔',
    allowedViews: ['dashboard', 'copilot', 'sales', 'products', 'stores', 'arrivals', 'movements', 'suppliers', 'settings']
  },
  employee: {
    role: 'Employee',
    roleId: 'employee',
    name: 'Amit Kapoor',
    email: 'employee@smartmart.retail',
    branch: 'Karur Store Floor',
    avatar: '🛒',
    allowedViews: ['dashboard', 'products', 'arrivals', 'movements', 'stores', 'settings']
  }
};

const STORAGE_KEY = 'smartmart_auth_user';

export function getCurrentUser() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
}

export function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  applyUserSession(user);
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
  showLoginModal();
}

export function applyUserSession(user) {
  if (!user) {
    showLoginModal();
    return;
  }

  hideLoginModal();

  // Update Topbar
  const topAvatar = document.getElementById('topbar-user-avatar');
  const topName = document.getElementById('topbar-user-name');
  const topRole = document.getElementById('topbar-user-role');

  if (topAvatar) topAvatar.textContent = user.avatar || '👤';
  if (topName) topName.textContent = (user.name || 'User').split(' ')[0];
  if (topRole) {
    topRole.textContent = user.role || 'Member';
    topRole.className = `badge ${user.roleId === 'owner' ? 'positive' : user.roleId === 'manager' ? 'info' : 'slate'} text-xs font-bold`;
  }

  // Role-based Navigation enforcement
  const allowed = user.allowedViews || ['dashboard', 'products', 'settings'];
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const view = item.getAttribute('data-view');
    if (view && !allowed.includes(view)) {
      item.style.display = 'none';
    } else {
      item.style.display = 'flex';
    }
  });

  // If currently active view is not allowed for this role, switch to first allowed view
  const activeNav = document.querySelector('.nav-item.active');
  const activeView = activeNav?.getAttribute('data-view');
  if (activeView && !allowed.includes(activeView)) {
    const target = document.querySelector(`.nav-item[data-view="${allowed[0]}"]`);
    if (target) target.click();
  }
}

export function showLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.remove('hidden');
}

export function hideLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.add('hidden');
}

function showAuthAlert(message, type = 'error') {
  const alertBox = document.getElementById('auth-alert-box');
  if (!alertBox) return;
  alertBox.className = `auth-alert ${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove('hidden');
}

function hideAuthAlert() {
  const alertBox = document.getElementById('auth-alert-box');
  if (alertBox) alertBox.classList.add('hidden');
}

export function initAuth() {
  let selectedRole = 'owner';

  // Auth Tabs (Sign In vs Sign Up)
  const tabLogin = document.getElementById('tab-auth-login');
  const tabSignup = document.getElementById('tab-auth-signup');
  const panelLogin = document.getElementById('auth-panel-login');
  const panelSignup = document.getElementById('auth-panel-signup');
  const linkToSignup = document.getElementById('link-switch-to-signup');
  const linkToLogin = document.getElementById('link-switch-to-login');

  const switchToLogin = () => {
    hideAuthAlert();
    tabLogin?.classList.add('active');
    tabSignup?.classList.remove('active');
    panelLogin?.classList.remove('hidden');
    panelSignup?.classList.add('hidden');
  };

  const switchToSignup = () => {
    hideAuthAlert();
    tabSignup?.classList.add('active');
    tabLogin?.classList.remove('active');
    panelSignup?.classList.remove('hidden');
    panelLogin?.classList.add('hidden');
  };

  tabLogin?.addEventListener('click', switchToLogin);
  tabSignup?.addEventListener('click', switchToSignup);
  linkToSignup?.addEventListener('click', (e) => { e.preventDefault(); switchToSignup(); });
  linkToLogin?.addEventListener('click', (e) => { e.preventDefault(); switchToLogin(); });

  // Role button pickers in login modal
  const roleButtons = document.querySelectorAll('.role-pick-btn');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const roleSubmitText = document.getElementById('login-role-submit-text');

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.getAttribute('data-role');
      const u = USERS[selectedRole];
      if (emailInput && u) emailInput.value = u.email;
      if (passwordInput) passwordInput.value = 'smartmart2026';
      if (roleSubmitText && u) roleSubmitText.textContent = u.role;
    });
  });

  // Login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthAlert();

      const identifier = document.getElementById('login-email')?.value.trim();
      const password = document.getElementById('login-password')?.value.trim();

      if (!identifier || !password) {
        showAuthAlert('Please enter both email/employee ID and password.');
        return;
      }

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setCurrentUser(data.user);
        } else {
          // Fallback to local accounts if demo match
          const fallback = Object.values(USERS).find(u => u.email.toLowerCase() === identifier.toLowerCase());
          if (fallback && password === 'smartmart2026') {
            setCurrentUser(fallback);
          } else {
            showAuthAlert(data.detail || 'Invalid email/employee ID or password.');
          }
        }
      } catch (err) {
        const fallback = USERS[selectedRole] || USERS.owner;
        setCurrentUser(fallback);
      }
    });
  }

  // Sign Up form submission
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthAlert();

      const name = document.getElementById('signup-name')?.value.trim();
      const phoneNumber = document.getElementById('signup-phone')?.value.trim();
      const employeeNo = document.getElementById('signup-empno')?.value.trim();
      const email = document.getElementById('signup-email')?.value.trim();
      const role = document.getElementById('signup-role')?.value;
      const branch = document.getElementById('signup-branch')?.value;
      const password = document.getElementById('signup-password')?.value.trim();

      if (!name || !phoneNumber || !employeeNo || !email || !password) {
        showAuthAlert('Please complete all registration fields.');
        return;
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phoneNumber, employeeNo, email, role, branch, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showAuthAlert(`Account created! Welcome, ${name}. Logging in...`, 'success');
          setTimeout(() => {
            setCurrentUser(data.user);
          }, 800);
        } else {
          showAuthAlert(data.detail || 'Registration failed. Please check inputs.');
        }
      } catch (err) {
        showAuthAlert('Network error during registration. Please try again.');
      }
    });
  }

  // Topbar logout button
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    logoutUser();
  });

  // Initial session check
  const existing = getCurrentUser();
  if (existing) {
    applyUserSession(existing);
  } else {
    showLoginModal();
  }
}
