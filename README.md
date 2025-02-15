# KharchaWise

KharchaWise is a **minimalist finance tracking application** designed to help users manage their **expenses, income, and transfers** efficiently. The application integrates **Google Firebase** for secure user authentication and transaction storage.

## Features
- **Expense Tracking:** Log and categorize expenses.
- **Income Tracking:** Record sources of income.
- **Transfers:** Track money transfers between accounts.
- **User Authentication:** Secure login and registration using Firebase.
- **Minimalist UI:** Simple, clean, and user-friendly interface.
- **Pagination:** Navigate through transaction history smoothly.
- **Responsive Design:** Works on both desktop and mobile devices.
- **Custom Account & Expense Category Addition:** Users can create and manage custom accounts and expense categories for better organization.
- **Monthly Analysis (with Pictorial Representation):** Get insights into monthly spending and income trends with interactive charts.
- **Budget Setting & Tracking:** Set budgets for different categories and track your progress visually.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Firebase (Authentication & Firestore for data storage)
- **Tools & Libraries:** FontAwesome (icons), Chart.js (for visual analytics), Git (version control)

## Installation & Setup
### 1. Clone the Repository
```sh
git clone https://github.com/your-username/kharchawise.git
cd kharchawise
```

### 2. Set Up Firebase
- Go to [Firebase Console](https://console.firebase.google.com/).
- Create a project and enable Firestore Database & Authentication.
- Get your Firebase config and update the `firebase-config.js` file:
```js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Run the Project
Simply open the `index.html` file in your browser.

## Usage
1. **Sign up or log in** using Firebase authentication.
2. **Add transactions** (Expense, Income, or Transfer).
3. **View, edit, or delete transactions** as needed.
4. **Navigate through pages** with the pagination controls.
5. **Customize Accounts & Categories** to organize finances more effectively.
6. **Analyze monthly transactions** with interactive charts to understand spending habits.
7. **Set budgets and track expenses** using visual progress indicators to maintain financial goals.

## Folder Structure
```
KharchaWise/
│-- index.html
│-- styles/
│   ├── styles.css
│-- scripts/
│   ├── main.js
│   ├── firebase-config.js
│   ├── charts.js (for data visualization)
│-- assets/
│   ├── icons/
│   ├── images/
```

## Future Improvements
- Add advanced financial reports
- Implement AI-based spending suggestions
- Dark mode support

## Contributing
Feel free to fork the repository and submit pull requests. Contributions are welcome!

## License
This project is licensed under the **MIT License**.

---
🚀 Built with ❤️ by [Your Name]

