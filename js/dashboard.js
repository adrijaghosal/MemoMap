// ===== DOM Elements =====
const userNameSpan = document.getElementById('userName');
const totalMemoriesSpan = document.getElementById('totalMemories');
const totalCitiesSpan = document.getElementById('totalCities');
const totalPhotosSpan = document.getElementById('totalPhotos');
const totalMoodsSpan = document.getElementById('totalMoods');
const logoutBtn = document.getElementById('logoutBtn');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const fabBtn = document.getElementById('fabBtn');
const onThisDayList = document.getElementById('onThisDayList');
const recentMemoriesGrid = document.getElementById('recentMemoriesList');
const galleryGrid = document.getElementById('galleryGrid');
const citiesGrid = document.getElementById('citiesGrid');
const moodBars = document.getElementById('moodBars');
const totalDistanceSpan = document.getElementById('totalDistance');
const totalNightsSpan = document.getElementById('totalNights');
const totalMomentsSpan = document.getElementById('totalMoments');
const totalPeopleSpan = document.getElementById('totalPeople');
const searchInput = document.getElementById('searchInput');

// Demo Modal Elements
const demoModal = document.getElementById('demoModal');
const closeDemoModal = document.getElementById('closeDemoModal');
const skipDemoBtn = document.getElementById('skipDemoBtn');
const loadDemoBtn = document.getElementById('loadDemoBtn');

let allMemories = [];
let currentUserId = null;

// ===== Sample Memories for Demo (Only loaded if user chooses) =====
const sampleMemories = [
    { id: 1, title: "Eiffel Tower Visit", location: "Paris, France", date: "2024-06-10", mood: "happy", photo: null },
    { id: 2, title: "Sunset at Marine Drive", location: "Mumbai, India", date: "2024-05-15", mood: "peaceful", photo: null },
    { id: 3, title: "Tokyo Adventure", location: "Tokyo, Japan", date: "2024-04-20", mood: "excited", photo: null },
    { id: 4, title: "Beach Day in Goa", location: "Goa, India", date: "2024-03-10", mood: "happy", photo: null },
    { id: 5, title: "Mountain Trek", location: "Himachal, India", date: "2024-02-05", mood: "excited", photo: null }
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

function getMoodColor(mood) {
    const colors = {
        happy: '#fbbf24', peaceful: '#6ee7b7', loved: '#f472b6',
        excited: '#fb923c', sad: '#93c5fd', nostalgic: '#a78bfa'
    };
    return colors[mood] || '#ff6b8b';
}

// ===== Load User-Specific Data =====
function loadUserData() {
    const userId = currentUserId || 'guest';
    const memoriesKey = `memonap_memories_${userId}`;
    const stored = localStorage.getItem(memoriesKey);
    if (stored) {
        allMemories = JSON.parse(stored);
    } else {
        allMemories = [];
    }
    return allMemories;
}

function saveUserData(memories) {
    const userId = currentUserId || 'guest';
    localStorage.setItem(`memonap_memories_${userId}`, JSON.stringify(memories));
}

// ===== Load Sample Memories (For new users) =====
function loadSampleMemories() {
    const userId = currentUserId || 'guest';
    const memoriesKey = `memonap_memories_${userId}`;
    localStorage.setItem(memoriesKey, JSON.stringify(sampleMemories));
    allMemories = [...sampleMemories];
    refreshDashboard();
    demoModal.classList.remove('active');
}

// ===== Refresh All Dashboard Components =====
function refreshDashboard() {
    loadStats();
    loadGallery();
    loadRecentMemories();
    loadOnThisDay();
    loadTopCities();
    loadMoodTracker();
    updateTravelStats();
    updateNotificationBadge();
    updateSidebarNotificationBadge();
}

// ===== Load Stats =====
function loadStats() {
    if (!totalMemoriesSpan) return;
    
    totalMemoriesSpan.textContent = allMemories.length;
    
    const uniqueCities = new Set(allMemories.map(m => m.location.split(',')[0].trim()));
    totalCitiesSpan.textContent = uniqueCities.size;
    
    const photoCount = allMemories.filter(m => m.photo).length;
    totalPhotosSpan.textContent = photoCount;
    
    const uniqueMoods = new Set(allMemories.map(m => m.mood));
    totalMoodsSpan.textContent = uniqueMoods.size;
}

// ===== Load Gallery =====
function loadGallery() {
    if (!galleryGrid) return;
    
    if (allMemories.length === 0) {
        galleryGrid.innerHTML = '<div class="loading-skeleton">No memories yet. Click + to add your first memory!</div>';
        return;
    }
    
    const recentMemories = [...allMemories].reverse().slice(0, 4);
    
    galleryGrid.innerHTML = recentMemories.map(memory => `
        <div class="gallery-item" onclick="viewMemory(${memory.id})">
            <div class="gallery-img">
                <i class="ri-image-line"></i>
            </div>
            <div class="gallery-overlay">
                ${escapeHtml(memory.title)}
            </div>
        </div>
    `).join('');
}

// ===== Load Recent Memories =====
function loadRecentMemories() {
    if (!recentMemoriesGrid) return;
    
    if (allMemories.length === 0) {
        recentMemoriesGrid.innerHTML = '<div class="loading-skeleton">No memories yet. Create your first memory!</div>';
        return;
    }
    
    const recentMemories = [...allMemories].reverse().slice(0, 3);
    
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

// ===== Load On This Day =====
function loadOnThisDay() {
    if (!onThisDayList) return;
    
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    const todayMemories = allMemories.filter(memory => {
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

// ===== Load Top Cities =====
function loadTopCities() {
    if (!citiesGrid) return;
    
    const cityCounts = {};
    allMemories.forEach(memory => {
        const city = memory.location.split(',')[0].trim();
        cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    
    const topCities = Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (topCities.length === 0) {
        citiesGrid.innerHTML = '<div class="loading-skeleton">Add memories to see your top cities</div>';
        return;
    }
    
    const cityEmojis = {
        'Paris': '🗼', 'Mumbai': '🌉', 'Tokyo': '🗻', 'Goa': '🏖️', 
        'Himachal': '🏔️', 'Bangalore': '🌆', 'New York': '🗽', 
        'Bali': '🌴', 'London': '🎡', 'Sydney': '🏄'
    };
    
    citiesGrid.innerHTML = topCities.map(([city, count]) => `
        <div class="city-card" onclick="filterByCity('${city}')">
            <div class="city-emoji">${cityEmojis[city] || '📍'}</div>
            <div class="city-name">${escapeHtml(city)}</div>
            <div class="city-count">${count} memory${count > 1 ? 's' : ''}</div>
        </div>
    `).join('');
}

// ===== Load Mood Tracker =====
function loadMoodTracker() {
    if (!moodBars) return;
    
    const moodCounts = {
        happy: 0, peaceful: 0, loved: 0, excited: 0, sad: 0, nostalgic: 0
    };
    
    allMemories.forEach(memory => {
        if (moodCounts[memory.mood] !== undefined) {
            moodCounts[memory.mood]++;
        }
    });
    
    const total = allMemories.length;
    const moods = ['happy', 'peaceful', 'loved', 'excited', 'nostalgic', 'sad'];
    
    if (total === 0) {
        moodBars.innerHTML = '<div class="loading-skeleton">Add memories to see your mood journey</div>';
        return;
    }
    
    moodBars.innerHTML = moods.map(mood => {
        const count = moodCounts[mood];
        const percentage = (count / total * 100);
        return `
            <div class="mood-bar-item">
                <div class="mood-bar-label">${getMoodEmoji(mood)} ${mood}</div>
                <div class="mood-bar-container">
                    <div class="mood-bar-fill" style="width: ${percentage}%; background: ${getMoodColor(mood)};"></div>
                </div>
                <div class="mood-bar-value">${count}</div>
            </div>
        `;
    }).join('');
}

// ===== Update Travel Stats =====
function updateTravelStats() {
    if (totalDistanceSpan) totalDistanceSpan.textContent = Math.floor(allMemories.length * 1250);
    if (totalNightsSpan) totalNightsSpan.textContent = Math.floor(allMemories.length * 2.5);
    if (totalMomentsSpan) totalMomentsSpan.textContent = allMemories.length * 3;
    if (totalPeopleSpan) totalPeopleSpan.textContent = Math.floor(allMemories.length * 1.8);
}

// ===== View Memory =====
window.viewMemory = function(id) {
    window.location.href = `memory-detail.html?id=${id}`;
};

window.filterByCity = function(city) {
    alert(`📍 Showing memories from ${city}\n\nFull filter feature coming soon!`);
};

// ===== Search Functionality =====
function setupSearch() {
    if (!searchInput) return;
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.trim().toLowerCase();
            if (searchTerm) {
                const results = allMemories.filter(m => 
                    m.title.toLowerCase().includes(searchTerm) || 
                    m.location.toLowerCase().includes(searchTerm)
                );
                if (results.length > 0) {
                    alert(`🔍 Found ${results.length} memory(ies) matching "${searchTerm}"`);
                } else {
                    alert(`🔍 No memories found matching "${searchTerm}"`);
                }
            }
        }
    });
}

// ===== Check Authentication =====
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userName = sessionStorage.getItem('userName');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    
    // Set current user ID for localStorage isolation
    currentUserId = userEmail || 'guest';
    
    if (userNameSpan && userName) {
        userNameSpan.textContent = userName;
    }
    
    const sidebarUserName = document.getElementById('sidebarUserName');
    if (sidebarUserName && userName) {
        sidebarUserName.textContent = userName;
    }
    
    return true;
}

// ===== Handle Logout =====
async function handleLogout() {
    sessionStorage.clear();
    
    if (typeof firebase !== 'undefined' && firebase.auth) {
        try {
            await firebase.auth().signOut();
        } catch (error) {
            console.error("Firebase sign out error:", error);
        }
    }
    
    window.location.href = 'login.html';
}

// ===== Sidebar Functions =====
function toggleSidebar() {
    if (sidebar) sidebar.classList.toggle('open');
}

function quickAddMemory() {
    window.location.href = 'add-memory.html';
}

function setupNavigation() {
    const navLinks = {
        mapNav: 'map.html',
        addMemoryNav: 'add-memory.html',
        timelineNav: 'timeline.html',
        collectionsNav: 'collections.html',
        nostalgiaNav: 'nostalgia.html',
        diaryNav: 'diary.html',
        profileNav: 'profile.html',
        notificationsNav: 'notifications.html',
        helpNav: 'help.html',
        settingsNav: 'settings.html'
    };
    
    for (const [id, url] of Object.entries(navLinks)) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = url;
            });
        }
    }
}

function setupClickOutside() {
    if (!sidebar || !menuToggle) return;
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

function setupViewAllButtons() {
    const viewAllMemories = document.querySelector('.recent-memories .view-all');
    if (viewAllMemories) {
        viewAllMemories.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'timeline.html';
        });
    }
    
    const viewAllOnThisDay = document.querySelector('.on-this-day .view-all');
    if (viewAllOnThisDay) {
        viewAllOnThisDay.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'nostalgia.html';
        });
    }
}

// ===== Notification Badges =====
function updateNotificationBadge() {
    const notifications = JSON.parse(localStorage.getItem('memonap_notifications') || '[]');
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function updateSidebarNotificationBadge() {
    const notifications = JSON.parse(localStorage.getItem('memonap_notifications') || '[]');
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('sidebarNotificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// ===== Scroll to Top =====
function setupScrollToTop() {
    let scrollBtn = document.querySelector('.scroll-top-btn');
    if (!scrollBtn) {
        scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-top-btn';
        scrollBtn.innerHTML = '<i class="ri-arrow-up-line"></i>';
        document.body.appendChild(scrollBtn);
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
}

// ===== Check if New User (No Memories) =====
function checkAndShowDemoModal() {
    if (allMemories.length === 0 && !localStorage.getItem('demoModalShown')) {
        setTimeout(() => {
            demoModal.classList.add('active');
        }, 500);
    }
}

// ===== Event Listeners =====
if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
if (fabBtn) fabBtn.addEventListener('click', quickAddMemory);
if (closeDemoModal) closeDemoModal.addEventListener('click', () => demoModal.classList.remove('active'));
if (skipDemoBtn) skipDemoBtn.addEventListener('click', () => {
    demoModal.classList.remove('active');
    localStorage.setItem('demoModalShown', 'true');
});
if (loadDemoBtn) loadDemoBtn.addEventListener('click', loadSampleMemories);

// ===== Initialize Dashboard =====
function init() {
    checkAuth();
    loadUserData();
    refreshDashboard();
    setupNavigation();
    setupClickOutside();
    setupViewAllButtons();
    setupSearch();
    setupScrollToTop();
    checkAndShowDemoModal();
}

init();

console.log('%c📊 MemoMap Dashboard Loaded (Real Data Mode)', 'color: #ff6b8b; font-size: 14px; font-weight: bold');