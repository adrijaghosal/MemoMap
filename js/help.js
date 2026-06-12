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

// ===== FAQ Accordion =====
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        item.classList.toggle('active');
    });
});

// ===== Search Functionality =====
function searchFAQs() {
    const searchTerm = searchInput.value.toLowerCase();
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
        
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
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
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterByCategory(btn.dataset.category);
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
    
    // Add user message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-message user';
    userMsgDiv.innerHTML = `
        <span class="chat-avatar">👤</span>
        <p>${escapeHtml(message)}</p>
    `;
    chatMessages.appendChild(userMsgDiv);
    
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate bot response
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
    
    // Store feedback
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

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', closeLiveChat);
});

// ===== Sidebar Functions =====
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
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
    const userName = sessionStorage.getItem('userName');
    if (userName) {
        document.getElementById('sidebarUserName').textContent = userName;
    }
}

checkAuth();

console.log('%c❓ Help & Support Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');