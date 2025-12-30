Quick Chat - Real-Time MERN Chat Application
Quick Chat is a high-performance, real-time messaging platform built with the MERN stack. It features instant messaging, user authentication, profile management, and online/offline status tracking.

🚀 Features
Real-Time Messaging: Instant message delivery using Socket.io without page reloads .

User Authentication: Secure Sign-up and Login functionality with password encryption using Bcrypt.js .

Status Tracking: Real-time online/offline status indicators for all users .

Media Sharing: Ability to send images within the chat and view shared media in a dedicated sidebar .

Unread Message Indicators: Visual badges to notify users of new, unseen messages .

Profile Management: Users can update their name, bio, and upload profile pictures via Cloudinary .

Responsive UI: A clean, modern interface styled with Tailwind CSS .

Search Functionality: Easily find other users to start a conversation .

🛠️ Tech Stack
Frontend: React.js, Tailwind CSS, React Router DOM, Axios .

Backend: Node.js, Express.js .

Database: MongoDB (Atlas) with Mongoose .

Real-Time Engine: Socket.io .

Cloud Storage: Cloudinary (for profile and chat images) .

State Management: React Context API .

📦 Installation & Setup
1. Clone the repository
Bash

git clone https://github.com/venu-gopal12/chat-app.git
cd chat-app
2. Backend Setup
Navigate to the server folder: cd server

Install dependencies: npm install

Create a .env file and add the following :

Code snippet

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
Start the server: npm run server .

3. Frontend Setup
Navigate to the client folder: cd client

Install dependencies: npm install

Create a .env file and add:

Code snippet

VITE_BACKEND_URL=http://localhost:5000
Start the development server: npm run dev .
