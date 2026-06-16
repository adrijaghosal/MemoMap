// ===== DOM Elements =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.category-btn');
const faqItems = document.querySelectorAll('.faq-item');
const emailSupportBtn = document.getElementById('emailSupportBtn');
const liveChatBtn = document.getElementById('liveChatBtn');
const feedbackBtns = document.querySelectorAll('.feedback-btn');

// Chat Modal
const chatModal = document.getElementById('chatModal');
const closeChatModal = document.getElementById('closeChatModal');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatMessages = document.getElementById('chatMessages');

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

// ===== FAQ Accordion =====
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
        question.addEventListener('click', function(e) {
            e.stopPropagation();
            faqItems.forEach(other => {
                if (other !== item && other.classList.contains('active')) {
                    other.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    }
});

// ===== Search Functionality =====
function searchFAQs() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span')?.textContent.toLowerCase() || '';
        const answer = item.querySelector('.faq-answer')?.textContent.toLowerCase() || '';
        
        if (searchTerm === '' || question.includes(searchTerm) || answer.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

searchInput.addEventListener('input', searchFAQs);

// ===== Category Filter =====
function filterByCategory(category) {
    faqItems.forEach(item => {
        const itemCategory = item.dataset.category;
        if (category === 'all' || itemCategory === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        categoryBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const category = this.dataset.category;
        filterByCategory(category);
        if (searchInput) {
            searchInput.value = '';
        }
    });
});

// ===== Email Support =====
function emailSupport() {
    window.location.href = 'mailto:support@memonap.com?subject=MemoMap%20Support%20Request';
}

// ===== Live Chat =====
function openLiveChat() {
    chatModal.classList.add('active');
}

function closeLiveChat() {
    chatModal.classList.remove('active');
}

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-message user';
    userMsgDiv.innerHTML = `
        <span class="chat-avatar">👤</span>
        <p>${escapeHtml(message)}</p>
    `;
    chatMessages.appendChild(userMsgDiv);
    
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    setTimeout(() => {
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'chat-message bot';
        botMsgDiv.innerHTML = `
            <span class="chat-avatar">🤖</span>
            <p>Thanks for reaching out! Our team will get back to you soon. Meanwhile, you can check our FAQ section for answers.</p>
        `;
        chatMessages.appendChild(botMsgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ===== Feedback =====
function sendFeedback(type) {
    const message = type === 'yes' ? 'Thank you for your feedback! 😊' : 'Sorry it wasn\'t helpful. We\'ll improve!';
    alert(message);
    
    let feedback = JSON.parse(localStorage.getItem('memonap_feedback') || '[]');
    feedback.push({ type: type, date: new Date().toISOString() });
    localStorage.setItem('memonap_feedback', JSON.stringify(feedback));
}

// ===== Event Listeners =====
emailSupportBtn.addEventListener('click', emailSupport);
liveChatBtn.addEventListener('click', openLiveChat);
closeChatModal.addEventListener('click', closeLiveChat);
sendChatBtn.addEventListener('click', sendChatMessage);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

feedbackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sendFeedback(btn.dataset.feedback);
    });
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', closeLiveChat);
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

// ===== Initialize =====
checkAuth();

console.log('%c❓ Help & Support Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold');