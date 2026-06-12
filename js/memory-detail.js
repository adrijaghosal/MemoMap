// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const editMemoryBtn = document.getElementById('editMemoryBtn');
const deleteMemoryBtn = document.getElementById('deleteMemoryBtn');
const memoryDetailContainer = document.getElementById('memoryDetailContainer');
const emptyState = document.getElementById('emptyState');
const memoryTitleHeader = document.getElementById('memoryTitleHeader');

// Delete Modal
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let currentMemory = null;
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

// ===== Load Memory from localStorage =====
function loadMemory() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    
    if (!id) {
        showEmptyState();
        return;
    }
    
    currentMemoryId = id;
    const memories = JSON.parse(localStorage.getItem('memonap_memories') || '[]');
    currentMemory = memories.find(m => m.id === id);
    
    if (!currentMemory) {
        showEmptyState();
        return;
    }
    
    renderMemoryDetail();
}

// ===== Show Empty State =====
function showEmptyState() {
    memoryDetailContainer.style.display = 'none';
    emptyState.style.display = 'block';
}

// ===== Render Memory Detail =====
function renderMemoryDetail() {
    memoryDetailContainer.style.display = 'block';
    emptyState.style.display = 'none';
    memoryTitleHeader.innerHTML = `<h2>${escapeHtml(currentMemory.title)}</h2>`;
    
    // Hero Image
    let heroHtml = '';
    if (currentMemory.photos && currentMemory.photos.length > 0) {
        heroHtml = `<img class="memory-hero-image" src="${currentMemory.photos[0].data}" alt="${escapeHtml(currentMemory.title)}">`;
    } else {
        heroHtml = `
            <div class="memory-hero-placeholder">
                <i class="ri-image-line"></i>
                <p>No photo added</p>
            </div>
        `;
    }
    
    // Photos Grid
    let photosHtml = '';
    if (currentMemory.photos && currentMemory.photos.length > 0) {
        photosHtml = `
            <div class="photos-section">
                <h3><i class="ri-image-line"></i> Photos (${currentMemory.photos.length})</h3>
                <div class="photos-grid">
                    ${currentMemory.photos.map(photo => `
                        <div class="photo-item" onclick="viewPhoto('${photo.data}')">
                            <img src="${photo.data}" alt="Memory photo">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Tags
    let tagsHtml = '';
    if (currentMemory.tags && currentMemory.tags.length > 0) {
        tagsHtml = `
            <div class="tags-section">
                <h3><i class="ri-price-tag-line"></i> Tags</h3>
                <div class="tags-list">
                    ${currentMemory.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    // Voice Note
    let voiceHtml = '';
    if (currentMemory.voiceNote) {
        voiceHtml = `
            <div class="voice-section">
                <h3><i class="ri-mic-line"></i> Voice Note</h3>
                <div class="voice-player">
                    <button class="play-btn" onclick="playVoiceNote()">
                        <i class="ri-play-fill"></i>
                    </button>
                    <span>Voice recording from ${formatDate(currentMemory.date)}</span>
                </div>
                <audio id="voiceAudio" style="display: none;" controls>
                    <source src="${currentMemory.voiceNote}" type="audio/wav">
                </audio>
            </div>
        `;
    }
    
    // Time Capsule Badge
    let timeCapsuleHtml = '';
    if (currentMemory.timeCapsule) {
        timeCapsuleHtml = `
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 20px; padding: 1rem; margin-bottom: 1.5rem; text-align: center;">
                <i class="ri-time-fill"></i> 🔒 Time Capsule Memory - Unlocks after ${currentMemory.capsuleTime || 1} year(s)
            </div>
        `;
    }
    
    const html = `
        <div class="memory-hero">
            ${heroHtml}
        </div>
        
        ${timeCapsuleHtml}
        
        <div class="memory-info-card">
            <h1 class="memory-title">${escapeHtml(currentMemory.title)}</h1>
            
            <div class="memory-meta-grid">
                <div class="meta-item">
                    <div class="meta-icon"><i class="ri-map-pin-line"></i></div>
                    <div class="meta-info">
                        <h4>Location</h4>
                        <p>${escapeHtml(currentMemory.location)}</p>
                    </div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon"><i class="ri-calendar-line"></i></div>
                    <div class="meta-info">
                        <h4>Date</h4>
                        <p>${formatDate(currentMemory.date)}</p>
                    </div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon"><i class="ri-emotion-line"></i></div>
                    <div class="meta-info">
                        <h4>Mood</h4>
                        <p>${moodEmoji[currentMemory.mood] || '📝'} ${currentMemory.mood}</p>
                    </div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon"><i class="ri-group-line"></i></div>
                    <div class="meta-info">
                        <h4>With</h4>
                        <p>${currentMemory.with ? escapeHtml(currentMemory.with) : 'Alone / Not specified'}</p>
                    </div>
                </div>
            </div>
            
            ${currentMemory.story ? `
                <div class="story-section">
                    <h3><i class="ri-book-open-line"></i> Story</h3>
                    <div class="story-content">
                        ${escapeHtml(currentMemory.story).replace(/\n/g, '<br>')}
                    </div>
                </div>
            ` : ''}
            
            ${tagsHtml}
        </div>
        
        ${photosHtml}
        
        ${voiceHtml}
        
        <div class="action-buttons">
            <button class="btn-primary" onclick="editMemory()">
                <i class="ri-edit-line"></i> Edit Memory
            </button>
            <button class="btn-secondary" onclick="shareMemory()">
                <i class="ri-share-line"></i> Share
            </button>
        </div>
    `;
    
    memoryDetailContainer.innerHTML = html;
}

// ===== Photo Viewer =====
window.viewPhoto = function(photoData) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    `;
    modal.innerHTML = `
        <img src="${photoData}" style="max-width: 90%; max-height: 90%; object-fit: contain;">
        <button style="position: absolute; top: 20px; right: 20px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer;">&times;</button>
    `;
    modal.querySelector('button').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
};

// ===== Play Voice Note =====
window.playVoiceNote = function() {
    const audio = document.getElementById('voiceAudio');
    if (audio) {
        audio.play();
        const playBtn = document.querySelector('.play-btn');
        if (playBtn) {
            playBtn.innerHTML = '<i class="ri-pause-fill"></i>';
            audio.onended = () => {
                playBtn.innerHTML = '<i class="ri-play-fill"></i>';
            };
        }
    }
};

// ===== Edit Memory =====
window.editMemory = function() {
    localStorage.setItem('editMemoryId', currentMemoryId);
    window.location.href = 'add-memory.html';
};

// ===== Share Memory =====
window.shareMemory = function() {
    if (navigator.share) {
        navigator.share({
            title: currentMemory.title,
            text: `Check out my memory: ${currentMemory.title} at ${currentMemory.location}`,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
};

// ===== Delete Memory =====
function openDeleteModal() {
    deleteModal.classList.add('active');
}

function closeDeleteModalFunc() {
    deleteModal.classList.remove('active');
}

function confirmDelete() {
    const memories = JSON.parse(localStorage.getItem('memonap_memories') || '[]');
    const updatedMemories = memories.filter(m => m.id !== currentMemoryId);
    localStorage.setItem('memonap_memories', JSON.stringify(updatedMemories));
    closeDeleteModalFunc();
    window.location.href = 'dashboard.html';
}

// ===== Event Listeners =====
if (editMemoryBtn) editMemoryBtn.addEventListener('click', openDeleteModal);
if (deleteMemoryBtn) deleteMemoryBtn.addEventListener('click', openDeleteModal);
if (closeDeleteModal) closeDeleteModal.addEventListener('click', closeDeleteModalFunc);
if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModalFunc);
if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDelete);

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', closeDeleteModalFunc);
});

// ===== Sidebar Functions =====
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
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

// ===== Check Auth =====
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
    }
}

// Initialize
checkAuth();
loadMemory();

console.log('%c📸 Memory Detail Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');