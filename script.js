import { auth, provider, realTimeDb } from "./firebase.js";
import { signInWithPopup, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { ref, set, get,onValue,update } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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
const addTBtn = document.getElementById("addsubmitBtn");
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
                user_account: {
                    cash: 0,  
                    bank: 0   
                }, // Default account types
                user_shop_category: [
                    "Rent", "EMI", "Groceries", "Utility bills", "Education expenses",
                    "Transportation", "Health insurance", "Medical expenses", "Household maintenance",
                    "Internet bills", "Mobile bills", "Entertainment", "Recreation", "Dining out",
                    "Savings", "Investments", "Loan repayments", "Clothing", "Festivals", "Celebrations",
                    "Gifts", "Donations", "Travel", "Vacations", "Childcare expenses", "Emergency fund contributions"
                ], // Default categories

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


document.documentElement.style.setProperty('--box-count', document.querySelectorAll('.content-box').length);




// add
document.getElementById('addNewBtn').addEventListener('click', function () {
    document.getElementById('main').style.display = 'none';
    document.getElementById('transactionForm').style.display = 'block';
});

document.getElementById('addcancelBtn').addEventListener('click', function () {
    document.getElementById('transactionForm').style.display = 'none';
    document.getElementById('main').style.display = 'flex';
});



function populateExpenseCategories(user) {
    const categoryDropdown = document.getElementById('expenseCategory');

    const userRef = ref(realTimeDb, `users/${user.uid}/user_shop_category`);
    onValue(userRef, (snapshot) => {


        if (snapshot.exists()) {
            const categories = snapshot.val();
            categoryDropdown.innerHTML = "";
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryDropdown.appendChild(option);
            });
        }
    });
}
function populateAccountOptions(user) {
    const accountDropdown = document.getElementById('account');
    const toAccountDropdown = document.getElementById('toAccount');

    const accountRef = ref(realTimeDb, `users/${user.uid}/user_account`);
    onValue(accountRef, (snapshot) => {
        if (snapshot.exists()) {
            const accounts = snapshot.val();
            accountDropdown.innerHTML = "";
            toAccountDropdown.innerHTML = "";


            Object.entries(accounts).forEach(([account, balance]) => {
                const formattedText = `${account.charAt(0).toUpperCase() + account.slice(1)} (₹${balance})`;

                const option = document.createElement('option');
                option.value = account;
                option.textContent = formattedText;

                const toOption = option.cloneNode(true);

                accountDropdown.appendChild(option);
                toAccountDropdown.appendChild(toOption);
            });
        }
    });
}




onAuthStateChanged(auth, (user) => {
    if (user) {
        populateExpenseCategories(user);
        populateAccountOptions(user);
        updateBalanceDisplay(user);
    }
});


// Calculator logic
const numberInput = document.getElementById('numberInput');
const calcButtons = document.querySelectorAll('.calc-btn');
let firstValue = '';
let operator = '';

calcButtons.forEach(button => {
    button.addEventListener('click', function () {
        const value = this.getAttribute('data-value');
        const operation = this.getAttribute('data-operation');

        if (value) {
            numberInput.value += value;
        } else if (operation) {
            if (numberInput.value !== '') {
                if (firstValue === '') {
                    firstValue = numberInput.value;
                } else if (operator) {
                    firstValue = operate(firstValue, numberInput.value, operator);
                }
                operator = operation;
                numberInput.value = '';
            }
        } else if (this.id === 'equals') {
            if (firstValue !== '' && numberInput.value !== '' && operator) {
                numberInput.value = operate(firstValue, numberInput.value, operator);
                firstValue = '';
                operator = '';
            }
        } else if (this.id === 'clear') {
            numberInput.value = '';
            firstValue = '';
            operator = '';
        }
    });
});

function operate(a, b, operator) {
    a = parseFloat(a);
    b = parseFloat(b);
    switch (operator) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : 'Error';
        default: return b;
    }
}


// Date field setup
function getCurrentDateInIST() {
    const now = new Date();

    const utcOffset = now.getTimezoneOffset(); 
    const istOffset = 330; 
    
    now.setMinutes(now.getMinutes() + utcOffset + istOffset);
    
    return now.toISOString().split('T')[0];
}

document.getElementById('dateField').value = getCurrentDateInIST();

// Transaction type logic
let selectedOption = 'Expense';
document.getElementById('expenseBtn').classList.add('active');

// Define the selectOption function in the MainContent scope
function selectOption(option) {
    selectedOption = option;

    document.getElementById('expenseBtn').classList.remove('active');
    document.getElementById('incomeBtn').classList.remove('active');
    document.getElementById('transferBtn').classList.remove('active');

    if (option === 'Expense') {
        document.getElementById('expenseBtn').classList.add('active');
        document.getElementById('expenseCategoryGroup').style.display = 'flex';
        document.querySelector('#toAccountGroup').style.display = 'none';
    } else if (option === 'Income') {
        document.getElementById('incomeBtn').classList.add('active');
        document.getElementById('expenseCategoryGroup').style.display = 'none';
        document.querySelector('#toAccountGroup').style.display = 'none';
    } else if (option === 'Transfer') {
        document.getElementById('transferBtn').classList.add('active');
        document.getElementById('expenseCategoryGroup').style.display = 'none';
        document.querySelector('#toAccountGroup').style.display = 'flex';
    }
}


document.getElementById('expenseBtn').onclick = () => selectOption('Expense');
document.getElementById('incomeBtn').onclick = () => selectOption('Income');
document.getElementById('transferBtn').onclick = () => selectOption('Transfer');


selectOption('Expense');

//log data into user_transaction

addTBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("Please sign in first");
        return;
    }

    const amount = parseFloat(document.getElementById('numberInput').value);
    const description = document.getElementById('description').value;
    const date = document.getElementById('dateField').value;
    const fromAccount = document.getElementById('account').value;
    const expenseCategory = document.getElementById('expenseCategory').value;
    const toAccount = document.getElementById('toAccount').value;

    if (!amount || !date || !fromAccount) {
        alert("Please fill in all required fields");
        return;
    }

    try {
        const userId = user.uid;
        const transactionRef = ref(realTimeDb, `user_transaction/${userId}`);
        const snapshot = await get(transactionRef);
        const nextTransactionId = snapshot.exists() ? Object.keys(snapshot.val()).length + 1 : 1;

        let transactionData = {
            transaction_id: nextTransactionId,
            transaction_type: selectedOption,
            amount: amount,
            from_account: fromAccount,
            date: date,
            description: description || ''
        };

        if (selectedOption === 'Expense') {
            transactionData.expense_category = expenseCategory;
        } else if (selectedOption === 'Transfer') {
            transactionData.to_account = toAccount;
        }

        await set(ref(realTimeDb, `user_transaction/${userId}/${nextTransactionId}`), transactionData);

        //Update balances
        await updateAccountBalance(userId, fromAccount, amount, selectedOption);

        if (selectedOption === "Transfer") {
            await updateAccountBalance(userId, toAccount, amount, "Income");
        }

        clearForm();
        console.log("Added transaction");
        alert("Transaction added successfully!");

    } catch (error) {
        console.error("Error adding transaction:", error);
        alert("Error adding transaction. Please try again.");
    }
});

async function updateAccountBalance(userId, account, amount, transactionType) {
    const accountRef = ref(realTimeDb, `users/${userId}/user_account`);
    const snapshot = await get(accountRef);
    let currentBalances = snapshot.exists() ? snapshot.val() : {};


    let currentBalance = currentBalances[account] || 0;

    if (transactionType === "Expense" || transactionType === "Transfer") {
        currentBalance -= amount;
    } else if (transactionType === "Income") {
        currentBalance += amount;
    }


    await update(accountRef, { [account]: currentBalance });

    console.log(`Updated balance for ${account}: ${currentBalance}`);
}


function clearForm() {
    document.getElementById('numberInput').value = '';
    document.getElementById('description').value = '';
    document.getElementById('transactionForm').style.display = 'none';
    document.getElementById('main').style.display = 'flex';
}


//fetch balance
function updateBalanceDisplay(user) {
    const totalBalanceElement = document.querySelector('.total-balance');
    const accountListElement = document.querySelector('.account-list');
    
    const userAccountRef = ref(realTimeDb, `users/${user.uid}/user_account`);
    
    onValue(userAccountRef, (snapshot) => {
        if (snapshot.exists()) {
            const accounts = snapshot.val();
            
            // Calculate total balance
            const totalBalance = Object.values(accounts).reduce((sum, balance) => sum + balance, 0);
            totalBalanceElement.textContent = `Total Balance: ₹${totalBalance}`;
            
            // Clear existing account list
            accountListElement.innerHTML = '';
            
            // Add individual account balances
            Object.entries(accounts).forEach(([accountName, balance]) => {
                const accountItem = document.createElement('div');
                accountItem.className = 'account-item';
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'account-name';
                nameSpan.textContent = accountName;
                
                const balanceSpan = document.createElement('span');
                balanceSpan.textContent = `₹${balance}`;
                
                accountItem.appendChild(nameSpan);
                accountItem.appendChild(balanceSpan);
                accountListElement.appendChild(accountItem);
            });
        } else {
            totalBalanceElement.textContent = 'Total Balance: ₹0';
            accountListElement.innerHTML = '<div class="account-item">No accounts found</div>';
        }
    });
}

