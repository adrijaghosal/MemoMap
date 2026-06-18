// ============================================
// FIREBASE CONFIG - COMPLETE WORKING VERSION
// ============================================

(function() {
    'use strict';
    
    console.log('🔧 Initializing Firebase...');
    
    // Your Firebase configuration
    const firebaseConfig = {
  apiKey: "AIzaSyBVG4GzANbYga-srEqh9A97pcrRNdtCd-I",
  authDomain: "memomap-34757.firebaseapp.com",
  projectId: "memomap-34757",
  storageBucket: "memomap-34757.firebasestorage.app",
  messagingSenderId: "347951994481",
  appId: "1:347951994481:web:bcf7930207c90fd85f6dd0",
  measurementId: "G-BWEKCQP5FZ"
};
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded!');
        return;
    }
    
    // Initialize Firebase only once
    if (!firebase.apps || firebase.apps.length === 0) {
        try {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } catch (e) {
            console.error('❌ Firebase init error:', e.message);
            return;
        }
    } else {
        console.log('✅ Firebase already initialized');
    }
    
    // Initialize Firestore
    let db = null;
    let storage = null;
    let auth = null;
    
    try {
        db = firebase.firestore();
        console.log('✅ Firestore initialized');
    } catch (e) {
        console.error('❌ Firestore init error:', e.message);
    }
    
    try {
        storage = firebase.storage();
        console.log('✅ Storage initialized');
    } catch (e) {
        console.error('❌ Storage init error:', e.message);
    }
    
    try {
        auth = firebase.auth();
        console.log('✅ Auth initialized');
    } catch (e) {
        console.error('❌ Auth init error:', e.message);
    }
    
    // Make services globally available
    window.db = db;
    window.storage = storage;
    window.auth = auth;
    
    // Also make firebase.firestore available
    if (db) {
        console.log('🚀 Firestore is ready');
    }
    
    // Test Firestore connection
    if (db) {
        setTimeout(function() {
            db.collection('memories').limit(1).get()
                .then(function() {
                    console.log('✅ Firestore connected successfully!');
                })
                .catch(function(err) {
                    console.log('⚠️ Firestore connection test:', err.message);
                    if (err.message && err.message.includes('permission-denied')) {
                        console.log('📌 Please enable Firestore in Firebase Console');
                    }
                    if (err.message && err.message.includes('API has not been used')) {
                        console.log('📌 Please enable Firestore API in Google Cloud Console');
                    }
                });
        }, 500);
    }
    
    console.log('🚀 Firebase services ready for project:', firebaseConfig.projectId);
    
})();