// ============================================
// MEMOMAP - AUTHENTICATION SERVICES
// ============================================

// ===== Helper Functions =====
function showAuthMessage(message, isError = true, elementId = 'authMessage') {
    const msgDiv = document.getElementById(elementId);
    if (msgDiv) {
        msgDiv.textContent = message;
        msgDiv.className = `message ${isError ? 'message-error' : 'message-success'}`;
        msgDiv.style.display = 'block';
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 4000);
    } else {
        console.log(message);
    }
}

// ===== Sign Up with Email/Password =====
async function signUp(email, password, displayName) {
    if (!email || !password) {
        showAuthMessage('Please enter email and password', true);
        return false;
    }
    
    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', true);
        return false;
    }
    
    try {
        showAuthMessage('Creating account...', false);
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        if (displayName) {
            await user.updateProfile({
                displayName: displayName
            });
        }
        
        // Save user data to localStorage (for profile page)
        const userProfile = {
            uid: user.uid,
            name: displayName || email.split('@')[0],
            email: email,
            avatar: '🌍',
            avatarType: 'emoji',
            bio: 'Memory collector and travel enthusiast',
            quote: 'Every place has a story...',
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('memonap_profile', JSON.stringify(userProfile));
        
        // Save to Firestore (optional - uncomment when ready)
        /*
        await db.collection('users').doc(user.uid).set(userProfile);
        */
        
        showAuthMessage('Account created successfully!', false);
        
        // Store session
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userName', displayName || email.split('@')[0]);
        sessionStorage.setItem('userUid', user.uid);
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
        return true;
        
    } catch (error) {
        let errorMessage = error.message;
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered. Please login.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. Use at least 6 characters.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/Password signup is disabled. Please contact support.';
                break;
            default:
                errorMessage = error.message;
        }
        
        showAuthMessage(errorMessage, true);
        return false;
    }
}

// ===== Sign In with Email/Password =====
async function signIn(email, password) {
    if (!email || !password) {
        showAuthMessage('Please enter email and password', true);
        return false;
    }
    
    try {
        showAuthMessage('Signing in...', false);
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        showAuthMessage(`Welcome back, ${user.displayName || user.email.split('@')[0]}!`, false);
        
        // Store session
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userName', user.displayName || user.email.split('@')[0]);
        sessionStorage.setItem('userUid', user.uid);
        
        // Load or create user profile
        let userProfile = localStorage.getItem('memonap_profile');
        if (!userProfile) {
            userProfile = {
                uid: user.uid,
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                avatar: '🌍',
                avatarType: 'emoji',
                bio: 'Memory collector and travel enthusiast',
                quote: 'Every place has a story...',
                joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('memonap_profile', JSON.stringify(userProfile));
        }
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
        return true;
        
    } catch (error) {
        let errorMessage = error.message;
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email. Please sign up.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled. Please contact support.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            default:
                errorMessage = error.message;
        }
        
        showAuthMessage(errorMessage, true);
        return false;
    }
}

// ===== Sign In with Google =====
async function signInWithGoogle() {
    try {
        showAuthMessage('Connecting to Google...', false);
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        showAuthMessage(`Welcome ${user.displayName}!`, false);
        
        // Store session
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userName', user.displayName);
        sessionStorage.setItem('userUid', user.uid);
        
        // Save user profile
        let userProfile = localStorage.getItem('memonap_profile');
        if (!userProfile) {
            userProfile = {
                uid: user.uid,
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                avatar: user.photoURL || '🌍',
                avatarType: user.photoURL ? 'image' : 'emoji',
                bio: 'Memory collector and travel enthusiast',
                quote: 'Every place has a story...',
                joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('memonap_profile', JSON.stringify(userProfile));
        }
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
        return true;
        
    } catch (error) {
        let errorMessage = error.message;
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign in cancelled. Please try again.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup was blocked. Please allow popups for this site.';
        }
        
        showAuthMessage(errorMessage, true);
        return false;
    }
}

// ===== Sign Out =====
async function signOut() {
    try {
        await auth.signOut();
        sessionStorage.clear();
        showAuthMessage('Logged out successfully', false);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Sign out error:', error);
        showAuthMessage('Error signing out. Please try again.', true);
    }
}

// ===== Reset Password =====
async function resetPassword(email) {
    if (!email) {
        showAuthMessage('Please enter your email address', true);
        return false;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        showAuthMessage('Password reset email sent! Check your inbox.', false);
        return true;
    } catch (error) {
        let errorMessage = error.message;
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            default:
                errorMessage = error.message;
        }
        
        showAuthMessage(errorMessage, true);
        return false;
    }
}

// ===== Update User Profile =====
async function updateUserProfile(displayName, photoURL) {
    const user = auth.currentUser;
    if (!user) {
        showAuthMessage('You must be logged in to update profile', true);
        return false;
    }
    
    try {
        const updates = {};
        if (displayName) updates.displayName = displayName;
        if (photoURL) updates.photoURL = photoURL;
        
        await user.updateProfile(updates);
        
        // Update local profile
        const profile = JSON.parse(localStorage.getItem('memonap_profile') || '{}');
        if (displayName) profile.name = displayName;
        if (photoURL) profile.avatar = photoURL;
        localStorage.setItem('memonap_profile', JSON.stringify(profile));
        
        showAuthMessage('Profile updated successfully!', false);
        return true;
    } catch (error) {
        showAuthMessage(error.message, true);
        return false;
    }
}

// ===== Change Password =====
async function changePassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    if (!user) {
        showAuthMessage('You must be logged in to change password', true);
        return false;
    }
    
    if (!newPassword || newPassword.length < 6) {
        showAuthMessage('New password must be at least 6 characters', true);
        return false;
    }
    
    try {
        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        await user.reauthenticateWithCredential(credential);
        
        // Update password
        await user.updatePassword(newPassword);
        showAuthMessage('Password changed successfully!', false);
        return true;
    } catch (error) {
        let errorMessage = error.message;
        
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Current password is incorrect.';
        }
        
        showAuthMessage(errorMessage, true);
        return false;
    }
}

// ===== Delete Account =====
async function deleteAccount(password) {
    const user = auth.currentUser;
    if (!user) {
        showAuthMessage('You must be logged in to delete account', true);
        return false;
    }
    
    try {
        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
        await user.reauthenticateWithCredential(credential);
        
        // Delete user
        await user.delete();
        
        // Clear local storage
        localStorage.clear();
        sessionStorage.clear();
        
        showAuthMessage('Account deleted successfully', false);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
        return true;
    } catch (error) {
        let errorMessage = error.message;
        
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Password is incorrect.';
        }
        
        showAuthMessage(errorMessage, true);
        return false;
    }
}

// ===== Get Current User =====
function getCurrentUser() {
    return auth.currentUser;
}

// ===== Check if User is Logged In =====
function isLoggedIn() {
    return auth.currentUser !== null;
}

// ===== Auth State Observer =====
function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
}

// ===== Redirect if Not Logged In =====
function requireAuth() {
    const protectedPages = ['dashboard.html', 'map.html', 'add-memory.html', 'timeline.html', 'collections.html', 'profile.html', 'nostalgia.html', 'settings.html', 'help.html', 'notifications.html', 'memory-detail.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        auth.onAuthStateChanged((user) => {
            if (!user) {
                window.location.href = 'login.html';
            }
        });
    }
}

// ===== Initialize Auth Listener =====
function initAuth() {
    requireAuth();
    
    // Update session storage when auth state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('userName', user.displayName || user.email.split('@')[0]);
            sessionStorage.setItem('userUid', user.uid);
        } else {
            sessionStorage.clear();
        }
    });
}

// Initialize authentication
initAuth();

console.log('%c🔐 MemoMap Authentication Service Loaded', 'color: #ff6b8b; font-size: 14px; font-weight: bold;');
console.log('%c🔥 Firebase connected to project: memomap-34757', 'color: #27ae60; font-size: 12px;');