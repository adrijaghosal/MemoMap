// ============================================
// MEMOMAP - SIGNUP PAGE SCRIPT
// ============================================

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

if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        toggleConfirmPassword.classList.toggle('ri-eye-line');
        toggleConfirmPassword.classList.toggle('ri-eye-off-line');
    });
}

// Password strength checker
function checkPasswordStrength(password) {
    if (!passwordStrengthDiv) return;
    
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    passwordStrengthDiv.classList.remove('weak', 'fair', 'good', 'strong');
    
    const strengthText = passwordStrengthDiv.querySelector('.strength-text');
    
    if (password.length === 0) {
        if (strengthText) strengthText.textContent = 'Enter a password';
        return 0;
    }
    
    if (strength <= 2) {
        passwordStrengthDiv.classList.add('weak');
        if (strengthText) strengthText.textContent = 'Weak password';
    } else if (strength === 3) {
        passwordStrengthDiv.classList.add('fair');
        if (strengthText) strengthText.textContent = 'Fair password';
    } else if (strength === 4) {
        passwordStrengthDiv.classList.add('good');
        if (strengthText) strengthText.textContent = 'Good password';
    } else {
        passwordStrengthDiv.classList.add('strong');
        if (strengthText) strengthText.textContent = 'Strong password!';
    }
    
    return strength;
}

// Real-time password strength check
if (passwordInput) {
    passwordInput.addEventListener('input', () => {
        checkPasswordStrength(passwordInput.value);
    });
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle signup with Firebase
async function handleSignup() {
    const fullname = fullnameInput?.value.trim();
    const email = emailInput?.value.trim();
    const password = passwordInput?.value;
    const confirmPassword = confirmPasswordInput?.value;
    
    if (!fullname || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', true);
        return;
    }
    
    if (fullname.length < 2) {
        showMessage('Please enter your full name', true);
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', true);
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', true);
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', true);
        return;
    }
    
    if (termsCheckbox && !termsCheckbox.checked) {
        showMessage('Please agree to the Terms of Service and Privacy Policy', true);
        return;
    }
    
    if (signupBtn) {
        signupBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Creating account...';
        signupBtn.disabled = true;
    }
    
    try {
        // Call Firebase signUp function from auth.js
        const result = await signUp(email, password, fullname);
        
        if (result) {
            showMessage('Account created successfully! Redirecting...', false);
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            if (signupBtn) {
                signupBtn.innerHTML = '<span>Create Account</span><i class="ri-arrow-right-line"></i>';
                signupBtn.disabled = false;
            }
        }
    } catch (error) {
        showMessage(error.message || 'Signup failed. Please try again.', true);
        if (signupBtn) {
            signupBtn.innerHTML = '<span>Create Account</span><i class="ri-arrow-right-line"></i>';
            signupBtn.disabled = false;
        }
    }
}

// Handle Google Sign Up
async function handleGoogleSignup() {
    if (googleBtn) {
        googleBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Connecting...';
        googleBtn.disabled = true;
    }
    
    try {
        const result = await signInWithGoogle();
        
        if (result) {
            showMessage('Account created successfully with Google! Redirecting...', false);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            if (googleBtn) {
                googleBtn.innerHTML = '<i class="ri-google-fill"></i><span>Sign up with Google</span>';
                googleBtn.disabled = false;
            }
        }
    } catch (error) {
        showMessage(error.message || 'Google sign up failed. Please try again.', true);
        if (googleBtn) {
            googleBtn.innerHTML = '<i class="ri-google-fill"></i><span>Sign up with Google</span>';
            googleBtn.disabled = false;
        }
    }
}

// Enter key support
const inputs = [fullnameInput, emailInput, passwordInput, confirmPasswordInput];
inputs.forEach(input => {
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSignup();
            }
        });
    }
});

// Event listeners
if (signupBtn) signupBtn.addEventListener('click', handleSignup);
if (googleBtn) googleBtn.addEventListener('click', handleGoogleSignup);

// Check if already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.href = 'dashboard.html';
    }
});

console.log('%c📝 MemoMap Sign Up Page Loaded with Firebase', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');