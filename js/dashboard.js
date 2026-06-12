// ===== DOM Elements =====
const userNameSpan = document.getElementById('userName');
const totalMemoriesSpan = document.getElementById('totalMemories');
const totalPlacesSpan = document.getElementById('totalPlaces');
const totalPhotosSpan = document.getElementById('totalPhotos');
const totalMoodsSpan = document.getElementById('totalMoods');
const logoutBtn = document.getElementById('logoutBtn');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const fabBtn = document.getElementById('fabBtn');
const onThisDayList = document.getElementById('onThisDayList');
const recentMemoriesGrid = document.getElementById('recentMemories');

// ===== Sample Memory Data =====
const sampleMemories = [
    { id: 1, title: "Eiffel Tower Visit", location: "Paris, France", date: "2024-06-10", mood: "happy", photo: null },
    { id: 2, title: "Sunset at Marine Drive", location: "Mumbai, India", date: "2024-05-15", mood: "peaceful", photo: null },
    { id: 3, title: "Tokyo Adventure", location: "Tokyo, Japan", date: "2024-04-20", mood: "excited", photo: null },
    { id: 4, title: "Beach Day in Goa", location: "Goa, India", date: "2024-03-10", mood: "happy", photo: null },
    { id: 5, title: "Mountain Trek", location: "Himachal, India", date: "2024-02-05", mood: "excited", photo: null },
    { id: 6, title: "Coffee Shop Vibes", location: "Bangalore, India", date: "2024-01-20", mood: "peaceful", photo: null }
];

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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getMoodEmoji(mood) {
    const emojis = {
        happy: '😊', peaceful: '😌', loved: '❤️',
        excited: '😎', sad: '😢', nostalgic: '📸'
    };
    return emojis[mood] || '📝';
}

// ===== Initialize Sample Data =====
function initSampleData() {
    const existing = localStorage.getItem('memonap_memories');
    if (!existing || JSON.parse(existing).length === 0) {
        localStorage.setItem('memonap_memories', JSON.stringify(sampleMemories));
    }
}

// ===== Load Stats =====
function loadStats() {
    const memories = JSON.parse(localStorage.getItem('memonap_memories') || '[]');
    
    totalMemoriesSpan.textContent = memories.length;
    
    const uniquePlaces = new Set(memories.map(m => m.location));
    totalPlacesSpan.textContent = uniquePlaces.size;
    
    const photoCount = memories.filter(m => m.photo).length;
    totalPhotosSpan.textContent = photoCount;
    
    const uniqueMoods = new Set(memories.map(m => m.mood));
    totalMoodsSpan.textContent = uniqueMoods.size;
}

// ===== Load On This Day =====
function loadOnThisDay() {
    const memories = JSON.parse(localStorage.getItem('memonap_memories') || '[]');
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    const todayMemories = memories.filter(memory => {
        const memoryDate = new Date(memory.date);
        return memoryDate.getMonth() === todayMonth && memoryDate.getDate() === todayDay;
    });
    
    if (todayMemories.length === 0) {
        onThisDayList.innerHTML = `
            <div class="memory-item" style="justify-content: center;">
                <div class="memory-title">✨ No memories from this day yet. Create one!</div>
            </div>
        `;
        return;
    }
    
    onThisDayList.innerHTML = todayMemories.map(memory => `
        <div class="memory-item" onclick="viewMemory(${memory.id})">
            <div class="memory-date">${formatDate(memory.date)}</div>
            <div class="memory-title">${escapeHtml(memory.title)}</div>
            <div class="memory-location"><i class="ri-map-pin-line"></i> ${escapeHtml(memory.location)}</div>
        </div>
    `).join('');
}

// ===== Load Recent Memories =====
function loadRecentMemories() {
    const memories = JSON.parse(localStorage.getItem('memonap_memories') || '[]');
    const recentMemories = [...memories].reverse().slice(0, 3);
    
    if (recentMemories.length === 0) {
        recentMemoriesGrid.innerHTML = `
            <div class="memory-card" style="text-align: center; padding: 2rem;">
                <i class="ri-add-line" style="font-size: 2rem; color: #ff6b8b;"></i>
                <p>No memories yet. Click + to add your first memory!</p>
            </div>
        `;
        return;
    }
    
    recentMemoriesGrid.innerHTML = recentMemories.map(memory => `
        <div class="memory-card" onclick="viewMemory(${memory.id})">
            <div class="memory-img-placeholder">
                <i class="ri-image-line"></i>
            </div>
            <div class="memory-details">
                <h4>${escapeHtml(memory.title)}</h4>
                <p><i class="ri-map-pin-line"></i> ${escapeHtml(memory.location)}</p>
                <div class="memory-footer">
                    <span class="memory-date">${formatDate(memory.date)}</span>
                    <span class="memory-mood">${getMoodEmoji(memory.mood)} ${memory.mood}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== View Memory (Temp) =====
window.viewMemory = function(id) {
    const memories = JSON.parse(localStorage.getItem('memonap_memories') || '[]');
    const memory = memories.find(m => m.id === id);
    if (memory) {
        alert(`📌 ${memory.title}\n📍 ${memory.location}\n📅 ${formatDate(memory.date)}\n😊 Mood: ${memory.mood}\n\nFull memory view coming soon!`);
    }
};

// ===== Check Authentication =====
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userName = sessionStorage.getItem('userName');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    
    if (userName) {
        userNameSpan.textContent = userName;
    } else {
        userNameSpan.textContent = 'Explorer';
    }
    
    return true;
}

// ===== Handle Logout =====
function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    window.location.href = 'login.html';
}

// ===== Toggle Sidebar (Mobile) =====
function toggleSidebar() {
    sidebar.classList.toggle('open');
}

// ===== Quick Add Memory =====
function quickAddMemory() {
    alert('➕ Add Memory page coming soon!');
}

// ===== Navigation Handlers =====
function setupNavigation() {
    document.getElementById('mapNav')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('🗺️ Memory Map page coming soon!');
    });
    
    document.getElementById('addMemoryNav')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('📝 Add Memory page coming soon!');
    });
    
    document.getElementById('timelineNav')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('⏰ Timeline page coming soon!');
    });
    
    document.getElementById('collectionsNav')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('📁 Collections page coming soon!');
    });
    
    document.getElementById('profileNav')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('👤 Profile page coming soon!');
    });
}

// ===== Close sidebar when clicking outside (mobile) =====
function setupClickOutside() {
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// ===== Event Listeners =====
logoutBtn.addEventListener('click', handleLogout);
menuToggle.addEventListener('click', toggleSidebar);
fabBtn.addEventListener('click', quickAddMemory);

// ===== Initialize Dashboard =====
function init() {
    initSampleData();
    checkAuth();
    loadStats();
    loadRecentMemories();
    loadOnThisDay();
    setupNavigation();
    setupClickOutside();
}
// Add to dashboard.js - View All handlers
function setupViewAllButtons() {
    // View all memories
    const viewAllMemories = document.querySelector('.recent-memories .view-all');
    if (viewAllMemories) {
        viewAllMemories.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'timeline.html';
        });
    }
    
    // View all on this day
    const viewAllOnThisDay = document.querySelector('.on-this-day .view-all');
    if (viewAllOnThisDay) {
        viewAllOnThisDay.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'nostalgia.html';
        });
    }
}
function updateNotificationBadge() {
    const notifications = JSON.parse(localStorage.getItem('memonap_notifications') || '[]');
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Call this function when page loads
updateNotificationBadge();
// Call this function in your init()
// Start the dashboard
init();

// Console welcome
console.log('%c📊 MemoMap Dashboard Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');
console.log('%c🗺️ Your memory journey continues!', 'color: #888; font-size: 12px;');