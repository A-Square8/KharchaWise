# KharchaWise Finance Tracker

A modern, highly responsive Personal Finance tracking application. Built with vanilla HTML, CSS, JS, and powered by Firebase Realtime Database. Features a premium "Glassmorphism" design system that elegantly morphs from a Bottom-Nav mobile app view into a professional Sidebar Dashboard on laptops and desktop screens.

## 🚀 Stunning Features

1. **Premium FinTech Design**
   - Translucent Glassmorphism cards with smooth blur filters.
   - Dynamic, fluid animations (Slide-up Bottom Sheets for Mobile, Centered Glass Popovers for Desktop).
   - Carefully chosen sophisticated color palettes (Deep slates, Indigo primary, Emerald success states).

2. **Responsive Dashboard Layout**
   - **Laptop & Desktop:** Utilizes a full-height Sidebar navigation layout (`display: flex`) with sticky widgets on the right side.
   - **Mobile Phones:** Automatically converts the Sidebar into a sticky Bottom Navigation bar, mirroring top-tier native mobile applications.
   - Multi-column flexible grids that adapt automatically without breaking.

3. **Intelligent Accounts & Balances**
   - The Top Balance card includes a sliding interface holding all of your bank accounts.
   - Accounts are dynamically fetched and formatted perfectly in a beautifully padded flexbox list indicating the exact institution name and current monetary holding.

4. **Advanced Transaction History Filters**
   - Integrated dynamic dropdown category filters (syncs with categories you personally define over time).
   - Blazing-fast real-time search filtering.
   - Smoothly paginated datasets ensuring the UI is never overwhelmed.

5. **Integrated Analytics Suite**
   - Interactive dual configurations for Chart.js visualizing your expenses via Doughnut and Bar graphs.
   - Dynamic Budget trackers showing how close you are to your limits per category.

6. **Firebase Backed**
   - Instant state syncing.
   - Secure Google Single Sign-On (SSO) alongside standard Email/Password Auth.
   - All transactions, budgets, account strings, and custom categories are saved permanently.

## 💻 Tech Stack
- HTML5 (Semantic Structure)
- Modern CSS3 (Grid, Flexbox, Variable-driven Theming, Media Queries)
- Vanilla Javascript ES6 (Modular `type="module"` execution)
- Firebase Auth & Realtime Database
- Chart.js

## ⚙️ How to Run
Due to ES6 Modules and CORS cross-origin policies for fetching external `https://` Firebase modules, **you must use a local web server to run this app.**

### Option A: VS Code Live Server (Recommended)
1. Open the folder in VS Code.
2. Install the `Live Server` extension.
3. Right-click `index.html` -> "Open with Live Server".

### Option B: Python Simple Server
1. Open your terminal in this directory.
2. Run `python3 -m http.server 8000`
3. Visit `http://localhost:8000` in Google Chrome or any modern browser.

---
*Built for tracking wealth seamlessly across every device format imaginable.*
