// settings.js - FIXED VERSION

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
const termsBtn = document.getElementById('termsBtn');
const privacyBtn = document.getElementById('privacyBtn');

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

// ===== Check Auth =====
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userName = sessionStorage.getItem('userName');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    
    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }
    
    return true;
}

// ===== Get System Theme =====
function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ===== Apply Theme to ALL Pages =====
function applyTheme(theme) {
    const body = document.body;
    
    // If auto, use system preference
    let actualTheme = theme;
    if (theme === 'auto') {
        actualTheme = getSystemTheme();
    }
    
    // Remove existing theme classes
    body.classList.remove('light-mode', 'dark-mode', 'theme-light', 'theme-dark');
    
    // Add new theme class - USING 'dark-mode' to match CSS
    if (actualTheme === 'dark') {
        body.classList.add('dark-mode');
        console.log('🌙 Dark mode applied');
    } else {
        body.classList.add('light-mode');
        console.log('☀️ Light mode applied');
    }
    
    // Store theme preference for ALL pages
    localStorage.setItem('memonap_theme', actualTheme);
    localStorage.setItem('memonap_preferred_theme', theme);
    
    // Update UI display
    updateThemeDisplay(actualTheme, theme);
}

// ===== Update Theme Display =====
function updateThemeDisplay(actualTheme, preferredTheme) {
    const display = document.getElementById('currentThemeDisplay');
    const indicator = document.getElementById('themeIndicator');
    
    if (display) {
        display.textContent = actualTheme.charAt(0).toUpperCase() + actualTheme.slice(1);
    }
    if (indicator) {
        indicator.textContent = actualTheme === 'dark' ? '🌙' : '☀️';
    }
    
    // Update theme buttons
    themeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === preferredTheme) {
            btn.classList.add('active');
        }
    });
}

// ===== Load Theme on Page Load =====
function loadThemeFromStorage() {
    const preferredTheme = localStorage.getItem('memonap_preferred_theme') || 'light';
    const settings = JSON.parse(localStorage.getItem('memonap_settings') || '{}');
    const savedTheme = settings.theme || preferredTheme || 'light';
    
    // Apply the saved theme
    applyTheme(savedTheme);
}

// ===== Load Settings =====
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('memonap_settings') || '{}');
    
    // Theme
    const savedTheme = settings.theme || localStorage.getItem('memonap_preferred_theme') || 'light';
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
    const activeTheme = document.querySelector('.theme-btn.active')?.dataset.theme || 'light';
    const settings = {
        theme: activeTheme,
        pushNotifications: pushNotifications?.checked || false,
        emailDigest: emailDigest?.checked || false,
        onThisDayReminders: onThisDayReminders?.checked || false,
        showExactLocation: showExactLocation?.checked || false,
        autoBackup: autoBackup?.checked || false,
        privacy: privacySelect?.value || 'private',
        language: languageSelect?.value || 'en'
    };
    localStorage.setItem('memonap_settings', JSON.stringify(settings));
    localStorage.setItem('memonap_preferred_theme', activeTheme);
    applyTheme(activeTheme);
    
    showToast('Settings saved successfully!');
}

// ===== Show Toast Message =====
function showToast(message, isError = false) {
    let toast = document.getElementById('settingsToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'settingsToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: ${isError ? '#e74c3c' : '#27ae60'};
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// ===== Listen for System Theme Changes (Auto Mode) =====
function listenForSystemThemeChanges() {
    const systemThemeListener = window.matchMedia('(prefers-color-scheme: dark)');
    systemThemeListener.addEventListener('change', (e) => {
        const currentTheme = localStorage.getItem('memonap_preferred_theme');
        if (currentTheme === 'auto') {
            applyTheme('auto');
        }
    });
}

// ===== Theme Button Click =====
themeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const theme = this.dataset.theme;
        console.log('🔄 Theme button clicked:', theme);
        
        // Update button states
        themeBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Apply theme
        applyTheme(theme);
        
        // Save settings
        const settings = JSON.parse(localStorage.getItem('memonap_settings') || '{}');
        settings.theme = theme;
        localStorage.setItem('memonap_settings', JSON.stringify(settings));
        localStorage.setItem('memonap_preferred_theme', theme);
        
        showToast('Theme updated: ' + theme);
    });
});

// ===== Save on change =====
const changeListeners = [pushNotifications, emailDigest, onThisDayReminders, showExactLocation, autoBackup, privacySelect, languageSelect];
changeListeners.forEach(el => {
    if (el) el.addEventListener('change', saveSettings);
});

// ===== Export Data as HTML =====
function exportData() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userId = userEmail || 'guest';
    
    const memories = JSON.parse(localStorage.getItem(`memonap_memories_${userId}`) || '[]');
    const collections = JSON.parse(localStorage.getItem(`memonap_collections_${userId}`) || '[]');
    const profile = JSON.parse(localStorage.getItem(`memonap_profile_${userId}`) || '{}');
    const diary = JSON.parse(localStorage.getItem(`memonap_diary_${userId}`) || '[]');
    
    // Build HTML for export
    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MemoMap Export - ${new Date().toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #fdf6f0; padding: 2rem; color: #2d1b2e; max-width: 1200px; margin: 0 auto; }
        h1 { font-size: 2.5rem; color: #5c3d2e; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 10px; }
        .header { text-align: center; padding: 2rem 0; border-bottom: 2px solid #f0e0e4; margin-bottom: 2rem; }
        .header p { color: #888; font-size: 1.1rem; }
        .section { margin-bottom: 2rem; }
        .section h2 { background: linear-gradient(135deg, #ff6b8b, #ffb347); color: white; padding: 0.8rem 1.5rem; border-radius: 40px; display: inline-block; margin-bottom: 1rem; }
        .memory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .memory-card { background: white; border-radius: 20px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f0e0e4; }
        .memory-card h3 { color: #2d1b2e; margin-bottom: 0.3rem; }
        .memory-card .location { color: #ff6b8b; font-size: 0.9rem; }
        .memory-card .date { color: #888; font-size: 0.8rem; margin: 0.3rem 0; }
        .memory-card .mood { display: inline-block; padding: 0.2rem 0.8rem; background: rgba(255,107,139,0.1); border-radius: 20px; font-size: 0.8rem; }
        .memory-card .story { color: #666; margin-top: 0.5rem; font-size: 0.9rem; line-height: 1.6; }
        .profile-info { background: white; border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .profile-info .avatar { font-size: 4rem; }
        .profile-info .name { font-size: 1.5rem; font-weight: 600; }
        .profile-info .email { color: #888; }
        .diary-entry { background: white; border-radius: 20px; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid #f0e0e4; }
        .diary-entry h3 { color: #2d1b2e; }
        .diary-entry .diary-date { color: #888; font-size: 0.8rem; }
        .diary-entry .diary-content { margin-top: 0.5rem; color: #666; line-height: 1.6; }
        .footer { text-align: center; padding: 2rem; color: #888; border-top: 2px solid #f0e0e4; margin-top: 2rem; }
        .tag { display: inline-block; padding: 0.2rem 0.6rem; background: rgba(255,107,139,0.08); border-radius: 20px; font-size: 0.7rem; color: #ff6b8b; margin: 0.2rem; }
        @media print { body { background: white; padding: 1rem; } .memory-card { break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🗺️ MemoMap</h1>
        <p>Every Place Has a Story</p>
        <p style="font-size: 0.8rem;">Exported on ${new Date().toLocaleString()}</p>
    </div>
`;

    // Profile Section
    if (profile.name) {
        html += `
    <div class="section">
        <h2>👤 Profile</h2>
        <div class="profile-info">
            <div class="avatar">${profile.avatar || '🌍'}</div>
            <div>
                <div class="name">${profile.name}</div>
                <div class="email">${profile.email}</div>
                ${profile.bio ? `<div style="color:#888; font-size:0.9rem;">${profile.bio}</div>` : ''}
                ${profile.quote ? `<div style="color:#ff6b8b; font-style:italic;">"${profile.quote}"</div>` : ''}
            </div>
        </div>
    </div>
`;
    }

    // Memories Section
    if (memories.length > 0) {
        const moodEmojis = { happy: '😊', peaceful: '😌', loved: '❤️', excited: '😎', nostalgic: '📸', sad: '😢' };
        html += `
    <div class="section">
        <h2>📸 Memories (${memories.length})</h2>
        <div class="memory-grid">
`;
        memories.forEach(m => {
            html += `
            <div class="memory-card">
                <h3>${m.title || 'Untitled'}</h3>
                <div class="location">📍 ${m.location || 'Unknown'}</div>
                <div class="date">📅 ${m.date ? new Date(m.date).toLocaleDateString() : 'Unknown'}</div>
                <div class="mood">${moodEmojis[m.mood] || '📝'} ${m.mood || 'No mood'}</div>
                ${m.tags && m.tags.length > 0 ? `<div>${m.tags.map(t => `<span class="tag">#${t}</span>`).join('')}</div>` : ''}
                ${m.story ? `<div class="story">${m.story}</div>` : ''}
                ${m.photos && m.photos.length > 0 ? `<div style="margin-top:0.5rem; color:#888; font-size:0.8rem;">📷 ${m.photos.length} photo(s)</div>` : ''}
            </div>
`;
        });
        html += `
        </div>
    </div>
`;
    }

    // Diary Section
    if (diary.length > 0) {
        html += `
    <div class="section">
        <h2>📖 Digital Diary (${diary.length} entries)</h2>
`;
        diary.forEach(entry => {
            html += `
            <div class="diary-entry">
                <h3>${entry.title || 'Untitled'}</h3>
                <div class="diary-date">${entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'Unknown'}</div>
                <div class="diary-content">${entry.content || 'No content'}</div>
            </div>
`;
        });
        html += `
    </div>
`;
    }

    html += `
    <div class="footer">
        <p>🗺️ MemoMap - Every Place Has a Story</p>
        <p style="font-size: 0.8rem; margin-top: 0.5rem;">Exported on ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;

    // Create download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memonap_export_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Data exported successfully!');
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
        showToast('Please fill all fields', true);
        return;
    }
    if (newPass !== confirm) {
        showToast('New passwords do not match', true);
        return;
    }
    if (newPass.length < 6) {
        showToast('Password must be at least 6 characters', true);
        return;
    }
    
    showToast('✅ Password changed successfully!');
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
            const userEmail = sessionStorage.getItem('userEmail');
            const userId = userEmail || 'guest';
            
            localStorage.removeItem(`memonap_memories_${userId}`);
            localStorage.removeItem(`memonap_collections_${userId}`);
            localStorage.removeItem(`memonap_profile_${userId}`);
            localStorage.removeItem(`memonap_diary_${userId}`);
            localStorage.removeItem(`memonap_notifications_${userId}`);
            
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().catch(console.error);
            }
            
            localStorage.clear();
            sessionStorage.clear();
            showToast('Account deleted. Redirecting...');
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    } else {
        showToast('Type "DELETE" to confirm', true);
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
    const userEmail = sessionStorage.getItem('userEmail');
    const userId = userEmail || 'guest';
    
    localStorage.removeItem(`memonap_memories_${userId}`);
    localStorage.removeItem(`memonap_collections_${userId}`);
    localStorage.removeItem(`memonap_diary_${userId}`);
    localStorage.removeItem(`memonap_notifications_${userId}`);
    
    showToast('All data cleared!');
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
}

// ===== Enable 2FA =====
function enable2FA() {
    showToast('🔐 Two-Factor Authentication coming soon!');
}

// ===== Terms of Service =====
function openTerms() {
    const termsWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (!termsWindow) {
        showToast('Please allow popups', true);
        return;
    }
    termsWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Service | MemoMap</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; background: linear-gradient(145deg, #fef5f7 0%, #fde8ed 40%, #eef2fa 100%); min-height: 100vh; padding: 2rem; color: #2d1b2e; }
        .container { max-width: 900px; margin: 0 auto; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-radius: 40px; padding: 3rem; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid rgba(255,255,255,0.5); }
        .header { text-align: center; padding-bottom: 2rem; border-bottom: 2px solid #f0e0e4; margin-bottom: 2rem; }
        .header h1 { font-size: 2.5rem; color: #2d1b2e; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .header p { color: #888; margin-top: 0.5rem; }
        .date-badge { display: inline-block; background: rgba(255,107,139,0.1); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; color: #ff6b8b; margin-top: 0.5rem; }
        .section { margin-bottom: 2rem; }
        .section h2 { color: #ff6b8b; font-size: 1.2rem; margin-bottom: 0.5rem; }
        .section p { color: #666; line-height: 1.8; font-size: 0.95rem; }
        .section ul { color: #666; line-height: 1.8; padding-left: 1.5rem; }
        .section ul li { margin-bottom: 0.3rem; }
        .footer { text-align: center; padding-top: 2rem; border-top: 2px solid #f0e0e4; color: #888; font-size: 0.85rem; }
        .footer .logo { font-size: 1.2rem; font-weight: 600; color: #2d1b2e; }
        @media (max-width: 550px) { .container { padding: 1.5rem; } .header h1 { font-size: 1.8rem; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Terms of Service</h1>
            <p>Last Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <span class="date-badge">📋 Effective Immediately</span>
        </div>
        <div class="section"><h2>1. Acceptance of Terms</h2><p>By using MemoMap, you agree to these Terms of Service.</p></div>
        <div class="section"><h2>2. User Accounts</h2><p>You are responsible for maintaining the security of your account.</p><ul><li>You must be at least 13 years old</li><li>You are responsible for all activity on your account</li></ul></div>
        <div class="section"><h2>3. User Content</h2><p>You retain all rights to your content. You can delete your content at any time.</p></div>
        <div class="section"><h2>4. Privacy</h2><p>Your privacy matters to us. We don't sell your data to third parties.</p></div>
        <div class="section"><h2>5. Contact</h2><p>Contact us at: <strong style="color:#ff6b8b;">support@memonap.com</strong></p></div>
        <div class="footer"><div class="logo">🗺️ MemoMap</div><p>Every Place Has a Story</p><p style="margin-top:0.5rem;font-size:0.75rem;">© ${new Date().getFullYear()} MemoMap. All Rights Reserved.</p></div>
    </div>
</body>
</html>
    `);
    termsWindow.document.close();
}

// ===== Privacy Policy =====
function openPrivacy() {
    const privacyWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (!privacyWindow) {
        showToast('Please allow popups', true);
        return;
    }
    privacyWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy | MemoMap</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; background: linear-gradient(145deg, #fef5f7 0%, #fde8ed 40%, #eef2fa 100%); min-height: 100vh; padding: 2rem; color: #2d1b2e; }
        .container { max-width: 900px; margin: 0 auto; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-radius: 40px; padding: 3rem; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid rgba(255,255,255,0.5); }
        .header { text-align: center; padding-bottom: 2rem; border-bottom: 2px solid #f0e0e4; margin-bottom: 2rem; }
        .header h1 { font-size: 2.5rem; color: #2d1b2e; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .header p { color: #888; margin-top: 0.5rem; }
        .date-badge { display: inline-block; background: rgba(255,107,139,0.1); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; color: #ff6b8b; margin-top: 0.5rem; }
        .section { margin-bottom: 2rem; }
        .section h2 { color: #ff6b8b; font-size: 1.2rem; margin-bottom: 0.5rem; }
        .section p { color: #666; line-height: 1.8; font-size: 0.95rem; }
        .section ul { color: #666; line-height: 1.8; padding-left: 1.5rem; }
        .section ul li { margin-bottom: 0.3rem; }
        .footer { text-align: center; padding-top: 2rem; border-top: 2px solid #f0e0e4; color: #888; font-size: 0.85rem; }
        .footer .logo { font-size: 1.2rem; font-weight: 600; color: #2d1b2e; }
        @media (max-width: 550px) { .container { padding: 1.5rem; } .header h1 { font-size: 1.8rem; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Privacy Policy</h1>
            <p>Last Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <span class="date-badge">🔒 Your Privacy Matters</span>
        </div>
        <div class="section"><h2>1. Information We Collect</h2><p>We collect account information, content, usage data, and location data.</p></div>
        <div class="section"><h2>2. How We Use Your Data</h2><p>To provide service, improve features, and protect your account.</p></div>
        <div class="section"><h2>3. Data Storage</h2><p>Your data is stored locally and synced with Firebase. We don't share your data.</p></div>
        <div class="section"><h2>4. Your Rights</h2><p>You can access, export, and delete your data anytime.</p></div>
        <div class="section"><h2>5. Contact</h2><p>Contact us at: <strong style="color:#ff6b8b;">support@memonap.com</strong></p></div>
        <div class="footer"><div class="logo">🗺️ MemoMap</div><p>Every Place Has a Story</p><p style="margin-top:0.5rem;font-size:0.75rem;">© ${new Date().getFullYear()} MemoMap. All Rights Reserved.</p></div>
    </div>
</body>
</html>
    `);
    privacyWindow.document.close();
}

// ===== Event Listeners =====
if (exportDataBtn) exportDataBtn.addEventListener('click', exportData);
if (clearDataBtn) clearDataBtn.addEventListener('click', openClearDataModal);
if (changePasswordBtn) changePasswordBtn.addEventListener('click', openPasswordModal);
if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', openDeleteAccountModal);
if (enable2faBtn) enable2faBtn.addEventListener('click', enable2FA);
if (termsBtn) termsBtn.addEventListener('click', openTerms);
if (privacyBtn) privacyBtn.addEventListener('click', openPrivacy);

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
    logoutBtn.addEventListener('click', async () => {
        sessionStorage.clear();
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                await firebase.auth().signOut();
            } catch(e) {}
        }
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

// ===== Initialize =====
checkAuth();
loadSettings();
listenForSystemThemeChanges();

console.log('%c⚙️ Settings Page Loaded - Theme applies to ALL pages', 'color: #ff6b8b; font-size: 14px; font-weight: bold');