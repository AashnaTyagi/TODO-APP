<div align="center">

# ✅ Taskflow
### Production-Grade Task Management Web Application

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-f97316?style=flat-square)](#license)

> A full-stack task management application with secure JWT authentication, RESTful API design, MongoDB persistence, and a fully responsive modern UI — built without any frontend framework.

**[🚀 Live Demo](#) · [📖 API Docs](#api-reference) · [🐛 Report Bug](../../issues)**

---

![Taskflow Dashboard](screenshots/dashboard.png)

</div>

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Screenshots](#screenshots)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [API Reference](#api-reference)
9. [Database Schema](#database-schema)
10. [Security](#security)
11. [Deployment](#deployment)
12. [Author](#author)

---

## Overview

Taskflow is a production-quality web application demonstrating end-to-end software engineering — from database modelling and API design to frontend architecture and security hardening.

Users can register, authenticate securely, and manage personal tasks with full CRUD operations, drag-and-drop ordering, priority levels, due dates, and real-time search.

> Built as a portfolio project to demonstrate enterprise-grade development practices.

---

## Screenshots

### 🔐 Sign In 
![Sign-in](screenshots/signin.png)

### 🔐 Sign Up
![Sign-up](screenshots/signup.png)

### 📊 Dashboard
![Dashboard](screenshots/dashboard.png)

### ➕ Add New Task
![Add Task](screenshots/addtask.png)

### ✏️ Edit Task
![Edit Task](screenshots/taskstatus.png)

### 🌙 Dark Mode
![Dark Mode](screenshots/darkmode.png)


---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime** | Node.js 18+ | JavaScript server runtime |
| **Framework** | Express.js 4.x | HTTP server & routing |
| **Database** | MongoDB + Mongoose | Document persistence & schema modeling |
| **Auth** | jsonwebtoken + bcryptjs | JWT authentication & password hashing |
| **Security** | Helmet + express-rate-limit | HTTP headers & brute-force protection |
| **Validation** | express-validator | Input sanitization |
| **Frontend** | HTML5 / CSS3 / Vanilla JS | SPA with no framework dependency |
| **Dev Tools** | nodemon + dotenv | Hot reload & environment management |

---

## Features

### 🔐 Authentication
- User registration and login with JWT tokens (7-day expiry)
- Password validation: min 6 chars, uppercase, lowercase, number, special character
- bcrypt hashing with 12 salt rounds
- Auto session restore on page reload
- Secure logout

### ✅ Task Management
- Create, edit, delete tasks
- Toggle complete / incomplete
- Drag and drop reordering (persisted to database)
- Priority levels: High / Medium / Low
- Due dates with overdue indicators
- Filter by status: All / Pending / Completed
- Filter by priority
- Full-text search with 300ms debounce

### 📊 Dashboard
- Live statistics: Total, Pending, Completed, Progress %
- Animated progress ring and stat bars
- Greeting based on time of day
- Dark mode (preference saved per user in database)
- Fully responsive: mobile, tablet, desktop
- Toast notifications, skeleton loaders, empty states

---

## Project Structure
```
todo-app/
│
├── README.md                       ← You are here
├── .gitignore                      ← Excludes node_modules, .env
├── package.json
│
├── screenshots/                    ← App screenshots for this README
│   ├── login.png
│   ├── dashboard.png
│   ├── add-task.png
│   ├── edit-task.png
│   ├── dark-mode.png
│   └── mobile.png
│
├── backend/                        ← Node.js / Express API server
│   ├── server.js                   ← Entry: middleware, routes, DB connection
│   ├── .env                        ← Your secrets (never committed to Git)
│   ├── .env.example                ← Template showing all required variables
│   ├── package.json                ← Backend dependencies
│   │
│   ├── models/
│   │   ├── User.js                 ← Schema, bcrypt pre-save hook, JWT method
│   │   └── Task.js                 ← Schema with priority, due date, ordering
│   │
│   ├── controllers/
│   │   ├── authController.js       ← signup, login, getMe, updateTheme
│   │   └── taskController.js       ← getTasks, create, update, delete, reorder
│   │
│   ├── middleware/
│   │   ├── auth.js                 ← Verifies JWT Bearer token
│   │   ├── validate.js             ← Input validation rule sets
│   │   └── errorHandler.js         ← Global error normalization
│   │
│   └── routes/
│       ├── auth.js                 ← /api/auth/signup  /login  /me
│       └── tasks.js                ← /api/tasks (all protected)
│
└── frontend/                       ← Static SPA served by Express
    ├── index.html                  ← Single HTML shell for the entire app
    ├── css/
    │   └── main.css                ← Full stylesheet: themes, layout, components
    └── js/
        ├── api.js                  ← Fetch wrapper: attaches auth header
        ├── auth.js                 ← Login/signup forms, session management
        ├── tasks.js                ← Task rendering, CRUD, drag-and-drop
        └── app.js                  ← Bootstrap, dark mode, toasts, sidebar
```

---

## Getting Started

> ⏱ Follow these steps in order. The app will be running in under 5 minutes.

---

### Prerequisites

| Tool | Check | Download |
|---|---|---|
| Node.js v18+ | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | `npm --version` | Included with Node.js |
| Git | `git --version` | [git-scm.com](https://git-scm.com) |

---

### Step 1 — Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

### Step 2 — Install Dependencies
```bash
cd backend
npm install
```

### Step 3 — Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → sign up free
2. Click **Build a Database** → select **M0 Free**
3. Create a **database user** — save the username and password
4. Go to **Network Access** → Add IP Address → type `0.0.0.0/0` → Confirm
5. Click **Connect** → **Drivers** → copy the connection string

### Step 4 — Configure Environment Variables
```bash
copy .env.example .env
code .env
```

See [Environment Variables](#environment-variables) below for exact values.

### Step 5 — Start the Server
```bash
npm run dev
```

Expected output:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
   Environment: development
```

### Step 6 — Open the App

Visit **http://localhost:5000** in your browser.

- Click **Sign Up** to create your account
- Password example: `Hello@1` (min 6 chars, uppercase, lowercase, number, special char)
- You will land on the dashboard automatically
- Click **Add Task** to create your first task!

---

## Environment Variables

Create `backend/.env` with these values:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB — paste your Atlas connection string here
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/todoapp?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret — generate using the command below
JWT_SECRET=your_64_character_random_hex_string
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5000
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> ⚠️ Never commit `.env` to GitHub. It is already in `.gitignore`.

---

## API Reference

All task routes require:
```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, receive JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PATCH | `/api/auth/theme` | ✅ | Save theme preference |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/tasks` | ✅ | List tasks (filterable) |
| POST | `/api/tasks` | ✅ | Create task |
| PATCH | `/api/tasks/:id` | ✅ | Update task |
| DELETE | `/api/tasks/:id` | ✅ | Delete task |
| PATCH | `/api/tasks/reorder` | ✅ | Save drag-and-drop order |

**GET /api/tasks query parameters:**

| Param | Values | Description |
|-------|--------|-------------|
| `filter` | `all` \| `pending` \| `completed` | Filter by status |
| `priority` | `high` \| `medium` \| `low` | Filter by priority |
| `search` | any string | Search title & description |
| `sortBy` | `order` \| `createdAt` \| `dueDate` | Sort field |
| `order` | `asc` \| `desc` | Sort direction |

---

## Database Schema

### User
```
_id          ObjectId   Auto-generated
name         String     Required · 2–50 chars
email        String     Required · Unique · Indexed
password     String     bcrypt hashed · never returned in queries
theme        String     'light' | 'dark'
lastLogin    Date       Updated on each login
createdAt    Date       Auto
updatedAt    Date       Auto
```

### Task
```
_id          ObjectId   Auto-generated
user         ObjectId   Ref: User · Indexed
title        String     Required · 1–200 chars
description  String     Optional · max 1000 chars
completed    Boolean    Default: false
priority     String     'low' | 'medium' | 'high'
dueDate      Date       Optional
order        Number     Drag-and-drop index
completedAt  Date       Auto-set when completed = true
createdAt    Date       Auto
updatedAt    Date       Auto
```

---

## Security

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt · 12 salt rounds |
| Authentication | JWT · 7-day expiry · HS256 |
| HTTP headers | helmet.js |
| Rate limiting | 100 req/15min · 10 req/15min on auth |
| Input validation | express-validator on all endpoints |
| CORS | Restricted to frontend origin only |
| Data isolation | All queries scoped to `req.user._id` |
| User enumeration prevention | Generic error messages on auth failure |
| Password never exposed | `select: false` on password field |

---

## Deployment

### Railway (Recommended — Free Tier)
1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add MongoDB plugin
4. Set environment variables
5. Auto-deploys on every push ✅

### Render (Free Tier)
1. Go to [render.com](https://render.com) → New Web Service
2. Build command: `cd backend && npm install`
3. Start command: `cd backend && npm start`
4. Add environment variables + MongoDB Atlas URI

---

## Push to GitHub
```bash
git init
git add .
git commit -m "feat: production-ready Taskflow task management app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

---

## License

MIT License — free to use, modify, and distribute.

---

<div align="center">

## Author

### Aashna Tyagi
*Full-Stack Developer*

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YOUR_USERNAME)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/YOUR_PROFILE)

---

*© 2026 Taskflow — Designed & Built by **Aashna Tyagi**. All rights reserved.*

*If this helped you, please ⭐ the repository!*

</div>