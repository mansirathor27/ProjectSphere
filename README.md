# ProjectSphere 🚀

## 📌 Overview
ProjectSphere is a full-stack Academic Project Management Platform developed using the MERN stack. The platform helps educational institutions manage academic projects efficiently through role-based access for Students, Teachers, and Administrators.

It streamlines project submission, approval workflows, communication, deadline tracking, and academic progress monitoring in a centralized system.

---

## ✨ Features

### 👨‍🎓 Student Features
- Submit academic projects
- Upload project documents securely
- Track project deadlines and status
- Receive real-time notifications
- Communicate with teachers through live chat

### 👨‍🏫 Teacher Features
- Review and approve/reject projects
- Monitor student progress
- Provide feedback and guidance
- Manage project discussions

### 👨‍💼 Admin Features
- Manage users and roles
- Monitor all academic activities
- Control workflow and project management
- Maintain academic records

---

## ⚡ Real-Time Communication
ProjectSphere integrates Socket.io to provide:
- Live messaging inside project rooms
- Instant notifications for updates and deadlines
- Real-time collaboration between students and teachers

---

## 🔒 Secure File Upload System
The platform uses Multer for secure file uploads, allowing users to:
- Upload project reports and documents
- Manage academic files efficiently
- Store submission history securely

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Additional Technologies
- Socket.io
- Multer
- JWT Authentication

---

## 🏗️ System Architecture
The application follows a client-server architecture:

- React.js handles the frontend UI
- Node.js and Express.js manage backend APIs
- MongoDB stores application data
- Socket.io enables real-time communication

---

## 📷 Screenshots

### Dashboard
Add dashboard screenshot here

### Project Submission Page
Add submission page screenshot here

### Chat System
Add chat system screenshot here

### Admin Panel
Add admin panel screenshot here

---

##  Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/mansirathor27/ProjectSphere.git
cd ProjectSphere
```

### 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

### 3️⃣ Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## ▶️ Run the Application

### Start Backend Server

```bash
npm start
```

### Start Frontend

```bash
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in the backend folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 📂 Project Structure

```bash
ProjectSphere/
│
├── frontend/
│   ├── src/
│   ├── public/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│
├── README.md
```

---

## 🎯 Project Objectives
- Simplify academic project management
- Improve communication between students and teachers
- Enable real-time collaboration
- Maintain organized academic records
- Reduce manual workflow management

---

## 🌟 Future Enhancements
- Email notification system
- AI-based project recommendations
- Video meeting integration
- Analytics dashboard
- Mobile application support

---

## 🤝 Contributing
Contributions are welcome. Feel free to fork the repository and submit pull requests.

---

## 📄 License
This project is developed for educational and learning purposes.

---

## 👩‍💻 Author

### Mansi Rathor
GitHub: https://github.com/mansirathor27
