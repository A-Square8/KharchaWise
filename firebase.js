import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";  // Add this line

const firebaseConfig = {
    apiKey: "AIzaSyDbvBQarDRrfFCohQ6RLAUyKIn9fCIJwCs",
    authDomain: "kharchawise-bad22.firebaseapp.com",
    projectId: "kharchawise-bad22",
    storageBucket: "kharchawise-bad22.firebasestorage.app",
    messagingSenderId: "789194548509",
    appId: "1:789194548509:web:3c9dbaf98d6314fa9c2df4",
    databaseURL: "https://kharchawise-bad22-default-rtdb.asia-southeast1.firebasedatabase.app" // Correct region URL
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const realTimeDb = getDatabase(app); 

export { auth, provider, realTimeDb };
