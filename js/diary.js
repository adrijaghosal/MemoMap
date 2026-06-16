// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const diaryGrid = document.getElementById('diaryEntriesGrid');
const emptyState = document.getElementById('emptyState');
const newEntryBtn = document.getElementById('newDiaryEntryBtn');
const emptyStateCreateBtn = document.getElementById('emptyStateCreateBtn');

// Modal Elements
const diaryModal = document.getElementById('diaryModal');
const closeDiaryModal = document.getElementById('closeDiaryModal');
const cancelDiaryBtn = document.getElementById('cancelDiaryBtn');
const saveDiaryBtn = document.getElementById('saveDiaryEntryBtn');
const modalTitle = document.getElementById('modalTitle');
const entryTitleInput = document.getElementById('entryTitle');
const entryContentInput = document.getElementById('entryContent');
const entryMoodInput = document.getElementById('entryMood');
const entryLockedCheckbox = document.getElementById('entryLocked');
const entryPasswordSection = document.getElementById('entryPasswordSection');
const entryPasswordInput = document.getElementById('entryPassword');
const contentCount = document.getElementById('contentCount');

// Locked Modal
const lockedModal = document.getElementById('lockedModal');
const closeLockedModal = document.getElementById('closeLockedModal');
const cancelLockedBtn = document.getElementById('cancelLockedBtn');
const unlockEntryBtn = document.getElementById('unlockEntryBtn');
const lockedEntryPassword = document.getElementById('lockedEntryPassword');

// View Modal
const viewModal = document.getElementById('viewModal');
const closeViewModal = document.getElementById('closeViewModal');
const closeViewBtn = document.getElementById('closeViewBtn');
const viewModalTitle = document.getElementById('viewModalTitle');
const viewModalBody = document.getElementById('viewModalBody');
const deleteEntryBtn = document.getElementById('deleteEntryBtn');
const editEntryBtn = document.getElementById('editEntryBtn');

// Stats
const totalEntriesSpan = document.getElementById('totalEntries');
const lockedEntriesSpan = document.getElementById('lockedEntries');
const totalWordsSpan = document.getElementById('totalWords');
const entryDaysSpan = document.getElementById('entryDays');

// Mood Selector
const moodOptions = document.querySelectorAll('#diaryMoodSelector .mood-option');

let diaryEntries = [];
let currentUserId = null;
let currentEditId = null;
let viewingEntryId = null;

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

function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getMoodEmoji(mood) {
    const emojis = {
        happy: '😊', peaceful: '😌', loved: '❤️', excited: '😎', nostalgic: '📸', sad: '😢'
    };
    return emojis[mood] || '📝';
}

// ===== Load Data =====
function loadData() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userEmail = sessionStorage.getItem('userEmail');
    const userName = sessionStorage.getItem('userName');

    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }

    currentUserId = userEmail || 'guest';
    const diaryKey = `memonap_diary_${currentUserId}`;
    const stored = localStorage.getItem(diaryKey);
    diaryEntries = stored ? JSON.parse(stored) : [];

    renderDiary();
    updateStats();
}

// ===== Update Stats =====
function updateStats() {
    totalEntriesSpan.textContent = diaryEntries.length;
    
    const lockedCount = diaryEntries.filter(e => e.isLocked).length;
    lockedEntriesSpan.textContent = lockedCount;
    
    let totalWords = 0;
    diaryEntries.forEach(entry => {
        if (entry.content) {
            totalWords += entry.content.split(/\s+/).filter(w => w.length > 0).length;
        }
    });
    totalWordsSpan.textContent = totalWords;
    
    if (diaryEntries.length > 0) {
        const dates = diaryEntries.map(e => new Date(e.createdAt));
        const oldest = new Date(Math.min(...dates));
        const now = new Date();
        const diffTime = Math.abs(now - oldest);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        entryDaysSpan.textContent = diffDays;
    } else {
        entryDaysSpan.textContent = 0;
    }
}

// ===== Render Diary =====
function renderDiary() {
    if (diaryEntries.length === 0) {
        diaryGrid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    diaryGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    const sortedEntries = [...diaryEntries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    diaryGrid.innerHTML = sortedEntries.map(entry => `
        <div class="diary-card" data-id="${entry.id}">
            <div class="diary-card-cover">
                <div class="cover-icon">${getMoodEmoji(entry.mood || 'happy')}</div>
                ${entry.isLocked ? `
                    <div class="lock-badge">
                        <i class="ri-lock-fill"></i> Locked
                    </div>
                ` : ''}
            </div>
            <div class="diary-card-content">
                <div class="diary-card-title">${escapeHtml(entry.title || 'Untitled')}</div>
                <div class="diary-card-preview">${escapeHtml(entry.content ? entry.content.substring(0, 120) : 'No content')}${entry.content && entry.content.length > 120 ? '...' : ''}</div>
                <div class="diary-card-footer">
                    <div class="diary-card-date">${formatDateShort(entry.createdAt)}</div>
                    <div class="diary-card-mood">${getMoodEmoji(entry.mood || 'happy')}</div>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.diary-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const entry = diaryEntries.find(e => e.id === id);
            if (entry && entry.isLocked) {
                viewingEntryId = id;
                lockedModal.classList.add('active');
            } else {
                viewEntry(id);
            }
        });
    });
}

// ===== Mood Selector =====
moodOptions.forEach(option => {
    option.addEventListener('click', () => {
        moodOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        entryMoodInput.value = option.dataset.mood;
    });
});

const defaultMood = document.querySelector('#diaryMoodSelector .mood-option[data-mood="happy"]');
if (defaultMood) defaultMood.classList.add('selected');

// ===== Lock Entry Checkbox =====
entryLockedCheckbox.addEventListener('change', () => {
    entryPasswordSection.style.display = entryLockedCheckbox.checked ? 'block' : 'none';
});

// ===== Content Character Count =====
entryContentInput.addEventListener('input', () => {
    contentCount.textContent = entryContentInput.value.length;
});

// ===== Open Create Modal =====
function openCreateModal() {
    currentEditId = null;
    modalTitle.innerHTML = '<i class="ri-edit-line"></i> New Diary Entry';
    entryTitleInput.value = '';
    entryContentInput.value = '';
    contentCount.textContent = '0';
    entryLockedCheckbox.checked = false;
    entryPasswordSection.style.display = 'none';
    entryPasswordInput.value = '';
    
    moodOptions.forEach(opt => opt.classList.remove('selected'));
    const defaultMood = document.querySelector('#diaryMoodSelector .mood-option[data-mood="happy"]');
    if (defaultMood) defaultMood.classList.add('selected');
    entryMoodInput.value = 'happy';
    
    diaryModal.classList.add('active');
}

// ===== Open Edit Modal =====
function openEditModal(entry) {
    currentEditId = entry.id;
    modalTitle.innerHTML = '<i class="ri-edit-line"></i> Edit Diary Entry';
    entryTitleInput.value = entry.title || '';
    entryContentInput.value = entry.content || '';
    contentCount.textContent = entry.content ? entry.content.length : 0;
    entryLockedCheckbox.checked = entry.isLocked || false;
    entryPasswordSection.style.display = entry.isLocked ? 'block' : 'none';
    entryPasswordInput.value = '';
    
    moodOptions.forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.mood === entry.mood) {
            opt.classList.add('selected');
        }
    });
    entryMoodInput.value = entry.mood || 'happy';
    
    diaryModal.classList.add('active');
}

// ===== Save Entry =====
function saveEntry() {
    const title = entryTitleInput.value.trim();
    const content = entryContentInput.value.trim();
    const mood = entryMoodInput.value || 'happy';
    const isLocked = entryLockedCheckbox.checked;
    const password = entryPasswordInput.value;

    if (!title) {
        alert('Please enter a title for your entry');
        entryTitleInput.focus();
        return;
    }

    if (!content) {
        alert('Please write something in your entry');
        entryContentInput.focus();
        return;
    }

    if (isLocked && !password) {
        alert('Please enter a password to lock this entry');
        entryPasswordInput.focus();
        return;
    }

    const diaryKey = `memonap_diary_${currentUserId}`;

    if (currentEditId) {
        const index = diaryEntries.findIndex(e => e.id === currentEditId);
        if (index !== -1) {
            diaryEntries[index] = {
                ...diaryEntries[index],
                title: title,
                content: content,
                mood: mood,
                isLocked: isLocked,
                password: isLocked ? password : null,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        const newEntry = {
            id: Date.now(),
            title: title,
            content: content,
            mood: mood,
            isLocked: isLocked,
            password: isLocked ? password : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        diaryEntries.push(newEntry);
    }

    localStorage.setItem(diaryKey, JSON.stringify(diaryEntries));
    diaryModal.classList.remove('active');
    renderDiary();
    updateStats();
}

// ===== View Entry =====
function viewEntry(id) {
    const entry = diaryEntries.find(e => e.id === id);
    if (!entry) return;

    viewingEntryId = id;
    viewModalTitle.textContent = entry.title || 'Untitled';

    viewModalBody.innerHTML = `
        <div class="view-entry-content">
            <div class="view-entry-mood">${getMoodEmoji(entry.mood || 'happy')} ${entry.mood || 'happy'}</div>
            <div class="view-entry-text">${escapeHtml(entry.content || 'No content')}</div>
            <div style="margin-top: 1rem; font-size: 0.7rem; color: #aaa;">
                Written on ${formatDate(entry.createdAt)}
                ${entry.updatedAt && entry.updatedAt !== entry.createdAt ? `<br>Last edited ${formatDate(entry.updatedAt)}` : ''}
            </div>
        </div>
    `;

    viewModal.classList.add('active');
}

// ===== Delete Entry =====
function deleteEntry() {
    if (!viewingEntryId) return;
    if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
        diaryEntries = diaryEntries.filter(e => e.id !== viewingEntryId);
        const diaryKey = `memonap_diary_${currentUserId}`;
        localStorage.setItem(diaryKey, JSON.stringify(diaryEntries));
        viewModal.classList.remove('active');
        renderDiary();
        updateStats();
        viewingEntryId = null;
    }
}

// ===== Edit Entry from View =====
function editEntryFromView() {
    if (!viewingEntryId) return;
    const entry = diaryEntries.find(e => e.id === viewingEntryId);
    if (entry) {
        viewModal.classList.remove('active');
        openEditModal(entry);
    }
}

// ===== Unlock Locked Entry =====
function unlockEntry() {
    const password = lockedEntryPassword.value;
    if (!password) {
        alert('Please enter the password');
        return;
    }

    const entry = diaryEntries.find(e => e.id === viewingEntryId);
    if (entry && entry.password === password) {
        lockedModal.classList.remove('active');
        lockedEntryPassword.value = '';
        viewEntry(viewingEntryId);
    } else {
        alert('Incorrect password!');
    }
}

// ===== Close Functions =====
function closeCreateModal() {
    diaryModal.classList.remove('active');
    currentEditId = null;
}

function closeLockedModalFunc() {
    lockedModal.classList.remove('active');
    lockedEntryPassword.value = '';
    viewingEntryId = null;
}

function closeViewModalFunc() {
    viewModal.classList.remove('active');
    viewingEntryId = null;
}

// ===== Event Listeners =====
newEntryBtn.addEventListener('click', openCreateModal);
emptyStateCreateBtn.addEventListener('click', openCreateModal);
closeDiaryModal.addEventListener('click', closeCreateModal);
cancelDiaryBtn.addEventListener('click', closeCreateModal);
saveDiaryBtn.addEventListener('click', saveEntry);

closeLockedModal.addEventListener('click', closeLockedModalFunc);
cancelLockedBtn.addEventListener('click', closeLockedModalFunc);
unlockEntryBtn.addEventListener('click', unlockEntry);

closeViewModal.addEventListener('click', closeViewModalFunc);
closeViewBtn.addEventListener('click', closeViewModalFunc);
deleteEntryBtn.addEventListener('click', deleteEntry);
editEntryBtn.addEventListener('click', editEntryFromView);

lockedEntryPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') unlockEntry();
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
        closeCreateModal();
        closeLockedModalFunc();
        closeViewModalFunc();
    });
});

// ===== Sidebar Functions =====
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

logoutBtn.addEventListener('click', async () => {
    sessionStorage.clear();
    if (typeof firebase !== 'undefined' && firebase.auth) {
        try {
            await firebase.auth().signOut();
        } catch(e) {}
    }
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
}

// ===== Initialize =====
checkAuth();
loadData();

console.log('%c📖 Digital Diary Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold');