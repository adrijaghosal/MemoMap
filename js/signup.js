// Get DOM elements
const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const signupBtn = document.getElementById('signupBtn');
const googleBtn = document.getElementById('googleBtn');
const termsCheckbox = document.getElementById('termsCheckbox');
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const passwordStrengthDiv = document.getElementById('passwordStrength');

// Create message containers
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

if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        toggleConfirmPassword.classList.toggle('ri-eye-line');
        toggleConfirmPassword.classList.toggle('ri-eye-off-line');
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

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    passwordStrengthDiv.classList.remove('weak', 'fair', 'good', 'strong');
    
    const strengthText = passwordStrengthDiv.querySelector('.strength-text');
    
    if (password.length === 0) {
        strengthText.textContent = 'Enter a password';
        return 0;
    }
    
    if (strength <= 2) {
        passwordStrengthDiv.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (strength === 3) {
        passwordStrengthDiv.classList.add('fair');
        strengthText.textContent = 'Fair password';
    } else if (strength === 4) {
        passwordStrengthDiv.classList.add('good');
        strengthText.textContent = 'Good password';
    } else {
        passwordStrengthDiv.classList.add('strong');
        strengthText.textContent = 'Strong password!';
    }
    
    return strength;
}

// Real-time password strength check
passwordInput.addEventListener('input', () => {
    checkPasswordStrength(passwordInput.value);
});

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle signup
function handleSignup() {
    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validation
    if (!fullname || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields');
        return;
    }
    
    if (fullname.length < 2) {
        showMessage('Please enter your full name');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match');
        return;
    }
    
    if (!termsCheckbox.checked) {
        showMessage('Please agree to the Terms of Service and Privacy Policy');
        return;
    }
    
    // Show loading state
    signupBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Creating account...';
    signupBtn.disabled = true;
    
    // Simulate API call (replace with Firebase Auth later)
    setTimeout(() => {
        // Check if email already exists (demo)
        const existingUsers = JSON.parse(localStorage.getItem('memonap_users') || '[]');
        
        if (existingUsers.some(user => user.email === email)) {
            showMessage('Email already registered. Please login instead.');
            signupBtn.innerHTML = '<span>Create Account</span><i class="ri-arrow-right-line"></i>';
            signupBtn.disabled = false;
            return;
        }
        
        // Save user to localStorage (demo)
        const newUser = {
            fullname: fullname,
            email: email,
            createdAt: new Date().toISOString()
        };
        existingUsers.push(newUser);
        localStorage.setItem('memonap_users', JSON.stringify(existingUsers));
        
        // Store login session
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userName', fullname);
        
        showMessage('Account created successfully! Redirecting...', false);
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 1000);
}

// Google sign up handler
function handleGoogleSignup() {
    googleBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Connecting...';
    googleBtn.disabled = true;
    
    setTimeout(() => {
        showMessage('Google Sign Up coming soon! Firebase integration in progress.', false);
        googleBtn.innerHTML = '<i class="ri-google-fill"></i><span>Sign up with Google</span>';
        googleBtn.disabled = false;
    }, 1000);
}

// Event listeners
signupBtn.addEventListener('click', handleSignup);
googleBtn.addEventListener('click', handleGoogleSignup);

// Enter key support
const inputs = [fullnameInput, emailInput, passwordInput, confirmPasswordInput];
inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSignup();
        }
    });
});

// Check if already logged in
if (sessionStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'dashboard.html';
}

console.log('%c📝 MemoMap Sign Up Page Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');
console.log('%c✨ Create your account and start preserving memories!', 'color: #888; font-size: 12px;');