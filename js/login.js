// ============================================
// MEMOMAP - LOGIN PAGE SCRIPT
// ============================================

// Get DOM elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const googleBtn = document.getElementById('googleBtn');
const rememberCheckbox = document.getElementById('rememberMe');
const togglePassword = document.getElementById('togglePassword');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
const authMessageDiv = document.getElementById('authMessage');

// Message helper
function showMessage(message, isError = true) {
    if (authMessageDiv) {
        authMessageDiv.textContent = message;
        authMessageDiv.className = `message ${isError ? 'message-error' : 'message-success'}`;
        authMessageDiv.style.display = 'block';
        setTimeout(() => {
            authMessageDiv.style.display = 'none';
        }, 4000);
    }
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

// Save credentials if "Remember me" is checked
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
    if (savedEmail && savedPassword && emailInput && passwordInput) {
        emailInput.value = savedEmail;
        passwordInput.value = atob(savedPassword);
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

// Handle login with Firebase
async function handleLogin() {
    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
        showMessage('Please enter both email and password', true);
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showMessage('Please enter a valid email address', true);
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', true);
        return;
    }

    // Show loading state
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Signing in...';
        loginBtn.disabled = true;
    }

    try {
        // Call Firebase signIn function from auth.js
        const result = await signIn(email, password);
        
        if (result) {
            saveCredentials(email, password);
            showMessage('Login successful! Redirecting...', false);
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            // Reset button
            if (loginBtn) {
                loginBtn.innerHTML = '<span>Sign In</span><i class="ri-arrow-right-line"></i>';
                loginBtn.disabled = false;
            }
        }
    } catch (error) {
        showMessage(error.message || 'Login failed. Please try again.', true);
        if (loginBtn) {
            loginBtn.innerHTML = '<span>Sign In</span><i class="ri-arrow-right-line"></i>';
            loginBtn.disabled = false;
        }
    }
}

// Handle Google Sign In
async function handleGoogleLogin() {
    if (googleBtn) {
        googleBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Connecting...';
        googleBtn.disabled = true;
    }

    try {
        const result = await signInWithGoogle();
        
        if (result) {
            showMessage('Google sign in successful! Redirecting...', false);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            if (googleBtn) {
                googleBtn.innerHTML = '<i class="ri-google-fill"></i><span>Sign in with Google</span>';
                googleBtn.disabled = false;
            }
        }
    } catch (error) {
        showMessage(error.message || 'Google sign in failed. Please try again.', true);
        if (googleBtn) {
            googleBtn.innerHTML = '<i class="ri-google-fill"></i><span>Sign in with Google</span>';
            googleBtn.disabled = false;
        }
    }
}

// Handle Forgot Password
async function handleForgotPassword() {
    const email = emailInput?.value.trim();
    
    if (!email) {
        showMessage('Please enter your email address to reset password', true);
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        showMessage('Please enter a valid email address', true);
        return;
    }
    
    try {
        const result = await resetPassword(email);
        if (result) {
            showMessage('Password reset email sent! Check your inbox.', false);
        }
    } catch (error) {
        showMessage(error.message || 'Failed to send reset email. Please try again.', true);
    }
}

// Enter key support
if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
}

if (emailInput) {
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (passwordInput) passwordInput.focus();
        }
    });
}

// Event listeners
if (loginBtn) loginBtn.addEventListener('click', handleLogin);
if (googleBtn) googleBtn.addEventListener('click', handleGoogleLogin);
if (forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', handleForgotPassword);

// Load saved credentials on page load
loadSavedCredentials();

// Check if already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
});

console.log('%c🔐 MemoMap Login Page Loaded with Firebase', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');