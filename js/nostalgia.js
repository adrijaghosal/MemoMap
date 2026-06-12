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

let currentModalMemoryId = null;
let allMemories = [];

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

const moodEmoji = {
    happy: '😊', peaceful: '😌', loved: '❤️', excited: '😎', nostalgic: '📸', sad: '😢'
};

// ===== Create Magical Surprise Popup =====
function createMagicalPopup(memory) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.magical-surprise-popup');
    if (existingPopup) existingPopup.remove();
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'magical-surprise-popup';
    
    // Create inner content
    popup.innerHTML = `
        <div class="magical-overlay"></div>
        <div class="magical-card">
            <button class="magical-close">&times;</button>
            <div class="magical-sparkles">
                <span class="sparkle">✨</span>
                <span class="sparkle">🎉</span>
                <span class="sparkle">🌟</span>
                <span class="sparkle">💫</span>
                <span class="sparkle">⭐</span>
                <span class="sparkle">✨</span>
            </div>
            <div class="magical-header">
                <span class="magical-badge">🎁 Surprise Memory!</span>
            </div>
            <div class="magical-media">
                ${memory.photos && memory.photos.length > 0 ? 
                    `<img src="${memory.photos[0].data}" alt="${escapeHtml(memory.title)}">` :
                    `<div class="magical-no-photo"><i class="ri-image-line"></i><span>No photo</span></div>`
                }
            </div>
            <div class="magical-content">
                <h2 class="magical-title">${escapeHtml(memory.title)}</h2>
                <div class="magical-location">
                    <i class="ri-map-pin-line"></i> ${escapeHtml(memory.location)}
                </div>
                <div class="magical-date">
                    <i class="ri-calendar-line"></i> ${formatDate(memory.date)}
                </div>
                <div class="magical-mood">
                    <i class="ri-emotion-line"></i> ${moodEmoji[memory.mood] || '📝'} ${memory.mood}
                </div>
                ${memory.story ? `<div class="magical-story">"${escapeHtml(memory.story.substring(0, 150))}${memory.story.length > 150 ? '...' : ''}"</div>` : ''}
                <button class="magical-view-btn" data-id="${memory.id}">
                    <i class="ri-eye-line"></i> View Full Memory
                </button>
            </div>
            <div class="magical-footer">
                <span class="magical-time">✨ Just for you ✨</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Animate popup entrance
    setTimeout(() => {
        popup.classList.add('active');
    }, 10);
    
    // Add sparkle burst animation
    createSparkleBurst();
    
    // Play magical sound effect (simple beep/sound alternative)
    playMagicalSound();
    
    // Auto-play voice note if available
    if (memory.voiceNote) {
        playVoiceNote(memory.voiceNote);
    } else if (memory.song) {
        // Simulate song playing message
        const songMsg = document.createElement('div');
        songMsg.className = 'magical-song-msg';
        songMsg.innerHTML = `<i class="ri-music-line"></i> Playing: ${escapeHtml(memory.song)}`;
        popup.querySelector('.magical-content').appendChild(songMsg);
        setTimeout(() => songMsg.remove(), 3000);
    }
    
    // Close button
    popup.querySelector('.magical-close').addEventListener('click', () => {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 300);
    });
    
    // View full memory button
    popup.querySelector('.magical-view-btn').addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        window.location.href = `memory-detail.html?id=${id}`;
    });
    
    // Close on overlay click
    popup.querySelector('.magical-overlay').addEventListener('click', () => {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 300);
    });
}

// ===== Create Sparkle Burst Effect =====
function createSparkleBurst() {
    const sparkleCount = 50;
    const container = document.body;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'burst-sparkle';
        sparkle.innerHTML = ['✨', '🎉', '🌟', '💫', '⭐', '💖', '🎊', '✨'][Math.floor(Math.random() * 8)];
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 0.5 + 's';
        sparkle.style.fontSize = (Math.random() * 20 + 15) + 'px';
        container.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1500);
    }
}

// ===== Play Magical Sound =====
function playMagicalSound() {
    // Create a subtle "pop" sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.15;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.8);
        oscillator.stop(audioContext.currentTime + 0.8);
        
        // Second little chime
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 1046.5;
            gain2.gain.value = 0.1;
            osc2.start();
            gain2.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
            osc2.stop(audioContext.currentTime + 0.5);
        }, 200);
        
    } catch(e) {
        console.log('Audio not supported');
    }
}

// ===== Play Voice Note =====
function playVoiceNote(voiceNoteData) {
    try {
        const audio = new Audio(voiceNoteData);
        audio.volume = 0.3;
        audio.play();
        
        // Show playing indicator
        const playingIndicator = document.createElement('div');
        playingIndicator.className = 'magical-voice-playing';
        playingIndicator.innerHTML = '<i class="ri-mic-fill"></i> Playing your voice note...';
        document.querySelector('.magical-content')?.appendChild(playingIndicator);
        setTimeout(() => playingIndicator.remove(), audio.duration * 1000 || 3000);
    } catch(e) {
        console.log('Voice note playback error');
    }
}

// ===== Load Data =====
function loadData() {
    const stored = localStorage.getItem('memonap_memories');
    if (stored) {
        allMemories = JSON.parse(stored);
    } else {
        allMemories = [];
    }
    
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
    document.getElementById('todayDate').textContent = formatted;
    document.getElementById('monthBadge').textContent = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ===== On This Day =====
function updateOnThisDay() {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    const todayMemories = allMemories.filter(memory => {
        const memoryDate = new Date(memory.date);
        return memoryDate.getMonth() === todayMonth && memoryDate.getDate() === todayDay;
    });
    
    const container = document.getElementById('onThisDayList');
    
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

// ===== Time Capsules =====
function updateTimeCapsules() {
    const capsules = allMemories.filter(m => m.timeCapsule === true);
    const container = document.getElementById('timeCapsuleList');
    document.getElementById('capsuleCount').textContent = `${capsules.length} locked`;
    
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

// ===== Recently Rediscovered =====
function updateRediscovered() {
    const rediscovered = [...allMemories].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
    const container = document.getElementById('rediscoveredGrid');
    
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
            <div class="memory-item-date" style="font-size: 0.65rem;">${formatDate(memory.date)}</div>
        </div>
    `).join('');
}

// ===== Memory of the Month =====
function updateMemoryOfMonth() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthMemories = allMemories.filter(memory => {
        const memoryDate = new Date(memory.date);
        return memoryDate.getMonth() === currentMonth && memoryDate.getFullYear() === currentYear;
    });
    
    const container = document.getElementById('memoryOfMonth');
    
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

// ===== Surprise Random Memory with Magical Popup =====
function showRandomMemory() {
    if (allMemories.length === 0) {
        alert('No memories yet! Add some memories first.');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * allMemories.length);
    const memory = allMemories[randomIndex];
    
    // Store in recently viewed
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    recentlyViewed.unshift({ id: memory.id, timestamp: Date.now() });
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed.slice(0, 10)));
    
    // Create magical popup
    createMagicalPopup(memory);
}

function closeRandomMemory() {
    randomMemoryCard.style.display = 'none';
}

// ===== Show Memory Modal =====
window.showMemoryModal = function(id) {
    const memory = allMemories.find(m => m.id === id);
    if (!memory) return;
    
    currentModalMemoryId = id;
    
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
}

function closeMemoryModal() {
    memoryModal.classList.remove('active');
    currentModalMemoryId = null;
}

function viewFullMemory() {
    if (currentModalMemoryId) {
        window.location.href = `memory-detail.html?id=${currentModalMemoryId}`;
    }
}

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

// ===== Add Sample Data =====
function addSampleData() {
    const existing = localStorage.getItem('memonap_memories');
    if (!existing || JSON.parse(existing).length === 0) {
        const sample = [
            { id: 1, title: "Eiffel Tower Visit", location: "Paris, France", date: "2024-06-15", mood: "happy", photos: [], story: "The tower sparkled at night! It was magical.", timeCapsule: false, song: "La Vie En Rose" },
            { id: 2, title: "Sunset at Marine Drive", location: "Mumbai, India", date: "2024-07-20", mood: "peaceful", photos: [], story: "The sky turned orange and pink. Perfect evening.", timeCapsule: false },
            { id: 3, title: "First Date", location: "Delhi, India", date: "2024-08-10", mood: "loved", photos: [], story: "Butterflies in my stomach. Best coffee ever.", timeCapsule: true, capsuleTime: 5, song: "Perfect - Ed Sheeran" },
            { id: 4, title: "Mountain Trek", location: "Himachal, India", date: "2024-09-05", mood: "excited", photos: [], story: "Reached the summit at sunrise! Unforgettable.", timeCapsule: false },
            { id: 5, title: "Old School Memories", location: "Home", date: "2019-06-10", mood: "nostalgic", photos: [], story: "Found old school photos. Time flies.", timeCapsule: false }
        ];
        localStorage.setItem('memonap_memories', JSON.stringify(sample));
    }
}

// ===== Inject CSS for Magical Popup =====
function injectMagicalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Magical Surprise Popup */
        .magical-surprise-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            visibility: hidden;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .magical-surprise-popup.active {
            visibility: visible;
            opacity: 1;
        }
        
        .magical-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
        }
        
        .magical-card {
            position: relative;
            width: 90%;
            max-width: 500px;
            background: linear-gradient(145deg, #fff, #fff5f8);
            border-radius: 48px;
            overflow: hidden;
            animation: magicalFloat 0.5s ease-out;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
            z-index: 2001;
        }
        
        @keyframes magicalFloat {
            0% {
                opacity: 0;
                transform: scale(0.8) translateY(50px);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        .magical-sparkles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        }
        
        .magical-sparkles .sparkle {
            position: absolute;
            font-size: 20px;
            animation: sparkleFloat 2s ease-out forwards;
        }
        
        .magical-sparkles .sparkle:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
        .magical-sparkles .sparkle:nth-child(2) { top: 20%; right: 15%; animation-delay: 0.2s; }
        .magical-sparkles .sparkle:nth-child(3) { bottom: 30%; left: 20%; animation-delay: 0.4s; }
        .magical-sparkles .sparkle:nth-child(4) { top: 40%; right: 25%; animation-delay: 0.1s; }
        .magical-sparkles .sparkle:nth-child(5) { bottom: 15%; right: 10%; animation-delay: 0.3s; }
        .magical-sparkles .sparkle:nth-child(6) { top: 60%; left: 15%; animation-delay: 0.5s; }
        
        @keyframes sparkleFloat {
            0% {
                opacity: 1;
                transform: translateY(0) rotate(0deg) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-100px) rotate(360deg) scale(1.5);
            }
        }
        
        .magical-header {
            background: linear-gradient(135deg, #ff6b8b, #ffb347);
            padding: 1rem;
            text-align: center;
        }
        
        .magical-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.3);
            padding: 0.3rem 1rem;
            border-radius: 40px;
            font-size: 0.8rem;
            color: white;
            font-weight: 600;
        }
        
        .magical-media {
            height: 250px;
            background: linear-gradient(135deg, #ffe4ec, #ffd4e0);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .magical-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .magical-no-photo {
            text-align: center;
            color: #ff6b8b;
        }
        
        .magical-no-photo i {
            font-size: 3rem;
            opacity: 0.5;
        }
        
        .magical-no-photo span {
            display: block;
            font-size: 0.8rem;
            margin-top: 0.5rem;
        }
        
        .magical-content {
            padding: 1.5rem;
        }
        
        .magical-title {
            font-size: 1.5rem;
            color: #2d1b2e;
            margin-bottom: 0.5rem;
        }
        
        .magical-location, .magical-date, .magical-mood {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            color: #888;
            margin-bottom: 0.5rem;
        }
        
        .magical-story {
            margin-top: 1rem;
            padding: 1rem;
            background: rgba(255, 107, 139, 0.05);
            border-radius: 20px;
            font-size: 0.85rem;
            line-height: 1.6;
            color: #666;
            font-style: italic;
        }
        
        .magical-view-btn {
            width: 100%;
            margin-top: 1rem;
            padding: 0.8rem;
            background: linear-gradient(135deg, #ff6b8b, #ffb347);
            border: none;
            border-radius: 40px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s;
        }
        
        .magical-view-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 139, 0.3);
        }
        
        .magical-footer {
            padding: 1rem;
            text-align: center;
            border-top: 1px solid #f0e0e4;
            background: rgba(255, 255, 255, 0.5);
        }
        
        .magical-time {
            font-size: 0.7rem;
            color: #ff6b8b;
        }
        
        .magical-close {
            position: absolute;
            top: 15px;
            right: 20px;
            background: rgba(0, 0, 0, 0.5);
            border: none;
            color: white;
            font-size: 1.5rem;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s;
        }
        
        .magical-close:hover {
            background: #ff6b8b;
            transform: scale(1.1);
        }
        
        .magical-song-msg, .magical-voice-playing {
            margin-top: 0.8rem;
            padding: 0.5rem;
            background: rgba(255, 107, 139, 0.1);
            border-radius: 20px;
            font-size: 0.75rem;
            color: #ff6b8b;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            animation: fadeInOut 3s ease;
        }
        
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-10px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
        
        /* Burst Sparkles */
        .burst-sparkle {
            position: fixed;
            pointer-events: none;
            z-index: 2002;
            animation: burstFloat 1.5s ease-out forwards;
            font-size: 20px;
        }
        
        @keyframes burstFloat {
            0% {
                opacity: 1;
                transform: translate(0, 0) scale(1) rotate(0deg);
            }
            100% {
                opacity: 0;
                transform: translate(var(--tx, 100px), var(--ty, -100px)) scale(0.5) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}
// Add to nostalgia.js - View All handlers
function setupViewAllButtons() {
    // View all on this day
    const viewAllOnThisDay = document.querySelector('.nostalgia-card:first-child .view-all');
    if (viewAllOnThisDay) {
        viewAllOnThisDay.addEventListener('click', (e) => {
            e.preventDefault();
            alert('📅 All "On This Day" memories are shown above!');
        });
    }
    
    // View all time capsules
    const viewAllCapsules = document.querySelector('.nostalgia-card:nth-child(2) .view-all');
    if (viewAllCapsules) {
        viewAllCapsules.addEventListener('click', (e) => {
            e.preventDefault();
            alert('🔒 All time capsules are shown above!');
        });
    }
    
    // View all rediscovered
    const viewAllRediscovered = document.getElementById('viewAllRediscovered');
    if (viewAllRediscovered) {
        viewAllRediscovered.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'timeline.html';
        });
    }
}

// Call setupViewAllButtons() in your loadData() or init function
// Initialize
injectMagicalStyles();
addSampleData();
checkAuth();
loadData();

console.log('%c🎞️ Nostalgia Page Loaded with Magical Surprise!', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');