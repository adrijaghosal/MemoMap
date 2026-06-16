// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.demo-nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(255, 255, 255, 0.98)';
        nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = 'none';
    }
});

// ===== Animate Stats on Scroll =====
const stats = document.querySelectorAll('.hero-stats .stat strong');
let counted = false;

function animateStats() {
    if (counted) return;
    stats.forEach(stat => {
        const text = stat.textContent;
        const target = parseInt(text);
        let current = 0;
        const increment = target / 40;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = text;
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 30);
    });
    counted = true;
}

const heroSection = document.querySelector('.demo-hero');
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        animateStats();
        observer.disconnect();
    }
}, { threshold: 0.5 });

if (heroSection) {
    observer.observe(heroSection);
}

// ===== Pin Hover Effect =====
document.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.2)';
        this.style.transition = 'transform 0.3s';
    });
    pin.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    pin.addEventListener('click', function() {
        const label = this.querySelector('.pin-label');
        if (label) {
            alert(`📍 You clicked on ${label.textContent}!\n\nThis is how you'll view your memories on the map.`);
        }
    });
});

// ===== Memory Card Click =====
document.querySelectorAll('.demo-memory-card, .demo-memory-item, .timeline-demo-item').forEach(card => {
    card.addEventListener('click', function() {
        const title = this.querySelector('h4')?.textContent || 'Memory';
        alert(`📌 "${title}"\n\nThis is how your memories will appear in MemoMap. Click to view full details!`);
    });
});

// ===== Collection Card Click =====
document.querySelectorAll('.demo-collection-card').forEach(card => {
    card.addEventListener('click', function() {
        const name = this.querySelector('h4')?.textContent || 'Collection';
        alert(`📁 "${name}"\n\nCollections help you organize your memories by theme!`);
    });
});

// ===== Diary Entry Click =====
document.querySelectorAll('.diary-entry-demo').forEach(entry => {
    entry.addEventListener('click', function() {
        alert(`📖 "${this.querySelector('h4')?.textContent || 'Diary Entry'}"\n\nYour digital diary keeps your thoughts and feelings safe.`);
    });
});

// ===== Nostalgia Item Click =====
document.querySelectorAll('.nostalgia-item-demo').forEach(item => {
    item.addEventListener('click', function() {
        const title = this.querySelector('h4')?.textContent || 'Nostalgia';
        alert(`🎞️ "${title}"\n\nNostalgia corner helps you rediscover forgotten memories!`);
    });
});

// ===== Profile Badge Click =====
document.querySelectorAll('.badge-demo').forEach(badge => {
    badge.addEventListener('click', function() {
        alert(`🏆 "${this.textContent}"\n\nEarn achievements as you add more memories!`);
    });
});

// ===== Feature Points Animation =====
const points = document.querySelectorAll('.point');
const pointObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }, index * 100);
            pointObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

points.forEach(point => {
    point.style.opacity = '0';
    point.style.transform = 'translateX(-20px)';
    point.style.transition = 'all 0.5s ease';
    pointObserver.observe(point);
});

console.log('%c🎬 MemoMap Demo Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold');
console.log('%c🗺️ Explore all features and see how MemoMap works!', 'color: #888; font-size: 12px;');