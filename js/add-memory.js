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

// Location suggestions
const locationSuggestions = document.getElementById('locationSuggestions');

// Time Capsule Custom Elements
const customYearRadio = document.getElementById('customYearRadio');
const customYearInput = document.getElementById('customYearInput');
const customYearMessage = document.getElementById('customYearMessage');
const customYearDisplay = document.getElementById('customYearDisplay');

// Data storage
let tags = [];
let photos = [];
let currentStep = 1;
let selectedMood = 'happy';
let voiceNote = null;
let voiceNoteBlob = null;
let isRecording = false;
let isPlaying = false;
let mediaRecorder = null;
let audioChunks = [];
let searchTimeout = null;
let audioPlayer = null;
let editMemoryId = null;

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

function updateCharCount(input, counter, max) {
    const length = input.value.length;
    counter.textContent = length;
    if (length > max) {
        input.value = input.value.substring(0, max);
        counter.textContent = max;
    }
}

// ===== COMPRESS IMAGE BEFORE SAVING =====
function compressImage(dataUrl, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Determine format
            const isVideo = dataUrl.startsWith('data:video');
            if (isVideo) {
                resolve(dataUrl); // Can't compress video with canvas
                return;
            }
            
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
        };
        img.src = dataUrl;
    });
}

// ===== GET ACCURATE ADDRESS FROM NOMINATIM RESPONSE =====
function getAccurateAddress(item) {
    const address = item.address || {};
    
    let addressParts = [];
    
    if (item.name && item.name !== item.display_name.split(',')[0]) {
        addressParts.push(item.name);
    }
    
    if (address.house_number && address.road) {
        addressParts.push(`${address.house_number}, ${address.road}`);
    } else if (address.road) {
        addressParts.push(address.road);
    } else if (address.pedestrian) {
        addressParts.push(address.pedestrian);
    }
    
    if (address.neighbourhood) {
        addressParts.push(address.neighbourhood);
    } else if (address.suburb) {
        addressParts.push(address.suburb);
    } else if (address.city_district) {
        addressParts.push(address.city_district);
    } else if (address.district) {
        addressParts.push(address.district);
    }
    
    if (address.city) {
        addressParts.push(address.city);
    } else if (address.town) {
        addressParts.push(address.town);
    } else if (address.village) {
        addressParts.push(address.village);
    } else if (address.municipality) {
        addressParts.push(address.municipality);
    }
    
    if (address.county) {
        addressParts.push(address.county);
    } else if (address.state) {
        addressParts.push(address.state);
    } else if (address.state_district) {
        addressParts.push(address.state_district);
    } else if (address.region) {
        addressParts.push(address.region);
    }
    
    if (address.country) {
        addressParts.push(address.country);
    }
    
    if (addressParts.length === 0) {
        return item.display_name;
    }
    
    const uniqueParts = [];
    const seen = new Set();
    for (const part of addressParts) {
        if (!seen.has(part)) {
            seen.add(part);
            uniqueParts.push(part);
        }
    }
    
    return uniqueParts.join(', ');
}

// ===== GET SHORT DISPLAY NAME =====
function getShortName(item) {
    const address = item.address || {};
    
    if (item.name) return item.name;
    if (address.neighbourhood) return address.neighbourhood;
    if (address.suburb) return address.suburb;
    if (address.city) return address.city;
    if (address.town) return address.town;
    if (address.village) return address.village;
    if (address.county) return address.county;
    if (address.state) return address.state;
    if (address.country) return address.country;
    
    return item.display_name.split(',')[0] || item.display_name;
}

// ===== GET EMOJI BASED ON LOCATION TYPE =====
function getLocationEmoji(item) {
    const type = item.type || '';
    const category = item.category || '';
    
    if (item.name && ['Taj Mahal', 'Eiffel Tower', 'Burj Khalifa', 'Statue of Liberty', 'Big Ben', 'Colosseum'].some(name => 
        item.name.includes(name) || item.display_name.includes(name)
    )) return '🗿';
    
    if (type === 'city' || type === 'city_district' || type === 'administrative') return '🏙️';
    if (type === 'country' || type === 'state') return '🌍';
    if (type === 'state') return '🏛️';
    if (type === 'neighbourhood' || type === 'suburb' || type === 'hamlet') return '🏘️';
    if (type === 'village') return '🌄';
    if (type === 'beach') return '🏖️';
    if (type === 'attraction' || type === 'tourist' || type === 'museum') return '🗿';
    if (type === 'mountain' || type === 'peak' || type === 'hill') return '🏔️';
    if (type === 'river' || type === 'water' || type === 'lake' || type === 'bay') return '🌊';
    if (type === 'park' || type === 'forest' || type === 'wood' || type === 'nature_reserve') return '🌳';
    if (type === 'restaurant' || type === 'cafe' || type === 'bar' || type === 'fast_food') return '🍽️';
    if (type === 'hotel' || type === 'guest_house' || type === 'hostel') return '🏨';
    if (type === 'hospital' || type === 'clinic' || type === 'doctors') return '🏥';
    if (type === 'school' || type === 'college' || type === 'university') return '🏫';
    if (type === 'church' || type === 'temple' || type === 'mosque' || type === 'cathedral') return '⛪';
    if (type === 'railway' || type === 'station' || type === 'stop') return '🚉';
    if (type === 'airport') return '✈️';
    if (type === 'shop' || type === 'supermarket' || type === 'mall') return '🛍️';
    if (type === 'cinema' || type === 'theatre') return '🎬';
    if (type === 'sports_centre' || type === 'stadium' || type === 'golf_course') return '🏟️';
    if (type === 'zoo' || type === 'aquarium') return '🐾';
    if (type === 'island') return '🏝️';
    
    if (category === 'amenity') return '📍';
    if (category === 'shop') return '🛍️';
    if (category === 'tourism') return '🗿';
    if (category === 'historic') return '🏛️';
    if (category === 'leisure') return '🎯';
    if (category === 'sport') return '⚽';
    
    return '📍';
}

// ===== GET COORDINATES =====
async function getCoordinates(address) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        const data = await response.json();
        if (data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// ===== LOCATION AUTOCOMPLETE =====
async function fetchLocationSuggestions(query) {
    if (!query || query.length < 2) {
        locationSuggestions.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&extratags=1&namedetails=1`
        );
        const data = await response.json();

        if (data.length === 0) {
            locationSuggestions.style.display = 'none';
            return;
        }

        locationSuggestions.innerHTML = data.map(item => {
            const fullAddress = getAccurateAddress(item);
            const shortName = getShortName(item);
            const emoji = getLocationEmoji(item);
            const country = item.address?.country || '';
            
            return `
                <div class="suggestion-item" data-name="${escapeHtml(fullAddress)}" data-lat="${item.lat}" data-lon="${item.lon}" data-display="${escapeHtml(shortName)}">
                    <div class="suggestion-emoji">${emoji}</div>
                    <div class="suggestion-name">${escapeHtml(shortName)}</div>
                    <div class="suggestion-country">${escapeHtml(country)}</div>
                </div>
            `;
        }).join('');

        locationSuggestions.style.display = 'block';

        document.querySelectorAll('#locationSuggestions .suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                locationInput.value = item.dataset.name;
                locationInput.dataset.lat = item.dataset.lat;
                locationInput.dataset.lon = item.dataset.lon;
                locationSuggestions.style.display = 'none';
            });
        });

    } catch (error) {
        console.error('Error fetching location suggestions:', error);
        locationSuggestions.style.display = 'none';
    }
}

function updateLocationSuggestions() {
    const query = locationInput.value.trim();
    
    if (query.length < 2) {
        locationSuggestions.style.display = 'none';
        return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchLocationSuggestions(query);
    }, 400);
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
            <div class="review-value"><span style="color: #27ae60;">✓ Recorded</span></div>
        </div>
        ` : ''}
    `;
}

// ===== Tags =====
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

// ===== Media Upload with Compression =====
async function handleMediaUpload(files) {
    const maxFiles = 5; // Reduced to save space
    
    for (const file of Array.from(files)) {
        if (photos.length >= maxFiles) {
            alert(`Maximum ${maxFiles} files allowed`);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('File too large. Max 10MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                let dataUrl = e.target.result;
                
                // Compress images (but not videos)
                if (file.type.startsWith('image/')) {
                    dataUrl = await compressImage(dataUrl, 800, 800, 0.7);
                }
                
                photos.push({
                    data: dataUrl,
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                renderPhotos();
            } catch (err) {
                console.error('Compression error:', err);
                // Fallback: save uncompressed
                photos.push({
                    data: e.target.result,
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                renderPhotos();
            }
        };
        reader.readAsDataURL(file);
    }
}

function removePhoto(index) {
    photos.splice(index, 1);
    renderPhotos();
}

function renderPhotos() {
    photoPreviewGrid.innerHTML = photos.map((media, index) => {
        const isVideo = media.type && media.type.startsWith('video/');
        return `
            <div class="photo-preview">
                ${isVideo ? `
                    <video src="${media.data}" muted style="width: 100%; height: 100%; object-fit: cover;"></video>
                    <div class="video-badge">🎬</div>
                ` : `
                    <img src="${media.data}" alt="Preview">
                `}
                <div class="remove-photo" data-index="${index}">
                    <i class="ri-close-line"></i>
                </div>
                <div class="media-type-badge">${isVideo ? 'VIDEO' : 'PHOTO'}</div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.remove-photo').forEach(el => {
        el.addEventListener('click', () => removePhoto(parseInt(el.dataset.index)));
    });
}

// ============================================
// VOICE RECORDING
// ============================================

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
            voiceNoteBlob = audioBlob;
            
            const reader = new FileReader();
            reader.onload = () => {
                voiceNote = reader.result;
                updateVoiceUI();
            };
            reader.readAsDataURL(audioBlob);
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        updateVoiceUI();
        
    } catch (err) {
        console.error('Microphone error:', err);
        alert('Unable to access microphone. Please check permissions.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        updateVoiceUI();
    }
}

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function playVoiceNote(audioData) {
    if (isPlaying) {
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            isPlaying = false;
            updateVoiceUI();
        }
        return;
    }
    
    if (!audioData && !voiceNoteBlob) {
        alert('No voice note to play. Please record first.');
        return;
    }
    
    try {
        const audioSrc = voiceNoteBlob ? URL.createObjectURL(voiceNoteBlob) : audioData;
        audioPlayer = new Audio(audioSrc);
        
        audioPlayer.onplay = () => {
            isPlaying = true;
            updateVoiceUI();
        };
        
        audioPlayer.onended = () => {
            isPlaying = false;
            updateVoiceUI();
            if (voiceNoteBlob) {
                URL.revokeObjectURL(audioSrc);
            }
        };
        
        audioPlayer.onerror = () => {
            isPlaying = false;
            updateVoiceUI();
            alert('Error playing voice note.');
        };
        
        audioPlayer.play();
    } catch (err) {
        console.error('Playback error:', err);
        alert('Error playing voice note.');
    }
}

function updateVoiceUI() {
    const statusDiv = document.getElementById('recordingStatus');
    const voiceControls = document.getElementById('voiceControls');
    
    if (isRecording) {
        if (recordBtn) {
            recordBtn.innerHTML = '<i class="ri-stop-circle-line"></i> Stop Recording';
            recordBtn.style.background = '#e74c3c';
        }
        if (statusDiv) {
            statusDiv.style.display = 'flex';
        }
        if (voiceControls) {
            voiceControls.style.display = 'none';
        }
    } else if (voiceNote) {
        if (recordBtn) {
            recordBtn.innerHTML = '<i class="ri-mic-line"></i> Re-record';
            recordBtn.style.background = '#ff6b8b';
        }
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
        if (voiceControls) {
            voiceControls.style.display = 'flex';
            const playBtn = voiceControls.querySelector('.play-btn');
            if (playBtn) {
                playBtn.innerHTML = isPlaying ? '<i class="ri-pause-fill"></i>' : '<i class="ri-play-fill"></i>';
            }
        }
    } else {
        if (recordBtn) {
            recordBtn.innerHTML = '<i class="ri-mic-line"></i> Record Voice';
            recordBtn.style.background = 'linear-gradient(135deg, #ff6b8b, #ffb347)';
        }
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
        if (voiceControls) {
            voiceControls.style.display = 'none';
        }
    }
}

function createVoiceControls() {
    const voiceRecorder = document.querySelector('.voice-recorder');
    if (!voiceRecorder) return;
    
    const existingControls = document.getElementById('voiceControls');
    if (existingControls) existingControls.remove();
    
    const controls = document.createElement('div');
    controls.id = 'voiceControls';
    controls.style.cssText = `
        display: none;
        align-items: center;
        gap: 1rem;
        margin-top: 0.8rem;
        padding: 0.8rem 1.2rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        border: 1px solid rgba(255, 107, 139, 0.15);
    `;
    
    controls.innerHTML = `
        <button class="play-btn" style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #ff6b8b, #ffb347);
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        ">
            <i class="ri-play-fill"></i>
        </button>
        <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 0.8rem; color: #888;">🎙️ Voice Note</span>
                <span style="font-size: 0.6rem; color: #27ae60; background: rgba(39, 174, 96, 0.1); padding: 2px 8px; border-radius: 20px;">Ready</span>
            </div>
            <div style="height: 4px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-top: 4px; overflow: hidden;">
                <div class="voice-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ff6b8b, #ffb347); border-radius: 4px; transition: width 0.1s;"></div>
            </div>
        </div>
        <button class="delete-voice-btn" style="
            background: none;
            border: none;
            color: #e74c3c;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 4px;
        ">
            <i class="ri-delete-bin-line"></i>
        </button>
    `;
    
    voiceRecorder.appendChild(controls);
    
    const playBtn = controls.querySelector('.play-btn');
    const deleteBtn = controls.querySelector('.delete-voice-btn');
    const progressBar = controls.querySelector('.voice-progress');
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (voiceNote) {
                playVoiceNote(voiceNote);
            }
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Delete this voice note?')) {
                voiceNote = null;
                voiceNoteBlob = null;
                updateVoiceUI();
                if (progressBar) progressBar.style.width = '0%';
                if (playBtn) playBtn.innerHTML = '<i class="ri-play-fill"></i>';
            }
        });
    }
    
    window.voiceProgressBar = progressBar;
}

function updateVoiceProgress(progress) {
    const progressBar = window.voiceProgressBar;
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

// ===== Update Custom Year Display =====
function updateCustomYearDisplay() {
    const years = parseInt(customYearInput?.value) || 0;
    if (customYearDisplay) customYearDisplay.textContent = years;
}

// ============================================
// SAVE MEMORY - WITH STORAGE CHECK
// ============================================

function getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length * 2; // UTF-16
        }
    }
    return total / (1024 * 1024); // MB
}

function checkStorageSpace() {
    const used = getStorageSize();
    const limit = 5; // 5MB safe limit
    if (used > limit) {
        alert(`⚠️ Storage is ${used.toFixed(1)}MB. Please clear some old memories or export and delete them.`);
        return false;
    }
    return true;
}

async function saveMemory() {
    // Validate
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
    
    // Check storage space
    if (!checkStorageSpace()) {
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
        // Get user ID
        const userEmail = sessionStorage.getItem('userEmail') || 'guest';
        const userId = userEmail;
        const memoriesKey = `memonap_memories_${userId}`;
        
        // Get existing memories
        let existingMemories = [];
        try {
            existingMemories = JSON.parse(localStorage.getItem(memoriesKey) || '[]');
        } catch (e) {
            existingMemories = [];
        }
        
        // Limit total memories to prevent storage issues
        if (existingMemories.length >= 50) {
            alert('⚠️ You have 50+ memories. Please export and delete some old ones to free up space.');
            saveBtn.disabled = false;
            saveBtn.textContent = editMemoryId ? 'Update Memory' : 'Save Memory';
            return;
        }
        
        // Get coordinates
        let coordinates = null;
        if (locationInput.dataset.lat && locationInput.dataset.lon) {
            coordinates = {
                lat: parseFloat(locationInput.dataset.lat),
                lng: parseFloat(locationInput.dataset.lon)
            };
        } else {
            coordinates = await getCoordinates(locationInput.value.trim());
        }
        
        // Get capsule time
        let capsuleTimeValue = null;
        if (timeCapsuleCheckbox.checked) {
            const selectedRadio = document.querySelector('input[name="capsuleTime"]:checked');
            if (selectedRadio) {
                if (selectedRadio.value === 'custom') {
                    capsuleTimeValue = parseInt(customYearInput?.value) || 1;
                    if (capsuleTimeValue < 1) capsuleTimeValue = 1;
                    if (capsuleTimeValue > 50) capsuleTimeValue = 50;
                } else {
                    capsuleTimeValue = parseInt(selectedRadio.value);
                }
            } else {
                capsuleTimeValue = 1;
            }
        }
        
        // Prepare memory data
        const memory = {
            id: Date.now(),
            title: titleInput.value.trim(),
            location: locationInput.value.trim(),
            date: dateInput.value,
            mood: selectedMood,
            content: storyTextarea.value.trim(),
            with: withInput.value.trim(),
            song: songInput.value.trim(),
            tags: tags,
            photos: photos,
            voiceNote: voiceNote,
            timeCapsule: timeCapsuleCheckbox.checked,
            capsuleTime: capsuleTimeValue,
            isPublic: document.getElementById('publicCheckbox')?.checked || false,
            userId: userId,
            userEmail: userEmail,
            createdAt: new Date().toISOString(),
            coordinates: coordinates,
            lat: coordinates?.lat || null,
            lng: coordinates?.lng || null
        };
        
        if (editMemoryId) {
            const index = existingMemories.findIndex(m => String(m.id) === String(editMemoryId));
            if (index !== -1) {
                memory.id = parseInt(editMemoryId);
                existingMemories[index] = memory;
            }
        } else {
            existingMemories.unshift(memory);
        }
        
        localStorage.setItem(memoriesKey, JSON.stringify(existingMemories));
        
        alert(`✨ Memory saved successfully!${memory.timeCapsule ? ` It will unlock after ${memory.capsuleTime} year(s).` : ''}`);
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('❌ Save error:', error);
        
        if (error.name === 'QuotaExceededError') {
            alert('⚠️ Storage full! Please clear some old memories.\n\nSuggestions:\n1. Delete old memories\n2. Export memories and clear localStorage\n3. Use smaller images');
        } else {
            alert('Error saving memory: ' + error.message);
        }
        
        saveBtn.disabled = false;
        saveBtn.textContent = editMemoryId ? 'Update Memory' : 'Save Memory';
    }
}

// ============================================
// LOAD MEMORY FOR EDITING
// ============================================

function loadMemoryForEdit() {
    const params = new URLSearchParams(window.location.search);
    editMemoryId = params.get('edit');
    
    if (!editMemoryId) return;
    
    try {
        const userEmail = sessionStorage.getItem('userEmail') || 'guest';
        const userId = userEmail;
        const memoriesKey = `memonap_memories_${userId}`;
        const memories = JSON.parse(localStorage.getItem(memoriesKey) || '[]');
        const memory = memories.find(m => String(m.id) === String(editMemoryId));
        
        if (!memory) {
            alert('Memory not found.');
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Fill form
        titleInput.value = memory.title || '';
        locationInput.value = memory.location || '';
        if (memory.lat && memory.lng) {
            locationInput.dataset.lat = memory.lat;
            locationInput.dataset.lon = memory.lng;
        }
        dateInput.value = memory.date || '';
        selectedMood = memory.mood || 'happy';
        storyTextarea.value = memory.content || '';
        withInput.value = memory.with || '';
        songInput.value = memory.song || '';
        
        moodOptions.forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.mood === selectedMood) {
                opt.classList.add('selected');
            }
        });
        document.getElementById('memoryMood').value = selectedMood;
        
        tags = memory.tags || [];
        renderTags();
        
        if (memory.timeCapsule) {
            timeCapsuleCheckbox.checked = true;
            timeCapsuleOptions.style.display = 'block';
            if (memory.capsuleTime) {
                const radio = document.querySelector(`input[name="capsuleTime"][value="${memory.capsuleTime}"]`);
                if (radio) {
                    radio.checked = true;
                } else {
                    customYearRadio.checked = true;
                    customYearInput.value = memory.capsuleTime;
                    customYearInput.disabled = false;
                    customYearMessage.style.display = 'block';
                    updateCustomYearDisplay();
                }
            }
        }
        
        if (memory.photos && memory.photos.length > 0) {
            photos = memory.photos;
            renderPhotos();
        }
        
        if (memory.voiceNote) {
            voiceNote = memory.voiceNote;
            updateVoiceUI();
        }
        
        saveBtn.textContent = 'Update Memory';
        document.querySelector('h2').textContent = '✏️ Edit Memory';
        
        console.log('✅ Memory loaded for edit:', editMemoryId);
        
    } catch (error) {
        console.error('❌ Load error:', error);
        alert('Error loading memory: ' + error.message);
    }
}

// ===== Check Auth =====
function checkAuth() {
    const userEmail = sessionStorage.getItem('userEmail');
    const userName = sessionStorage.getItem('userName');
    
    if (!sessionStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    
    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }
    
    return true;
}

// ===== Time Capsule Custom Year =====
function setupTimeCapsuleCustomYear() {
    if (!customYearRadio) return;
    
    customYearRadio.addEventListener('change', () => {
        if (customYearRadio.checked) {
            if (customYearInput) customYearInput.disabled = false;
            if (customYearMessage) customYearMessage.style.display = 'block';
            updateCustomYearDisplay();
        } else {
            if (customYearInput) customYearInput.disabled = true;
            if (customYearMessage) customYearMessage.style.display = 'none';
        }
    });
    
    if (customYearInput) {
        customYearInput.addEventListener('input', () => {
            let years = parseInt(customYearInput.value);
            if (isNaN(years) || years < 1) years = 1;
            if (years > 50) years = 50;
            customYearInput.value = years;
            updateCustomYearDisplay();
        });
    }
    
    const otherRadios = document.querySelectorAll('input[name="capsuleTime"]:not(#customYearRadio)');
    otherRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                if (customYearInput) customYearInput.disabled = true;
                if (customYearMessage) customYearMessage.style.display = 'none';
            }
        });
    });
    
    if (timeCapsuleCheckbox) {
        timeCapsuleCheckbox.addEventListener('change', () => {
            if (timeCapsuleCheckbox.checked) {
                if (timeCapsuleOptions) timeCapsuleOptions.style.display = 'block';
            } else {
                if (timeCapsuleOptions) timeCapsuleOptions.style.display = 'none';
                otherRadios.forEach(radio => radio.checked = false);
                if (customYearRadio) customYearRadio.checked = false;
                if (customYearInput) {
                    customYearInput.disabled = true;
                    customYearInput.value = '';
                }
                if (customYearMessage) customYearMessage.style.display = 'none';
            }
        });
    }
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

locationInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(updateLocationSuggestions, 300);
});

document.addEventListener('click', (e) => {
    if (!locationInput?.contains(e.target) && !locationSuggestions?.contains(e.target)) {
        if (locationSuggestions) locationSuggestions.style.display = 'none';
    }
});

photoUploadArea.addEventListener('click', () => photoInput.click());
photoInput.addEventListener('change', (e) => handleMediaUpload(e.target.files));

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
    handleMediaUpload(e.dataTransfer.files);
});

recordBtn.addEventListener('click', toggleRecording);

setTimeout(createVoiceControls, 100);

setInterval(() => {
    if (audioPlayer && isPlaying && !audioPlayer.paused) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        updateVoiceProgress(progress);
    }
}, 100);

saveBtn.addEventListener('click', saveMemory);

if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

const defaultMood = document.querySelector('.mood-option[data-mood="happy"]');
if (defaultMood) defaultMood.classList.add('selected');

// ===== Sidebar =====
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        sessionStorage.clear();
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

// ============================================
// INITIALIZE
// ============================================

function init() {
    console.log('📝 Add Memory Page Initializing...');
    
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userName = sessionStorage.getItem('userName');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }
    
    loadMemoryForEdit();
    setupTimeCapsuleCustomYear();
    
    console.log('✅ Add Memory Page Ready');
}

init();

console.log('%c📝 Add Memory Page Loaded (Optimized)', 'color: #ff6b8b; font-size: 14px; font-weight: bold');