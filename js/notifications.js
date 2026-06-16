// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const markAllReadBtn = document.getElementById('markAllReadBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const notificationsContainer = document.getElementById('notificationsContainer');
const emptyState = document.getElementById('emptyState');
const unreadCountSpan = document.getElementById('unreadCount');

let notifications = [];
let currentTab = 'all';
let currentUserId = null;

// ===== Helper Functions =====
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatTime(timeString) {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

// ===== CLEAR ALL DUMMY NOTIFICATIONS =====
function clearDummyNotifications() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userId = userEmail || 'guest';
    const notifKey = `memonap_notifications_${userId}`;
    
    // Check if there are any notifications
    const stored = localStorage.getItem(notifKey);
    if (stored) {
        const existing = JSON.parse(stored);
        // Filter out dummy notifications (those with IDs less than 1000 or specific titles)
        const realNotifications = existing.filter(n => {
            // Keep notifications that:
            // 1. Have ID > 1000 (real notifications use Date.now())
            // 2. OR are not from the default dummy list
            return n.id > 1000 || !n._dummy;
        });
        
        // If there are dummy notifications, save the filtered list
        if (realNotifications.length !== existing.length) {
            localStorage.setItem(notifKey, JSON.stringify(realNotifications));
            notifications = realNotifications;
        } else {
            notifications = existing;
        }
    } else {
        notifications = [];
    }
}

// ===== Generate Real Notifications from User Data =====
function generateRealNotifications() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userId = userEmail || 'guest';
    const newNotifications = [];
    
    // Load memories
    const memoriesKey = `memonap_memories_${userId}`;
    const storedMemories = localStorage.getItem(memoriesKey);
    const memories = storedMemories ? JSON.parse(storedMemories) : [];
    
    // Load diary entries
    const diaryKey = `memonap_diary_${userId}`;
    const storedDiary = localStorage.getItem(diaryKey);
    const diaryEntries = storedDiary ? JSON.parse(storedDiary) : [];
    
    // Load collections
    const collectionsKey = `memonap_collections_${userId}`;
    const storedCollections = localStorage.getItem(collectionsKey);
    const collections = storedCollections ? JSON.parse(storedCollections) : [];
    
    // 1. On This Day Reminder
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    const todayMemories = memories.filter(memory => {
        const memoryDate = new Date(memory.date);
        return memoryDate.getMonth() === todayMonth && memoryDate.getDate() === todayDay;
    });
    
    if (todayMemories.length > 0) {
        const existing = notifications.some(n => 
            n.title.includes('On This Day') && 
            new Date(n.time).toDateString() === today.toDateString()
        );
        if (!existing) {
            newNotifications.push({
                id: Date.now() + 1,
                type: 'reminders',
                title: '📅 On This Day Reminder',
                message: `You have ${todayMemories.length} memory${todayMemories.length > 1 ? 'ies' : ''} from this day in the past!`,
                time: new Date().toISOString(),
                read: false,
                icon: '📅',
                link: 'nostalgia.html',
                _dummy: false
            });
        }
    }
    
    // 2. New Memory Added (most recent memory)
    if (memories.length > 0) {
        const sortedMemories = [...memories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestMemory = sortedMemories[0];
        const memoryDate = new Date(latestMemory.createdAt);
        const hoursDiff = (Date.now() - memoryDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            const existing = notifications.some(n => 
                n.title.includes('New Memory') && 
                n.message.includes(latestMemory.title)
            );
            if (!existing) {
                newNotifications.push({
                    id: Date.now() + 2,
                    type: 'memories',
                    title: '📸 New Memory Added',
                    message: `You added "${latestMemory.title}" to your collection`,
                    time: latestMemory.createdAt,
                    read: false,
                    icon: '📸',
                    link: `memory-detail.html?id=${latestMemory.id}`,
                    _dummy: false
                });
            }
        }
    }
    
    // 3. Diary Entry Added
    if (diaryEntries.length > 0) {
        const sortedDiary = [...diaryEntries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestDiary = sortedDiary[0];
        const diaryDate = new Date(latestDiary.createdAt);
        const hoursDiff = (Date.now() - diaryDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            const existing = notifications.some(n => 
                n.title.includes('Diary Entry') && 
                n.message.includes(latestDiary.title)
            );
            if (!existing) {
                newNotifications.push({
                    id: Date.now() + 3,
                    type: 'memories',
                    title: '📖 New Diary Entry',
                    message: `You wrote a new diary entry: "${latestDiary.title}"`,
                    time: latestDiary.createdAt,
                    read: false,
                    icon: '📖',
                    link: 'diary.html',
                    _dummy: false
                });
            }
        }
    }
    
    // 4. Collection Created
    if (collections.length > 0) {
        const sortedCollections = [...collections].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestCollection = sortedCollections[0];
        const collectionDate = new Date(latestCollection.createdAt);
        const hoursDiff = (Date.now() - collectionDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            const existing = notifications.some(n => 
                n.title.includes('Collection') && 
                n.message.includes(latestCollection.name)
            );
            if (!existing) {
                newNotifications.push({
                    id: Date.now() + 4,
                    type: 'updates',
                    title: '📁 New Collection Created',
                    message: `You created a new collection: "${latestCollection.name}"`,
                    time: latestCollection.createdAt,
                    read: false,
                    icon: '📁',
                    link: 'collections.html',
                    _dummy: false
                });
            }
        }
    }
    
    // 5. Achievement Notifications
    if (memories.length >= 10) {
        const existing = notifications.some(n => n.title.includes('Memory Collector'));
        if (!existing) {
            newNotifications.push({
                id: Date.now() + 5,
                type: 'achievements',
                title: '🏆 Achievement Unlocked!',
                message: `You've reached ${memories.length} memories! Memory Collector badge earned.`,
                time: new Date().toISOString(),
                read: false,
                icon: '🏆',
                link: 'profile.html',
                _dummy: false
            });
        }
    }
    
    if (memories.length >= 50) {
        const existing = notifications.some(n => n.title.includes('Memory Master'));
        if (!existing) {
            newNotifications.push({
                id: Date.now() + 6,
                type: 'achievements',
                title: '🏆 Achievement Unlocked!',
                message: `You've reached ${memories.length} memories! Memory Master badge earned.`,
                time: new Date().toISOString(),
                read: false,
                icon: '🏆',
                link: 'profile.html',
                _dummy: false
            });
        }
    }
    
    // 6. Weekly Digest
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentMemories = memories.filter(m => new Date(m.createdAt) > oneWeekAgo);
    if (recentMemories.length > 0) {
        const existing = notifications.some(n => n.title.includes('Weekly Digest'));
        if (!existing) {
            newNotifications.push({
                id: Date.now() + 7,
                type: 'reminders',
                title: '📊 Weekly Digest',
                message: `You added ${recentMemories.length} memory${recentMemories.length > 1 ? 'ies' : ''} this week. Keep going!`,
                time: new Date().toISOString(),
                read: false,
                icon: '📊',
                link: 'dashboard.html',
                _dummy: false
            });
        }
    }
    
    return newNotifications;
}

// ===== Load Notifications =====
function loadNotifications() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userEmail = sessionStorage.getItem('userEmail');
    const userName = sessionStorage.getItem('userName');

    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }

    currentUserId = userEmail || 'guest';
    const notifKey = `memonap_notifications_${currentUserId}`;
    
    // First, clear any dummy notifications
    clearDummyNotifications();
    
    // Then load existing or create empty array
    const stored = localStorage.getItem(notifKey);
    notifications = stored ? JSON.parse(stored) : [];
    
    // Generate real notifications from user data
    const realNotifications = generateRealNotifications();
    
    // Add new real notifications
    realNotifications.forEach(newNotif => {
        // Check if notification already exists (by title and time proximity)
        const exists = notifications.some(n => 
            n.title === newNotif.title && 
            Math.abs(new Date(n.time).getTime() - new Date(newNotif.time).getTime()) < 60000
        );
        if (!exists) {
            notifications.unshift(newNotif);
        }
    });
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    localStorage.setItem(notifKey, JSON.stringify(notifications));
    updateBadges();
    renderNotifications();
}

// ===== Save Notifications =====
function saveNotifications() {
    const notifKey = `memonap_notifications_${currentUserId}`;
    localStorage.setItem(notifKey, JSON.stringify(notifications));
    updateBadges();
}

// ===== Update Badges =====
function updateBadges() {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCountSpan) {
        unreadCountSpan.textContent = unreadCount;
    }
    
    const sidebarBadge = document.getElementById('sidebarNotificationBadge');
    if (sidebarBadge) {
        if (unreadCount > 0) {
            sidebarBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            sidebarBadge.style.display = 'inline-block';
        } else {
            sidebarBadge.style.display = 'none';
        }
    }
}

// ===== Mark as Read =====
function markAsRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) {
        notif.read = true;
        saveNotifications();
        renderNotifications();
    }
}

// ===== Mark All as Read =====
function markAllAsRead() {
    notifications.forEach(n => {
        n.read = true;
    });
    saveNotifications();
    renderNotifications();
}

// ===== Delete Notification =====
function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveNotifications();
    renderNotifications();
}

// ===== Handle Notification Click =====
function handleNotificationClick(id, link) {
    markAsRead(id);
    if (link) {
        window.location.href = link;
    }
}

// ===== Get Filtered Notifications =====
function getFilteredNotifications() {
    if (currentTab === 'all') return notifications;
    if (currentTab === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === currentTab);
}

// ===== Render Notifications =====
function renderNotifications() {
    const filtered = getFilteredNotifications();
    
    if (filtered.length === 0) {
        notificationsContainer.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    notificationsContainer.style.display = 'flex';
    emptyState.style.display = 'none';
    
    notificationsContainer.innerHTML = filtered.map(notif => `
        <div class="notification-item ${!notif.read ? 'unread' : ''}" onclick="handleNotificationClick(${notif.id}, '${notif.link || '#'}')">
            <div class="notification-icon">
                ${notif.icon || '📬'}
            </div>
            <div class="notification-content">
                <div class="notification-title">${escapeHtml(notif.title)}</div>
                <div class="notification-message">${escapeHtml(notif.message)}</div>
                <div class="notification-time">
                    <i class="ri-time-line"></i> ${formatTime(notif.time)}
                </div>
            </div>
            <div class="notification-actions">
                ${!notif.read ? `
                    <button class="mark-read-btn" onclick="event.stopPropagation(); markAsRead(${notif.id})">
                        <i class="ri-mail-check-line"></i>
                    </button>
                ` : ''}
                <button class="delete-notif-btn" onclick="event.stopPropagation(); deleteNotification(${notif.id})">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ===== Switch Tab =====
function switchTab(tab) {
    currentTab = tab;
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderNotifications();
}

// ===== Add New Notification (for other pages to call) =====
window.addNotification = function(title, message, type, icon, link) {
    const newNotif = {
        id: Date.now(),
        type: type || 'updates',
        title: title,
        message: message,
        time: new Date().toISOString(),
        read: false,
        icon: icon || '📬',
        link: link || '#',
        _dummy: false
    };
    notifications.unshift(newNotif);
    saveNotifications();
    renderNotifications();
};

// ===== Event Listeners =====
markAllReadBtn.addEventListener('click', markAllAsRead);

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
    });
});

// ===== Sidebar Functions =====
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

logoutBtn.addEventListener('click', async () => {
    sessionStorage.clear();
    if (typeof firebase !== 'undefined' && firebase.auth) {
        try {
            await firebase.auth().signOut();
        } catch(e) {}
    }
    window.location.href = 'login.html';
});

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
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
}

// ===== Initialize =====
checkAuth();
loadNotifications();

console.log('%c🔔 Notifications Page Loaded (No Dummy Data)', 'color: #ff6b8b; font-size: 14px; font-weight: bold');