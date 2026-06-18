// ============================================
// MEMORY DETAIL - COMPLETE WORKING VERSION
// ============================================

(function() {
    'use strict';
    
    console.log('🚀 Memory Detail Page Loaded');
    
    // DOM Elements
    const content = document.getElementById('content');
    
    // Get memory ID from URL
    function getMemoryId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }
    
    const memoryId = getMemoryId();
    console.log('📌 Memory ID:', memoryId);
    
    // Audio player variables
    let audioPlayer = null;
    let isPlaying = false;
    let audioProgressInterval = null;
    
    // ============================================
    // SHOW FUNCTIONS
    // ============================================
    
    function showLoading() {
        content.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading your memory...</p>
            </div>
        `;
    }
    
    function showError(title, message, details = '') {
        content.innerHTML = `
            <div class="error-box">
                <h2>${title}</h2>
                <p>${message}</p>
                ${details ? `<div class="debug-box">${details}</div>` : ''}
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap;">
                    <a href="dashboard.html" style="display: inline-flex; align-items: center; gap: 8px; padding: 0.6rem 1.5rem; background: linear-gradient(135deg, #ff6b8b, #ffb347); color: white; border-radius: 40px; text-decoration: none; font-weight: 500;">
                        <i class="ri-dashboard-line"></i> Go to Dashboard
                    </a>
                    <button onclick="location.reload()" style="display: inline-flex; align-items: center; gap: 8px; padding: 0.6rem 1.5rem; background: rgba(255, 107, 139, 0.1); color: #ff6b8b; border: 2px solid rgba(255, 107, 139, 0.2); border-radius: 40px; text-decoration: none; font-weight: 500; cursor: pointer; font-family: 'Poppins', sans-serif;">
                        <i class="ri-refresh-line"></i> Try Again
                    </button>
                </div>
            </div>
        `;
    }
    
    // ============================================
    // VOICE PLAYER FUNCTIONS
    // ============================================
    
    function createVoicePlayer(audioData, voiceName = 'Voice Note') {
        const playerId = 'voicePlayer_' + Date.now();
        
        return `
            <div class="voice-player" id="${playerId}">
                <button class="play-btn" id="playBtn_${playerId}" onclick="window.toggleVoicePlay('${playerId}', '${audioData}')">
                    <i class="ri-play-fill"></i>
                </button>
                <div class="voice-info">
                    <div class="voice-label">🎙️ Voice Note</div>
                    <div class="voice-name">${voiceName}</div>
                    <div class="voice-progress-bar">
                        <div class="voice-progress" id="progress_${playerId}" style="width: 0%;"></div>
                    </div>
                </div>
                <span style="font-size: 0.7rem; color: #888;" id="timeDisplay_${playerId}">0:00</span>
            </div>
        `;
    }
    
    // Global function for voice toggle
    window.toggleVoicePlay = function(playerId, audioData) {
        const playBtn = document.getElementById('playBtn_' + playerId);
        const progressBar = document.getElementById('progress_' + playerId);
        const timeDisplay = document.getElementById('timeDisplay_' + playerId);
        
        if (isPlaying && audioPlayer) {
            // Pause
            audioPlayer.pause();
            isPlaying = false;
            playBtn.innerHTML = '<i class="ri-play-fill"></i>';
            playBtn.classList.remove('playing');
            clearInterval(audioProgressInterval);
            return;
        }
        
        // Stop any existing audio
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer = null;
            clearInterval(audioProgressInterval);
        }
        
        try {
            audioPlayer = new Audio(audioData);
            
            audioPlayer.onplay = function() {
                isPlaying = true;
                playBtn.innerHTML = '<i class="ri-pause-fill"></i>';
                playBtn.classList.add('playing');
            };
            
            audioPlayer.onpause = function() {
                isPlaying = false;
                playBtn.innerHTML = '<i class="ri-play-fill"></i>';
                playBtn.classList.remove('playing');
            };
            
            audioPlayer.onended = function() {
                isPlaying = false;
                playBtn.innerHTML = '<i class="ri-play-fill"></i>';
                playBtn.classList.remove('playing');
                progressBar.style.width = '100%';
                timeDisplay.textContent = formatTime(audioPlayer.duration);
                clearInterval(audioProgressInterval);
            };
            
            audioPlayer.onerror = function() {
                isPlaying = false;
                playBtn.innerHTML = '<i class="ri-play-fill"></i>';
                playBtn.classList.remove('playing');
                clearInterval(audioProgressInterval);
                alert('Error playing voice note.');
            };
            
            audioPlayer.play();
            
            // Update progress
            audioProgressInterval = setInterval(function() {
                if (audioPlayer && audioPlayer.currentTime) {
                    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                    progressBar.style.width = progress + '%';
                    timeDisplay.textContent = formatTime(audioPlayer.currentTime);
                }
            }, 100);
            
        } catch (err) {
            console.error('Playback error:', err);
            alert('Error playing voice note.');
        }
    };
    
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
    
    // ============================================
    // EXTRACT PHOTO URLS
    // ============================================
    
    function getPhotoUrls(memory) {
        let photoUrls = [];
        
        if (memory.photos && Array.isArray(memory.photos) && memory.photos.length > 0) {
            memory.photos.forEach((photo) => {
                if (typeof photo === 'object' && photo.data) {
                    photoUrls.push(photo.data);
                } else if (typeof photo === 'object' && photo.url) {
                    photoUrls.push(photo.url);
                } else if (typeof photo === 'string') {
                    photoUrls.push(photo);
                } else if (photo && photo.data) {
                    photoUrls.push(photo.data);
                }
            });
        }
        
        if (memory.imageUrl) {
            photoUrls.push(memory.imageUrl);
        }
        
        if (memory.photo) {
            photoUrls.push(memory.photo);
        }
        
        return photoUrls;
    }
    
    // ============================================
    // SHOW MEMORY - BEAUTIFUL UI
    // ============================================
    
    function showMemory(memory) {
        console.log('📌 Displaying memory:', memory);
        
        // Mood emojis
        const moodEmojis = {
            happy: '😊', peaceful: '😌', loved: '❤️',
            excited: '😎', nostalgic: '📸', sad: '😢',
            angry: '😠', scared: '😨', surprised: '😲'
        };
        
        // Format date
        let dateStr = 'Unknown date';
        if (memory.createdAt) {
            try {
                let date;
                if (memory.createdAt.toDate) {
                    date = memory.createdAt.toDate();
                } else if (memory.createdAt.seconds) {
                    date = new Date(memory.createdAt.seconds * 1000);
                } else {
                    date = new Date(memory.createdAt);
                }
                if (!isNaN(date.getTime())) {
                    dateStr = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            } catch(e) {}
        } else if (memory.date) {
            try {
                const date = new Date(memory.date);
                if (!isNaN(date.getTime())) {
                    dateStr = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            } catch(e) {}
        }
        
        // Mood
        const moodEmoji = memory.mood ? (moodEmojis[memory.mood] || '📝') : '📝';
        const moodName = memory.mood ? memory.mood.charAt(0).toUpperCase() + memory.mood.slice(1) : '';
        
        // Tags
        let tagsHtml = '';
        const tags = memory.tags || memory.collections || [];
        if (tags && tags.length > 0) {
            tagsHtml = `<div class="memory-tags">${tags.map(t => `<span class="tag">#${t}</span>`).join('')}</div>`;
        }
        
        // Photos
        const photoUrls = getPhotoUrls(memory);
        let imageHtml = '';
        if (photoUrls.length > 0) {
            const imgSrc = photoUrls[0];
            if (imgSrc && typeof imgSrc === 'string' && (imgSrc.startsWith('data:image') || imgSrc.startsWith('http'))) {
                imageHtml = `
                    <div class="memory-image-container">
                        <img src="${imgSrc}" alt="${memory.title || 'Memory'}" class="memory-image" 
                             onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'><i class=\\'ri-image-line\\'></i><span>Image not available</span></div>'">
                    </div>
                `;
            } else {
                imageHtml = `
                    <div class="image-placeholder">
                        <i class="ri-image-line"></i>
                        <span>No image available</span>
                    </div>
                `;
            }
        } else {
            imageHtml = `
                <div class="image-placeholder">
                    <i class="ri-image-line"></i>
                    <span>No image available</span>
                </div>
            `;
        }
        
        // Voice Note
        let voiceHtml = '';
        if (memory.voiceNote) {
            voiceHtml = createVoicePlayer(memory.voiceNote, 'Memory Voice Note');
        }
        
        // Story
        const story = memory.content || memory.story || '';
        const storyHtml = story ? `
            <div class="memory-story-section">
                <div class="story-label"><i class="ri-book-open-line"></i> Story</div>
                <div class="memory-story">${escapeHtml(story)}</div>
            </div>
        ` : '';
        
        // Build HTML
        content.innerHTML = `
            <div class="memory-card">
                <div class="memory-header">
                    <h1 class="memory-title">
                        <span class="title-emoji">${moodEmoji}</span>
                        ${escapeHtml(memory.title || 'Untitled Memory')}
                    </h1>
                    
                    <div class="memory-meta">
                        <span class="detail-badge">
                            <i class="ri-calendar-line"></i> ${dateStr}
                        </span>
                        ${memory.location ? `<span class="detail-badge"><i class="ri-map-pin-line"></i> ${escapeHtml(memory.location)}</span>` : ''}
                        <span class="detail-badge">
                            <span class="mood-emoji">${moodEmoji}</span> ${escapeHtml(moodName)}
                        </span>
                    </div>
                </div>
                
                ${imageHtml}
                
                <div class="memory-detail-grid">
                    ${memory.date ? `
                    <div class="detail-item">
                        <div class="detail-icon"><i class="ri-calendar-line"></i></div>
                        <div class="detail-text"><strong>Date:</strong> ${dateStr}</div>
                    </div>
                    ` : ''}
                    ${memory.location ? `
                    <div class="detail-item">
                        <div class="detail-icon"><i class="ri-map-pin-line"></i></div>
                        <div class="detail-text"><strong>Location:</strong> ${escapeHtml(memory.location)}</div>
                    </div>
                    ` : ''}
                    ${memory.with ? `
                    <div class="detail-item">
                        <div class="detail-icon"><i class="ri-group-line"></i></div>
                        <div class="detail-text"><strong>With:</strong> ${escapeHtml(memory.with)}</div>
                    </div>
                    ` : ''}
                    ${memory.song ? `
                    <div class="detail-item">
                        <div class="detail-icon"><i class="ri-music-line"></i></div>
                        <div class="detail-text"><strong>Song:</strong> 🎵 ${escapeHtml(memory.song)}</div>
                    </div>
                    ` : ''}
                </div>
                
                ${storyHtml}
                
                ${voiceHtml}
                
                ${tagsHtml}
                
                <div class="memory-actions">
                    <button class="btn-edit" id="editBtn">
                        <i class="ri-edit-line"></i> Edit Memory
                    </button>
                    <button class="btn-delete" id="deleteBtn">
                        <i class="ri-delete-bin-line"></i> Delete Memory
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('editBtn')?.addEventListener('click', function() {
            window.location.href = `add-memory.html?edit=${memory.id}`;
        });
        
        document.getElementById('deleteBtn')?.addEventListener('click', function() {
            deleteMemory(memory.id);
        });
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // ============================================
    // DELETE MEMORY
    // ============================================
    
    async function deleteMemory(id) {
        if (!confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
            return;
        }
        
        try {
            const userEmail = sessionStorage.getItem('userEmail');
            const userId = userEmail || 'guest';
            const memoriesKey = `memonap_memories_${userId}`;
            const memories = JSON.parse(localStorage.getItem(memoriesKey) || '[]');
            const index = memories.findIndex(m => String(m.id) === String(id));
            
            if (index !== -1) {
                memories.splice(index, 1);
                localStorage.setItem(memoriesKey, JSON.stringify(memories));
                console.log('✅ Memory deleted from localStorage');
                window.location.href = 'dashboard.html?deleted=true';
                return;
            }
            
            if (typeof firebase !== 'undefined') {
                const user = firebase.auth().currentUser;
                if (user) {
                    const db = firebase.firestore();
                    const docRef = db.collection('memories').doc(String(id));
                    const doc = await docRef.get();
                    
                    if (doc.exists && doc.data().userId === user.uid) {
                        await docRef.delete();
                        console.log('✅ Memory deleted from Firebase');
                        window.location.href = 'dashboard.html?deleted=true';
                        return;
                    }
                }
            }
            
            alert('Could not delete memory. Please try again.');
            
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete memory. Please try again.');
        }
    }
    
    // ============================================
    // SEARCH LOCALSTORAGE FOR MEMORY
    // ============================================
    
    function searchLocalStorage(id) {
        const userEmail = sessionStorage.getItem('userEmail');
        const userId = userEmail || 'guest';
        const memoriesKey = `memonap_memories_${userId}`;
        const memories = JSON.parse(localStorage.getItem(memoriesKey) || '[]');
        
        const memory = memories.find(m => String(m.id) === String(id));
        
        if (memory) {
            console.log('✅ Found in localStorage:', memory);
            return memory;
        }
        
        console.log('❌ Not found in localStorage');
        return null;
    }
    
    // ============================================
    // LOAD MEMORY
    // ============================================
    
    function loadMemory() {
        if (!memoryId) {
            showError(
                'No Memory ID',
                'No memory ID was provided in the URL.',
                `<strong>URL:</strong> ${window.location.href}<br><strong>Expected:</strong> memory-detail.html?id=YOUR_MEMORY_ID`
            );
            return;
        }
        
        showLoading();
        
        const localMemory = searchLocalStorage(memoryId);
        if (localMemory) {
            console.log('✅ Displaying from localStorage');
            showMemory(localMemory);
            return;
        }
        
        if (typeof firebase === 'undefined') {
            showError(
                'Memory Not Found',
                'The memory you\'re looking for doesn\'t exist or has been deleted.',
                `<strong>Memory ID:</strong> ${memoryId}<br><strong>Note:</strong> Checked localStorage`
            );
            return;
        }
        
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        auth.onAuthStateChanged(function(user) {
            console.log('👤 Auth state:', user ? 'Logged in' : 'Logged out');
            
            if (!user) {
                showError(
                    '🔒 Not Logged In',
                    'Please log in to view this memory.',
                    `<strong>Redirecting to login...</strong>`
                );
                setTimeout(() => window.location.href = 'login.html', 2000);
                return;
            }
            
            console.log('👤 User ID:', user.uid);
            console.log('🔍 Fetching from Firebase:', memoryId);
            
            db.collection('memories').doc(String(memoryId)).get()
                .then(function(doc) {
                    console.log('📄 Document exists:', doc.exists);
                    
                    if (!doc.exists) {
                        showError(
                            '🔍 Memory Not Found',
                            'The memory you\'re looking for doesn\'t exist or has been deleted.',
                            `<strong>Memory ID:</strong> ${memoryId}<br><strong>User ID:</strong> ${user.uid}`
                        );
                        return;
                    }
                    
                    const data = doc.data();
                    console.log('📄 Firebase Memory Data:', data);
                    
                    if (data.userId !== user.uid) {
                        showError(
                            '🔒 Access Denied',
                            'You don\'t have permission to view this memory.',
                            `<strong>Memory Owner:</strong> ${data.userId}<br><strong>Your ID:</strong> ${user.uid}`
                        );
                        return;
                    }
                    
                    showMemory({
                        id: doc.id,
                        ...data
                    });
                    
                    console.log('✅ Memory displayed from Firebase!');
                })
                .catch(function(error) {
                    console.error('❌ Firestore Error:', error);
                    
                    const retryLocal = searchLocalStorage(memoryId);
                    if (retryLocal) {
                        console.log('✅ Found in localStorage on retry');
                        showMemory(retryLocal);
                        return;
                    }
                    
                    showError(
                        '❌ Error Loading Memory',
                        error.message || 'Could not load memory. Please try again.',
                        `<strong>Memory ID:</strong> ${memoryId}<br><strong>Error:</strong> ${error.message}`
                    );
                });
        });
    }
    
    // ============================================
    // INITIALIZE
    // ============================================
    
    function waitForFirebase() {
        if (typeof firebase !== 'undefined') {
            console.log('✅ Firebase ready');
            loadMemory();
        } else {
            console.log('⏳ Waiting for Firebase...');
            setTimeout(waitForFirebase, 300);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForFirebase);
    } else {
        waitForFirebase();
    }
    
})();