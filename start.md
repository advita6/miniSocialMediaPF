# 🚀 Social Media Pro: The Ultimate Start Guide

Welcome to the **Social Media Pro** project! This is a full-stack social media application designed with performance, real-time interactivity, and a premium user experience in mind.

---

## ✨ Key Features (What's New!)

We've been busy! Here are the core functionalities now live in the project:

- **💬 Real-Time Global Chat**: 
    - Instant messaging across local networks.
    - Built-in **Emoji Picker** for expressive conversations.
    - **Identity Persistence**: Your anonymous handle stays with you even after a refresh.
- **🔔 Smart Notifications**: 
    - Real-time alerts when someone **Likes** or **Comments** on your post.
    - One-click navigation: Click a notification to go straight to the relevant post.
- **🛡️ Admin Dashboard**: 
    - Comprehensive control panel to manage the platform.
    - Ability to delete posts directly from the dashboard.
- **🏠 Dynamic Home Feed**: 
    - Mix of user-generated content and external placeholder posts for a rich initial experience.
- **👤 User Profiles & Settings**: 
    - Personalized profile pages showing your specific posts.
    - Settings page to manage your account details.
- **🔐 Secure Auth System**: 
    - Persistent login sessions and secure password hashing.

---

## 🛠️ Step-by-Step Setup

Follow these steps to get everything running in minutes.

### 1. Prerequisites
- **Node.js**: Ensure you have the latest stable version installed.
- **MongoDB**: Have a local MongoDB instance running (usually on `localhost:27017`).

### 2. Environment Configuration
Check the `.env` file in the `Backend` folder. It should look like this:
```env
PORT=5000
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
```

### 3. Installation
Open your terminal in the root folder (`e:\fullstackminiproj`) and run:
```bash
# Install root, backend, and frontend dependencies at once
npm install && cd Backend && npm install && cd ../Frontend && npm install && cd ..
```

### 4. Launch the App! 🚀
From the root folder, run:
```bash
npm start
```
This command uses `concurrently` to start both the Backend (Port 5000) and Frontend (Port 5173) simultaneously.

---

## 🔗 Quick Links
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🚨 Troubleshooting
- **"Connection Refused"**: Check if MongoDB is running (`mongosh` or MongoDB Compass).
- **"Socket issues"**: If chat doesn't connect, ensure the `FRONTEND_URL` in `.env` matches your browser URL.
- **"Missing dependencies"**: Run the installation command in step 3 again.

---
*Happy Coding!* 🎈
