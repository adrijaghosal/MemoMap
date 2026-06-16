// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const yearFilter = document.getElementById('yearFilter');
const timelineTrack = document.getElementById('timelineTrack');
const emptyState = document.getElementById('emptyState');
const totalYearsSpan = document.getElementById('totalYears');
const totalMemoriesSpan = document.getElementById('totalMemories');
const totalPhotosSpan = document.getElementById('totalPhotos');
const totalCitiesSpan = document.getElementById('totalCities');

// Modal Elements
const memoryModal = document.getElementById('memoryModal');
const closeModal = document.getElementById('closeModal');
const viewFullMemoryBtn = document.getElementById('viewFullMemoryBtn');

let allMemories = [];
let currentUserId = null;
let currentMemoryId = null;

// Mood Emojis
const moodEmoji = {
    happy: '😊', peaceful: '😌', loved: '❤️',
    excited: '😎', nostalgic: '📸', sad: '😢'
};

// ===== Helper Functions =====
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString + 'T00:00:00'); // force local time parse
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatShortDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getYear(dateString) {
    if (!dateString) return 'Unknown';
    return new Date(dateString + 'T00:00:00').getFullYear();
}

// ===== Load User Data =====
function loadUserData() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userEmail = sessionStorage.getItem('userEmail');
    const userName = sessionStorage.getItem('userName');

    // Redirect if not logged in
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return [];
    }

    const nameEl = document.getElementById('sidebarUserName');
    if (nameEl && userName) nameEl.textContent = userName;

    currentUserId = userEmail || 'guest';
    const memoriesKey = `memonap_memories_${currentUserId}`;

    let stored = null;
    try {
        stored = localStorage.getItem(memoriesKey);
    } catch (e) {
        console.error('localStorage read error:', e);
    }

    // Parse & validate each memory has the required fields
    let parsed = [];
    if (stored) {
        try {
            parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) parsed = [];
        } catch (e) {
            console.error('Failed to parse memories:', e);
            parsed = [];
        }
    }

    // Filter out any corrupt entries missing required fields
    allMemories = parsed.filter(m =>
        m && m.id && m.title && m.date && m.location && m.mood
    );

    // Re-save cleaned data (removes corrupt entries silently)
    if (allMemories.length !== parsed.length) {
        try {
            localStorage.setItem(memoriesKey, JSON.stringify(allMemories));
        } catch (e) {}
    }

    console.log(`📊 Loaded ${allMemories.length} valid memories for: ${currentUserId}`);
    return allMemories;
}

// ===== Update Stats =====
function updateStats() {
    totalMemoriesSpan.textContent = allMemories.length;

    const uniqueYears = new Set(allMemories.map(m => getYear(m.date)));
    totalYearsSpan.textContent = uniqueYears.size;

    // Count memories that have at least one photo
    const photoCount = allMemories.filter(m => m.photos && m.photos.length > 0).length;
    totalPhotosSpan.textContent = photoCount;

    const uniqueCities = new Set(
        allMemories
            .map(m => m.location ? m.location.split(',')[0].trim() : null)
            .filter(Boolean)
    );
    totalCitiesSpan.textContent = uniqueCities.size;
}

// ===== Group Memories by Year =====
function groupMemoriesByYear(memories) {
    const grouped = {};
    memories.forEach(memory => {
        const year = getYear(memory.date);
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(memory);
    });
    return grouped;
}

// ===== Update Year Filter =====
function updateYearFilter(memories) {
    const years = [...new Set(memories.map(m => getYear(m.date)))];
    years.sort((a, b) => b - a);

    yearFilter.innerHTML = '<option value="all">All Years</option>';
    years.forEach(year => {
        const opt = document.createElement('option');
        opt.value = year;
        opt.textContent = year;
        yearFilter.appendChild(opt);
    });
}

// ===== Render Timeline =====
function renderTimeline() {
    if (allMemories.length === 0) {
        if (timelineTrack) timelineTrack.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (timelineTrack) timelineTrack.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';

    const grouped = groupMemoriesByYear(allMemories);
    const sortedYears = Object.keys(grouped).sort((a, b) => b - a);
    const selectedYear = yearFilter.value;

    const yearsToShow = selectedYear !== 'all'
        ? sortedYears.filter(y => String(y) === String(selectedYear))
        : sortedYears;

    if (yearsToShow.length === 0) {
        timelineTrack.innerHTML = '<p style="padding:2rem;color:#aaa;">No memories for this year.</p>';
        return;
    }

    timelineTrack.innerHTML = yearsToShow.map(year => {
        const yearMemories = [...grouped[year]].sort((a, b) => new Date(b.date) - new Date(a.date));
        const monthCount = new Set(yearMemories.map(m => new Date(m.date + 'T00:00:00').getMonth())).size;

        return `
            <div class="year-section" data-year="${year}">
                <div class="year-header">
                    <h3>${year}</h3>
                    <p>${yearMemories.length} ${yearMemories.length === 1 ? 'memory' : 'memories'} &bull; ${monthCount} ${monthCount === 1 ? 'month' : 'months'}</p>
                </div>
                <div class="year-memories">
                    ${yearMemories.map(memory => `
                        <div class="timeline-memory-card" data-id="${memory.id}">
                            <div class="memory-card-image">
                                ${memory.photos && memory.photos.length > 0
                                    ? `<img src="${memory.photos[0].data}" alt="${escapeHtml(memory.title)}" loading="lazy">`
                                    : '<i class="ri-image-line"></i>'
                                }
                            </div>
                            <div class="memory-card-details">
                                <div class="memory-card-title">
                                    ${escapeHtml(memory.title)}
                                    ${memory.timeCapsule
                                        ? '<span class="time-capsule-badge"><i class="ri-time-fill"></i> Capsule</span>'
                                        : ''
                                    }
                                </div>
                                <div class="memory-card-location">
                                    <i class="ri-map-pin-line"></i> ${escapeHtml(memory.location)}
                                </div>
                                <div class="memory-card-date">
                                    <i class="ri-calendar-line"></i> ${formatShortDate(memory.date)}
                                </div>
                                <div class="memory-card-mood">
                                    ${moodEmoji[memory.mood] || '📝'} ${escapeHtml(memory.mood)}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Attach click events to cards
    document.querySelectorAll('.timeline-memory-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = Number(card.dataset.id);
            openMemoryModal(id);
        });
    });
}

// ===== Open Memory Modal =====
function openMemoryModal(id) {
    const memory = allMemories.find(m => Number(m.id) === id);
    if (!memory) return;

    currentMemoryId = id;

    document.getElementById('modalTitle').textContent = memory.title;

    document.getElementById('modalBody').innerHTML = `
        <div class="modal-memory-img">
            ${memory.photos && memory.photos.length > 0
                ? `<img src="${memory.photos[0].data}" alt="${escapeHtml(memory.title)}">`
                : '<i class="ri-image-line" style="font-size:3rem;color:#ff6b8b;opacity:0.4;"></i>'
            }
        </div>
        <div class="modal-memory-title">${escapeHtml(memory.title)}</div>
        <div class="modal-memory-location"><i class="ri-map-pin-line"></i> ${escapeHtml(memory.location)}</div>
        <div class="modal-memory-date"><i class="ri-calendar-line"></i> ${formatDate(memory.date)}</div>
        <div class="modal-memory-mood">
            <i class="ri-emotion-line"></i> ${moodEmoji[memory.mood] || '📝'} ${escapeHtml(memory.mood)}
        </div>
        ${memory.story
            ? `<div class="modal-memory-story">${escapeHtml(memory.story)}</div>`
            : ''
        }
        ${memory.timeCapsule
            ? `<div class="modal-memory-story" style="background:#fef3c7;">
                <i class="ri-time-fill"></i> 🔒 Time Capsule — unlocks after ${memory.capsuleTime || 1} year(s)
               </div>`
            : ''
        }
    `;

    memoryModal.classList.add('active');
}

function closeMemoryModal() {
    memoryModal.classList.remove('active');
    currentMemoryId = null;
}

function viewFullMemory() {
    if (currentMemoryId) {
        window.location.href = `memory-detail.html?id=${currentMemoryId}`;
    }
}

// ===== Sidebar =====
function toggleSidebar() {
    sidebar.classList.toggle('open');
}

async function handleLogout() {
    sessionStorage.clear();
    if (typeof firebase !== 'undefined' && firebase.auth) {
        try { await firebase.auth().signOut(); } catch (e) {}
    }
    window.location.href = 'login.html';
}

// ===== Event Listeners =====
if (yearFilter) yearFilter.addEventListener('change', renderTimeline);
if (closeModal) closeModal.addEventListener('click', closeMemoryModal);
if (viewFullMemoryBtn) viewFullMemoryBtn.addEventListener('click', viewFullMemory);
if (memoryModal) {
    memoryModal.querySelector('.modal-overlay')?.addEventListener('click', closeMemoryModal);
}
if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
        if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

// ===== Initialize =====
function init() {
    loadUserData();
    updateStats();
    updateYearFilter(allMemories);
    renderTimeline();
}

init();

console.log('%c📅 Timeline loaded — showing real user data only', 'color: #ff6b8b; font-size: 13px; font-weight: bold');