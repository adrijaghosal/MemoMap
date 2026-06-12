// Demo credentials (for testing)
const DEMO_USER = {
    email: "demo@memonap.com",
    password: "demo123"
};

// Get DOM elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const googleBtn = document.getElementById('googleBtn');
const rememberCheckbox = document.getElementById('rememberMe');
const togglePassword = document.getElementById('togglePassword');

// Create message container if not exists
let messageDiv = document.querySelector('.error-message');
if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    const authForm = document.querySelector('.auth-form');
    authForm.insertBefore(messageDiv, authForm.firstChild);
}

let successDiv = document.querySelector('.success-message');
if (!successDiv) {
    successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    const authForm = document.querySelector('.auth-form');
    authForm.insertBefore(successDiv, authForm.firstChild);
}

// Toggle password visibility
if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('ri-eye-line');
        togglePassword.classList.toggle('ri-eye-off-line');
    });
}

// Show message function
function showMessage(message, isError = true) {
    if (isError) {
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        successDiv.style.display = 'none';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    } else {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        messageDiv.style.display = 'none';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 2000);
    }
}

// Save to localStorage if remember me checked
function saveCredentials(email, password) {
    if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', btoa(password));
    } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
    }
}

// Load saved credentials
function loadSavedCredentials() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
        emailInput.value = savedEmail;
        passwordInput.value = atob(savedPassword);
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

// Handle login
function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage('Please enter both email and password');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showMessage('Please enter a valid email address');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters');
        return;
    }

    loginBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Signing in...';
    loginBtn.disabled = true;

    setTimeout(() => {
        if (email === DEMO_USER.email && password === DEMO_USER.password) {
            saveCredentials(email, password);
            showMessage('Login successful! Redirecting...', false);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showMessage('Invalid email or password. Try: demo@memonap.com / demo123');
            loginBtn.innerHTML = '<span>Sign In</span><i class="ri-arrow-right-line"></i>';
            loginBtn.disabled = false;
        }
    }, 1000);
}

// Google sign in handler
function handleGoogleLogin() {
    googleBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Connecting...';
    googleBtn.disabled = true;

    setTimeout(() => {
        showMessage('Google Sign In coming soon! Firebase integration in progress.', false);
        googleBtn.innerHTML = '<i class="ri-google-fill"></i><span>Sign in with Google</span>';
        googleBtn.disabled = false;
        emailInput.value = DEMO_USER.email;
        passwordInput.value = DEMO_USER.password;
    }, 1000);
}

// Event listeners
loginBtn.addEventListener('click', handleLogin);
googleBtn.addEventListener('click', handleGoogleLogin);

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

loadSavedCredentials();

console.log('%c🔐 MemoMap Login Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');
console.log('%c📝 Demo Credentials: demo@memonap.com / demo123', 'color: #888; font-size: 12px;');