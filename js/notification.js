// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const markAllReadBtn = document.getElementById('markAllReadBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const notificationsContainer = document.getElementById('notificationsContainer');
const emptyState = document.getElementById('emptyState');
const unreadCountSpan = document.getElementById('unreadCount');

// Sample notifications data
let notifications = [
    {
        id: 1,
        type: 'reminder',
        title: '✨ On This Day Reminder',
        message: 'You have a memory from 2 years ago today: "Sunset at Marine Drive"',
        time: '2024-12-15T09:30:00',
        read: false,
        icon: '📅',
        link: 'memory-detail.html?id=2'
    },
    {
        id: 2,
        type: 'memories',
        title: '📸 New Memory Added',
        message: 'You successfully added "Paris Trip" to your collection',
        time: '2024-12-14T15:20:00',
        read: false,
        icon: '📸',
        link: 'memory-detail.html?id=1'
    },
    {
        id: 3,
        type: 'updates',
        title: '🎉 New Feature Alert!',
        message: 'Time Capsules are now available! Lock memories for the future.',
        time: '2024-12-13T10:00:00',
        read: true,
        icon: '🎉',
        link: 'add-memory.html'
    },
    {
        id: 4,
        type: 'memories',
        title: '🏆 Achievement Unlocked',
        message: 'Congratulations! You\'ve reached 10 memories. Memory Collector badge earned!',
        time: '2024-12-12T18:45:00',
        read: true,
        icon: '🏆',
        link: 'profile.html'
    },
    {
        id: 5,
        type: 'reminder',
        title: '🔔 Weekly Digest',
        message: 'You added 3 memories this week. Keep going!',
        time: '2024-12-11T08:00:00',
        read: true,
        icon: '📊',
        link: 'dashboard.html'
    },
    {
        id: 6,
        type: 'updates',
        title: '💫 Memory Map Updated',
        message: 'Your memories are now visible on the interactive world map!',
        time: '2024-12-10T14:30:00',
        read: true,
        icon: '🗺️',
        link: 'map.html'
    },
    {
        id: 7,
        type: 'memories',
        title: '🌟 Memory of the Month',
        message: 'Your memory "Mountain Trek" has been featured as Memory of the Month!',
        time: '2024-12-09T11:15:00',
        read: false,
        icon: '🌟',
        link: 'memory-detail.html?id=4'
    }
];

let currentTab = 'all';

// ===== Helper Functions =====
function formatTime(timeString) {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

function saveNotifications() {
    localStorage.setItem('memonap_notifications', JSON.stringify(notifications));
}

function loadNotifications() {
    const stored = localStorage.getItem('memonap_notifications');
    if (stored) {
        notifications = JSON.parse(stored);
    } else {
        saveNotifications();
    }
    updateUnreadCount();
    renderNotifications();
}

function updateUnreadCount() {
    const unreadCount = notifications.filter(n => !n.read).length;
    unreadCountSpan.textContent = unreadCount;
    
    // Update notification badge in sidebar (if exists)
    const notifBadge = document.querySelector('.notification-icon .notification-badge');
    if (notifBadge) {
        notifBadge.textContent = unreadCount;
        notifBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

function markAsRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) {
        notif.read = true;
        saveNotifications();
        updateUnreadCount();
        renderNotifications();
    }
}

function markAllAsRead() {
    notifications.forEach(n => {
        n.read = true;
    });
    saveNotifications();
    updateUnreadCount();
    renderNotifications();
}

function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveNotifications();
    updateUnreadCount();
    renderNotifications();
}

function getFilteredNotifications() {
    if (currentTab === 'all') return notifications;
    if (currentTab === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === currentTab);
}

function renderNotifications() {
    const filtered = getFilteredNotifications();
    
    if (filtered.length === 0) {
        notificationsContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    notificationsContainer.style.display = 'flex';
    emptyState.style.display = 'none';
    
    notificationsContainer.innerHTML = filtered.map(notif => `
        <div class="notification-item ${!notif.read ? 'unread' : ''}" data-id="${notif.id}" onclick="handleNotificationClick(${notif.id}, '${notif.link}')">
            <div class="notification-icon">
                ${notif.icon}
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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ===== Handle Notification Click =====
window.handleNotificationClick = function(id, link) {
    markAsRead(id);
    if (link) {
        window.location.href = link;
    }
};

// ===== Add New Notification (for other pages to call) =====
window.addNotification = function(title, message, type, icon, link) {
    const newNotif = {
        id: Date.now(),
        type: type,
        title: title,
        message: message,
        time: new Date().toISOString(),
        read: false,
        icon: icon,
        link: link
    };
    notifications.unshift(newNotif);
    saveNotifications();
    updateUnreadCount();
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '/favicon.ico' });
    }
    
    renderNotifications();
};

// ===== Request Notification Permission =====
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// ===== Tab Switching =====
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

logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
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
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }
}

// ===== Generate Sample Notifications on First Visit =====
function initNotifications() {
    const existing = localStorage.getItem('memonap_notifications');
    if (!existing) {
        saveNotifications();
    }
}

// Initialize
checkAuth();
initNotifications();
loadNotifications();
requestNotificationPermission();

console.log('%c🔔 Notifications Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');