// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');

// Step elements
const steps = document.querySelectorAll('.step');
const formSteps = document.querySelectorAll('.form-step');
const nextBtns = document.querySelectorAll('.btn-next');
const prevBtns = document.querySelectorAll('.btn-prev');

// Form fields
const titleInput = document.getElementById('memoryTitle');
const locationInput = document.getElementById('memoryLocation');
const dateInput = document.getElementById('memoryDate');
const moodOptions = document.querySelectorAll('.mood-option');
const storyTextarea = document.getElementById('memoryStory');
const songInput = document.getElementById('memorySong');
const withInput = document.getElementById('memoryWith');
const tagInput = document.getElementById('tagInput');
const tagsList = document.getElementById('tagsList');
const photoUploadArea = document.getElementById('photoUploadArea');
const photoInput = document.getElementById('photoInput');
const photoPreviewGrid = document.getElementById('photoPreviewGrid');
const recordBtn = document.getElementById('recordBtn');
const timeCapsuleCheckbox = document.getElementById('timeCapsuleCheckbox');
const timeCapsuleOptions = document.getElementById('timeCapsuleOptions');
const saveBtn = document.getElementById('saveMemoryBtn');

// Character counters
const titleCount = document.getElementById('titleCount');
const storyCount = document.getElementById('storyCount');

// Review content
const reviewContent = document.getElementById('reviewContent');

// Data storage
let tags = [];
let photos = [];
let currentStep = 1;
let selectedMood = 'happy';
let voiceNote = null;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// ===== Helper Functions =====
function updateCharCount(input, counter, max) {
    const length = input.value.length;
    counter.textContent = length;
    if (length > max) {
        input.value = input.value.substring(0, max);
        counter.textContent = max;
    }
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

// ===== Step Navigation =====
function updateStep(step) {
    currentStep = step;
    
    steps.forEach((s, index) => {
        if (index + 1 === step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
    
    formSteps.forEach((fs, index) => {
        if (index + 1 === step) {
            fs.classList.add('active');
        } else {
            fs.classList.remove('active');
        }
    });
    
    if (step === 3) {
        updateReview();
    }
}

function nextStep() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    updateStep(currentStep + 1);
}

function prevStep() {
    updateStep(currentStep - 1);
}

// ===== Step 1 Validation =====
function validateStep1() {
    if (!titleInput.value.trim()) {
        alert('Please enter a memory title');
        titleInput.focus();
        return false;
    }
    if (!locationInput.value.trim()) {
        alert('Please enter a location');
        locationInput.focus();
        return false;
    }
    if (!dateInput.value) {
        alert('Please select a date');
        dateInput.focus();
        return false;
    }
    return true;
}

function validateStep2() {
    return true;
}

// ===== Update Review Section =====
function updateReview() {
    const moodEmoji = {
        happy: '😊', peaceful: '😌', loved: '❤️', excited: '😎', nostalgic: '📸', sad: '😢'
    };
    
    reviewContent.innerHTML = `
        <div class="review-item">
            <div class="review-label">📝 Title</div>
            <div class="review-value">${escapeHtml(titleInput.value)}</div>
        </div>
        <div class="review-item">
            <div class="review-label">📍 Location</div>
            <div class="review-value">${escapeHtml(locationInput.value)}</div>
        </div>
        <div class="review-item">
            <div class="review-label">📅 Date</div>
            <div class="review-value">${dateInput.value ? new Date(dateInput.value).toLocaleDateString() : 'Not set'}</div>
        </div>
        <div class="review-item">
            <div class="review-label">😊 Mood</div>
            <div class="review-value">${moodEmoji[selectedMood]} ${selectedMood}</div>
        </div>
        ${withInput.value ? `
        <div class="review-item">
            <div class="review-label">👥 With</div>
            <div class="review-value">${escapeHtml(withInput.value)}</div>
        </div>
        ` : ''}
        ${tags.length > 0 ? `
        <div class="review-item">
            <div class="review-label">🏷️ Tags</div>
            <div class="review-value">#${tags.join(' #')}</div>
        </div>
        ` : ''}
        ${storyTextarea.value ? `
        <div class="review-item">
            <div class="review-label">📖 Story</div>
            <div class="review-value">${escapeHtml(storyTextarea.value.substring(0, 150))}${storyTextarea.value.length > 150 ? '...' : ''}</div>
        </div>
        ` : ''}
        ${photos.length > 0 ? `
        <div class="review-item">
            <div class="review-label">📸 Photos</div>
            <div class="review-value">${photos.length} photo(s)</div>
        </div>
        ` : ''}
        ${voiceNote ? `
        <div class="review-item">
            <div class="review-label">🎙️ Voice Note</div>
            <div class="review-value">Recorded ✓</div>
        </div>
        ` : ''}
    `;
}

// ===== Tags Functionality =====
function addTag(tag) {
    tag = tag.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
        tags.push(tag);
        renderTags();
    }
    tagInput.value = '';
}

function removeTag(tag) {
    tags = tags.filter(t => t !== tag);
    renderTags();
}

function renderTags() {
    tagsList.innerHTML = tags.map(tag => `
        <span class="tag">
            #${escapeHtml(tag)}
            <i class="ri-close-line remove-tag" data-tag="${tag}"></i>
        </span>
    `).join('');
    
    document.querySelectorAll('.remove-tag').forEach(el => {
        el.addEventListener('click', () => removeTag(el.dataset.tag));
    });
}

// ===== Photo Upload =====
function handlePhotoUpload(files) {
    Array.from(files).forEach(file => {
        if (photos.length >= 10) {
            alert('Maximum 10 photos allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Photo too large. Max 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            photos.push({
                data: e.target.result,
                name: file.name
            });
            renderPhotos();
        };
        reader.readAsDataURL(file);
    });
}

function removePhoto(index) {
    photos.splice(index, 1);
    renderPhotos();
}

function renderPhotos() {
    photoPreviewGrid.innerHTML = photos.map((photo, index) => `
        <div class="photo-preview">
            <img src="${photo.data}" alt="Preview">
            <div class="remove-photo" data-index="${index}">
                <i class="ri-close-line"></i>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.remove-photo').forEach(el => {
        el.addEventListener('click', () => removePhoto(parseInt(el.dataset.index)));
    });
}

// ===== Voice Recording =====
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const reader = new FileReader();
            reader.onload = () => {
                voiceNote = reader.result;
                const statusDiv = document.getElementById('recordingStatus');
                statusDiv.style.display = 'none';
                recordBtn.innerHTML = '<i class="ri-mic-line"></i> Voice Recorded ✓';
                recordBtn.style.background = '#27ae60';
            };
            reader.readAsDataURL(audioBlob);
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        const statusDiv = document.getElementById('recordingStatus');
        statusDiv.style.display = 'flex';
        recordBtn.innerHTML = '<i class="ri-stop-circle-line"></i> Stop Recording';
        
    } catch (err) {
        console.error('Microphone error:', err);
        alert('Unable to access microphone. Please check permissions.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
    }
}

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

// ===== Save Memory =====
function saveMemory() {
    if (!titleInput.value.trim()) {
        alert('Please enter a title');
        updateStep(1);
        return;
    }
    if (!locationInput.value.trim()) {
        alert('Please enter a location');
        updateStep(1);
        return;
    }
    if (!dateInput.value) {
        alert('Please select a date');
        updateStep(1);
        return;
    }
    
    const memory = {
        id: Date.now(),
        title: titleInput.value.trim(),
        location: locationInput.value.trim(),
        date: dateInput.value,
        mood: selectedMood,
        story: storyTextarea.value.trim(),
        with: withInput.value.trim(),
        song: songInput.value.trim(),
        tags: tags,
        photos: photos,
        voiceNote: voiceNote,
        timeCapsule: timeCapsuleCheckbox.checked,
        capsuleTime: timeCapsuleCheckbox.checked ? document.querySelector('input[name="capsuleTime"]:checked')?.value : null,
        isPublic: document.getElementById('publicCheckbox')?.checked || false,
        createdAt: new Date().toISOString()
    };
    
    const existingMemories = JSON.parse(localStorage.getItem('memonap_memories') || '[]');
    existingMemories.unshift(memory);
    localStorage.setItem('memonap_memories', JSON.stringify(existingMemories));
    
    alert('✨ Memory saved successfully!');
    window.location.href = 'dashboard.html';
}

// ===== Event Listeners =====
nextBtns.forEach(btn => btn.addEventListener('click', nextStep));
prevBtns.forEach(btn => btn.addEventListener('click', prevStep));

titleInput.addEventListener('input', () => updateCharCount(titleInput, titleCount, 100));
storyTextarea.addEventListener('input', () => updateCharCount(storyTextarea, storyCount, 5000));

moodOptions.forEach(option => {
    option.addEventListener('click', () => {
        moodOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedMood = option.dataset.mood;
        document.getElementById('memoryMood').value = selectedMood;
    });
});

tagInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTag(tagInput.value);
    }
});

document.querySelectorAll('.suggestion').forEach(suggestion => {
    suggestion.addEventListener('click', () => {
        locationInput.value = suggestion.textContent;
    });
});

photoUploadArea.addEventListener('click', () => photoInput.click());
photoInput.addEventListener('change', (e) => handlePhotoUpload(e.target.files));

photoUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    photoUploadArea.style.borderColor = '#ff6b8b';
});
photoUploadArea.addEventListener('dragleave', () => {
    photoUploadArea.style.borderColor = '#f0e0e4';
});
photoUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    photoUploadArea.style.borderColor = '#f0e0e4';
    handlePhotoUpload(e.dataTransfer.files);
});

recordBtn.addEventListener('click', toggleRecording);

timeCapsuleCheckbox.addEventListener('change', () => {
    timeCapsuleOptions.style.display = timeCapsuleCheckbox.checked ? 'block' : 'none';
});

saveBtn.addEventListener('click', saveMemory);

dateInput.value = new Date().toISOString().split('T')[0];
document.querySelector('.mood-option[data-mood="happy"]').classList.add('selected');

// ===== Sidebar Functions =====
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    window.location.href = 'login.html';
});

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

checkAuth();

console.log('%c📝 Add Memory Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');