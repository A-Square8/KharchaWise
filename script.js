import { auth, provider, realTimeDb } from "./firebase.js";
import { signInWithPopup, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { ref, set, get, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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

        initializeTransactionHistory();

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
    document.getElementById('addTransactionModal').style.display = 'block';
});

document.querySelector('#addTransactionModal .close-modal').addEventListener('click', function () {
    document.getElementById('addTransactionModal').style.display = 'none';
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

        // Generate a unique transaction ID using timestamp
        const transactionId = Date.now().toString();

        let transactionData = {
            transaction_id: transactionId,
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

        // Store the transaction using the unique ID
        await set(ref(realTimeDb, `user_transaction/${userId}/${transactionId}`), transactionData);

        // Update balances
        await updateAccountBalance(userId, fromAccount, amount, selectedOption);

        if (selectedOption === "Transfer") {
            await updateAccountBalance(userId, toAccount, amount, "Income");
        }

        clearForm();
        console.log("Added transaction with ID:", transactionId);
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
    document.getElementById('addTransactionModal').style.display = 'none';
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



const balanceContainer = document.querySelector('.balance-container');
const accountList = document.querySelector('.account-list');
const navButtons = document.querySelectorAll('.nav-btn');


navButtons.forEach(button => {
    button.addEventListener('click', () => {

        navButtons.forEach(btn => btn.classList.remove('active'));

        button.classList.add('active');


        if (button.dataset.frame === 'accounts') {
            balanceContainer.style.transform = 'translateX(-100%)';
            accountList.style.transform = 'translateX(0)';
        } else {
            balanceContainer.style.transform = 'translateX(0)';
            accountList.style.transform = 'translateX(100%)';
        }
    });
});



//transaction history

let currentPage = 1;
const transactionsPerPage = 6;

function initializeTransactionHistory() {
    loadTransactions();

    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
}

function loadTransactions() {
    const user = auth.currentUser;
    if (!user) return;

    const transactionsRef = ref(realTimeDb, `user_transaction/${user.uid}`);
    onValue(transactionsRef, (snapshot) => {
        if (snapshot.exists()) {
            const transactions = [];
            snapshot.forEach((childSnapshot) => {
                transactions.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            displayTransactions(transactions);
            updatePaginationControls(transactions.length);
        } else {
            const transactionsList = document.getElementById('transactionsList');
            transactionsList.innerHTML = '<div class="no-transactions">No transactions found</div>';
            updatePaginationControls(0);
        }
    });
}

function displayTransactions(transactions) {
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = '';

    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const currentTransactions = transactions.slice(startIndex, endIndex);

    // Create table view for larger screens
    const tableView = document.createElement('div');
    tableView.className = 'transaction-table';
    tableView.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>From</th>
                    <th>To/Category</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${currentTransactions.map(transaction => `
                    <tr>
                        <td>${formatDate(transaction.date)}</td>
                        <td>
                            <span class="transaction-type type-${transaction.transaction_type.toLowerCase()}">
                                ${transaction.transaction_type}
                            </span>
                        </td>
                        <td class="amount ${transaction.transaction_type.toLowerCase()}">
                            ${transaction.transaction_type === 'Income' ? '+' :
            transaction.transaction_type === 'Expense' ? '-' : ''}
                            ₹${transaction.amount}
                        </td>
                        <td>${transaction.from_account}</td>
                        <td>${transaction.to_account || transaction.expense_category || '-'}</td>
                        <td>${transaction.description || '-'}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Create card view for mobile screens
    const cardView = document.createElement('div');
    cardView.className = 'transaction-cards';

    currentTransactions.forEach(transaction => {
        const card = document.createElement('div');
        card.className = 'transaction-item';

        const amountPrefix = transaction.transaction_type === 'Income' ? '+' :
            transaction.transaction_type === 'Expense' ? '-' : '';

        card.innerHTML = `
            <div class="transaction-header">
                <div class="transaction-main-info">
                    <span class="transaction-type type-${transaction.transaction_type.toLowerCase()}">${transaction.transaction_type}</span>
                    <span class="transaction-amount ${transaction.transaction_type.toLowerCase()}">
                        ${amountPrefix}₹${transaction.amount}
                    </span>
                </div>
                <button class="toggle-details-btn">
                    <span class="transaction-date-main">${formatDateShort(transaction.date)}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="transaction-details">
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formatDate(transaction.date)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">From Account:</span>
                    <span class="detail-value">${transaction.from_account}</span>
                </div>
                ${transaction.to_account ? `
                <div class="detail-row">
                    <span class="detail-label">To Account:</span>
                    <span class="detail-value">${transaction.to_account}</span>
                </div>
                ` : ''}
                ${transaction.expense_category ? `
                <div class="detail-row">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">${transaction.expense_category}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Description:</span>
                    <span class="detail-value">${transaction.description || '-'}</span>
                </div>
                <div class="action-buttons">
                    <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')">Delete</button>
                </div>
            </div>
        `;

        const toggleBtn = card.querySelector('.toggle-details-btn');
        const details = card.querySelector('.transaction-details');
        toggleBtn.addEventListener('click', () => {
            details.classList.toggle('show');
            toggleBtn.querySelector('i').classList.toggle('fa-chevron-up');
            toggleBtn.querySelector('i').classList.toggle('fa-chevron-down');
        });

        cardView.appendChild(card);
    });

    transactionsList.appendChild(tableView);
    transactionsList.appendChild(cardView);
}

function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}`;
}

function updatePaginationControls(totalTransactions) {
    const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const pageIndicator = document.getElementById('pageIndicator');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    pageIndicator.textContent = totalPages === 0 ?
        'No transactions' :
        `Page ${currentPage} of ${totalPages}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function changePage(step) {
    currentPage += step;
    loadTransactions();
}


window.deleteTransaction = async function (transactionId) {
    const user = auth.currentUser;
    if (!user) return;


    const transactionRef = ref(realTimeDb, `user_transaction/${user.uid}/${transactionId}`);

    try {
        const snapshot = await get(transactionRef);
        if (snapshot.exists()) {
            const transaction = snapshot.val();

            if (confirm("Are you sure you want to delete this transaction?")) {

                if (transaction.transaction_type === "Expense") {
                    await updateAccountBalance(
                        user.uid,
                        transaction.from_account,
                        transaction.amount,
                        "Income"
                    );
                } else if (transaction.transaction_type === "Income") {
                    await updateAccountBalance(
                        user.uid,
                        transaction.from_account,
                        transaction.amount,
                        "Expense"
                    );
                } else if (transaction.transaction_type === "Transfer") {

                    await updateAccountBalance(
                        user.uid,
                        transaction.from_account,
                        transaction.amount,
                        "Income"
                    );
                    await updateAccountBalance(
                        user.uid,
                        transaction.to_account,
                        transaction.amount,
                        "Expense"
                    );
                }


                await remove(transactionRef);
                alert("Transaction deleted successfully!");
                loadTransactions();
            }
        } else {
            alert("Transaction not found!");
        }
    } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction. Please try again.");
    }
};



document.addEventListener('DOMContentLoaded', function () {
    const modals = document.querySelectorAll('.modal');
    const btns = document.querySelectorAll('.analysis-btn');
    const closeBtns = document.querySelectorAll('.close-modal');

    btns.forEach(btn => {
        btn.addEventListener('click', function () {
            const modalId = this.getAttribute('data-modal') + 'Modal';
            document.getElementById(modalId).style.display = 'block';
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });

    window.addEventListener('click', function (event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});







// More Options Modal Functionality
function initializeMoreOptions() {
    // Set default dates
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('startDate').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];

    // Initialize event listeners
    document.getElementById('addExpenseTypeBtn').addEventListener('click', addNewExpenseType);
    document.getElementById('addAccountBtn').addEventListener('click', addNewAccount);
    document.getElementById('exportCSVBtn').addEventListener('click', exportTransactions);

    // Load existing data
    loadExpenseTypes();
    loadAccounts();
}

async function addNewExpenseType() {
    const user = auth.currentUser;
    if (!user) return;

    const newType = document.getElementById('newExpenseType').value.trim();
    if (!newType) {
        alert('Please enter an expense type');
        return;
    }

    try {
        const categoriesRef = ref(realTimeDb, `users/${user.uid}/user_shop_category`);
        const snapshot = await get(categoriesRef);
        const categories = snapshot.val() || [];

        if (categories.includes(newType)) {
            alert('This category already exists');
            return;
        }

        categories.push(newType);
        await set(categoriesRef, categories);
        
        document.getElementById('newExpenseType').value = '';
        loadExpenseTypes();
    } catch (error) {
        console.error('Error adding expense type:', error);
        alert('Failed to add expense type');
    }
}

async function addNewAccount() {
    const user = auth.currentUser;
    if (!user) return;

    const accountName = document.getElementById('newAccountName').value.trim().toLowerCase();
    const balance = parseFloat(document.getElementById('newAccountBalance').value) || 0;

    if (!accountName) {
        alert('Please enter an account name');
        return;
    }

    try {
        const accountRef = ref(realTimeDb, `users/${user.uid}/user_account/${accountName}`);
        const snapshot = await get(accountRef);

        if (snapshot.exists()) {
            alert('This account already exists');
            return;
        }

        await set(accountRef, balance);
        
        document.getElementById('newAccountName').value = '';
        document.getElementById('newAccountBalance').value = '';
        loadAccounts();
    } catch (error) {
        console.error('Error adding account:', error);
        alert('Failed to add account');
    }
}

function loadExpenseTypes() {
    const user = auth.currentUser;
    if (!user) return;

    const categoriesRef = ref(realTimeDb, `users/${user.uid}/user_shop_category`);
    onValue(categoriesRef, (snapshot) => {
        const categories = snapshot.val() || [];
        const container = document.getElementById('expenseTypeList');
        container.innerHTML = '';

        categories.forEach(category => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <span>${category}</span>
                <button class="delete-item-btn" onclick="deleteExpenseType('${category}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(div);
        });
    });
}

function loadAccounts() {
    const user = auth.currentUser;
    if (!user) return;

    const accountsRef = ref(realTimeDb, `users/${user.uid}/user_account`);
    onValue(accountsRef, (snapshot) => {
        const accounts = snapshot.val() || {};
        const container = document.getElementById('accountList');
        container.innerHTML = '';

        Object.entries(accounts).forEach(([account, balance]) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <span>${account} (₹${balance})</span>
                <button class="delete-item-btn" onclick="deleteAccount('${account}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(div);
        });
    });
}

window.deleteExpenseType = async function(category) {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm(`Are you sure you want to delete "${category}"?`)) return;

    try {
        const categoriesRef = ref(realTimeDb, `users/${user.uid}/user_shop_category`);
        const snapshot = await get(categoriesRef);
        const categories = snapshot.val() || [];

        const updatedCategories = categories.filter(c => c !== category);
        await set(categoriesRef, updatedCategories);
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
    }
}

window.deleteAccount = async function(account) {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm(`Are you sure you want to delete "${account}"?`)) return;

    try {
        const accountRef = ref(realTimeDb, `users/${user.uid}/user_account/${account}`);
        await remove(accountRef);
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account');
    }
}


async function exportTransactions() {
    const user = auth.currentUser;
    if (!user) return;

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    try {
        const transactionsRef = ref(realTimeDb, `user_transaction/${user.uid}`);
        const snapshot = await get(transactionsRef);
        let transactions = [];

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const transaction = childSnapshot.val();
                if (transaction.date >= startDate && transaction.date <= endDate) {
                    transactions.push(transaction);
                }
            });
        }

        if (transactions.length === 0) {
            alert('No transactions found for the selected date range');
            return;
        }

        // Convert to CSV
        const headers = ['Date', 'Type', 'Amount', 'From Account', 'To/Category', 'Description'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
                t.date,
                t.transaction_type,
                t.amount,
                t.from_account,
                t.to_account || t.expense_category || '-',
                t.description || '-'
            ].join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `transactions_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting transactions:', error);
        alert('Failed to export transactions');
    }
}


document.querySelector('[data-modal="more"]').addEventListener('click', initializeMoreOptions);



let pieChart = null;
let barChart = null;


function initializeAnalysis() {

    const currentYear = new Date().getFullYear();
    const yearDropdowns = [
        document.getElementById('pieChartYear'),
        document.getElementById('barChartYear')
    ];

    yearDropdowns.forEach(dropdown => {
        for (let year = currentYear; year >= currentYear - 4; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            dropdown.appendChild(option);
        }
    });

    document.getElementById('pieChartMonth').value = new Date().getMonth();


    createPieChart();
    createBarChart();

    document.getElementById('pieChartMonth').addEventListener('change', updatePieChart);
    document.getElementById('pieChartYear').addEventListener('change', updatePieChart);
    document.getElementById('barChartYear').addEventListener('change', updateBarChart);
}

async function updatePieChart() {
    const month = parseInt(document.getElementById('pieChartMonth').value);
    const year = parseInt(document.getElementById('pieChartYear').value);
    
    try {
        const user = auth.currentUser;
        if (!user) return;

        const transactionsRef = ref(realTimeDb, `user_transaction/${user.uid}`);
        const snapshot = await get(transactionsRef);
        
        const categoryMap = new Map();
        let totalExpense = 0;

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const transaction = childSnapshot.val();
                const transactionDate = new Date(transaction.date);
                
                if (transactionDate.getMonth() === month && 
                    transactionDate.getFullYear() === year && 
                    transaction.transaction_type === 'Expense') {
                    const category = transaction.expense_category;
                    const amount = transaction.amount;
                    categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
                    totalExpense += amount;
                }
            });
        }

        const labels = Array.from(categoryMap.keys());
        const data = Array.from(categoryMap.values());
        
        // Generate colors based on the number of categories
        const colors = getColorArray(labels.length);

        pieChart.data.labels = labels;
        pieChart.data.datasets[0].data = data;
        pieChart.data.datasets[0].backgroundColor = colors;
        pieChart.update();

        document.getElementById('totalExpenses').textContent = totalExpense.toLocaleString();
    } catch (error) {
        console.error('Error updating pie chart:', error);
    }
}

async function updateBarChart() {
    const year = parseInt(document.getElementById('barChartYear').value);
    
    try {
        const user = auth.currentUser;
        if (!user) return;

        const transactionsRef = ref(realTimeDb, `user_transaction/${user.uid}`);
        const snapshot = await get(transactionsRef);
        
        const monthlyData = Array(12).fill().map(() => ({ income: 0, expense: 0 }));
        let totalIncome = 0;
        let totalExpense = 0;

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const transaction = childSnapshot.val();
                const transactionDate = new Date(transaction.date);
                
                if (transactionDate.getFullYear() === year) {
                    const month = transactionDate.getMonth();
                    
                    if (transaction.transaction_type === 'Income') {
                        monthlyData[month].income += transaction.amount;
                        totalIncome += transaction.amount;
                    } else if (transaction.transaction_type === 'Expense') {
                        monthlyData[month].expense += transaction.amount;
                        totalExpense += transaction.amount;
                    }
                }
            });
        }

        barChart.data.datasets[0].data = monthlyData.map(d => d.income);
        barChart.data.datasets[1].data = monthlyData.map(d => d.expense);
        barChart.update();

        document.getElementById('totalIncome').textContent = totalIncome.toLocaleString();
        document.getElementById('totalExpense').textContent = totalExpense.toLocaleString();
    } catch (error) {
        console.error('Error updating bar chart:', error);
    }
}

function generateRandomColor() {

    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(70 + Math.random() * 30);
    const lightness = Math.floor(45 + Math.random() * 20);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getColorArray(count) {
    // Generate an array of distinct random colors
    const colors = new Set();
    while (colors.size < count) {
        colors.add(generateRandomColor());
    }
    return Array.from(colors);
}

function createPieChart() {
    const ctx = document.getElementById('expensePieChart').getContext('2d');
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [] 
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12
                    }
                }
            }
        }
    });
}


function createBarChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Income',
                    backgroundColor: '#36A2EB',
                    data: []
                },
                {
                    label: 'Expense',
                    backgroundColor: '#FF6384',
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString()
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: context => {
                            const label = context.dataset.label;
                            const value = context.raw;
                            return `${label}: ₹${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize when analyze modal is opened
document.querySelector('[data-modal="analyze"]').addEventListener('click', function() {
    if (!pieChart || !barChart) {
        initializeAnalysis();
    }
    updatePieChart();
    updateBarChart();
});



//budgeting

// Function to populate budget categories
function populateBudgetCategories() {
    const user = auth.currentUser;
    if (!user) return;

    const budgetCategorySelect = document.getElementById('budgetCategory');
    budgetCategorySelect.innerHTML = ''; // Clear existing options

    // Add "All" option first
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    budgetCategorySelect.appendChild(allOption);

    // Fetch and add user categories
    const categoriesRef = ref(realTimeDb, `users/${user.uid}/user_shop_category`);
    onValue(categoriesRef, (snapshot) => {
        if (snapshot.exists()) {
            const categories = snapshot.val();
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                budgetCategorySelect.appendChild(option);
            });
        }
    });
}

// Function to set new budget
async function setBudget() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please sign in first');
        return;
    }

    const category = document.getElementById('budgetCategory').value;
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    const monthSelection = document.getElementById('budgetMonth').value;

    // Validation
    if (!category || !amount || amount <= 0) {
        alert('Please select a category and enter a valid amount');
        return;
    }

    try {
        const budgetRef = ref(realTimeDb, `user_budget/${user.uid}`);
        const currentYear = new Date().getFullYear();

        // Determine active months
        let activeMonths;
        if (monthSelection === 'all') {
            activeMonths = Array.from({length: 12}, (_, i) => i.toString()); // 0-11 for all months
        } else {
            activeMonths = [monthSelection];
        }

        // Create budget data structure
        const budgetData = {
            amount: amount,
            active_months: activeMonths,
            year: currentYear
        };

        // Update the budget in Firebase
        const updates = {};
        updates[`${category}`] = budgetData;

        await update(budgetRef, updates);

        alert('Budget set successfully!');
        document.getElementById('budgetAmount').value = '';
        document.getElementById('budgetMonth').value = 'all';

    } catch (error) {
        console.error('Error setting budget:', error);
        alert('Failed to set budget. Please try again.');
    }
}

// Initialize budget management
function initializeBudgetManagement() {
    // Populate categories when budget modal opens
    document.querySelector('[data-modal="budget"]').addEventListener('click', () => {
        populateBudgetCategories();
    });

    // Set budget when button is clicked
    document.getElementById('setBudgetBtn').addEventListener('click', setBudget);
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeBudgetManagement);



// Function to display current budgets based on selected month
function displayCurrentBudgets() {
    const user = auth.currentUser;
    if (!user) return;

    const selectedMonth = document.getElementById('currentBudgetMonth').value;
    const budgetListContainer = document.getElementById('budgetList');
    
    const budgetRef = ref(realTimeDb, `user_budget/${user.uid}`);
    onValue(budgetRef, (snapshot) => {
        budgetListContainer.innerHTML = '';

        if (snapshot.exists()) {
            const budgets = snapshot.val();
            
            Object.entries(budgets).forEach(([category, budgetData]) => {
                let shouldDisplay = false;

                if (selectedMonth === 'all') {
                    // For yearly view, only show budgets where active_months array has length 12
                    shouldDisplay = budgetData.active_months.length >= 2;
                } else {
                    // For monthly view, show both yearly budgets and specific month budgets
                    shouldDisplay = budgetData.active_months.length === 12 || 
                                  budgetData.active_months.includes(selectedMonth);
                }

                if (shouldDisplay) {
                    const budgetItem = document.createElement('div');
                    budgetItem.className = 'budget-item';
                    budgetItem.innerHTML = `
                        <div class="budget-info">
                            <span class="budget-category">${category}</span>
                            <span class="budget-amount">₹${budgetData.amount.toLocaleString()}</span>
                        </div>
                        <button class="delete-budget-btn" title="Delete Budget">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;

                    budgetItem.querySelector('.delete-budget-btn').addEventListener('click', () => {
                        deleteBudget(category, selectedMonth);
                    });

                    budgetListContainer.appendChild(budgetItem);
                }
            });

            if (budgetListContainer.children.length === 0) {
                budgetListContainer.innerHTML = '<div class="no-budget">No budgets set for this period</div>';
            }
        } else {
            budgetListContainer.innerHTML = '<div class="no-budget">No budgets found</div>';
        }
    });
}


// Modified delete function
async function deleteBudget(category, month) {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm(`Are you sure you want to delete the budget for ${category}?`)) {
        return;
    }

    try {
        const budgetRef = ref(realTimeDb, `user_budget/${user.uid}/${category}`);
        const snapshot = await get(budgetRef);

        if (snapshot.exists()) {
            const budgetData = snapshot.val();

            if (month === 'all') {
            
                await remove(budgetRef);
            } else {
      
                let activeMonths = budgetData.active_months;
                

                activeMonths = activeMonths.filter(m => m !== month);
                
                if (activeMonths.length === 0) {
            
                    await remove(budgetRef);
                } else {
                   
                    await update(budgetRef, {
                        active_months: activeMonths
                    });
                }
            }

            
            displayCurrentBudgets();
        }
    } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget. Please try again.');
    }
}




function initializeCurrentBudgets() {

    const currentMonth = new Date().getMonth().toString();
    const currentBudgetMonth = document.getElementById('currentBudgetMonth');
    currentBudgetMonth.value = currentMonth;

    
    currentBudgetMonth.addEventListener('change', displayCurrentBudgets);


    displayCurrentBudgets();
}
document.querySelector('[data-modal="budget"]').addEventListener('click', () => {
    initializeCurrentBudgets();
});
