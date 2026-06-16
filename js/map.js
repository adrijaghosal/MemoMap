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

// Search Elements
const locationSearch = document.getElementById('locationSearch');
const searchLocationBtn = document.getElementById('searchLocationBtn');
const searchSuggestions = document.getElementById('searchSuggestions');

// Toast Elements
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

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
let currentUserId = null;
let searchTimeout = null;

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

// Show Toast Notification
function showToast(message, isError = true) {
    toastMessage.textContent = message;
    toastNotification.classList.add('show');
    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 3000);
}

// Get Coordinates from Location Name (using local cache first, then API)
function getCoordinatesFromLocation(location) {
    // Default to India if location not found
    return [20.5937, 78.9629];
}

// ===== SEARCH SUGGESTIONS USING NOMINATIM API =====
async function fetchLocationSuggestions(query) {
    if (!query || query.length < 2) {
        searchSuggestions.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`
        );
        const data = await response.json();

        if (data.length === 0) {
            searchSuggestions.style.display = 'none';
            return;
        }

        // Build suggestions HTML from API response
        searchSuggestions.innerHTML = data.map(item => {
            const name = item.display_name.split(',')[0] || item.display_name;
            const country = item.address?.country || '';
            const coords = [parseFloat(item.lat), parseFloat(item.lon)];
            
            // Get emoji based on type
            let icon = '📍';
            if (item.type === 'city') icon = '🏙️';
            else if (item.type === 'country') icon = '🌍';
            else if (item.type === 'state') icon = '🏛️';
            else if (item.type === 'neighbourhood' || item.type === 'suburb') icon = '🏘️';
            else if (item.type === 'village') icon = '🌄';
            else if (item.type === 'beach') icon = '🏖️';
            else if (item.type === 'landmark') icon = '🗿';
            else if (item.type === 'mountain') icon = '🏔️';
            else if (item.type === 'river' || item.type === 'water') icon = '🌊';
            
            return `
                <div class="suggestion-item" data-name="${escapeHtml(name)}" data-country="${escapeHtml(country)}" data-coords="${coords[0]},${coords[1]}">
                    <div class="suggestion-icon">${icon}</div>
                    <div class="suggestion-name">${escapeHtml(name)}</div>
                    <div class="suggestion-country">${escapeHtml(country || '')}</div>
                </div>
            `;
        }).join('');

        searchSuggestions.style.display = 'block';

        // Add click event to each suggestion
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = item.dataset.name;
                const coords = item.dataset.coords.split(',').map(Number);
                locationSearch.value = name;
                searchSuggestions.style.display = 'none';
                flyToLocation(coords, name);
            });
        });

    } catch (error) {
        console.error('Error fetching location suggestions:', error);
        searchSuggestions.style.display = 'none';
    }
}

// ===== UPDATE SEARCH SUGGESTIONS (Debounced) =====
function updateSearchSuggestions() {
    const query = locationSearch.value.trim();
    
    if (query.length < 2) {
        searchSuggestions.style.display = 'none';
        return;
    }

    // Clear previous timeout
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchLocationSuggestions(query);
    }, 400);
}

// ===== SEARCH LOCATION AND FLY =====
async function searchAndFlyToLocation() {
    const query = locationSearch.value.trim();
    if (!query) {
        showToast('Please enter a location to search', true);
        return;
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const name = data[0].display_name.split(',')[0] || data[0].display_name;
            
            flyToLocation([lat, lon], name);
            locationSearch.value = name;
            searchSuggestions.style.display = 'none';
        } else {
            showToast(`❌ "${query}" not found. Try searching for a city, country, or landmark.`, true);
        }
    } catch (error) {
        console.error('Search error:', error);
        showToast('Unable to search location. Please check your internet connection.', true);
    }
}

// Fly to Location on Map
function flyToLocation(coords, name) {
    map.flyTo(coords, 14, { duration: 1.5, easeLinearity: 0.25 });
    const tempMarker = L.marker(coords).addTo(map);
    tempMarker.bindPopup(`📍 ${name}`).openPopup();
    setTimeout(() => { map.removeLayer(tempMarker); }, 4000);
}

// ===== Load User Data =====
function loadUserData() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return [];
    }
    
    currentUserId = userEmail || 'guest';
    const memoriesKey = `memonap_memories_${currentUserId}`;
    const stored = localStorage.getItem(memoriesKey);
    allMemories = stored ? JSON.parse(stored) : [];
    return allMemories;
}

// ===== Update Stats =====
function updateStats() {
    pinCountSpan.textContent = allMemories.length;
    
    const countries = new Set();
    allMemories.forEach(m => {
        const parts = m.location.split(',');
        if (parts.length > 1) countries.add(parts[1].trim());
        else countries.add(parts[0].trim());
    });
    countryCountSpan.textContent = countries.size || 0;
    
    const photoCount = allMemories.filter(m => m.photos && m.photos.length > 0).length;
    photoCountSpan.textContent = photoCount;
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

// ===== Render Markers =====
function renderMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    let filteredMemories = allMemories;
    if (currentFilter !== 'all') {
        filteredMemories = allMemories.filter(m => m.mood === currentFilter);
    }
    
    filteredMemories.forEach(memory => {
        const coords = getCoordinatesFromLocation(memory.location);
        const customIcon = L.divIcon({
            className: `custom-marker ${memory.mood}`,
            html: `<i class="ri-map-pin-fill"></i>`,
            iconSize: [40, 40],
            popupAnchor: [0, -20]
        });
        const marker = L.marker(coords, { icon: customIcon }).addTo(map);
        marker.on('click', () => openMemoryPanel(memory));
        markers.push(marker);
    });
    
    if (markers.length > 0 && filteredMemories.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
    }
}

// ===== Load Memories =====
function loadMemories() {
    loadUserData();
    updateStats();
    renderMarkers();
}

// ===== Open Memory Panel =====
function openMemoryPanel(memory) {
    currentMemoryId = memory.id;
    document.getElementById('panelTitle').textContent = memory.title;
    document.getElementById('panelLocation').textContent = memory.location;
    document.getElementById('panelDate').textContent = formatDate(memory.date);
    document.getElementById('panelMood').innerHTML = `${moodEmoji[memory.mood] || '📝'} ${memory.mood}`;
    document.getElementById('panelStory').innerHTML = memory.story ? `<p>${escapeHtml(memory.story)}</p>` : '<p><em>No story added yet.</em></p>';
    
    const photosContainer = document.getElementById('panelPhotos');
    if (memory.photos && memory.photos.length > 0) {
        photosContainer.innerHTML = memory.photos.slice(0, 6).map(photo => `<img src="${photo.data}" alt="Memory photo" onclick="viewPhoto('${photo.data}')">`).join('');
    } else {
        photosContainer.innerHTML = '<p style="color:#aaa; font-size:0.8rem;">No photos added</p>';
    }
    memoryPanel.classList.add('open');
}

function closeMemoryPanel() { memoryPanel.classList.remove('open'); currentMemoryId = null; }
function viewFullMemory() { if (currentMemoryId) window.location.href = `memory-detail.html?id=${currentMemoryId}`; }
function shareMemory() {
    if (currentMemoryId) {
        const memory = allMemories.find(m => m.id === currentMemoryId);
        if (memory && navigator.share) navigator.share({ title: memory.title, text: `Check out my memory: ${memory.title} at ${memory.location}` });
        else if (memory) { navigator.clipboard.writeText(`${memory.title} - ${memory.location}`); showToast('✅ Memory details copied to clipboard!', false); }
    }
}

window.viewPhoto = function(photoData) {
    const modal = document.createElement('div');
    modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:2000; display:flex; align-items:center; justify-content:center; cursor:pointer;`;
    modal.innerHTML = `<img src="${photoData}" style="max-width:90%; max-height:90%; object-fit:contain;"><button style="position:absolute; top:20px; right:20px; background:white; border:none; width:40px; height:40px; border-radius:50%; font-size:1.5rem; cursor:pointer;">&times;</button>`;
    modal.querySelector('button').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
};

function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => { btn.classList.toggle('active', btn.dataset.filter === filter); });
    renderMarkers();
}

function zoomIn() { map.zoomIn(); }
function zoomOut() { map.zoomOut(); }
function resetView() {
    if (markers.length > 0) { const group = L.featureGroup(markers); map.fitBounds(group.getBounds().pad(0.2)); }
    else map.setView([20, 0], 2);
}

// ===== Sidebar & Logout =====
function toggleSidebar() { sidebar.classList.toggle('open'); }
async function handleLogout() {
    sessionStorage.clear();
    if (typeof firebase !== 'undefined' && firebase.auth) await firebase.auth().signOut();
    window.location.href = 'login.html';
}
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') window.location.href = 'login.html';
    const userName = sessionStorage.getItem('userName');
    if (userName) document.getElementById('sidebarUserName').textContent = userName;
    const notifications = JSON.parse(localStorage.getItem('memonap_notifications') || '[]');
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('sidebarNotificationBadge');
    if (badge) {
        if (unreadCount > 0) { badge.textContent = unreadCount > 9 ? '9+' : unreadCount; badge.style.display = 'inline-block'; }
        else badge.style.display = 'none';
    }
    return true;
}

// ===== Event Listeners =====
closePanel.addEventListener('click', closeMemoryPanel);
viewMemoryBtn.addEventListener('click', viewFullMemory);
shareMemoryBtn.addEventListener('click', shareMemory);
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);
resetViewBtn.addEventListener('click', resetView);
searchLocationBtn.addEventListener('click', searchAndFlyToLocation);

// Search input with debounce using API
locationSearch.addEventListener('input', () => {
    updateSearchSuggestions();
});

document.addEventListener('click', (e) => {
    if (!locationSearch.contains(e.target) && !searchSuggestions.contains(e.target)) {
        searchSuggestions.style.display = 'none';
    }
});

locationSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchSuggestions.style.display = 'none';
        searchAndFlyToLocation();
    }
});

filterBtns.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
menuToggle.addEventListener('click', toggleSidebar);
logoutBtn.addEventListener('click', handleLogout);

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

// ===== Initialize =====
checkAuth();
initMap();
console.log('%c🗺️ Memory Map Page Loaded with Live API Search', 'color: #ff6b8b; font-size: 14px; font-weight: bold');