// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const timelineTrack = document.getElementById('timelineTrack');
const emptyState = document.getElementById('emptyState');
const yearsContainer = document.getElementById('yearsContainer');
const prevYearBtn = document.getElementById('prevYear');
const nextYearBtn = document.getElementById('nextYear');
const currentYearValue = document.getElementById('currentYearValue');

// Popup elements
const welcomePopup = document.getElementById('welcomePopup');
const closePopup = document.getElementById('closePopup');
const popupMessage = document.getElementById('popupMessage');
const viewLatestBtn = document.getElementById('viewLatestBtn');
const exploreBtn = document.getElementById('exploreBtn');

// Modal elements
const memoryModal = document.getElementById('memoryModal');
const closeModal = document.getElementById('closeModal');
const modalOverlay = document.querySelector('.modal-overlay');

// Mood emojis
const moodEmoji = {
    happy: '😊', peaceful: '😌', loved: '❤️', excited: '😎', nostalgic: '📸', sad: '😢'
};

let allMemories = [];
let currentYear = new Date().getFullYear();
let selectedMemoryId = null;

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

// ===== Load Memories =====
function loadMemories() {
    const stored = localStorage.getItem('memonap_memories');
    if (stored && JSON.parse(stored).length > 0) {
        allMemories = JSON.parse(stored);
        emptyState.style.display = 'none';
        renderYearSelector();
        renderTimeline();
        checkAndShowPopup();
    } else {
        allMemories = [];
        emptyState.style.display = 'block';
        timelineTrack.innerHTML = '';
    }
}

// ===== Render Year Selector =====
function renderYearSelector() {
    const years = [...new Set(allMemories.map(m => new Date(m.date).getFullYear()))];
    years.sort((a, b) => b - a);
    
    if (years.length === 0) return;
    
    yearsContainer.innerHTML = years.map(year => `
        <div class="year-chip ${year === currentYear ? 'active' : ''}" data-year="${year}">
            ${year}
        </div>
    `).join('');
    
    currentYearValue.textContent = currentYear;
    
    document.querySelectorAll('.year-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.year-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentYear = parseInt(chip.dataset.year);
            currentYearValue.textContent = currentYear;
            renderTimeline();
        });
    });
}

// ===== Render Horizontal Timeline =====
function renderTimeline() {
    const filteredMemories = allMemories.filter(m => new Date(m.date).getFullYear() === currentYear);
    filteredMemories.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredMemories.length === 0) {
        timelineTrack.innerHTML = `<div style="text-align: center; width: 100%; padding: 2rem; color: #888;">No memories in ${currentYear}</div>`;
        return;
    }
    
    timelineTrack.innerHTML = filteredMemories.map(memory => `
        <div class="memory-slide" data-id="${memory.id}">
            <div class="memory-slide-media">
                ${memory.photos && memory.photos.length > 0 ? 
                    `<img src="${memory.photos[0].data}" alt="${escapeHtml(memory.title)}">` :
                    `<i class="ri-image-line"></i>`
                }
                ${memory.video ? `<div class="video-badge"><i class="ri-video-line"></i> Video</div>` : ''}
            </div>
            <div class="memory-slide-content">
                <div class="memory-slide-title">${escapeHtml(memory.title)}</div>
                <div class="memory-slide-location">
                    <i class="ri-map-pin-line"></i> ${escapeHtml(memory.location)}
                </div>
                <div class="memory-slide-date">
                    <i class="ri-calendar-line"></i> ${formatDate(memory.date)}
                </div>
                <div class="memory-slide-mood">
                    ${moodEmoji[memory.mood] || '📝'} ${memory.mood}
                </div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.memory-slide').forEach(slide => {
        slide.addEventListener('click', () => {
            const id = parseInt(slide.dataset.id);
            openMemoryModal(id);
        });
    });
}

// ===== Check and Show Welcome Popup =====
function checkAndShowPopup() {
    const hasSeenPopup = sessionStorage.getItem('hasSeenTimelinePopup');
    if (!hasSeenPopup) {
        const latestMemory = getLatestMemory();
        if (latestMemory) {
            popupMessage.innerHTML = `You have <strong>${allMemories.length} memories</strong> from the past years.<br>Your latest memory: <strong>"${escapeHtml(latestMemory.title)}"</strong>`;
        } else {
            popupMessage.innerHTML = `You have <strong>${allMemories.length} memories</strong> to explore!`;
        }
        welcomePopup.classList.add('active');
        sessionStorage.setItem('hasSeenTimelinePopup', 'true');
    }
}

// ===== Get Latest Memory =====
function getLatestMemory() {
    if (allMemories.length === 0) return null;
    const sorted = [...allMemories].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0];
}

// ===== Open Memory Modal =====
function openMemoryModal(id) {
    const memory = allMemories.find(m => m.id === id);
    if (!memory) return;
    
    selectedMemoryId = id;
    
    document.getElementById('modalTitle').textContent = memory.title;
    document.getElementById('modalLocation').textContent = memory.location;
    document.getElementById('modalDate').textContent = formatDate(memory.date);
    document.getElementById('modalMood').innerHTML = `${moodEmoji[memory.mood] || '📝'} ${memory.mood}`;
    document.getElementById('modalStory').innerHTML = memory.story ? `<p>${escapeHtml(memory.story)}</p>` : '<p><em>No story added yet.</em></p>';
    
    const modalImage = document.getElementById('modalImage');
    if (memory.photos && memory.photos.length > 0) {
        modalImage.src = memory.photos[0].data;
        modalImage.style.display = 'block';
    } else {
        modalImage.style.display = 'none';
    }
    
    const tagsContainer = document.getElementById('modalTags');
    if (memory.tags && memory.tags.length > 0) {
        tagsContainer.innerHTML = memory.tags.map(tag => `<span class="modal-tag">#${escapeHtml(tag)}</span>`).join('');
    } else {
        tagsContainer.innerHTML = '';
    }
    
    memoryModal.classList.add('active');
}

// ===== Close Modal =====
function closeMemoryModal() {
    memoryModal.classList.remove('active');
    selectedMemoryId = null;
}

// ===== Delete Memory =====
function deleteMemory() {
    if (selectedMemoryId && confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
        allMemories = allMemories.filter(m => m.id !== selectedMemoryId);
        localStorage.setItem('memonap_memories', JSON.stringify(allMemories));
        closeMemoryModal();
        loadMemories();
    }
}

// ===== Edit Memory =====
function editMemory() {
    if (selectedMemoryId) {
        localStorage.setItem('editMemoryId', selectedMemoryId);
        window.location.href = 'add-memory.html';
    }
}

// ===== Year Navigation =====
function scrollYears(direction) {
    yearsContainer.scrollBy({ left: direction * 100, behavior: 'smooth' });
}

// ===== Event Listeners =====
prevYearBtn?.addEventListener('click', () => scrollYears(-100));
nextYearBtn?.addEventListener('click', () => scrollYears(100));

closePopup?.addEventListener('click', () => welcomePopup.classList.remove('active'));
document.querySelector('.popup-overlay')?.addEventListener('click', () => welcomePopup.classList.remove('active'));

viewLatestBtn?.addEventListener('click', () => {
    const latest = getLatestMemory();
    if (latest) {
        welcomePopup.classList.remove('active');
        openMemoryModal(latest.id);
    }
});

exploreBtn?.addEventListener('click', () => {
    welcomePopup.classList.remove('active');
});

closeModal?.addEventListener('click', closeMemoryModal);
modalOverlay?.addEventListener('click', closeMemoryModal);

document.getElementById('editMemoryBtn')?.addEventListener('click', editMemory);
document.getElementById('deleteMemoryBtn')?.addEventListener('click', deleteMemory);

menuToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
logoutBtn?.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'login.html';
});

// ===== Check Auth =====
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }
    return true;
}

// ===== Sample Data =====
function addSampleData() {
    const existing = localStorage.getItem('memonap_memories');
    if (!existing || JSON.parse(existing).length === 0) {
        const sample = [
            { id: 1, title: "🎓 Graduation Day", location: "Mumbai, India", date: "2024-05-15", mood: "happy", photos: [], story: "Finally graduated after 4 years of hard work!", tags: ["graduation", "celebration"] },
            { id: 2, title: "🏔️ Himalayan Trek", location: "Himachal, India", date: "2024-08-20", mood: "excited", photos: [], story: "The view from the top was breathtaking!", tags: ["adventure", "mountains"] },
            { id: 3, title: "🍕 First Date", location: "Delhi, India", date: "2024-10-10", mood: "loved", photos: [], story: "Best pizza and best company!", tags: ["romance", "date"] },
            { id: 4, title: "🌊 Beach Sunset", location: "Goa, India", date: "2023-12-25", mood: "peaceful", photos: [], story: "The most beautiful sunset I've ever seen", tags: ["beach", "sunset"] }
        ];
        localStorage.setItem('memonap_memories', JSON.stringify(sample));
    }
}
// Add to timeline.js - View All years
function setupViewAllButtons() {
    const viewAllBtn = document.querySelector('.view-all');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            yearFilter.value = 'all';
            yearFilter.dispatchEvent(new Event('change'));
        });
    }
}

// Initialize
addSampleData();
checkAuth();
loadMemories();

console.log('%c📅 Timeline Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');