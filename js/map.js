// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const memoryPanel = document.getElementById('memoryPanel');
const closePanel = document.getElementById('closePanel');
const viewMemoryBtn = document.getElementById('viewMemoryBtn');
const shareMemoryBtn = document.getElementById('shareMemoryBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetViewBtn = document.getElementById('resetViewBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

// Stats elements
const pinCountSpan = document.getElementById('pinCount');
const countryCountSpan = document.getElementById('countryCount');
const photoCountSpan = document.getElementById('photoCount');

// Map variables
let map;
let markers = [];
let currentMemoryId = null;
let allMemories = [];
let currentFilter = 'all';

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

// Generate coordinates from location name
function getCoordinatesFromLocation(location) {
    const locationMap = {
        'paris': [48.8566, 2.3522], 'france': [48.8566, 2.3522],
        'new york': [40.7128, -74.0060], 'nyc': [40.7128, -74.0060], 'usa': [40.7128, -74.0060],
        'tokyo': [35.6762, 139.6503], 'japan': [35.6762, 139.6503],
        'london': [51.5074, -0.1278], 'uk': [51.5074, -0.1278],
        'sydney': [-33.8688, 151.2093], 'australia': [-33.8688, 151.2093],
        'mumbai': [19.0760, 72.8777], 'delhi': [28.6139, 77.2090], 'india': [20.5937, 78.9629],
        'bali': [-8.3405, 115.0920], 'indonesia': [-0.7893, 113.9213],
        'goa': [15.2993, 74.1240], 'himachal': [31.1048, 77.1734],
        'paris': [48.8566, 2.3522], 'france': [48.8566, 2.3522],
        'new york': [40.7128, -74.0060], 'nyc': [40.7128, -74.0060],
        'tokyo': [35.6762, 139.6503], 'japan': [35.6762, 139.6503],
        'london': [51.5074, -0.1278], 'uk': [51.5074, -0.1278],
        'sydney': [-33.8688, 151.2093], 'australia': [-33.8688, 151.2093],
        'mumbai': [19.0760, 72.8777], 'delhi': [28.6139, 77.2090], 'india': [20.5937, 78.9629],
        'bali': [-8.3405, 115.0920], 'indonesia': [-0.7893, 113.9213],
        'goa': [15.2993, 74.1240], 'himachal': [31.1048, 77.1734],
        'rome': [41.9028, 12.4964], 'italy': [41.9028, 12.4964],
        'berlin': [52.5200, 13.4050], 'germany': [52.5200, 13.4050],
        'amsterdam': [52.3676, 4.9041], 'netherlands': [52.3676, 4.9041],
        'barcelona': [41.3851, 2.1734], 'spain': [40.4637, -3.7492]
    };
    
    const lowerLocation = location.toLowerCase();
    for (const [key, coords] of Object.entries(locationMap)) {
        if (lowerLocation.includes(key)) {
            return coords;
        }
    }
    return [20.5937, 78.9629];
}

// ===== Initialize Map =====
function initMap() {
    map = L.map('map').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 1
    }).addTo(map);
    
    loadMemories();
}

// ===== Load Memories =====
function loadMemories() {
    const stored = localStorage.getItem('memonap_memories');
    if (stored) {
        allMemories = JSON.parse(stored);
    } else {
        allMemories = [];
    }
    
    updateStats();
    renderMarkers();
}

// ===== Update Stats =====
function updateStats() {
    pinCountSpan.textContent = allMemories.length;
    
    const countries = new Set();
    allMemories.forEach(m => {
        const coords = getCoordinatesFromLocation(m.location);
        countries.add(coords[0].toFixed(0) + coords[1].toFixed(0));
    });
    countryCountSpan.textContent = countries.size;
    
    const photoCount = allMemories.filter(m => m.photos && m.photos.length > 0).length;
    photoCountSpan.textContent = photoCount;
}

// ===== Render Markers with Filter =====
function renderMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    let filteredMemories = allMemories;
    if (currentFilter !== 'all') {
        filteredMemories = allMemories.filter(m => m.mood === currentFilter);
    }
    
    filteredMemories.forEach(memory => {
        const coords = getCoordinatesFromLocation(memory.location);
        
        const markerColor = getMarkerColor(memory.mood);
        
        const customIcon = L.divIcon({
            className: `custom-marker ${memory.mood}`,
            html: `<i class="ri-map-pin-fill"></i>`,
            iconSize: [40, 40],
            popupAnchor: [0, -20]
        });
        
        const marker = L.marker(coords, { icon: customIcon }).addTo(map);
        
        marker.on('click', () => {
            openMemoryPanel(memory);
        });
        
        markers.push(marker);
    });
    
    if (markers.length > 0 && filteredMemories.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
    }
}

// ===== Get Marker Color based on Mood =====
function getMarkerColor(mood) {
    const colors = {
        happy: '#fbbf24', peaceful: '#6ee7b7', loved: '#f472b6',
        excited: '#fb923c', nostalgic: '#a78bfa', sad: '#93c5fd'
    };
    return colors[mood] || '#ff6b8b';
}

// ===== Open Memory Panel =====
function openMemoryPanel(memory) {
    currentMemoryId = memory.id;
    
    document.getElementById('panelTitle').textContent = memory.title;
    document.getElementById('panelLocation').textContent = memory.location;
    document.getElementById('panelDate').textContent = formatDate(memory.date);
    document.getElementById('panelMood').innerHTML = `${moodEmoji[memory.mood] || '📝'} ${memory.mood}`;
    
    const storyHtml = memory.story ? `<p>${escapeHtml(memory.story)}</p>` : '<p><em>No story added yet.</em></p>';
    document.getElementById('panelStory').innerHTML = storyHtml;
    
    const photosContainer = document.getElementById('panelPhotos');
    if (memory.photos && memory.photos.length > 0) {
        photosContainer.innerHTML = memory.photos.slice(0, 6).map(photo => `
            <img src="${photo.data}" alt="Memory photo" onclick="viewPhoto('${photo.data}')">
        `).join('');
    } else {
        photosContainer.innerHTML = '<p style="color:#aaa; font-size:0.8rem;">No photos added</p>';
    }
    
    memoryPanel.classList.add('open');
}

// ===== Close Memory Panel =====
function closeMemoryPanel() {
    memoryPanel.classList.remove('open');
    currentMemoryId = null;
}

// ===== View Full Memory =====
function viewFullMemory() {
    if (currentMemoryId) {
        window.location.href = `memory-detail.html?id=${currentMemoryId}`;
    }
}

// ===== Share Memory =====
function shareMemory() {
    if (currentMemoryId) {
        const memory = allMemories.find(m => m.id === currentMemoryId);
        if (memory && navigator.share) {
            navigator.share({
                title: memory.title,
                text: `Check out my memory: ${memory.title} at ${memory.location}`,
                url: window.location.href
            });
        } else if (memory) {
            navigator.clipboard.writeText(`${memory.title} - ${memory.location}`);
            alert('Memory details copied to clipboard!');
        }
    }
}

// ===== View Photo =====
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

// ===== Filter Memories =====
function setFilter(filter) {
    currentFilter = filter;
    
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderMarkers();
}

// ===== Map Controls =====
function zoomIn() {
    map.zoomIn();
}

function zoomOut() {
    map.zoomOut();
}

function resetView() {
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
    } else {
        map.setView([20, 0], 2);
    }
}

// ===== Event Listeners =====
closePanel.addEventListener('click', closeMemoryPanel);
viewMemoryBtn.addEventListener('click', viewFullMemory);
shareMemoryBtn.addEventListener('click', shareMemory);
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);
resetViewBtn.addEventListener('click', resetView);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

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
        return false;
    }
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }
    return true;
}

// ===== Add Sample Data =====
function addSampleData() {
    const existing = localStorage.getItem('memonap_memories');
    if (!existing || JSON.parse(existing).length === 0) {
        const sample = [
            { id: 1, title: "Eiffel Tower Visit", location: "Paris, France", date: "2024-06-15", mood: "happy", photos: [], story: "The tower sparkled at night! It was magical." },
            { id: 2, title: "Sunset at Marine Drive", location: "Mumbai, India", date: "2024-07-20", mood: "peaceful", photos: [], story: "The sky turned orange and pink." },
            { id: 3, title: "First Date", location: "Delhi, India", date: "2024-08-10", mood: "loved", photos: [], story: "Butterflies in my stomach." },
            { id: 4, title: "Mountain Trek", location: "Himachal, India", date: "2024-09-05", mood: "excited", photos: [], story: "Reached the summit at sunrise!" },
            { id: 5, title: "Old School Memories", location: "Home", date: "2019-06-10", mood: "nostalgic", photos: [], story: "Found old school photos." },
            { id: 6, title: "Tokyo Adventure", location: "Tokyo, Japan", date: "2024-10-01", mood: "excited", photos: [], story: "Incredible sushi!" },
            { id: 7, title: "Bali Sunset", location: "Bali, Indonesia", date: "2024-10-15", mood: "peaceful", photos: [], story: "Magical sunset view" },
            { id: 8, title: "New York City", location: "New York, USA", date: "2024-11-05", mood: "excited", photos: [], story: "Times Square was amazing!" }
        ];
        localStorage.setItem('memonap_memories', JSON.stringify(sample));
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
// Initialize
addSampleData();
checkAuth();
initMap();

console.log('%c🗺️ Memory Map Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');