# 🚌 Smart Bus Ticket System

A **fully deployed full-stack web application** that allows users to **book bus tickets**, **track buses live**, and **verify tickets using QR codes**, while administrators manage buses, routes, and schedules through a dedicated dashboard.

This project demonstrates complete end-to-end development using **Node.js, Express, MongoDB Atlas, Google Maps API, Vercel, and Render**.

---

# 🌐 Live Application

| Component | URL |
|----------|------|
| **Frontend (Vercel)** | https://bus-ticket-system-omega.vercel.app |
| **Backend (Render)** | https://bus-ticket-system-w7wd.onrender.com |
| **Repository** | https://github.com/sandeepJonnalagadda/bus_ticket_system |

✔ Always accessible  
✔ Backend may take a few seconds to wake up (Render free tier)

---

# 🚀 Features

## 🔹 User Features
- User Registration & Login (JWT)
- Browse and search buses
- Book tickets
- View booking history
- **Live bus tracking using Google Maps API**
- **QR code–based ticket verification**

## 🔹 Admin Features
- Add, edit, delete buses
- Manage routes and schedules
- View all user bookings
- Admin dashboard

## 🔹 System Features
- REST APIs with Express.js
- MongoDB Atlas cloud storage
- Secure password hashing (bcrypt)
- JWT authentication
- Google Maps JavaScript & Directions API

---

# 🛠️ Tech Stack

## 🌐 Frontend
- HTML
- CSS
- JavaScript
- Google Maps JavaScript API

## 🧩 Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT
- Bcrypt

## ☁ Deployment
- **Frontend:** Vercel  
- **Backend:** Render  
- **Database:** MongoDB Atlas  
- **Maps:** Google Maps API  

---

# 📁 Project Structure

bus_ticket_system/
│
├── frontend
├── backend
└── README.md


---

# ⚙️ Local Development Setup

## 1️⃣ Backend Setup

- cd backend
- npm install
- npm run dev
- http://localhost:5000

## 2️⃣ Frontend Setup

- cd frontend
- python -m http.server 8000
- http://localhost:8000

# 🚀 Deployment Guide (Completed)
## 1️⃣ Backend on Render
### Environment Variables:
- PORT=5000
- MONGODB_URI=your_mongodb_atlas_url
- JWT_SECRET=your_secret
- NODE_ENV=production
- FRONTEND_URL=https://bus-ticket-system-omega.vercel.app

### Commands:
- Build:  npm install
- Start:  npm start

### Backend URL:
- https://bus-ticket-system-w7wd.onrender.com

## 2️⃣ Frontend on Vercel
- Root Directory:frontend
- const API_URL = "https://bus-ticket-system-w7wd.onrender.com/api";

---

## 3️⃣ Google Maps API Setup
### Enable:
- Maps JavaScript API
- Directions API

### Allowed Referrers:
- https://bus-ticket-system-omega.vercel.app/*
- http://localhost:8000/*

---

# 🌍 After Deployment (Live Behavior)

✔ Frontend always online

✔ Backend wakes from sleep automatically

✔ Live tracking fully functional

✔ QR verification works online

✔ MongoDB Atlas stores all production data

# 🤝 Contributing

Pull requests and improvements are welcome!

# 👨‍💻 Author

Sandeep Jonnalagadda
GitHub: https://github.com/sandeepJonnalagadda

# ⭐ Support

If you like this project, please ⭐ star the repository!

---

# ✅ IMPORTANT  
👉 **Paste this only in GitHub README.md editor**, NOT in Word or Notepad.

Then GitHub will automatically show:

- ✔ Headings  
- ✔ Bold text  
- ✔ Code blocks  
- ✔ Tables  
- ✔ Icons  

---

If you want, I can also:

✅ Generate a README banner image  
✅ Add shields.io badges  
✅ Add screenshots section  
✅ Add an architecture diagram  
Just tell me!
