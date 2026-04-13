# How to Start the Project (The "Even a Monkey Can Do It" Guide) 🐵

Welcome! Follow these insanely simple steps to get the app running on your machine.

### Prerequisites (Do this only once!)
1. Ensure you have **Node.js** installed on your computer.
2. Ensure you have **MongoDB** running in the background.

---

### Step 1: Open Your Terminal
Open your terminal (Command Prompt, PowerShell, or VS Code Terminal) right in this folder: 
`e:\fullstackminiproj`

### Step 2: Install the Dependencies
If this is your first time running the project, you need to download the required packages. Just copy and paste this into your terminal and hit Enter:

```bash
npm install
cd Backend && npm install
cd ../Frontend && npm install
cd ..
```
*(Wait a minute or two for all the downloads to finish. You only need to do this once!)*

### Step 3: Start the App! 🚀
Run this single magic command from the main `fullstackminiproj` folder:

```bash
npm start
```

### What happens now?
- The **Backend (Server)** will start automatically (it connects to MongoDB).
- The **Frontend (Website)** will start up using Vite.
- Open your browser and go to the link shown in the terminal (usually `http://localhost:5173`).

---

### 🚨 Troubleshooting (If Things Go Wrong)
- **"MongoDB connection error" / "Crash"**: Make sure your local MongoDB instance is actually running.
- **"Command not found"**: Did you install Node.js? Check by running `node -v` in terminal.
- **"Port already in use"**: You might have another server running. Close other terminal windows and try again.
