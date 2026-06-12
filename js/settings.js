// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');

// Theme
const themeBtns = document.querySelectorAll('.theme-btn');

// Toggles
const pushNotifications = document.getElementById('pushNotifications');
const emailDigest = document.getElementById('emailDigest');
const onThisDayReminders = document.getElementById('onThisDayReminders');
const showExactLocation = document.getElementById('showExactLocation');
const autoBackup = document.getElementById('autoBackup');

// Selects
const privacySelect = document.getElementById('privacySelect');
const languageSelect = document.getElementById('languageSelect');

// Buttons
const exportDataBtn = document.getElementById('exportDataBtn');
const clearDataBtn = document.getElementById('clearDataBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const enable2faBtn = document.getElementById('enable2faBtn');

// Modals
const passwordModal = document.getElementById('passwordModal');
const deleteAccountModal = document.getElementById('deleteAccountModal');
const clearDataModal = document.getElementById('clearDataModal');

// Close buttons
const closePasswordModal = document.getElementById('closePasswordModal');
const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
const savePasswordBtn = document.getElementById('savePasswordBtn');

const closeDeleteAccountModal = document.getElementById('closeDeleteAccountModal');
const cancelDeleteAccountBtn = document.getElementById('cancelDeleteAccountBtn');
const confirmDeleteAccountBtn = document.getElementById('confirmDeleteAccountBtn');
const deleteConfirmInput = document.getElementById('deleteConfirmInput');

const closeClearDataModal = document.getElementById('closeClearDataModal');
const cancelClearDataBtn = document.getElementById('cancelClearDataBtn');
const confirmClearDataBtn = document.getElementById('confirmClearDataBtn');

// ===== Load Settings from localStorage =====
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('memonap_settings') || '{}');
    
    // Theme
    const savedTheme = settings.theme || 'light';
    themeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === savedTheme) {
            btn.classList.add('active');
        }
    });
    applyTheme(savedTheme);
    
    // Toggles
    if (pushNotifications) pushNotifications.checked = settings.pushNotifications !== false;
    if (emailDigest) emailDigest.checked = settings.emailDigest !== false;
    if (onThisDayReminders) onThisDayReminders.checked = settings.onThisDayReminders !== false;
    if (showExactLocation) showExactLocation.checked = settings.showExactLocation !== false;
    if (autoBackup) autoBackup.checked = settings.autoBackup !== false;
    
    // Selects
    if (privacySelect) privacySelect.value = settings.privacy || 'private';
    if (languageSelect) languageSelect.value = settings.language || 'en';
}

// ===== Save Settings =====
function saveSettings() {
    const settings = {
        theme: document.querySelector('.theme-btn.active')?.dataset.theme || 'light',
        pushNotifications: pushNotifications?.checked || false,
        emailDigest: emailDigest?.checked || false,
        onThisDayReminders: onThisDayReminders?.checked || false,
        showExactLocation: showExactLocation?.checked || false,
        autoBackup: autoBackup?.checked || false,
        privacy: privacySelect?.value || 'private',
        language: languageSelect?.value || 'en'
    };
    localStorage.setItem('memonap_settings', JSON.stringify(settings));
}

// ===== Apply Theme with Improved Dark Mode Colors =====
function applyTheme(theme) {
    const root = document.documentElement;
    const body = document.body;
    const sidebarElement = document.querySelector('.sidebar');
    const topHeader = document.querySelector('.top-header');
    const settingsCards = document.querySelectorAll('.settings-card');
    const settingItems = document.querySelectorAll('.setting-item');
    const modals = document.querySelectorAll('.modal-content');
    
    if (theme === 'dark') {
        // Main background - Deep blackish blue
        body.style.background = 'linear-gradient(145deg, #0a0e1a 0%, #0f1422 40%, #0b1020 100%)';
        body.style.color = '#e8e8f0';
        
        // Sidebar - Dark blue with blur
        if (sidebarElement) {
            sidebarElement.style.background = 'rgba(10, 14, 26, 0.96)';
            sidebarElement.style.borderRight = '1px solid rgba(255, 107, 139, 0.15)';
            sidebarElement.style.backdropFilter = 'blur(20px)';
        }
        
        // Top header - Dark glass
        if (topHeader) {
            topHeader.style.background = 'rgba(15, 20, 34, 0.75)';
            topHeader.style.backdropFilter = 'blur(10px)';
        }
        
        // Settings cards - Dark with subtle border
        settingsCards.forEach(card => {
            card.style.background = 'rgba(20, 28, 45, 0.8)';
            card.style.backdropFilter = 'blur(10px)';
            card.style.border = '1px solid rgba(255, 107, 139, 0.1)';
        });
        
        // Setting items
        settingItems.forEach(item => {
            item.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
        });
        
        // Text colors
        document.querySelectorAll('.setting-label').forEach(el => {
            el.style.color = '#f0f0ff';
        });
        
        document.querySelectorAll('.setting-desc').forEach(el => {
            el.style.color = '#9a9ac0';
        });
        
        document.querySelectorAll('.settings-section h3').forEach(el => {
            el.style.color = '#ffb8c6';
        });
        
        document.querySelectorAll('.welcome-text h2').forEach(el => {
            el.style.color = '#f0f0ff';
        });
        
        document.querySelectorAll('.welcome-text p').forEach(el => {
            el.style.color = '#9a9ac0';
        });
        
        // Inputs and selects
        document.querySelectorAll('.setting-select').forEach(el => {
            el.style.background = '#1a1f35';
            el.style.border = '1px solid rgba(255, 107, 139, 0.2)';
            el.style.color = '#e8e8f0';
        });
        
        // Buttons
        document.querySelectorAll('.secondary-btn').forEach(el => {
            el.style.background = 'transparent';
            el.style.border = '1px solid rgba(255, 107, 139, 0.3)';
            el.style.color = '#ffb8c6';
        });
        
        document.querySelectorAll('.danger-btn').forEach(el => {
            el.style.background = 'rgba(231, 76, 60, 0.15)';
            el.style.color = '#ff6b8b';
        });
        
        // Version badge
        document.querySelectorAll('.version-badge').forEach(el => {
            el.style.background = 'rgba(255, 107, 139, 0.15)';
            el.style.color = '#ffb8c6';
        });
        
        // Modal backgrounds
        modals.forEach(modal => {
            modal.style.background = '#1a1f35';
            modal.style.border = '1px solid rgba(255, 107, 139, 0.15)';
        });
        
        document.querySelectorAll('.modal-header').forEach(el => {
            el.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
        });
        
        document.querySelectorAll('.modal-footer').forEach(el => {
            el.style.borderTop = '1px solid rgba(255, 255, 255, 0.05)';
        });
        
        document.querySelectorAll('.modal-content .form-group input').forEach(el => {
            el.style.background = '#0f1422';
            el.style.border = '1px solid rgba(255, 107, 139, 0.2)';
            el.style.color = '#e8e8f0';
        });
        
        document.querySelectorAll('.modal-content label').forEach(el => {
            el.style.color = '#ffb8c6';
        });
        
        // Nav items in sidebar
        document.querySelectorAll('.nav-item').forEach(el => {
            if (!el.classList.contains('active')) {
                el.style.color = '#9a9ac0';
            }
        });
        
        document.querySelectorAll('.nav-item.active').forEach(el => {
            el.style.background = 'linear-gradient(135deg, #ff6b8b, #ffb347)';
            el.style.color = 'white';
        });
        
        // User profile mini
        const userProfileMini = document.querySelector('.user-profile-mini');
        if (userProfileMini) {
            userProfileMini.style.background = 'rgba(255, 107, 139, 0.08)';
        }
        
        const userInfoMini = document.querySelectorAll('.user-info-mini h4');
        userInfoMini.forEach(el => {
            el.style.color = '#f0f0ff';
        });
        
        const userInfoMiniP = document.querySelectorAll('.user-info-mini p');
        userInfoMiniP.forEach(el => {
            el.style.color = '#9a9ac0';
        });
        
        // Toggle switch background
        document.querySelectorAll('.toggle-slider').forEach(el => {
            el.style.backgroundColor = '#2a2f45';
        });
        
    } else if (theme === 'light') {
        // Reset to original light theme
        body.style.background = 'linear-gradient(145deg, #fef5f7 0%, #fde8ed 40%, #eef2fa 100%)';
        body.style.color = '#2d1b2e';
        
        if (sidebarElement) {
            sidebarElement.style.background = 'rgba(255, 255, 255, 0.96)';
            sidebarElement.style.borderRight = '1px solid rgba(255, 107, 139, 0.12)';
        }
        
        if (topHeader) {
            topHeader.style.background = 'rgba(255, 255, 255, 0.75)';
        }
        
        settingsCards.forEach(card => {
            card.style.background = 'rgba(255, 255, 255, 0.8)';
            card.style.border = 'none';
        });
        
        settingItems.forEach(item => {
            item.style.borderBottom = '1px solid #f0e0e4';
        });
        
        document.querySelectorAll('.setting-label').forEach(el => {
            el.style.color = '#2d1b2e';
        });
        
        document.querySelectorAll('.setting-desc').forEach(el => {
            el.style.color = '#888';
        });
        
        document.querySelectorAll('.settings-section h3').forEach(el => {
            el.style.color = '#2d1b2e';
        });
        
        document.querySelectorAll('.welcome-text h2').forEach(el => {
            el.style.color = '#2d1b2e';
        });
        
        document.querySelectorAll('.setting-select').forEach(el => {
            el.style.background = 'white';
            el.style.border = '1.5px solid #f0e0e4';
            el.style.color = '#2d1b2e';
        });
        
        document.querySelectorAll('.secondary-btn').forEach(el => {
            el.style.background = 'transparent';
            el.style.border = '1.5px solid #f0e0e4';
            el.style.color = '#666';
        });
        
        document.querySelectorAll('.danger-btn').forEach(el => {
            el.style.background = 'rgba(231, 76, 60, 0.1)';
            el.style.color = '#e74c3c';
        });
        
        document.querySelectorAll('.version-badge').forEach(el => {
            el.style.background = 'rgba(255, 107, 139, 0.1)';
            el.style.color = '#ff6b8b';
        });
        
        modals.forEach(modal => {
            modal.style.background = 'white';
        });
        
        document.querySelectorAll('.modal-header').forEach(el => {
            el.style.borderBottom = '1px solid #f0e0e4';
        });
        
        document.querySelectorAll('.modal-footer').forEach(el => {
            el.style.borderTop = '1px solid #f0e0e4';
        });
        
        document.querySelectorAll('.modal-content .form-group input').forEach(el => {
            el.style.background = 'white';
            el.style.border = '1.5px solid #f0e0e4';
            el.style.color = '#2d1b2e';
        });
        
        document.querySelectorAll('.nav-item').forEach(el => {
            if (!el.classList.contains('active')) {
                el.style.color = '#666';
            }
        });
        
        document.querySelectorAll('.nav-item.active').forEach(el => {
            el.style.background = 'linear-gradient(135deg, #ff6b8b, #ffb347)';
            el.style.color = 'white';
        });
        
        if (userProfileMini) {
            userProfileMini.style.background = 'rgba(255, 107, 139, 0.06)';
        }
        
        userInfoMini.forEach(el => {
            el.style.color = '#2d1b2e';
        });
        
        userInfoMiniP.forEach(el => {
            el.style.color = '#888';
        });
        
        document.querySelectorAll('.toggle-slider').forEach(el => {
            el.style.backgroundColor = '#ddd';
        });
    }
}

// ===== Theme Change =====
themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyTheme(btn.dataset.theme);
        saveSettings();
    });
});

// ===== Save on change =====
const changeListeners = [pushNotifications, emailDigest, onThisDayReminders, showExactLocation, autoBackup, privacySelect, languageSelect];
changeListeners.forEach(el => {
    if (el) el.addEventListener('change', saveSettings);
});

// ===== Export Data =====
function exportData() {
    const memories = localStorage.getItem('memonap_memories');
    const collections = localStorage.getItem('memonap_collections');
    const profile = localStorage.getItem('memonap_profile');
    const settings = localStorage.getItem('memonap_settings');
    
    const exportData = {
        memories: memories ? JSON.parse(memories) : [],
        collections: collections ? JSON.parse(collections) : [],
        profile: profile ? JSON.parse(profile) : {},
        settings: settings ? JSON.parse(settings) : {},
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memonap_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Data exported successfully!');
}

// ===== Change Password =====
function openPasswordModal() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    passwordModal.classList.add('active');
}

function closePasswordModalFunc() {
    passwordModal.classList.remove('active');
}

function savePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (!current || !newPass || !confirm) {
        alert('Please fill all fields');
        return;
    }
    if (newPass !== confirm) {
        alert('New passwords do not match');
        return;
    }
    if (newPass.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    alert('✅ Password changed successfully!');
    closePasswordModalFunc();
}

// ===== Delete Account =====
function openDeleteAccountModal() {
    deleteConfirmInput.value = '';
    deleteAccountModal.classList.add('active');
}

function closeDeleteAccountModalFunc() {
    deleteAccountModal.classList.remove('active');
}

function confirmDeleteAccount() {
    if (deleteConfirmInput.value === 'DELETE') {
        if (confirm('⚠️ This will permanently delete ALL your data. Are you absolutely sure?')) {
            localStorage.clear();
            sessionStorage.clear();
            alert('Account deleted. Redirecting to home...');
            window.location.href = 'index.html';
        }
    } else {
        alert('Type "DELETE" to confirm account deletion');
    }
}

// ===== Clear Data =====
function openClearDataModal() {
    clearDataModal.classList.add('active');
}

function closeClearDataModalFunc() {
    clearDataModal.classList.remove('active');
}

function confirmClearData() {
    localStorage.removeItem('memonap_memories');
    localStorage.removeItem('memonap_collections');
    alert('All data cleared! Redirecting to dashboard...');
    window.location.href = 'dashboard.html';
}

// ===== Enable 2FA =====
function enable2FA() {
    alert('🔐 Two-Factor Authentication coming soon!');
}

// ===== Event Listeners =====
if (exportDataBtn) exportDataBtn.addEventListener('click', exportData);
if (clearDataBtn) clearDataBtn.addEventListener('click', openClearDataModal);
if (changePasswordBtn) changePasswordBtn.addEventListener('click', openPasswordModal);
if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', openDeleteAccountModal);
if (enable2faBtn) enable2faBtn.addEventListener('click', enable2FA);

if (closePasswordModal) closePasswordModal.addEventListener('click', closePasswordModalFunc);
if (cancelPasswordBtn) cancelPasswordBtn.addEventListener('click', closePasswordModalFunc);
if (savePasswordBtn) savePasswordBtn.addEventListener('click', savePassword);

if (closeDeleteAccountModal) closeDeleteAccountModal.addEventListener('click', closeDeleteAccountModalFunc);
if (cancelDeleteAccountBtn) cancelDeleteAccountBtn.addEventListener('click', closeDeleteAccountModalFunc);
if (confirmDeleteAccountBtn) confirmDeleteAccountBtn.addEventListener('click', confirmDeleteAccount);

if (closeClearDataModal) closeClearDataModal.addEventListener('click', closeClearDataModalFunc);
if (cancelClearDataBtn) cancelClearDataBtn.addEventListener('click', closeClearDataModalFunc);
if (confirmClearDataBtn) confirmClearDataBtn.addEventListener('click', confirmClearData);

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
        closePasswordModalFunc();
        closeDeleteAccountModalFunc();
        closeClearDataModalFunc();
    });
});

// ===== Sidebar Functions =====
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
        if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

// ===== Check Auth =====
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
    }
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }
}

// Initialize
checkAuth();
loadSettings();

console.log('%c⚙️ Settings Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');