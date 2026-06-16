// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const collectionsGrid = document.getElementById('collectionsGrid');
const emptyState = document.getElementById('emptyState');
const createCollectionBtn = document.getElementById('createCollectionBtn');
const emptyStateCreateBtn = document.getElementById('emptyStateCreateBtn');

// Create Modal Elements
const createModal = document.getElementById('createModal');
const closeCreateModal = document.getElementById('closeCreateModal');
const cancelCreateBtn = document.getElementById('cancelCreateBtn');
const confirmCreateBtn = document.getElementById('confirmCreateBtn');
const collectionNameInput = document.getElementById('collectionName');
const collectionTypeSelect = document.getElementById('collectionType');
const collectionDescInput = document.getElementById('collectionDesc');
const iconOptions = document.querySelectorAll('.icon-option');
const lockCollectionCheckbox = document.getElementById('lockCollectionCheckbox');
const passwordSection = document.getElementById('passwordSection');
const collectionPasswordInput = document.getElementById('collectionPassword');

// Password Modal Elements
const passwordModal = document.getElementById('passwordModal');
const closePasswordModal = document.getElementById('closePasswordModal');
const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
const unlockCollectionBtn = document.getElementById('unlockCollectionBtn');
const passwordInput = document.getElementById('passwordInput');
const lockedCollectionName = document.getElementById('lockedCollectionName');

// Collection View Modal
const collectionModal = document.getElementById('collectionModal');
const closeCollectionModal = document.getElementById('closeCollectionModal');
const closeCollectionModalBtn = document.getElementById('closeCollectionModalBtn');
const collectionModalTitle = document.getElementById('collectionModalTitle');
const collectionInfo = document.getElementById('collectionInfo');
const collectionMemories = document.getElementById('collectionMemories');
const memorySelector = document.getElementById('memorySelector');
const addMemoryToCollectionBtn = document.getElementById('addMemoryToCollectionBtn');
const deleteCollectionBtn = document.getElementById('deleteCollectionBtn');
const removePasswordBtn = document.getElementById('removePasswordBtn');
const lockStatus = document.getElementById('lockStatus');

let collections = [];
let allMemories = [];
let currentCollectionId = null;
let pendingCollectionId = null;
let selectedIcon = '✈️';

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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ===== Load Data =====
function loadData() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userId = userEmail || 'guest';
    
    const collectionsKey = `memonap_collections_${userId}`;
    const memoriesKey = `memonap_memories_${userId}`;
    
    const storedCollections = localStorage.getItem(collectionsKey);
    const storedMemories = localStorage.getItem(memoriesKey);
    
    collections = storedCollections ? JSON.parse(storedCollections) : [];
    allMemories = storedMemories ? JSON.parse(storedMemories) : [];
    
    renderCollections();
}

// ===== Save Collections =====
function saveCollections() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userId = userEmail || 'guest';
    localStorage.setItem(`memonap_collections_${userId}`, JSON.stringify(collections));
}

// ===== Render Collections Grid =====
function renderCollections() {
    if (collections.length === 0) {
        collectionsGrid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    collectionsGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    collectionsGrid.innerHTML = collections.map(collection => {
        const memoryCount = collection.memoryIds ? collection.memoryIds.length : 0;
        const memoryIds = collection.memoryIds || [];
        const previewMemories = memoryIds.slice(0, 3);
        
        const typeLabels = {
            personal: '✨ Personal', travel: '✈️ Travel', family: '👨‍👩‍👧 Family',
            friends: '👥 Friends', work: '💼 Work', romance: '❤️ Romance', other: '🎯 Other'
        };
        
        return `
            <div class="collection-card" data-id="${collection.id}">
                ${collection.isLocked ? `
                    <div class="lock-badge">
                        <i class="ri-lock-fill"></i> Locked
                    </div>
                ` : ''}
                <div class="collection-cover">
                    <div class="cover-icon">${collection.icon || '📁'}</div>
                    <div class="collection-count-badge">${memoryCount} memory${memoryCount !== 1 ? 's' : ''}</div>
                </div>
                <div class="collection-info">
                    <div class="collection-name">
                        ${escapeHtml(collection.name)}
                        <span class="collection-type">${typeLabels[collection.type] || '📁 Collection'}</span>
                    </div>
                    <div class="collection-desc">${escapeHtml(collection.description || 'No description')}</div>
                    <div class="collection-preview">
                        ${previewMemories.map(mid => {
                            const memory = allMemories.find(m => m.id === mid);
                            return `<div class="preview-img">📸</div>`;
                        }).join('')}
                        ${memoryCount > 3 ? `<div class="preview-img">+${memoryCount - 3}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.collection-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const collection = collections.find(c => c.id === id);
            if (collection && collection.isLocked) {
                pendingCollectionId = id;
                lockedCollectionName.textContent = `"${escapeHtml(collection.name)}" is password protected`;
                passwordModal.classList.add('active');
            } else {
                openCollectionModal(id);
            }
        });
    });
}

// ===== Open Create Modal =====
function openCreateModal() {
    collectionNameInput.value = '';
    collectionTypeSelect.value = 'personal';
    collectionDescInput.value = '';
    selectedIcon = '✈️';
    lockCollectionCheckbox.checked = false;
    passwordSection.style.display = 'none';
    collectionPasswordInput.value = '';
    iconOptions.forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.icon === '✈️') opt.classList.add('selected');
    });
    createModal.classList.add('active');
}

// ===== Create Collection =====
function createCollection() {
    const name = collectionNameInput.value.trim();
    if (!name) {
        alert('Please enter a collection name');
        return;
    }
    
    const isLocked = lockCollectionCheckbox.checked;
    let password = null;
    if (isLocked) {
        password = collectionPasswordInput.value;
        if (!password) {
            alert('Please enter a password for this collection');
            return;
        }
    }
    
    const newCollection = {
        id: Date.now(),
        name: name,
        type: collectionTypeSelect.value,
        description: collectionDescInput.value.trim(),
        icon: selectedIcon,
        memoryIds: [],
        isLocked: isLocked,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    collections.push(newCollection);
    saveCollections();
    renderCollections();
    closeCreateModalFunc();
}

// ===== Unlock Collection =====
function unlockCollection() {
    const enteredPassword = passwordInput.value;
    const collection = collections.find(c => c.id === pendingCollectionId);
    
    if (collection && collection.password === enteredPassword) {
        passwordModal.classList.remove('active');
        passwordInput.value = '';
        openCollectionModal(pendingCollectionId);
        pendingCollectionId = null;
    } else {
        alert('Incorrect password!');
    }
}

// ===== Remove Password from Collection =====
function removePasswordFromCollection() {
    if (confirm('Remove password protection from this collection?')) {
        const collection = collections.find(c => c.id === currentCollectionId);
        if (collection) {
            collection.isLocked = false;
            collection.password = null;
            saveCollections();
            renderCollections();
            lockStatus.style.display = 'none';
            removePasswordBtn.style.display = 'none';
            alert('Password protection removed!');
        }
    }
}

// ===== Close Create Modal =====
function closeCreateModalFunc() {
    createModal.classList.remove('active');
}

// ===== Open Collection Modal =====
function openCollectionModal(id) {
    const collection = collections.find(c => c.id === id);
    if (!collection) return;
    
    currentCollectionId = id;
    collectionModalTitle.innerHTML = `<i class="ri-folder-line"></i> ${escapeHtml(collection.name)}`;
    
    const typeLabels = {
        personal: '✨ Personal', travel: '✈️ Travel', family: '👨‍👩‍👧 Family',
        friends: '👥 Friends', work: '💼 Work', romance: '❤️ Romance', other: '🎯 Other'
    };
    
    collectionInfo.innerHTML = `
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
            <div style="font-size: 3rem;">${collection.icon || '📁'}</div>
            <div>
                <p style="color: #888; font-size: 0.8rem;">${escapeHtml(collection.description || 'No description')}</p>
                <p style="color: #aaa; font-size: 0.7rem;">Type: ${typeLabels[collection.type] || 'Collection'} • Created: ${new Date(collection.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    `;
    
    if (collection.isLocked) {
        lockStatus.style.display = 'inline-block';
        removePasswordBtn.style.display = 'inline-block';
    } else {
        lockStatus.style.display = 'none';
        removePasswordBtn.style.display = 'none';
    }
    
    renderCollectionMemories(collection);
    updateMemorySelector(collection);
    
    collectionModal.classList.add('active');
}

// ===== Render Collection Memories =====
function renderCollectionMemories(collection) {
    const memoryIds = collection.memoryIds || [];
    const memoriesInCollection = allMemories.filter(m => memoryIds.includes(m.id));
    
    if (memoriesInCollection.length === 0) {
        collectionMemories.innerHTML = '<p style="text-align: center; color: #888; padding: 2rem;">No memories in this collection yet.</p>';
        return;
    }
    
    collectionMemories.innerHTML = memoriesInCollection.map(memory => `
        <div class="collection-memory-item" data-id="${memory.id}">
            <div class="memory-item-img">
                ${memory.photos && memory.photos.length > 0 ? 
                    `<img src="${memory.photos[0].data}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">` :
                    '<i class="ri-image-line"></i>'
                }
            </div>
            <div class="memory-item-info">
                <div class="memory-item-title">${escapeHtml(memory.title)}</div>
                <div class="memory-item-date">${formatDate(memory.date)} • ${escapeHtml(memory.location)}</div>
            </div>
            <div class="remove-from-collection" data-id="${memory.id}">
                <i class="ri-close-line"></i>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.remove-from-collection').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const memoryId = parseInt(btn.dataset.id);
            removeMemoryFromCollection(memoryId);
        });
    });
    
    document.querySelectorAll('.collection-memory-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-from-collection')) {
                const memoryId = parseInt(item.dataset.id);
                window.location.href = `memory-detail.html?id=${memoryId}`;
            }
        });
    });
}

// ===== Update Memory Selector =====
function updateMemorySelector(collection) {
    const memoryIdsInCollection = collection.memoryIds || [];
    const availableMemories = allMemories.filter(m => !memoryIdsInCollection.includes(m.id));
    
    memorySelector.innerHTML = '<option value="">+ Add memory to this collection</option>' +
        availableMemories.map(m => `<option value="${m.id}">${escapeHtml(m.title)} - ${escapeHtml(m.location)}</option>`).join('');
}

// ===== Add Memory to Collection =====
function addMemoryToCollection() {
    const memoryId = parseInt(memorySelector.value);
    if (!memoryId) {
        alert('Please select a memory');
        return;
    }
    
    const collection = collections.find(c => c.id === currentCollectionId);
    if (collection) {
        if (!collection.memoryIds) collection.memoryIds = [];
        if (!collection.memoryIds.includes(memoryId)) {
            collection.memoryIds.push(memoryId);
            saveCollections();
            renderCollectionMemories(collection);
            updateMemorySelector(collection);
            renderCollections();
        }
    }
}

// ===== Remove Memory from Collection =====
function removeMemoryFromCollection(memoryId) {
    const collection = collections.find(c => c.id === currentCollectionId);
    if (collection) {
        collection.memoryIds = collection.memoryIds.filter(id => id !== memoryId);
        saveCollections();
        renderCollectionMemories(collection);
        updateMemorySelector(collection);
        renderCollections();
    }
}

// ===== Delete Collection =====
function deleteCollection() {
    if (confirm('Are you sure you want to delete this collection? The memories will NOT be deleted.')) {
        collections = collections.filter(c => c.id !== currentCollectionId);
        saveCollections();
        closeCollectionModalFunc();
        renderCollections();
    }
}

// ===== Close Collection Modal =====
function closeCollectionModalFunc() {
    collectionModal.classList.remove('active');
    currentCollectionId = null;
}

// ===== Close Password Modal =====
function closePasswordModalFunc() {
    passwordModal.classList.remove('active');
    passwordInput.value = '';
    pendingCollectionId = null;
}

// ===== Icon Picker =====
iconOptions.forEach(icon => {
    icon.addEventListener('click', () => {
        iconOptions.forEach(opt => opt.classList.remove('selected'));
        icon.classList.add('selected');
        selectedIcon = icon.dataset.icon;
    });
});

// ===== Lock Collection Checkbox =====
lockCollectionCheckbox?.addEventListener('change', () => {
    passwordSection.style.display = lockCollectionCheckbox.checked ? 'block' : 'none';
});

// ===== Event Listeners =====
createCollectionBtn?.addEventListener('click', openCreateModal);
emptyStateCreateBtn?.addEventListener('click', openCreateModal);
closeCreateModal?.addEventListener('click', closeCreateModalFunc);
cancelCreateBtn?.addEventListener('click', closeCreateModalFunc);
confirmCreateBtn?.addEventListener('click', createCollection);

closeCollectionModal?.addEventListener('click', closeCollectionModalFunc);
closeCollectionModalBtn?.addEventListener('click', closeCollectionModalFunc);
deleteCollectionBtn?.addEventListener('click', deleteCollection);
addMemoryToCollectionBtn?.addEventListener('click', addMemoryToCollection);
removePasswordBtn?.addEventListener('click', removePasswordFromCollection);

closePasswordModal?.addEventListener('click', closePasswordModalFunc);
cancelPasswordBtn?.addEventListener('click', closePasswordModalFunc);
unlockCollectionBtn?.addEventListener('click', unlockCollection);

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
        closeCreateModalFunc();
        closeCollectionModalFunc();
        closePasswordModalFunc();
    });
});

menuToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

logoutBtn?.addEventListener('click', async () => {
    sessionStorage.clear();
    if (typeof firebase !== 'undefined' && firebase.auth) {
        await firebase.auth().signOut();
    }
    window.location.href = 'login.html';
});

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
    const userName = sessionStorage.getItem('userName');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    
    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }
    
    return true;
}

// ===== Initialize =====
function init() {
    checkAuth();
    loadData();
}

init();

console.log('%c📁 Collections Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold');