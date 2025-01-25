import { auth, provider, realTimeDb } from "./firebase.js";
import { signInWithPopup, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// DOM Elements
const authContainer = document.getElementById("auth-container");
const mainContent = document.getElementById("main-content");
const googleSignInBtn = document.getElementById("google-signin-btn");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const showSignup = document.getElementById("show-signup");
const showLogin = document.getElementById("show-login");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const signupEmailInput = document.getElementById("signup-email");
const signupPasswordInput = document.getElementById("signup-password");
const emailLoginContainer = document.getElementById("email-login-container");
const signupContainer = document.getElementById("signup-container");
const messageContainer = document.getElementById("message-container");
const messageContainerSignup = document.getElementById("message-container-signup");
const signOutButton = document.getElementById("signout-btn");

// Handle Google Sign-In
googleSignInBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            displayMessage(messageContainer, `Welcome, ${user.displayName}!`, 'success');
            saveUserDataToDb(user); // Save user to Realtime Database
        })
        .catch((error) => {
            console.error(error);
            displayMessage(messageContainer, "Google Sign-In failed. Please try again.", 'error');
        });
});

// Handle Email/Password Login
loginBtn.addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        displayMessage(messageContainer, "Please enter both email and password.", 'error');
        return;
    }

    if (password.length < 6) {
        displayMessage(messageContainer, "Password must be at least 6 characters.", 'error');
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            displayMessage(messageContainer, `Welcome back, ${user.displayName || user.email}!`, 'success');
        })
        .catch((error) => {
            console.error(error);
            displayMessage(messageContainer, "Login failed. Please check your email or password.", 'error');
        });
});

// Handle Email/Password Signup
signupBtn.addEventListener("click", async () => {
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;

    if (!email || !password) {
        displayMessage(messageContainerSignup, "Please enter both email and password.", 'error');
        return;
    }

    if (password.length < 6) {
        displayMessage(messageContainerSignup, "Password must be at least 6 characters.", 'error');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        displayMessage(messageContainerSignup, `Account created! Welcome, ${user.email}!`, 'success');

        // Save user data to Firebase Realtime Database
        saveUserDataToDb(user);
    } catch (error) {
        console.error(error);
        displayMessage(messageContainerSignup, "Sign-Up failed. Please try again.", 'error');
    }
});

// Function to save user data to Firebase Realtime Database
function saveUserDataToDb(user) {
    const userRef = ref(realTimeDb, `users/${user.uid}`);
    

    onValue(userRef, (snapshot) => {
        if (!snapshot.exists()) {
            set(userRef, {
                email: user.email,
                user_account: ["cash", "bank"], // Default account types
                user_shop_category: [
                    "Rent", "EMI", "Groceries", "Utility bills", "Education expenses",
                    "Transportation", "Health insurance", "Medical expenses", "Household maintenance",
                    "Internet bills", "Mobile bills", "Entertainment", "Recreation", "Dining out",
                    "Savings", "Investments", "Loan repayments", "Clothing", "Festivals", "Celebrations",
                    "Gifts", "Donations", "Travel", "Vacations", "Childcare expenses", "Emergency fund contributions"
                ] // Default categories
            })
            .then(() => {
                console.log("User data saved successfully.");
            })
            .catch((error) => {
                console.error("Error saving user data to DB:", error);
            });
        } else {
            console.log("User data already exists in the database.");
        }
    });
}


// Toggle between Login and Signup forms
showSignup.addEventListener("click", () => {
    emailLoginContainer.style.display = "none";
    signupContainer.style.display = "block";
    clearMessage(messageContainer);
});

showLogin.addEventListener("click", () => {
    signupContainer.style.display = "none";
    emailLoginContainer.style.display = "block";
    clearMessage(messageContainerSignup);
});

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.style.display = "none";
        mainContent.style.display = "block";

        // Listen for real-time changes in the user's data
        const userRef = ref(realTimeDb, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            console.log("Real-time user data:", userData);
            // Update UI or perform actions based on real-time changes
        });

        console.log(`User signed in: ${user.displayName || user.email}`);
    } else {
        authContainer.style.display = "flex";
        mainContent.style.display = "none";
    }
});

// Display Message in the message container
function displayMessage(container, message, type) {
    container.textContent = message;
    container.style.color = type === 'success' ? 'rgb(250, 240, 221)' : 'rgb(250, 240, 221)';
    container.style.fontWeight = 'bold';
}

// Clear messages
function clearMessage(container) {
    container.textContent = '';
}

// Sign out the user
signOutButton.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            console.log("User signed out!");
            window.location.reload();
        })
        .catch((error) => {
            console.error("Error signing out: ", error);
        });
});
