// Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'white';
            navLinks.style.padding = '2rem';
            navLinks.style.gap = '1.5rem';
            navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        }
    });
}

// Smooth Scrolling
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
        if (window.innerWidth <= 900) {
            navLinks.style.display = 'none';
        }
    });
});

// Button Alerts
document.querySelectorAll('.login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('🔐 Login page coming soon!');
    });
});

document.querySelectorAll('.signup-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('📝 Sign up page coming soon!');
    });
});

document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('🗺️ Start your memory journey!');
    });
});

// Stats Counter Animation
const statNumbers = document.querySelectorAll('.stat-item h2');
let counted = false;

function startCounter() {
    if (counted) return;
    statNumbers.forEach(stat => {
        const text = stat.innerText;
        const target = parseInt(text);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.innerText = text;
                clearInterval(timer);
            } else {
                stat.innerText = Math.floor(current) + '+';
            }
        }, 25);
    });
    counted = true;
}

const statsSection = document.querySelector('.stats');
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        startCounter();
        observer.disconnect();
    }
}, { threshold: 0.5 });

if (statsSection) {
    observer.observe(statsSection);
}

// Console Message
console.log('✨ MemoMap is ready!');
console.log('📍 Every Place Has a Story');