// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const surpriseBtn = document.getElementById('surpriseBtn');
const randomMemoryCard = document.getElementById('randomMemoryCard');
const closeRandomBtn = document.getElementById('closeRandomBtn');

// Modal
const memoryModal = document.getElementById('memoryModal');
const closeModal = document.getElementById('closeModal');
const viewFullMemoryBtn = document.getElementById('viewFullMemoryBtn');

let allMemories = [];
let currentUserId = null;
let currentMemoryId = null;

// Mood emojis
const moodEmoji = {
    happy: '😊', peaceful: '😌', loved: '❤️', excited: '😎', nostalgic: '📸', sad: '😢'
};

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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===== Load User Data =====
function loadUserData() {
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
    const memoriesKey = `memonap_memories_${currentUserId}`;
    const stored = localStorage.getItem(memoriesKey);
    allMemories = stored ? JSON.parse(stored) : [];

    updateOnThisDay();
    updateTimeCapsules();
    updateRediscovered();
    updateMemoryOfMonth();
    updateTodayDate();
}

// ===== Update Today Date =====
function updateTodayDate() {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const todayEl = document.getElementById('todayDate');
    if (todayEl) todayEl.textContent = formatted;
    
    const monthBadge = document.getElementById('monthBadge');
    if (monthBadge) {
        monthBadge.textContent = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
}

// ===== Update On This Day =====
function updateOnThisDay() {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    const todayMemories = allMemories.filter(memory => {
        const memoryDate = new Date(memory.date);
        return memoryDate.getMonth() === todayMonth && memoryDate.getDate() === todayDay;
    });

    const container = document.getElementById('onThisDayList');
    if (!container) return;

    if (todayMemories.length === 0) {
        container.innerHTML = `
            <div class="memory-item" style="justify-content: center;">
                <div class="memory-item-info">
                    <div class="memory-item-title">✨ No memories from this day yet</div>
                    <div class="memory-item-date">Create a memory today!</div>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = todayMemories.map(memory => `
        <div class="memory-item" onclick="showMemoryModal(${memory.id})">
            <div class="memory-item-icon">📅</div>
            <div class="memory-item-info">
                <div class="memory-item-title">${escapeHtml(memory.title)}</div>
                <div class="memory-item-date">${formatDate(memory.date)} • ${escapeHtml(memory.location)}</div>
            </div>
        </div>
    `).join('');
}

// ===== Update Time Capsules =====
function updateTimeCapsules() {
    const capsules = allMemories.filter(m => m.timeCapsule === true);
    const container = document.getElementById('timeCapsuleList');
    const countEl = document.getElementById('capsuleCount');
    
    if (countEl) countEl.textContent = `${capsules.length} locked`;

    if (!container) return;

    if (capsules.length === 0) {
        container.innerHTML = `
            <div class="memory-item" style="justify-content: center;">
                <div class="memory-item-info">
                    <div class="memory-item-title">🔒 No time capsules yet</div>
                    <div class="memory-item-date">Lock a memory for the future!</div>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = capsules.map(memory => `
        <div class="memory-item" onclick="showMemoryModal(${memory.id})">
            <div class="memory-item-icon">🔒</div>
            <div class="memory-item-info">
                <div class="memory-item-title">${escapeHtml(memory.title)}</div>
                <div class="memory-item-date">Unlocks after ${memory.capsuleTime || 1} year(s) • ${formatDate(memory.date)}</div>
            </div>
            <div class="locked-badge"><i class="ri-lock-fill"></i> Locked</div>
        </div>
    `).join('');
}

// ===== Update Recently Rediscovered =====
function updateRediscovered() {
    const rediscovered = [...allMemories].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
    const container = document.getElementById('rediscoveredGrid');
    if (!container) return;

    if (rediscovered.length === 0) {
        container.innerHTML = '<div class="loading">No memories yet</div>';
        return;
    }

    container.innerHTML = rediscovered.map(memory => `
        <div class="rediscovered-item" onclick="showMemoryModal(${memory.id})">
            <div class="rediscovered-img">
                ${memory.photos && memory.photos.length > 0 ? 
                    `<img src="${memory.photos[0].data}" alt="${escapeHtml(memory.title)}">` :
                    '<i class="ri-image-line" style="font-size: 2rem; color: #ff6b8b;"></i>'
                }
            </div>
            <div class="rediscovered-title">${escapeHtml(memory.title)}</div>
            <div style="font-size: 0.65rem; color: #aaa;">${formatDate(memory.date)}</div>
        </div>
    `).join('');
}

// ===== Update Memory of the Month =====
function updateMemoryOfMonth() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthMemories = allMemories.filter(memory => {
        const memoryDate = new Date(memory.date);
        return memoryDate.getMonth() === currentMonth && memoryDate.getFullYear() === currentYear;
    });

    const container = document.getElementById('memoryOfMonth');
    if (!container) return;

    if (monthMemories.length === 0) {
        container.innerHTML = '<div class="loading">No memories this month yet. Create one!</div>';
        return;
    }

    const featuredMemory = monthMemories[Math.floor(Math.random() * monthMemories.length)];

    container.innerHTML = `
        <div class="memory-of-month" onclick="showMemoryModal(${featuredMemory.id})">
            <div class="memory-of-month-img">
                ${featuredMemory.photos && featuredMemory.photos.length > 0 ? 
                    `<img src="${featuredMemory.photos[0].data}" alt="${escapeHtml(featuredMemory.title)}">` :
                    '<i class="ri-image-line" style="font-size: 2rem; color: #ff6b8b;"></i>'
                }
            </div>
            <div class="memory-of-month-info">
                <h4>${escapeHtml(featuredMemory.title)}</h4>
                <p><i class="ri-map-pin-line"></i> ${escapeHtml(featuredMemory.location)}</p>
                <span class="memory-of-month-mood">${moodEmoji[featuredMemory.mood] || '📝'} ${featuredMemory.mood}</span>
            </div>
        </div>
    `;
}

// ===== Show Random Memory =====
function showRandomMemory() {
    if (allMemories.length === 0) {
        alert('No memories yet! Add some memories first.');
        return;
    }

    const randomIndex = Math.floor(Math.random() * allMemories.length);
    const memory = allMemories[randomIndex];

    randomMemoryCard.style.display = 'block';

    document.getElementById('randomMemoryContent').innerHTML = `
        <div class="random-memory-item" onclick="showMemoryModal(${memory.id})">
            <div class="random-memory-img">
                ${memory.photos && memory.photos.length > 0 ? 
                    `<img src="${memory.photos[0].data}" alt="${escapeHtml(memory.title)}">` :
                    '<i class="ri-image-line" style="font-size: 2rem; color: #ff6b8b;"></i>'
                }
            </div>
            <div class="random-memory-details">
                <div class="random-memory-title">${escapeHtml(memory.title)}</div>
                <div class="random-memory-location"><i class="ri-map-pin-line"></i> ${escapeHtml(memory.location)}</div>
                <div class="random-memory-date"><i class="ri-calendar-line"></i> ${formatDate(memory.date)}</div>
                <div class="random-memory-date"><i class="ri-emotion-line"></i> ${moodEmoji[memory.mood] || '📝'} ${memory.mood}</div>
            </div>
        </div>
    `;
}

function closeRandomMemory() {
    randomMemoryCard.style.display = 'none';
}

// ===== Show Memory Modal =====
window.showMemoryModal = function(id) {
    const memory = allMemories.find(m => m.id === id);
    if (!memory) return;

    currentMemoryId = id;

    document.getElementById('modalTitle').textContent = memory.title;

    document.getElementById('modalBody').innerHTML = `
        <div class="modal-memory-img">
            ${memory.photos && memory.photos.length > 0 ? 
                `<img src="${memory.photos[0].data}" alt="${escapeHtml(memory.title)}">` :
                '<i class="ri-image-line" style="font-size: 3rem; color: #ff6b8b;"></i>'
            }
        </div>
        <div class="modal-memory-title">${escapeHtml(memory.title)}</div>
        <div class="modal-memory-location"><i class="ri-map-pin-line"></i> ${escapeHtml(memory.location)}</div>
        <div class="modal-memory-date"><i class="ri-calendar-line"></i> ${formatDate(memory.date)}</div>
        <div class="modal-memory-mood"><i class="ri-emotion-line"></i> ${moodEmoji[memory.mood] || '📝'} ${memory.mood}</div>
        ${memory.story ? `<div class="modal-memory-story">${escapeHtml(memory.story)}</div>` : ''}
        ${memory.timeCapsule ? `<div class="modal-memory-story" style="background: #fef3c7;"><i class="ri-time-fill"></i> 🔒 Time Capsule - Unlocks after ${memory.capsuleTime || 1} year(s)</div>` : ''}
    `;

    memoryModal.classList.add('active');
};

function closeMemoryModal() {
    memoryModal.classList.remove('active');
    currentMemoryId = null;
}

function viewFullMemory() {
    if (currentMemoryId) {
        window.location.href = `memory-detail.html?id=${currentMemoryId}`;
    }
}

// ===== View All Rediscovered =====
document.getElementById('viewAllRediscovered')?.addEventListener('click', () => {
    window.location.href = 'timeline.html';
});

// ===== Event Listeners =====
surpriseBtn.addEventListener('click', showRandomMemory);
closeRandomBtn.addEventListener('click', closeRandomMemory);
closeModal.addEventListener('click', closeMemoryModal);
viewFullMemoryBtn.addEventListener('click', viewFullMemory);

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', closeMemoryModal);
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
loadUserData();

console.log('%c🎞️ Nostalgia Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold');