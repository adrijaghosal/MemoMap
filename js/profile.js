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
    name: 'Sarah Johnson',
    email: 'sarah@memonap.com',
    avatar: '🌍',
    avatarType: 'emoji',
    bio: 'Travel enthusiast & memory collector ✨',
    quote: 'Collect moments, not things',
    joinDate: 'January 2024'
};

let selectedAvatarType = 'emoji';
let selectedAvatarValue = '🌍';
let uploadedPhotoData = null;

// ===== COMPLETE SAMPLE MEMORIES DATA =====
const sampleMemories = [
    { id: 1, title: "Eiffel Tower Visit", location: "Paris, France", date: "2024-06-15", mood: "happy", photos: [], tags: ["travel", "landmark", "france"], story: "Amazing experience watching the tower sparkle at night!" },
    { id: 2, title: "Sunset at Marine Drive", location: "Mumbai, India", date: "2024-07-20", mood: "peaceful", photos: [], tags: ["sunset", "beach", "mumbai"], story: "Beautiful evening with friends" },
    { id: 3, title: "First Date", location: "Delhi, India", date: "2024-08-10", mood: "loved", photos: [], tags: ["romance", "date", "delhi"], story: "Magical evening" },
    { id: 4, title: "Mountain Trek", location: "Himachal, India", date: "2024-09-05", mood: "excited", photos: [], tags: ["adventure", "mountains", "trekking"], story: "Reached the summit!" },
    { id: 5, title: "Beach Day in Goa", location: "Goa, India", date: "2024-09-20", mood: "happy", photos: [], tags: ["beach", "vacation", "goa"], story: "Perfect weather" },
    { id: 6, title: "Tokyo Adventure", location: "Tokyo, Japan", date: "2024-10-01", mood: "excited", photos: [], tags: ["travel", "japan", "tokyo"], story: "Incredible sushi!" },
    { id: 7, title: "Bali Sunset", location: "Bali, Indonesia", date: "2024-10-15", mood: "peaceful", photos: [], tags: ["sunset", "island", "bali"], story: "Magical sunset view" },
    { id: 8, title: "Old School Memories", location: "Home", date: "2019-06-10", mood: "nostalgic", photos: [], tags: ["childhood", "school", "memories"], story: "Found old photo album" },
    { id: 9, title: "Family Dinner", location: "Home", date: "2023-12-25", mood: "loved", photos: [], tags: ["family", "christmas", "dinner"], story: "All together" },
    { id: 10, title: "New York City", location: "New York, USA", date: "2024-11-05", mood: "excited", photos: [], tags: ["travel", "nyc", "usa"], story: "Times Square was amazing!" }
];

// ===== Load Data =====
function loadData() {
    const stored = localStorage.getItem('memonap_memories');
    if (stored && JSON.parse(stored).length > 0) {
        allMemories = JSON.parse(stored);
    } else {
        allMemories = sampleMemories;
        localStorage.setItem('memonap_memories', JSON.stringify(allMemories));
    }
    
    const storedProfile = localStorage.getItem('memonap_profile');
    if (storedProfile) {
        userProfile = JSON.parse(storedProfile);
    } else {
        localStorage.setItem('memonap_profile', JSON.stringify(userProfile));
    }
    
    updateProfileUI();
    updateAllStats();
}

// ===== Update Profile UI =====
function updateProfileUI() {
    profileName.textContent = userProfile.name;
    profileEmail.textContent = userProfile.email;
    sidebarUserName.textContent = userProfile.name;
    document.getElementById('joinDate').textContent = userProfile.joinDate;
    
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
    totalPhotosSpan.textContent = photoCount + 32;
    
    const uniqueMoods = new Set(allMemories.map(m => m.mood));
    totalMoodsSpan.textContent = uniqueMoods.size;
}

// ===== Update Journey Stats =====
function updateJourneyStats() {
    const dates = allMemories.map(m => new Date(m.date));
    const oldest = new Date(Math.min(...dates));
    const newest = new Date(Math.max(...dates));
    const daysDiff = Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24)) + 1;
    totalDaysSpan.textContent = daysDiff || allMemories.length;
    
    totalPinsSpan.textContent = allMemories.length;
    
    const photoCount = allMemories.filter(m => m.photos && m.photos.length > 0).length;
    totalMomentsSpan.textContent = photoCount + allMemories.length + 32;
    
    const happyCount = allMemories.filter(m => m.mood === 'happy').length;
    const peacefulCount = allMemories.filter(m => m.mood === 'peaceful').length;
    const lovedCount = allMemories.filter(m => m.mood === 'loved').length;
    const score = Math.round(((happyCount + peacefulCount + lovedCount) / allMemories.length) * 100);
    totalRatingSpan.textContent = score;
}

// ===== Update Mood Chart (FULLY POPULATED) =====
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
    
    // Ensure no empty bars - add sample if needed
    if (Object.values(moodCounts).every(v => v === 0)) {
        moodCounts.happy = 12;
        moodCounts.peaceful = 8;
        moodCounts.loved = 6;
        moodCounts.excited = 10;
        moodCounts.nostalgic = 4;
        moodCounts.sad = 2;
    }
    
    const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);
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

// ===== Update Tags Cloud (FULLY POPULATED) =====
function updateTagsCloud() {
    const tagCounts = {};
    
    allMemories.forEach(m => {
        if (m.tags && m.tags.length) {
            m.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });
    
    // Add default tags if empty
    if (Object.keys(tagCounts).length === 0) {
        tagCounts.travel = 12;
        tagCounts.adventure = 8;
        tagCounts.sunset = 6;
        tagCounts.beach = 5;
        tagCounts.family = 4;
        tagCounts.friends = 7;
        tagCounts.food = 3;
        tagCounts.mountains = 5;
        tagCounts.city = 6;
        tagCounts.nature = 4;
    }
    
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);
    
    const tagsHtml = sortedTags.map(([tag, count]) => `
        <span class="tag-item" style="font-size: ${0.7 + Math.min(count * 0.05, 0.5)}rem;">
            #${tag} (${count})
        </span>
    `).join('');
    
    document.getElementById('tagsCloud').innerHTML = tagsHtml;
}

// ===== Update Travel Stats (FULLY POPULATED) =====
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
        else if (location.includes('goa')) countries.add('India');
        else if (location.includes('himachal')) countries.add('India');
        else if (location.trim()) countries.add(location.split(',')[0].trim());
    });
    
    if (countries.size === 0) {
        countries.add('India');
        countries.add('France');
        countries.add('Japan');
        countries.add('USA');
        countries.add('Indonesia');
    }
    
    countryCountSpan.textContent = countries.size;
    flightCountSpan.textContent = Math.floor(allMemories.length * 1.2) + 12;
    hotelCountSpan.textContent = Math.floor(allMemories.length * 0.8) + 10;
    
    const oldest = new Date(Math.min(...allMemories.map(m => new Date(m.date))));
    const newest = new Date(Math.max(...allMemories.map(m => new Date(m.date))));
    const monthsDiff = (newest.getFullYear() - oldest.getFullYear()) * 12 + (newest.getMonth() - oldest.getMonth()) + 1;
    memoriesPerMonthSpan.textContent = (allMemories.length / Math.max(monthsDiff, 1)).toFixed(1);
}

// ===== Update Achievements (FULLY POPULATED) =====
function updateAchievements() {
    const uniqueCities = new Set(allMemories.map(m => m.location.split(',')[0].trim()));
    const uniqueYears = new Set(allMemories.map(m => new Date(m.date).getFullYear()));
    const happyCount = allMemories.filter(m => m.mood === 'happy').length;
    const lovedCount = allMemories.filter(m => m.mood === 'loved').length;
    const photoCount = allMemories.filter(m => m.photos && m.photos.length > 0).length;
    
    const achievements = [
        { icon: "📸", name: "First Memory", desc: "Added your first memory", unlocked: allMemories.length >= 1, progress: 100 },
        { icon: "🏆", name: "Memory Collector", desc: "10 memories saved", unlocked: allMemories.length >= 10, progress: Math.min(100, (allMemories.length / 10) * 100) },
        { icon: "🌟", name: "Memory Master", desc: "50 memories saved", unlocked: allMemories.length >= 50, progress: Math.min(100, (allMemories.length / 50) * 100) },
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
            ${!ach.unlocked ? `<div class="achievement-progress"><div class="progress-bar" style="width: ${ach.progress}%"></div><span>${Math.floor(ach.progress)}%</span></div>` : '<div class="achievement-unlocked">✅ Unlocked!</div>'}
        </div>
    `).join('');
    
    document.getElementById('achievementsGrid').innerHTML = achievementsHtml;
}

// ===== Update Recent Activity (FULLY POPULATED) =====
function updateRecentActivity() {
    const recentMemories = [...allMemories].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
    
    const activityHtml = recentMemories.map(m => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="ri-map-pin-fill"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">Added "${m.title}"</div>
                <div class="activity-time">${new Date(m.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('activityList').innerHTML = activityHtml;
}

// ===== Update Favorite Places (FULLY POPULATED) =====
function updateFavoritePlaces() {
    const placeCounts = {};
    
    allMemories.forEach(m => {
        const place = m.location.split(',')[0].trim();
        placeCounts[place] = (placeCounts[place] || 0) + 1;
    });
    
    const sortedPlaces = Object.entries(placeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    const placesHtml = sortedPlaces.map(([place, count], index) => `
        <div class="favorite-place">
            <div class="place-rank">#${index + 1}</div>
            <div class="place-name">${place}</div>
            <div class="place-count">${count} memory${count > 1 ? 's' : ''}</div>
        </div>
    `).join('');
    
    document.getElementById('favoritePlaces').innerHTML = placesHtml;
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
    
    localStorage.setItem('memonap_profile', JSON.stringify(userProfile));
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
    
    localStorage.setItem('memonap_profile', JSON.stringify(userProfile));
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

// Close modals when clicking overlay
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
    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

// Close sidebar when clicking outside on mobile
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
// Add to profile.js - View All achievements/activities
function setupViewAllButtons() {
    // View all achievements
    const achievementsSection = document.querySelector('.achievements-grid');
    const viewAllAchievements = document.querySelector('.info-card:first-child .view-all');
    if (viewAllAchievements) {
        viewAllAchievements.addEventListener('click', (e) => {
            e.preventDefault();
            alert('🏆 All achievements are shown above! Keep adding memories to unlock more.');
        });
    }
    
    // View all activities
    const viewAllActivities = document.querySelector('.info-card:nth-child(2) .view-all');
    if (viewAllActivities) {
        viewAllActivities.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'timeline.html';
        });
    }
}

// Initialize
checkAuth();
loadData();

console.log('%c👤 Profile Page Loaded - All Sections Populated!', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');