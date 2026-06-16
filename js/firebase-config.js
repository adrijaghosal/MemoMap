// ============================================
// MEMOMAP - FIREBASE CONFIGURATION
// ============================================

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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();  // For database (optional)
// const storage = firebase.storage();  // For file storage (optional)

// Enable persistence (keeps user logged in)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('✅ Firebase persistence enabled');
    })
    .catch((error) => {
        console.error('❌ Persistence error:', error);
    });

console.log('✅ Firebase initialized successfully with MemoMap project');

// Export for use in other files
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = { auth, db };
// }

