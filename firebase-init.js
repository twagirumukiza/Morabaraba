// Firebase - Morabaraba V3
const firebaseConfig = {
  apiKey: "AIzaSyBG6oid29bMq8GVvBkNvPtSDZTRO5K09uk",
  authDomain: "focus-game-1c7ee.firebaseapp.com",
  databaseURL: "https://focus-game-1c7ee-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "focus-game-1c7ee",
  storageBucket: "focus-game-1c7ee.firebasestorage.app",
  messagingSenderId: "856695121197",
  appId: "1:856695121197:web:5d622976f1e740b9499fa4"
};

let fbReady = false;
let fbError = '';
let db = null;
let auth = null;
let currentUid = null;
let roomCode = null;
let roomRef = null;
let seat = null;
let remoteApplying = false;

try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.database();

  auth.signInAnonymously()
    .then(() => {
      fbReady = true;
      fbError = '';
      currentUid = auth.currentUser.uid;
      if (typeof autoJoinFromURL === 'function') autoJoinFromURL();
    })
    .catch((e) => {
      fbError = e.code || e.message || String(e);
      console.error('Firebase Auth', e);
    });

  auth.onAuthStateChanged((u) => {
    if (u) {
      fbReady = true;
      fbError = '';
      currentUid = u.uid;
      if (typeof autoJoinFromURL === 'function') autoJoinFromURL();
    }
  });
} catch (e) {
  fbError = e.message || String(e);
  console.error('Firebase', e);
}
