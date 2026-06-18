// ============================================
// MEMORY MAP - COMPLETE WORKING VERSION
// ============================================

(function() {
    'use strict';
    
    console.log('🗺️ Memory Map Page Loaded');
    
    // DOM Elements
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
    const locationSearch = document.getElementById('locationSearch');
    const searchLocationBtn = document.getElementById('searchLocationBtn');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const pinCountSpan = document.getElementById('pinCount');
    const countryCountSpan = document.getElementById('countryCount');
    const photoCountSpan = document.getElementById('photoCount');

    // Map variables
    let map = null;
    let markers = [];
    let currentMemoryId = null;
    let allMemories = [];
    let currentFilter = 'all';
    let currentUserId = null;
    let searchTimeout = null;
    let isMapReady = false;
    let geocodeCache = {};

    // ===== MOOD EMOJIS - DEFINED AT THE TOP =====
    const moodEmoji = {
        happy: '😊', 
        peaceful: '😌', 
        loved: '❤️', 
        excited: '😎', 
        nostalgic: '📸', 
        sad: '😢'
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
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
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch(e) {
            return 'Invalid date';
        }
    }

    // ============================================
    // TOAST NOTIFICATION
    // ============================================
    
    function showToast(message, isError = true) {
        toastMessage.textContent = message;
        toastNotification.classList.add('show');
        if (isError) {
            toastNotification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        } else {
            toastNotification.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
        }
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }

    // ============================================
    // GEOCODING - GET COORDINATES FROM ADDRESS
    // ============================================
    
    async function getCoordinatesFromAddress(address) {
        if (!address) return null;
        
        // Check cache first
        if (geocodeCache[address]) {
            console.log('✅ Cache hit for:', address);
            return geocodeCache[address];
        }
        
        try {
            console.log('🔍 Geocoding:', address);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const coords = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                geocodeCache[address] = coords;
                console.log('✅ Geocoded:', address, '→', coords);
                return coords;
            }
            
            console.log('⚠️ No results for:', address);
            return null;
            
        } catch (error) {
            console.error('❌ Geocoding error:', error);
            return null;
        }
    }

    // ============================================
    // GET COORDINATES FOR A MEMORY
    // ============================================
    
    async function getMemoryCoordinates(memory) {
        // Check if memory already has coordinates
        if (memory.coordinates && memory.coordinates.lat && memory.coordinates.lng) {
            console.log('✅ Using stored coordinates:', memory.coordinates);
            return memory.coordinates;
        }
        
        if (memory.lat && memory.lng) {
            console.log('✅ Using stored lat/lng:', memory.lat, memory.lng);
            return { lat: memory.lat, lng: memory.lng };
        }
        
        // If no coordinates, geocode the address
        if (memory.location) {
            console.log('🔍 Geocoding memory location:', memory.location);
            const coords = await getCoordinatesFromAddress(memory.location);
            if (coords) {
                // Store coordinates back to memory for future use
                memory.coordinates = coords;
                memory.lat = coords.lat;
                memory.lng = coords.lng;
                saveMemoryCoordinates(memory);
                return coords;
            }
        }
        
        console.log('⚠️ No coordinates found for:', memory.title);
        return null;
    }

    // ============================================
    // SAVE COORDINATES BACK TO MEMORY
    // ============================================
    
    function saveMemoryCoordinates(memory) {
        try {
            const userEmail = sessionStorage.getItem('userEmail') || 'guest';
            const memoriesKey = `memonap_memories_${userEmail}`;
            const memories = JSON.parse(localStorage.getItem(memoriesKey) || '[]');
            const index = memories.findIndex(m => m.id === memory.id);
            if (index !== -1) {
                memories[index].coordinates = memory.coordinates;
                memories[index].lat = memory.lat;
                memories[index].lng = memory.lng;
                localStorage.setItem(memoriesKey, JSON.stringify(memories));
                console.log('✅ Saved coordinates to localStorage for:', memory.title);
            }
        } catch (e) {
            console.error('Error saving coordinates:', e);
        }
    }

    // ============================================
    // LOAD USER DATA
    // ============================================
    
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
        console.log(`📚 Loaded ${allMemories.length} memories`);
        return allMemories;
    }

    // ============================================
    // UPDATE STATS
    // ============================================
    
    function updateStats() {
        pinCountSpan.textContent = allMemories.length;
        
        const countries = new Set();
        allMemories.forEach(m => {
            if (m.location) {
                const parts = m.location.split(',');
                if (parts.length > 1) countries.add(parts[parts.length - 1].trim());
                else countries.add(parts[0].trim());
            }
        });
        countryCountSpan.textContent = countries.size || 0;
        
        const photoCount = allMemories.filter(m => m.photos && m.photos.length > 0).length;
        photoCountSpan.textContent = photoCount;
    }

    // ============================================
    // CREATE CUSTOM MARKER
    // ============================================
    
    function createCustomMarker(memory) {
        const moodColors = {
            happy: '#fbbf24', 
            peaceful: '#6ee7b7', 
            loved: '#f472b6',
            excited: '#fb923c', 
            nostalgic: '#a78bfa', 
            sad: '#93c5fd'
        };
        const color = moodColors[memory.mood] || '#ff6b8b';
        const emoji = moodEmoji[memory.mood] || '📍';
        
        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="
                    background: ${color};
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    border: 3px solid white;
                    transition: all 0.3s ease;
                    cursor: pointer;
                ">
                    ${emoji}
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
    }

    // ============================================
    // CREATE POPUP CONTENT
    // ============================================
    
    function createPopupContent(memory) {
        const emoji = moodEmoji[memory.mood] || '📝';
        const moodName = memory.mood ? memory.mood.charAt(0).toUpperCase() + memory.mood.slice(1) : '';
        
        let imageHtml = '';
        if (memory.photos && memory.photos.length > 0) {
            const photo = memory.photos[0];
            const imgSrc = typeof photo === 'object' ? (photo.data || photo.url) : photo;
            if (imgSrc && (imgSrc.startsWith('data:image') || imgSrc.startsWith('http'))) {
                imageHtml = `<img src="${imgSrc}" alt="${memory.title}" class="popup-image" onerror="this.style.display='none'" style="width:100%; max-height:150px; object-fit:cover; border-radius:12px; margin-bottom:0.8rem;">`;
            }
        }
        
        const isCapsule = memory.timeCapsule === true;
        const capsuleBadge = isCapsule ? `<span style="display:inline-block; background:#fbbf24; color:#000; padding:2px 10px; border-radius:20px; font-size:0.7rem; margin-bottom:0.5rem;">🔒 Time Capsule</span>` : '';
        
        return `
            <div style="padding: 0.5rem;">
                ${imageHtml}
                <h3 style="font-size: 1rem; margin: 0 0 0.3rem 0; color: #2d1b2e;">${escapeHtml(memory.title || 'Untitled Memory')}</h3>
                ${capsuleBadge}
                <p style="font-size: 0.8rem; color: #888; margin: 0.2rem 0;">📍 ${escapeHtml(memory.location || 'Unknown location')}</p>
                <p style="font-size: 0.8rem; color: #888; margin: 0.2rem 0;">${emoji} ${escapeHtml(moodName)}</p>
                <button onclick="window.location.href='memory-detail.html?id=${memory.id}'" style="
                    display: inline-block;
                    margin-top: 0.5rem;
                    padding: 0.4rem 1.2rem;
                    background: linear-gradient(135deg, #ff6b8b, #ffb347);
                    color: white;
                    border: none;
                    border-radius: 40px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s;
                ">
                    View Memory →
                </button>
            </div>
        `;
    }

    // ============================================
    // RENDER MARKERS ON MAP
    // ============================================
    
    async function renderMarkers() {
        if (!isMapReady || !map) {
            console.log('⏳ Map not ready, waiting...');
            setTimeout(renderMarkers, 500);
            return;
        }
        
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Filter memories
        let filteredMemories = allMemories;
        if (currentFilter !== 'all') {
            filteredMemories = allMemories.filter(m => m.mood === currentFilter);
        }
        
        console.log(`📌 Rendering ${filteredMemories.length} markers`);
        
        let addedCount = 0;
        let bounds = L.latLngBounds();
        
        for (const memory of filteredMemories) {
            try {
                const coords = await getMemoryCoordinates(memory);
                
                if (!coords) {
                    console.log(`⚠️ No coordinates for: ${memory.title}`);
                    continue;
                }
                
                // Validate coordinates
                if (coords.lat < -90 || coords.lat > 90 || coords.lng < -180 || coords.lng > 180) {
                    console.log(`⚠️ Invalid coordinates for: ${memory.title}`, coords);
                    continue;
                }
                
                console.log(`📍 Adding: ${memory.title} at [${coords.lat}, ${coords.lng}]`);
                
                const icon = createCustomMarker(memory);
                const marker = L.marker([coords.lat, coords.lng], {
                    icon: icon,
                    title: memory.title || 'Untitled'
                }).addTo(map);
                
                // Store memory data with marker
                marker.memoryData = memory;
                
                // Create popup content
                const popupContent = createPopupContent(memory);
                marker.bindPopup(popupContent, {
                    maxWidth: 300,
                    className: 'memory-popup',
                    closeButton: true
                });
                
                // Click handler
                marker.on('click', function() {
                    openMemoryPanel(this.memoryData);
                });
                
                markers.push(marker);
                bounds.extend([coords.lat, coords.lng]);
                addedCount++;
                
            } catch (error) {
                console.error('❌ Error adding memory:', memory.title, error);
            }
        }
        
        // Fit map to show all markers
        if (addedCount > 0) {
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15
            });
            console.log(`✅ Added ${addedCount} markers to map`);
        } else {
            // If no markers, show world view
            map.setView([20, 0], 2);
            console.log('⚠️ No markers added to map');
            
            // Show "no memories" message
            showToast('No memories with locations found. Add some!', false);
        }
        
        updateStats();
    }

    // ============================================
    // MEMORY PANEL FUNCTIONS
    // ============================================
    
    function openMemoryPanel(memory) {
        currentMemoryId = memory.id;
        document.getElementById('panelTitle').textContent = memory.title || 'Untitled Memory';
        document.getElementById('panelLocation').textContent = memory.location || 'Unknown location';
        document.getElementById('panelDate').textContent = formatDate(memory.date);
        
        const moodName = memory.mood ? memory.mood.charAt(0).toUpperCase() + memory.mood.slice(1) : '';
        document.getElementById('panelMood').innerHTML = `${moodEmoji[memory.mood] || '📝'} ${moodName}`;
        
        document.getElementById('panelStory').innerHTML = memory.content || memory.story ? 
            `<p style="margin:0;">${escapeHtml(memory.content || memory.story)}</p>` : 
            '<p style="margin:0; color:#aaa; font-style:italic;">No story added yet.</p>';
        
        const photosContainer = document.getElementById('panelPhotos');
        if (memory.photos && memory.photos.length > 0) {
            photosContainer.innerHTML = memory.photos.slice(0, 6).map(photo => {
                const src = typeof photo === 'object' ? (photo.data || photo.url) : photo;
                return `<img src="${src}" alt="Memory photo" onclick="window.viewPhoto('${src}')" style="width:80px; height:80px; border-radius:12px; object-fit:cover; cursor:pointer;">`;
            }).join('');
        } else {
            photosContainer.innerHTML = '<p style="color:#aaa; font-size:0.8rem; margin:0;">No photos added</p>';
        }
        
        memoryPanel.classList.add('open');
    }

    function closeMemoryPanel() {
        memoryPanel.classList.remove('open');
        currentMemoryId = null;
    }

    function viewFullMemory() {
        if (currentMemoryId) {
            window.location.href = `memory-detail.html?id=${currentMemoryId}`;
        }
    }

    // ============================================
    // SHARE MEMORY - UPDATED WITH LINK
    // ============================================
    
    function shareMemory() {
        if (currentMemoryId) {
            const memory = allMemories.find(m => m.id === currentMemoryId);
            if (memory) {
                // Create the shareable link
                const baseUrl = window.location.origin + window.location.pathname.replace('map.html', '');
                const shareUrl = `${baseUrl}memory-detail.html?id=${memory.id}`;
                
                // Create share text with emojis and details
                const storyPreview = memory.content || memory.story || '';
                const shareText = `📍 ${memory.title}\n📅 ${formatDate(memory.date)}\n📍 ${memory.location}\n${storyPreview ? `📖 ${storyPreview.substring(0, 100)}${storyPreview.length > 100 ? '...' : ''}` : ''}\n\n🔗 ${shareUrl}`;
                
                if (navigator.share) {
                    // Use Web Share API (mobile)
                    navigator.share({
                        title: memory.title,
                        text: shareText,
                        url: shareUrl
                    }).catch((err) => {
                        if (err.name !== 'AbortError') {
                            console.error('Share error:', err);
                            fallbackShare(shareText, shareUrl);
                        }
                    });
                } else {
                    // Fallback: Copy to clipboard
                    fallbackShare(shareText, shareUrl);
                }
            }
        }
    }

    function fallbackShare(shareText, shareUrl) {
        // Try to copy both text and link
        const fullText = shareText;
        
        // Use modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fullText).then(() => {
                showToast('✅ Memory details and link copied to clipboard! 📋', false);
            }).catch(() => {
                // Fallback: show text with link in a prompt
                promptShare(fullText);
            });
        } else {
            // Old school fallback
            promptShare(fullText);
        }
    }

    function promptShare(text) {
        // Show a prompt with the shareable text
        const result = prompt('📤 Share this memory:\n\nCopy the text below and share it with your friends!\n\n', text);
        if (result !== null) {
            showToast('✅ Text copied! Share it with your friends!', false);
        }
    }

    // Photo viewer
    window.viewPhoto = function(photoData) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;
        modal.innerHTML = `
            <img src="${photoData}" style="max-width:90%; max-height:90%; object-fit:contain;">
            <button style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 1.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            ">&times;</button>
        `;
        modal.querySelector('button').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
    };

    // ============================================
    // FILTER FUNCTIONS
    // ============================================
    
    function setFilter(filter) {
        currentFilter = filter;
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        renderMarkers();
    }

    // ============================================
    // MAP CONTROLS
    // ============================================
    
    function zoomIn() {
        if (map) map.zoomIn();
    }
    
    function zoomOut() {
        if (map) map.zoomOut();
    }
    
    function resetView() {
        if (!map) return;
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.2));
        } else {
            map.setView([20, 0], 2);
        }
    }

    // ============================================
    // SEARCH FUNCTIONS
    // ============================================
    
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

            searchSuggestions.innerHTML = data.map(item => {
                const name = item.display_name.split(',')[0] || item.display_name;
                const country = item.address?.country || '';
                const coords = [parseFloat(item.lat), parseFloat(item.lon)];
                
                let icon = '📍';
                if (item.type === 'city') icon = '🏙️';
                else if (item.type === 'country') icon = '🌍';
                else if (item.type === 'state') icon = '🏛️';
                else if (item.type === 'neighbourhood' || item.type === 'suburb') icon = '🏘️';
                else if (item.type === 'village') icon = '🌄';
                else if (item.type === 'beach') icon = '🏖️';
                
                return `
                    <div class="suggestion-item" data-name="${escapeHtml(name)}" data-country="${escapeHtml(country)}" data-coords="${coords[0]},${coords[1]}">
                        <div class="suggestion-icon">${icon}</div>
                        <div class="suggestion-name">${escapeHtml(name)}</div>
                        <div class="suggestion-country">${escapeHtml(country || '')}</div>
                    </div>
                `;
            }).join('');

            searchSuggestions.style.display = 'block';

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

    function updateSearchSuggestions() {
        const query = locationSearch.value.trim();
        
        if (query.length < 2) {
            searchSuggestions.style.display = 'none';
            return;
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchLocationSuggestions(query);
        }, 400);
    }

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

    function flyToLocation(coords, name) {
        if (!map) return;
        map.flyTo(coords, 14, { duration: 1.5, easeLinearity: 0.25 });
        const tempMarker = L.marker(coords).addTo(map);
        tempMarker.bindPopup(`📍 ${name}`).openPopup();
        setTimeout(() => { map.removeLayer(tempMarker); }, 4000);
    }

    // ============================================
    // INITIALIZE MAP
    // ============================================
    
    function initMap() {
        try {
            map = L.map('map', {
                center: [20, 0],
                zoom: 2,
                zoomControl: true,
                fadeAnimation: true,
                attributionControl: true
            });
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                subdomains: 'abcd',
                maxZoom: 19,
                minZoom: 1
            }).addTo(map);
            
            isMapReady = true;
            console.log('✅ Map initialized');
            
            // Load memories after map is ready
            loadMemories();
            
        } catch (error) {
            console.error('❌ Map initialization error:', error);
        }
    }

    // ============================================
    // LOAD MEMORIES
    // ============================================
    
    function loadMemories() {
        loadUserData();
        renderMarkers();
    }

    // ============================================
    // SIDEBAR & LOGOUT
    // ============================================
    
    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }
    
    async function handleLogout() {
        sessionStorage.clear();
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                await firebase.auth().signOut();
            } catch(e) {}
        }
        window.location.href = 'login.html';
    }
    
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

    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    closePanel.addEventListener('click', closeMemoryPanel);
    viewMemoryBtn.addEventListener('click', viewFullMemory);
    shareMemoryBtn.addEventListener('click', shareMemory);
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    resetViewBtn.addEventListener('click', resetView);
    searchLocationBtn.addEventListener('click', searchAndFlyToLocation);
    
    locationSearch.addEventListener('input', updateSearchSuggestions);
    
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
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });
    
    menuToggle.addEventListener('click', toggleSidebar);
    logoutBtn.addEventListener('click', handleLogout);
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) {
            if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // ============================================
    // INITIALIZE
    // ============================================
    
    function init() {
        console.log('🗺️ Initializing Memory Map...');
        
        if (!checkAuth()) return;
        
        // Initialize map
        initMap();
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('%c🗺️ Memory Map Page Loaded with Proper Geocoding', 'color: #ff6b8b; font-size: 14px; font-weight: bold');
    
})();