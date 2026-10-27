# Universe - Campus Sentiment Analysis

An enterprise-ready, full-stack campus sentiment intelligence platform built with **React (Vite)**, **Node.js (Express)**, **MongoDB Atlas (Mongoose)**, and a verified **Scikit-Learn TF-IDF & Logistic Regression** machine learning engine.

---

## 🚀 Mandatory Technology Stack

- **Frontend:** React.js 18 with Vite
- **Routing:** React Router v6
- **Backend:** Node.js (v20+) with Express.js (Primary Server)
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** Secure server-side authentication with HttpOnly cookies & JWT
- **Password Security:** Salted password hashing with `bcryptjs`
- **Machine Learning Integration:** Verified Scikit-Learn TF-IDF Vectorizer + Negation-Aware Logistic Regression pipeline (`sentiment_model.pkl` & `vectorizer.pkl`)

---

## 📁 Project Structure

```text
Universe-CampusSentimentAnalysis/
├── frontend/                     # React.js + Vite Application
│   ├── public/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, ProtectedRoute
│   │   ├── context/              # AuthContext (HttpOnly session state)
│   │   ├── pages/
│   │   │   ├── Home.jsx          # 1. Home
│   │   │   ├── About.jsx         # 2. About Us
│   │   │   ├── SentimentAnalyzer.jsx # 3. Sentiment Analyzer
│   │   │   ├── Dashboard.jsx     # 4. Dashboard (Live MongoDB metrics)
│   │   │   ├── Contact.jsx       # 5. Contact Us
│   │   │   ├── Login.jsx         # 6. Login
│   │   │   ├── Register.jsx      # 6. Register
│   │   │   └── Profile.jsx       # 7. Profile & Logout
│   │   ├── App.jsx               # Route mappings & Layout
│   │   ├── main.jsx              # React DOM entry
│   │   └── index.css             # Glassmorphism Design System
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express Primary Backend
│   ├── config/
│   │   ├── db.js                 # MongoDB Atlas Mongoose connection
│   │   └── inMemoryStore.js      # Session cache fallback
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Logout, Profile
│   │   ├── feedbackController.js # Feedback submission & history
│   │   ├── dashboardController.js# Real-time aggregation metrics
│   │   ├── contactController.js  # Campus inquiries
│   │   └── mlService.js          # Python ML Child Process Bridge
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT & HttpOnly cookie protection
│   │   ├── rateLimiter.js        # Brute-force & spam limits
│   │   └── errorMiddleware.js    # Centralized error handler
│   ├── models/
│   │   ├── User.js               # Name, Email, PasswordHash, Role, Timestamps
│   │   └── Feedback.js           # FeedbackText, Sentiment, User, Category, Timestamps
│   ├── ml/                       # Machine Learning Model Assets
│   │   ├── sentiment_model.pkl   # Trained Logistic Regression classifier
│   │   ├── vectorizer.pkl        # Fitted TF-IDF vectorizer
│   │   ├── predict_bridge.py     # Python bridge with negation tokenizer
│   │   └── requirements.txt      # Python dependencies
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── sentimentRoutes.js
│   │   └── contactRoutes.js
│   ├── tests/
│   │   └── test_flow.js          # 16-point automated verification suite
│   ├── server.js                 # Primary Express server entry point
│   ├── .env                      # Local configuration
│   ├── .env.example              # Placeholders template
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start: Exact PowerShell Commands

Open PowerShell in the project root: `C:\Users\gupta\Universe-CampusSentementAnalysis`

### 1. Install Dependencies

```powershell
# Backend Dependencies
cd backend
npm install

# Frontend Dependencies
cd ..\frontend
npm install
cd ..
```

### 2. Configure Environment Variables

Inspect or update `backend\.env` (or copy from `backend\.env.example`):

```powershell
# In backend\.env:
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/universe_sentiment?retryWrites=true&w=majority
JWT_SECRET=universe_campus_sentiment_dev_secret_jwt_2026_xyz987
JWT_EXPIRES_IN=7d
COOKIE_SECRET=universe_campus_sentiment_dev_cookie_secret_2026
FRONTEND_URL=http://localhost:5173
PYTHON_PATH=C:\Users\gupta\OneDrive\Desktop\CampusSentimentAnalyzer\.venv\Scripts\python.exe
```

*(Note: If using system Python, set `PYTHON_PATH=python` after installing `backend/ml/requirements.txt` via `pip install -r backend/ml/requirements.txt`)*

### 3. Run Automated Integration Verification

```powershell
cd backend
npm test
cd ..
```

This tests:
- Positive, Negative, Neutral, and Negation-aware NLP model predictions
- Bcrypt salted password hashing and validation
- JWT sign and claims verification
- Express health check, rate limiting, and CORS
- User registration and duplicate email rejection (409)
- Login issuing secure HttpOnly cookies
- Protected route authentication via cookie
- Real-time feedback submission and dashboard aggregation
- User logout and cookie clearing

### 4. Run the Full Application Locally

Open two PowerShell terminal tabs:

**Terminal 1 — Backend Server:**
```powershell
cd backend
npm run dev
# Server listening at http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```powershell
cd frontend
npm run dev
# Vite dev server running at http://localhost:5173
```

Now open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛡️ Security Features

- **HttpOnly Cookies:** Session JWTs are stored in `HttpOnly`, `SameSite=Lax`, and `Secure` (production) cookies, immune to JavaScript XSS token theft.
- **CSRF Defense:** State-changing requests validate custom headers (`X-Requested-With`) and strict origin checks.
- **Bcrypt Hashing:** Passwords are salted and hashed (10 rounds) before MongoDB storage; plaintext is never stored or returned in queries (`select: false`).
- **Rate Limiting:** `express-rate-limit` prevents brute-force login attempts (20 attempts / 15 min) and feedback spam.
- **Input Validation:** Email normalization and validation regex, feedback length limits, and role enforcement.

---

## 📊 Live MongoDB Dashboard

The dashboard fetches live metrics computed directly from MongoDB Atlas:
- **Total Submissions Count**
- **Positive Sentiment Count & Percentage** (Emerald)
- **Neutral Sentiment Count & Percentage** (Amber)
- **Negative Sentiment Count & Percentage** (Rose)
- **Interactive Sentiment Distribution Chart**
- **Campus Category Breakdown** (Academics, Canteen, Facilities, Events, etc.)
- **Filterable & Searchable Feedback History Table** with role-based deletion controls.
