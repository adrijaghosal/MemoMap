// ===== THEME LOADER - CORRECT COLOR PALETTE =====

(function() {
    'use strict';
    
    console.log('🔵 Theme loader running on:', window.location.pathname);
    
    // Get theme from localStorage
    let theme = localStorage.getItem('memonap_theme');
    
    // If no theme found, check settings
    if (!theme) {
        const settings = JSON.parse(localStorage.getItem('memonap_settings') || '{}');
        theme = settings.theme || localStorage.getItem('memonap_preferred_theme') || 'light';
    }
    
    // Handle auto mode
    if (theme === 'auto') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    console.log('📌 Applying theme:', theme);
    
    // ============================================
    // DARK MODE COLORS - APPROVED PALETTE
    // ============================================
    const darkColors = {
        background: '#0d0d1a',
        backgroundSecondary: '#13132a',
        cardBackground: '#1a1a3a',
        sidebarBackground: '#0a0a16',
        textPrimary: '#f0eef8',
        textSecondary: '#b8b4d4',
        textMuted: '#7a7a9a',
        borderColor: '#2a2a4a',
        accentPrimary: '#7c6cf0',
        accentSecondary: '#a29bfe',
        accentGradient: 'linear-gradient(135deg, #7c6cf0, #a29bfe)',
        hoverBackground: '#24244a',
        shadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
    };
    
    // ============================================
    // LIGHT MODE COLORS - APPROVED PALETTE
    // ============================================
    const lightColors = {
        background: '#fef5f7',
        backgroundSecondary: '#ffffff',
        cardBackground: '#ffffff',
        sidebarBackground: '#ffffff',
        textPrimary: '#2d1b2e',
        textSecondary: '#666666',
        textMuted: '#888888',
        borderColor: '#f0e0e4',
        accentPrimary: '#ff6b8b',
        accentSecondary: '#ffb347',
        accentGradient: 'linear-gradient(135deg, #ff6b8b, #ffb347)',
        hoverBackground: '#fde8ed',
        shadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
    };
    
    // Select colors based on theme
    const colors = theme === 'dark' ? darkColors : lightColors;
    
    // ============================================
    // APPLY TO BODY
    // ============================================
    
    // Remove all theme classes
    document.body.classList.remove('dark-mode', 'light-mode', 'theme-dark', 'theme-light');
    
    // Add correct class
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        console.log('🌙 Dark mode applied with approved colors');
    } else {
        document.body.classList.add('light-mode');
        console.log('☀️ Light mode applied with approved colors');
    }
    
    // ============================================
    // DIRECTLY APPLY STYLES TO BODY
    // ============================================
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.textPrimary;
    document.body.style.transition = 'all 0.4s ease';
    
    // ============================================
    // APPLY TO SIDEBAR
    // ============================================
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.backgroundColor = colors.sidebarBackground;
        sidebar.style.borderRight = `1px solid ${colors.borderColor}`;
        sidebar.style.color = colors.textPrimary;
        sidebar.style.transition = 'all 0.4s ease';
        
        // Sidebar logo
        const logo = sidebar.querySelector('.sidebar-logo span');
        if (logo) {
            logo.style.color = colors.textPrimary;
        }
        
        // Sidebar nav items
        sidebar.querySelectorAll('.nav-item').forEach(item => {
            item.style.color = theme === 'dark' ? '#8a8aaa' : '#666666';
        });
        
        // Sidebar user info
        const userInfo = sidebar.querySelector('.user-info-mini h4');
        if (userInfo) {
            userInfo.style.color = colors.textPrimary;
        }
        const userInfoP = sidebar.querySelector('.user-info-mini p');
        if (userInfoP) {
            userInfoP.style.color = colors.textMuted;
        }
    }
    
    // ============================================
    // APPLY TO MAIN CONTENT
    // ============================================
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.backgroundColor = colors.background;
        mainContent.style.color = colors.textPrimary;
        mainContent.style.transition = 'all 0.4s ease';
    }
    
    // ============================================
    // APPLY TO TOP HEADER
    // ============================================
    const topHeader = document.querySelector('.top-header');
    if (topHeader) {
        if (theme === 'dark') {
            topHeader.style.backgroundColor = 'rgba(22, 22, 46, 0.85)';
            topHeader.style.border = '1px solid rgba(124, 108, 240, 0.06)';
        } else {
            topHeader.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
            topHeader.style.border = 'none';
        }
        topHeader.style.transition = 'all 0.4s ease';
    }
    
    // ============================================
    // APPLY TO SETTINGS CARDS
    // ============================================
    document.querySelectorAll('.settings-card, .card').forEach(card => {
        if (theme === 'dark') {
            card.style.backgroundColor = 'rgba(28, 28, 58, 0.85)';
            card.style.border = '1px solid rgba(124, 108, 240, 0.06)';
            card.style.boxShadow = '0 8px 40px rgba(0, 0, 0, 0.3)';
        } else {
            card.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            card.style.border = '1px solid #f0e0e4';
            card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
        }
        card.style.transition = 'all 0.4s ease';
    });
    
    // ============================================
    // APPLY TO SETTING ITEMS
    // ============================================
    document.querySelectorAll('.setting-item').forEach(item => {
        if (theme === 'dark') {
            item.style.borderBottom = '1px solid rgba(124, 108, 240, 0.05)';
        } else {
            item.style.borderBottom = '1px solid #f0e0e4';
        }
    });
    
    // ============================================
    // APPLY TO LABELS AND DESCRIPTIONS
    // ============================================
    document.querySelectorAll('.setting-label').forEach(label => {
        label.style.color = colors.textPrimary;
    });
    
    document.querySelectorAll('.setting-desc').forEach(desc => {
        desc.style.color = colors.textMuted;
    });
    
    document.querySelectorAll('.settings-section h3').forEach(h3 => {
        if (theme === 'dark') {
            h3.style.color = '#b8b4d4';
        } else {
            h3.style.color = '#2d1b2e';
        }
    });
    
    // ============================================
    // APPLY TO WELCOME TEXT
    // ============================================
    const welcomeH2 = document.querySelector('.welcome-text h2');
    if (welcomeH2) {
        welcomeH2.style.color = colors.textPrimary;
    }
    
    const welcomeP = document.querySelector('.welcome-text p');
    if (welcomeP) {
        welcomeP.style.color = colors.textMuted;
    }
    
    // ============================================
    // APPLY TO MODALS
    // ============================================
    document.querySelectorAll('.modal-content').forEach(modal => {
        if (theme === 'dark') {
            modal.style.backgroundColor = 'rgba(28, 28, 58, 0.95)';
            modal.style.border = '1px solid rgba(124, 108, 240, 0.08)';
        } else {
            modal.style.backgroundColor = 'white';
            modal.style.border = 'none';
        }
    });
    
    // ============================================
    // APPLY TO FORM INPUTS
    // ============================================
    document.querySelectorAll('.form-group input, .setting-select').forEach(input => {
        if (theme === 'dark') {
            input.style.backgroundColor = 'rgba(22, 22, 46, 0.8)';
            input.style.border = '1px solid rgba(124, 108, 240, 0.08)';
            input.style.color = '#f0eef8';
        } else {
            input.style.backgroundColor = 'white';
            input.style.border = '1.5px solid #f0e0e4';
            input.style.color = '#2d1b2e';
        }
    });
    
    // ============================================
    // APPLY TO THEME BUTTONS
    // ============================================
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (theme === 'dark') {
            btn.style.border = '1.5px solid rgba(124, 108, 240, 0.12)';
            btn.style.color = '#8a8aaa';
            btn.style.background = 'rgba(124, 108, 240, 0.02)';
        } else {
            btn.style.border = '1.5px solid #f0e0e4';
            btn.style.color = '#666';
            btn.style.background = 'transparent';
        }
        
        // Active button
        if (btn.classList.contains('active')) {
            if (theme === 'dark') {
                btn.style.background = 'linear-gradient(135deg, #7c6cf0, #6c5ce7)';
                btn.style.color = 'white';
                btn.style.border = 'transparent';
                btn.style.boxShadow = '0 4px 25px rgba(124, 108, 240, 0.3)';
            } else {
                btn.style.background = 'linear-gradient(135deg, #ff6b8b, #ffb347)';
                btn.style.color = 'white';
                btn.style.border = 'transparent';
                btn.style.boxShadow = 'none';
            }
        }
    });
    
    // ============================================
    // APPLY TO TOGGLES
    // ============================================
    document.querySelectorAll('.toggle-slider').forEach(slider => {
        if (theme === 'dark') {
            slider.style.backgroundColor = '#2a2a4a';
        } else {
            slider.style.backgroundColor = '#ddd';
        }
    });
    
    document.querySelectorAll('input:checked + .toggle-slider').forEach(slider => {
        if (theme === 'dark') {
            slider.style.background = 'linear-gradient(135deg, #7c6cf0, #6c5ce7)';
        } else {
            slider.style.background = 'linear-gradient(135deg, #ff6b8b, #ffb347)';
        }
    });
    
    // ============================================
    // APPLY TO SCROLLBAR
    // ============================================
    if (theme === 'dark') {
        document.querySelector('style')?.insertAdjacentHTML('afterend', `
            <style id="dark-scrollbar">
                ::-webkit-scrollbar-track { background: rgba(13, 13, 26, 0.5); }
                ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #7c6cf0, #6c5ce7); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #a29bfe, #7c6cf0); }
            </style>
        `);
    } else {
        const scrollbarStyle = document.getElementById('dark-scrollbar');
        if (scrollbarStyle) scrollbarStyle.remove();
    }
    
    console.log('✅ Theme applied with approved colors!');
    console.log('📌 Theme:', theme);
    console.log('📌 Body classes:', document.body.className);
    
    // Listen for system theme changes (for auto mode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        const preferred = localStorage.getItem('memonap_preferred_theme') || 'light';
        if (preferred === 'auto') {
            const newTheme = e.matches ? 'dark' : 'light';
            localStorage.setItem('memonap_theme', newTheme);
            location.reload();
        }
    });
    
})();