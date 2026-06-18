// ============================================
// MEMORY DETAIL - FIXED IMAGE DISPLAY
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
    console.log('📌 Memory ID Type:', typeof memoryId);
    
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
    // EXTRACT PHOTO URLS - FIXED
    // ============================================
    
    function getPhotoUrls(memory) {
        let photoUrls = [];
        
        console.log('📸 Getting photos from memory:', memory);
        
        // Case 1: photos array
        if (memory.photos && Array.isArray(memory.photos) && memory.photos.length > 0) {
            console.log('📸 Found photos array with length:', memory.photos.length);
            console.log('📸 First photo:', memory.photos[0]);
            
            // Check each photo
            memory.photos.forEach((photo, index) => {
                // If photo is object with 'data' property (base64)
                if (typeof photo === 'object' && photo.data) {
                    console.log('📸 Photo ' + index + ' has data property');
                    photoUrls.push(photo.data);
                }
                // If photo is object with 'url' property
                else if (typeof photo === 'object' && photo.url) {
                    console.log('📸 Photo ' + index + ' has url property');
                    photoUrls.push(photo.url);
                }
                // If photo is string (URL or base64)
                else if (typeof photo === 'string') {
                    console.log('📸 Photo ' + index + ' is string');
                    photoUrls.push(photo);
                }
                // If photo has 'data' as a property
                else if (photo && photo.data) {
                    console.log('📸 Photo ' + index + ' has data');
                    photoUrls.push(photo.data);
                }
            });
        }
        
        // Case 2: imageUrl field
        if (memory.imageUrl) {
            console.log('📸 Found imageUrl:', memory.imageUrl);
            photoUrls.push(memory.imageUrl);
        }
        
        // Case 3: single photo (legacy)
        if (memory.photo) {
            console.log('📸 Found photo:', memory.photo);
            photoUrls.push(memory.photo);
        }
        
        console.log('📸 Final photo URLs:', photoUrls.length);
        return photoUrls;
    }
    
    // ============================================
    // SHOW MEMORY - FIXED IMAGE
    // ============================================
    
    function showMemory(memory) {
        console.log('📌 Displaying memory:', memory);
        console.log('📸 Photos in memory:', memory.photos);
        
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
            } catch(e) {
                console.log('Date formatting error:', e);
            }
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
        const moodName = memory.mood ? memory.mood.charAt(0).toUpperCase() + memory.mood.slice(1) : 'No mood';
        
        // Tags
        let tagsHtml = '';
        const tags = memory.tags || memory.collections || [];
        if (tags && tags.length > 0) {
            tagsHtml = `<div class="memory-tags">${tags.map(t => `<span class="tag">#${t}</span>`).join('')}</div>`;
        }
        
        // ============================================
        // GET PHOTO URLS - FIXED
        // ============================================
        const photoUrls = getPhotoUrls(memory);
        
        // Build image HTML
        let imageHtml = '';
        if (photoUrls.length > 0) {
            const imgSrc = photoUrls[0];
            console.log('📸 Using image src:', imgSrc ? imgSrc.substring(0, 50) + '...' : 'null');
            
            if (imgSrc && typeof imgSrc === 'string' && (imgSrc.startsWith('data:image') || imgSrc.startsWith('http'))) {
                imageHtml = `
                    <div class="memory-image-container">
                        <img src="${imgSrc}" alt="${memory.title || 'Memory'}" class="memory-image" 
                             onerror="this.parentElement.innerHTML='<div style=\\'padding: 2rem; text-align: center; color: #888;\\'><i class=\\'ri-image-line\\' style=\\'font-size: 3rem; display: block; margin-bottom: 0.5rem;\\'></i>Image not available</div>'">
                    </div>
                `;
            } else {
                imageHtml = `
                    <div class="memory-image-container" style="padding: 2rem; text-align: center; background: rgba(0,0,0,0.03); border-radius: 16px;">
                        <i class="ri-image-line" style="font-size: 3rem; color: #ccc; display: block; margin-bottom: 0.5rem;"></i>
                        <span style="color: #888; font-size: 0.9rem;">Image format not supported</span>
                    </div>
                `;
            }
        } else {
            imageHtml = `
                <div class="memory-image-container" style="padding: 2rem; text-align: center; background: rgba(0,0,0,0.03); border-radius: 16px;">
                    <i class="ri-image-line" style="font-size: 3rem; color: #ccc; display: block; margin-bottom: 0.5rem;"></i>
                    <span style="color: #888; font-size: 0.9rem;">No image available</span>
                </div>
            `;
        }
        
        // Story
        const story = memory.content || memory.story || 'No content available for this memory.';
        
        // Build HTML
        content.innerHTML = `
            <div class="memory-card">
                <h1 class="memory-title">${memory.title || 'Untitled Memory'}</h1>
                
                <div class="memory-meta">
                    <span>📅 ${dateStr}</span>
                    ${memory.location ? `<span>📍 ${memory.location}</span>` : ''}
                    <span>${moodEmoji} ${moodName}</span>
                </div>
                
                ${imageHtml}
                
                <div class="memory-story">${story}</div>
                
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
    
    // ============================================
    // DELETE MEMORY
    // ============================================
    
    async function deleteMemory(id) {
        if (!confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
            return;
        }
        
        try {
            // Check if it's a localStorage memory
            const userEmail = sessionStorage.getItem('userEmail');
            const userId = userEmail || 'guest';
            const memoriesKey = `memonap_memories_${userId}`;
            const memories = JSON.parse(localStorage.getItem(memoriesKey) || '[]');
            const index = memories.findIndex(m => String(m.id) === String(id));
            
            if (index !== -1) {
                // Delete from localStorage
                memories.splice(index, 1);
                localStorage.setItem(memoriesKey, JSON.stringify(memories));
                console.log('✅ Memory deleted from localStorage');
                window.location.href = 'dashboard.html?deleted=true';
                return;
            }
            
            // Try Firebase
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
        
        console.log('🔍 Searching localStorage:', memories.length, 'memories');
        console.log('🔍 Looking for ID:', id, 'Type:', typeof id);
        
        // Find memory (convert both to string for comparison)
        const memory = memories.find(m => String(m.id) === String(id));
        
        if (memory) {
            console.log('✅ Found in localStorage:', memory);
            console.log('📸 Photos in memory:', memory.photos);
            if (memory.photos && memory.photos.length > 0) {
                const firstPhoto = memory.photos[0];
                console.log('📸 First photo type:', typeof firstPhoto);
                if (typeof firstPhoto === 'object') {
                    console.log('📸 First photo keys:', Object.keys(firstPhoto));
                    if (firstPhoto.data) {
                        console.log('📸 First photo data preview:', firstPhoto.data.substring(0, 50) + '...');
                    }
                } else if (typeof firstPhoto === 'string') {
                    console.log('📸 First photo preview:', firstPhoto.substring(0, 50) + '...');
                }
            }
            return memory;
        }
        
        console.log('❌ Not found in localStorage');
        return null;
    }
    
    // ============================================
    // LOAD MEMORY - SEARCH BOTH SOURCES
    // ============================================
    
    function loadMemory() {
        // Check if we have a memory ID
        if (!memoryId) {
            showError(
                'No Memory ID',
                'No memory ID was provided in the URL.',
                `<strong>URL:</strong> ${window.location.href}<br><strong>Expected:</strong> memory-detail.html?id=YOUR_MEMORY_ID`
            );
            return;
        }
        
        showLoading();
        
        // ===== STEP 1: Search localStorage first =====
        const localMemory = searchLocalStorage(memoryId);
        if (localMemory) {
            console.log('✅ Displaying from localStorage');
            showMemory(localMemory);
            return;
        }
        
        // ===== STEP 2: Try Firebase =====
        if (typeof firebase === 'undefined') {
            showError(
                'Memory Not Found',
                'The memory you\'re looking for doesn\'t exist or has been deleted.',
                `<strong>Memory ID:</strong> ${memoryId}<br><strong>Note:</strong> Checked localStorage and Firebase`
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
            
            // Get memory from Firestore
            db.collection('memories').doc(String(memoryId)).get()
                .then(function(doc) {
                    console.log('📄 Document exists:', doc.exists);
                    
                    if (!doc.exists) {
                        showError(
                            '🔍 Memory Not Found',
                            'The memory you\'re looking for doesn\'t exist or has been deleted.',
                            `<strong>Memory ID:</strong> ${memoryId}<br><strong>User ID:</strong> ${user.uid}<br><strong>Checked:</strong> localStorage and Firebase`
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
                    
                    // One more try - search localStorage again
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
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForFirebase);
    } else {
        waitForFirebase();
    }
    
})();