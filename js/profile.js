// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const changeAvatarBtn = document.getElementById('changeAvatarBtn');

// Profile Display Elements
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileAvatarEmoji = document.getElementById('profileAvatarEmoji');
const profileAvatarImg = document.getElementById('profileAvatarImg');
const sidebarUserName = document.getElementById('sidebarUserName');

// Stats Elements
const totalMemoriesSpan = document.getElementById('totalMemories');
const totalCitiesSpan = document.getElementById('totalCities');
const totalPhotosSpan = document.getElementById('totalPhotos');
const totalMoodsSpan = document.getElementById('totalMoods');

// Journey Stats Elements
const totalDaysSpan = document.getElementById('totalDays');
const totalPinsSpan = document.getElementById('totalPins');
const totalMomentsSpan = document.getElementById('totalMoments');
const totalRatingSpan = document.getElementById('totalRating');

// Travel Stats
const countryCountSpan = document.getElementById('countryCount');
const flightCountSpan = document.getElementById('flightCount');
const hotelCountSpan = document.getElementById('hotelCount');
const memoriesPerMonthSpan = document.getElementById('memoriesPerMonth');

// Edit Modal
const editProfileModal = document.getElementById('editProfileModal');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const editName = document.getElementById('editName');
const editEmail = document.getElementById('editEmail');
const editBio = document.getElementById('editBio');
const editQuote = document.getElementById('editQuote');

// Avatar Modal
const avatarModal = document.getElementById('avatarModal');
const closeAvatarModal = document.getElementById('closeAvatarModal');
const cancelAvatarBtn = document.getElementById('cancelAvatarBtn');
const saveAvatarBtn = document.getElementById('saveAvatarBtn');

// Mood colors
const moodColors = {
    happy: '#fbbf24',
    peaceful: '#6ee7b7',
    loved: '#f472b6',
    excited: '#fb923c',
    nostalgic: '#a78bfa',
    sad: '#93c5fd'
};

const moodEmoji = {
    happy: '😊',
    peaceful: '😌',
    loved: '❤️',
    excited: '😎',
    nostalgic: '📸',
    sad: '😢'
};

const moodNames = {
    happy: 'Happy',
    peaceful: 'Peaceful',
    loved: 'Loved',
    excited: 'Excited',
    nostalgic: 'Nostalgic',
    sad: 'Sad'
};

let allMemories = [];
let userProfile = {
    name: 'Explorer',
    email: 'explorer@memonap.com',
    avatar: '🌍',
    avatarType: 'emoji',
    bio: 'Memory collector and travel enthusiast',
    quote: 'Every place has a story...',
    joinDate: 'January 2024'
};

let selectedAvatarType = 'emoji';
let selectedAvatarValue = '🌍';
let uploadedPhotoData = null;

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
    
    // Load memories
    const userId = userEmail || 'guest';
    const memoriesKey = `memonap_memories_${userId}`;
    const storedMemories = localStorage.getItem(memoriesKey);
    allMemories = storedMemories ? JSON.parse(storedMemories) : [];
    
    // Load profile
    const profileKey = `memonap_profile_${userId}`;
    const storedProfile = localStorage.getItem(profileKey);
    if (storedProfile) {
        userProfile = JSON.parse(storedProfile);
    }
    
    updateProfileUI();
    updateAllStats();
}

// ===== Update Profile UI =====
function updateProfileUI() {
    profileName.textContent = userProfile.name;
    profileEmail.textContent = userProfile.email;
    sidebarUserName.textContent = userProfile.name;
    document.getElementById('joinDate').textContent = userProfile.joinDate || 'January 2024';
    
    if (userProfile.avatarType === 'image' && userProfile.avatar) {
        profileAvatarEmoji.style.display = 'none';
        profileAvatarImg.style.display = 'block';
        profileAvatarImg.src = userProfile.avatar;
    } else {
        profileAvatarEmoji.style.display = 'flex';
        profileAvatarImg.style.display = 'none';
        profileAvatarEmoji.textContent = userProfile.avatar || '🌍';
    }
}

// ===== Update All Stats =====
function updateAllStats() {
    updateStats();
    updateJourneyStats();
    updateMoodChart();
    updateTagsCloud();
    updateTravelStats();
    updateAchievements();
    updateRecentActivity();
    updateFavoritePlaces();
}

// ===== Update Stats =====
function updateStats() {
    totalMemoriesSpan.textContent = allMemories.length;
    
    const uniqueCities = new Set(allMemories.map(m => m.location.split(',')[0].trim()));
    totalCitiesSpan.textContent = uniqueCities.size;
    
    const photoCount = allMemories.filter(m => m.photos && m.photos.length > 0).length;
    totalPhotosSpan.textContent = photoCount;
    
    const uniqueMoods = new Set(allMemories.map(m => m.mood));
    totalMoodsSpan.textContent = uniqueMoods.size;
}

// ===== Update Journey Stats =====
function updateJourneyStats() {
    if (allMemories.length === 0) {
        totalDaysSpan.textContent = '0';
        totalPinsSpan.textContent = '0';
        totalMomentsSpan.textContent = '0';
        totalRatingSpan.textContent = '0';
        return;
    }
    
    const dates = allMemories.map(m => new Date(m.date));
    const oldest = new Date(Math.min(...dates));
    const newest = new Date(Math.max(...dates));
    const daysDiff = Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24)) + 1;
    totalDaysSpan.textContent = daysDiff || allMemories.length;
    
    totalPinsSpan.textContent = allMemories.length;
    
    const photoCount = allMemories.filter(m => m.photos && m.photos.length > 0).length;
    totalMomentsSpan.textContent = photoCount + allMemories.length;
    
    const happyCount = allMemories.filter(m => m.mood === 'happy').length;
    const peacefulCount = allMemories.filter(m => m.mood === 'peaceful').length;
    const lovedCount = allMemories.filter(m => m.mood === 'loved').length;
    const score = allMemories.length > 0 ? Math.round(((happyCount + peacefulCount + lovedCount) / allMemories.length) * 100) : 85;
    totalRatingSpan.textContent = score;
}

// ===== Update Mood Chart =====
function updateMoodChart() {
    const moodCounts = {
        happy: 0, peaceful: 0, loved: 0,
        excited: 0, nostalgic: 0, sad: 0
    };
    
    allMemories.forEach(m => {
        if (moodCounts[m.mood] !== undefined) {
            moodCounts[m.mood]++;
        }
    });
    
    const total = allMemories.length || 1;
    const moodOrder = ['happy', 'peaceful', 'loved', 'excited', 'nostalgic', 'sad'];
    
    const chartHtml = moodOrder.map(mood => {
        const count = moodCounts[mood];
        const percentage = total > 0 ? (count / total * 100) : 0;
        return `
            <div class="mood-bar-item">
                <div class="mood-label">${moodEmoji[mood]} ${moodNames[mood]}</div>
                <div class="mood-bar-container">
                    <div class="mood-bar-fill" style="width: ${percentage}%; background: ${moodColors[mood]};"></div>
                </div>
                <div class="mood-count">${count}</div>
            </div>
        `;
    }).join('');
    
    document.getElementById('moodChart').innerHTML = chartHtml;
}

// ===== Update Tags Cloud =====
function updateTagsCloud() {
    const tagCounts = {};
    allMemories.forEach(m => {
        if (m.tags && m.tags.length) {
            m.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });
    
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
    
    const tagsHtml = sortedTags.map(([tag, count]) => `
        <span class="tag-item" style="font-size: ${0.7 + Math.min(count * 0.05, 0.5)}rem;">
            #${tag} (${count})
        </span>
    `).join('');
    
    document.getElementById('tagsCloud').innerHTML = tagsHtml || '<p style="color:#888;">No tags yet</p>';
}

// ===== Update Travel Stats =====
function updateTravelStats() {
    const countries = new Set();
    
    allMemories.forEach(m => {
        const location = m.location.toLowerCase();
        if (location.includes('paris') || location.includes('france')) countries.add('France');
        else if (location.includes('tokyo') || location.includes('japan')) countries.add('Japan');
        else if (location.includes('new york') || location.includes('usa')) countries.add('USA');
        else if (location.includes('london') || location.includes('uk')) countries.add('UK');
        else if (location.includes('mumbai') || location.includes('delhi') || location.includes('india')) countries.add('India');
        else if (location.includes('bali') || location.includes('indonesia')) countries.add('Indonesia');
        else if (location.includes('sydney') || location.includes('australia')) countries.add('Australia');
        else countries.add(location.split(',')[0].trim());
    });
    
    countryCountSpan.textContent = countries.size || 0;
    flightCountSpan.textContent = Math.floor(allMemories.length * 1.2) || 0;
    hotelCountSpan.textContent = Math.floor(allMemories.length * 0.8) || 0;
    
    if (allMemories.length > 0) {
        const oldest = new Date(Math.min(...allMemories.map(m => new Date(m.date))));
        const newest = new Date(Math.max(...allMemories.map(m => new Date(m.date))));
        const monthsDiff = (newest.getFullYear() - oldest.getFullYear()) * 12 + (newest.getMonth() - oldest.getMonth()) + 1;
        memoriesPerMonthSpan.textContent = (allMemories.length / Math.max(monthsDiff, 1)).toFixed(1);
    } else {
        memoriesPerMonthSpan.textContent = '0';
    }
}

// ===== Update Achievements =====
function updateAchievements() {
    const uniqueCities = new Set(allMemories.map(m => m.location.split(',')[0].trim()));
    const uniqueYears = new Set(allMemories.map(m => new Date(m.date).getFullYear()));
    const happyCount = allMemories.filter(m => m.mood === 'happy').length;
    const lovedCount = allMemories.filter(m => m.mood === 'loved').length;
    const photoCount = allMemories.filter(m => m.photos && m.photos.length > 0).length;
    const totalMemories = allMemories.length;
    
    const achievements = [
        { icon: "📸", name: "First Memory", desc: "Added your first memory", unlocked: totalMemories >= 1, progress: Math.min(100, (totalMemories / 1) * 100) },
        { icon: "🏆", name: "Memory Collector", desc: "10 memories saved", unlocked: totalMemories >= 10, progress: Math.min(100, (totalMemories / 10) * 100) },
        { icon: "🌟", name: "Memory Master", desc: "50 memories saved", unlocked: totalMemories >= 50, progress: Math.min(100, (totalMemories / 50) * 100) },
        { icon: "🌍", name: "World Explorer", desc: "Visited 5+ cities", unlocked: uniqueCities.size >= 5, progress: Math.min(100, (uniqueCities.size / 5) * 100) },
        { icon: "🗺️", name: "Globetrotter", desc: "Visited 10+ cities", unlocked: uniqueCities.size >= 10, progress: Math.min(100, (uniqueCities.size / 10) * 100) },
        { icon: "😊", name: "Happy Soul", desc: "10 happy memories", unlocked: happyCount >= 10, progress: Math.min(100, (happyCount / 10) * 100) },
        { icon: "❤️", name: "Hopeless Romantic", desc: "5 loved memories", unlocked: lovedCount >= 5, progress: Math.min(100, (lovedCount / 5) * 100) },
        { icon: "📆", name: "Time Traveler", desc: "Memories from 3+ years", unlocked: uniqueYears.size >= 3, progress: Math.min(100, (uniqueYears.size / 3) * 100) },
        { icon: "📷", name: "Photographer", desc: "50 photos uploaded", unlocked: photoCount >= 50, progress: Math.min(100, (photoCount / 50) * 100) },
        { icon: "✈️", name: "Frequent Flyer", desc: "Visit 5 countries", unlocked: uniqueCities.size >= 5, progress: Math.min(100, (uniqueCities.size / 5) * 100) }
    ];
    
    const achievementsHtml = achievements.map(ach => `
        <div class="achievement-card ${!ach.unlocked ? 'locked' : ''}">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.desc}</div>
            ${!ach.unlocked ? `<div class="achievement-progress" style="font-size:0.6rem; color:#888; margin-top:4px;">${Math.floor(ach.progress)}%</div>` : '<div style="font-size:0.6rem; color:#27ae60; margin-top:4px;">✅ Unlocked!</div>'}
        </div>
    `).join('');
    
    document.getElementById('achievementsGrid').innerHTML = achievementsHtml;
}

// ===== Update Recent Activity =====
function updateRecentActivity() {
    const sorted = [...allMemories].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    const activityHtml = sorted.map(m => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="ri-map-pin-fill"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">Added "${escapeHtml(m.title)}"</div>
                <div class="activity-time">${new Date(m.date).toLocaleDateString()}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('activityList').innerHTML = activityHtml || '<p style="color:#888; text-align:center;">No activity yet</p>';
}

// ===== Update Favorite Places =====
function updateFavoritePlaces() {
    const placeCounts = {};
    allMemories.forEach(m => {
        const place = m.location.split(',')[0].trim();
        placeCounts[place] = (placeCounts[place] || 0) + 1;
    });
    
    const sorted = Object.entries(placeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    const placesHtml = sorted.map(([place, count], index) => `
        <div class="favorite-place">
            <div class="place-rank">#${index + 1}</div>
            <div class="place-name">${escapeHtml(place)}</div>
            <div class="place-count">${count} memory${count > 1 ? 's' : ''}</div>
        </div>
    `).join('');
    
    document.getElementById('favoritePlaces').innerHTML = placesHtml || '<p style="color:#888; text-align:center;">No places yet</p>';
}

// ===== Escape HTML =====
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ===== Edit Profile Functions =====
function openEditModal() {
    editName.value = userProfile.name;
    editEmail.value = userProfile.email;
    editBio.value = userProfile.bio || '';
    editQuote.value = userProfile.quote || '';
    editProfileModal.classList.add('active');
}

function closeEditModalFunc() {
    editProfileModal.classList.remove('active');
}

function saveProfile() {
    userProfile.name = editName.value.trim() || 'Explorer';
    userProfile.email = editEmail.value.trim() || 'explorer@memonap.com';
    userProfile.bio = editBio.value;
    userProfile.quote = editQuote.value;
    
    const userId = sessionStorage.getItem('userEmail') || 'guest';
    localStorage.setItem(`memonap_profile_${userId}`, JSON.stringify(userProfile));
    
    updateProfileUI();
    closeEditModalFunc();
    alert('Profile updated successfully!');
}

// ===== Avatar Functions =====
function openAvatarModal() {
    selectedAvatarType = userProfile.avatarType || 'emoji';
    selectedAvatarValue = userProfile.avatar || '🌍';
    uploadedPhotoData = null;
    
    const emojiTab = document.getElementById('emojiTab');
    const uploadTab = document.getElementById('uploadTab');
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoPreview = document.getElementById('photoPreview');
    
    if (photoUploadArea) photoUploadArea.style.display = 'block';
    if (photoPreview) photoPreview.style.display = 'none';
    
    if (selectedAvatarType === 'image') {
        const tabs = document.querySelectorAll('.avatar-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === 'upload');
        });
        if (emojiTab) emojiTab.classList.remove('active');
        if (uploadTab) uploadTab.classList.add('active');
        
        if (userProfile.avatar && photoPreview) {
            const previewImg = document.getElementById('previewImage');
            if (previewImg) previewImg.src = userProfile.avatar;
            if (photoPreview) photoPreview.style.display = 'block';
            if (photoUploadArea) photoUploadArea.style.display = 'none';
        }
    } else {
        const tabs = document.querySelectorAll('.avatar-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === 'emoji');
        });
        if (emojiTab) emojiTab.classList.add('active');
        if (uploadTab) uploadTab.classList.remove('active');
        
        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.avatar === selectedAvatarValue) {
                opt.classList.add('selected');
            }
        });
    }
    
    avatarModal.classList.add('active');
}

function closeAvatarModalFunc() {
    avatarModal.classList.remove('active');
}

function saveAvatar() {
    if (selectedAvatarType === 'emoji') {
        userProfile.avatar = selectedAvatarValue;
        userProfile.avatarType = 'emoji';
    } else if (selectedAvatarType === 'upload' && uploadedPhotoData) {
        userProfile.avatar = uploadedPhotoData;
        userProfile.avatarType = 'image';
    }
    
    const userId = sessionStorage.getItem('userEmail') || 'guest';
    localStorage.setItem(`memonap_profile_${userId}`, JSON.stringify(userProfile));
    
    updateProfileUI();
    closeAvatarModalFunc();
    alert('Avatar updated successfully!');
}

// ===== Avatar Tab Switching =====
document.querySelectorAll('.avatar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        selectedAvatarType = tabName;
        
        document.querySelectorAll('.avatar-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.avatar-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeTab = document.getElementById(`${tabName}Tab`);
        if (activeTab) activeTab.classList.add('active');
    });
});

// ===== Emoji Selection =====
document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedAvatarType = 'emoji';
        selectedAvatarValue = opt.dataset.avatar;
    });
});

// ===== Photo Upload =====
const photoUploadArea = document.getElementById('photoUploadArea');
const photoUploadInput = document.getElementById('photoUploadInput');
const photoPreview = document.getElementById('photoPreview');
const previewImage = document.getElementById('previewImage');
const removePhotoBtn = document.getElementById('removePhotoBtn');

if (photoUploadArea) {
    photoUploadArea.addEventListener('click', () => {
        if (photoUploadInput) photoUploadInput.click();
    });
}

if (photoUploadInput) {
    photoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedPhotoData = event.target.result;
                if (previewImage) previewImage.src = uploadedPhotoData;
                if (photoPreview) photoPreview.style.display = 'block';
                if (photoUploadArea) photoUploadArea.style.display = 'none';
                selectedAvatarType = 'upload';
            };
            reader.readAsDataURL(file);
        }
    });
}

if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
        uploadedPhotoData = null;
        if (photoPreview) photoPreview.style.display = 'none';
        if (photoUploadArea) photoUploadArea.style.display = 'block';
        selectedAvatarType = 'emoji';
        selectedAvatarValue = '🌍';
    });
}

// ===== Event Listeners =====
if (editProfileBtn) editProfileBtn.addEventListener('click', openEditModal);
if (changeAvatarBtn) changeAvatarBtn.addEventListener('click', openAvatarModal);
if (closeEditModal) closeEditModal.addEventListener('click', closeEditModalFunc);
if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModalFunc);
if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);
if (closeAvatarModal) closeAvatarModal.addEventListener('click', closeAvatarModalFunc);
if (cancelAvatarBtn) cancelAvatarBtn.addEventListener('click', closeAvatarModalFunc);
if (saveAvatarBtn) saveAvatarBtn.addEventListener('click', saveAvatar);

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
        closeEditModalFunc();
        closeAvatarModalFunc();
    });
});

// ===== Sidebar Functions =====
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        sessionStorage.clear();
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                await firebase.auth().signOut();
            } catch(e) {}
        }
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

// ===== Initialize =====
checkAuth();
loadData();

console.log('%c👤 Profile Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold');