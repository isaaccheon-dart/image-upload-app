# Image Upload & Share App with Real-Time Sharing

A modern React-based image upload application with real-time image sharing capabilities using Socket.IO and WebSockets!

## Features

- **Image Upload**: Upload images with preview functionality
- **Real-Time Communication**: Uses Socket.IO for instant image sharing
- **User Registration**: Connect with a unique user ID
- **Direct Sharing**: Send images to specific users by their ID
- **Broadcasting**: Share images with all connected users at once
- **Live Feed**: See received images in real-time with sender information
- **Beautiful UI**: Modern gradient design with smooth animations

## Tech Stack

- **Frontend**: React 19 with Vite
- **Backend**: Express.js with Socket.IO
- **File Upload**: Multer middleware
- **Real-Time**: Socket.IO with WebSocket support

## Installation

### 1. Install Dependencies

#### Frontend:
```bash
npm install
```

#### Backend:
```bash
cd server
npm install
```

### 2. Run the Application

#### Start the Backend Server:
```bash
cd server
npm start
```
Server runs on `http://localhost:5001`

#### Start the Frontend (in a new terminal):
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

## How to Use

### 1. Register Your User ID
- Open the app in your browser
- Enter a unique user ID (e.g., "user1", "alice", "bob")
- Click "Connect" to register

### 2. Upload an Image
- Click "Choose Image" to select an image from your computer
- Preview your image
- Click "Upload Image" to upload it to the server

### 3. Share Images

#### Option A: Send to Specific User
- After uploading an image, enter the recipient's User ID
- Click "Send to User"
- The recipient will see your image in their "Received Images" section

#### Option B: Broadcast to All
- After uploading an image, click "Broadcast to All"
- All connected users will receive your image instantly

### 4. View Received Images
- When someone shares an image with you, it appears in the "Received Images" section
- Each image shows:
  - Sender's User ID
  - Timestamp of when it was sent
  - The shared image
  - Filename

## Testing Real-Time Sharing

To test the real-time features:

1. Open the app in multiple browser windows/tabs
2. Register each window with a different User ID (e.g., "alice", "bob")
3. Upload an image in one window
4. Share it with another user's ID or broadcast to all
5. Watch the image appear instantly in the recipient's window!

## Project Structure

```
image-upload-app/
├── src/
│   ├── App.jsx          # Main React component with Socket.IO client
│   ├── App.css          # Styling with gradients and animations
│   └── main.jsx         # React entry point
├── server/
│   ├── server.js        # Express + Socket.IO server
│   ├── uploads/         # Uploaded images directory
│   └── package.json     # Server dependencies
├── public/
└── package.json         # Frontend dependencies
```

## Socket.IO Events

### Client → Server
- `register`: Register user with a unique ID
- `shareImage`: Send image to specific user
- `broadcastImage`: Send image to all users

### Server → Client
- `registered`: Confirmation of successful registration
- `receiveImage`: Receive a shared image
- `shareSent`: Confirmation of successful share
- `shareError`: Error message if share fails

## Configuration

### Backend (server/server.js)
- Port: `5001`
- CORS Origin: `http://localhost:5173`
- Max File Size: 5MB
- Allowed Formats: JPEG, JPG, PNG, GIF

### Frontend (src/App.jsx)
- Socket.IO Server: `http://localhost:5001`
- API Endpoint: `/api/upload`

## Features in Detail

### Real-Time Architecture
The app uses WebSockets (via Socket.IO) to establish a persistent connection between clients and the server. When an image is shared:

1. Sender uploads image to server (via HTTP POST)
2. Image is saved and URL is generated
3. Sender emits Socket.IO event with recipient ID and image URL
4. Server looks up recipient's socket connection
5. Server sends image URL to recipient in real-time
6. Recipient's React app receives and displays the image instantly

### User Management
- Each user registers with a unique ID
- Server maintains a Map of userId → socketId
- When users disconnect, they're removed from the active users list

### Security Features
- File type validation (images only)
- File size limits (5MB max)
- CORS protection
- Input sanitization

## Customization

### Change Colors
Edit the gradient colors in `src/App.css`:
```css
.registration-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Change File Size Limit
Edit `server/server.js`:
```javascript
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});
```

### Add More File Types
Edit the fileFilter in `server/server.js`:
```javascript
const allowedTypes = /jpeg|jpg|png|gif|webp/;
```

## Troubleshooting

### Socket.IO Connection Issues
- Make sure backend is running on port 5001
- Check CORS settings in `server/server.js`
- Verify Socket.IO server URL in `src/App.jsx`

### Images Not Uploading
- Check file size (must be under 5MB)
- Verify file type (JPEG, JPG, PNG, GIF only)
- Ensure `server/uploads/` directory exists

### User Not Found Error
- Make sure recipient is connected with the correct User ID
- User IDs are case-sensitive

## Future Enhancements

- User authentication and profiles
- Image galleries and history
- Group chat rooms
- Video sharing support
- Image filters and editing
- Persistent message storage
- Typing indicators
- Read receipts
- Emoji reactions

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
