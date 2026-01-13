# Image Upload & Share App

A React-based image upload application with real-time sharing capabilities using Socket.IO and WebSockets. Users can upload images and share them instantly with specific users or broadcast to all connected users.

## Features

- Upload images with live preview
- Real-time image sharing via Socket.IO
- Direct messaging to specific users
- Broadcast to all connected users
- Live feed of received images

## Installation

### Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

## Running the App

### Start Backend Server
```bash
cd server
npm start
```
Server runs on `http://localhost:5001`

### Start Frontend (in a new terminal)
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

## Usage

1. Open http://localhost:5173/ in your browser
2. Enter a user ID and click "Connect"
3. Upload an image
4. Share with a specific user ID or broadcast to all
5. Test with multiple browser tabs using different user IDs

## Tech Stack

- Frontend: React + Vite
- Backend: Express.js + Socket.IO
- Real-time: WebSockets via Socket.IO
