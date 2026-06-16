// ===== THEME LOADER - APPLIES THEME TO ALL PAGES =====

(function loadTheme() {
    // Get theme from localStorage
    const settings = JSON.parse(localStorage.getItem('memonap_settings') || '{}');
    const preferredTheme = settings.theme || localStorage.getItem('memonap_preferred_theme') || 'light';
    
    // Check if auto mode
    let actualTheme = preferredTheme;
    if (preferredTheme === 'auto') {
        actualTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Apply theme class to body
    document.body.classList.remove('theme-light', 'theme-dark');
    if (actualTheme === 'dark') {
        document.body.classList.add('theme-dark');
    } else {
        document.body.classList.add('theme-light');
    }
    
    // Listen for system theme changes when in auto mode
    if (preferredTheme === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', function(e) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(newTheme === 'dark' ? 'theme-dark' : 'theme-light');
        });
    }
    
    console.log('🎨 Theme loaded:', actualTheme, '(preferred:', preferredTheme, ')');
})();