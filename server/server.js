const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});
const PORT = 5001;

// Enable CORS for React app
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Serve uploaded images as static files
app.use('/api/images', express.static(uploadsDir));

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      path: `/api/images/${req.file.filename}`,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: error.message });
});

// Socket.IO connection handling
const connectedUsers = new Map(); // Store userId -> socketId mapping

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register user with their custom ID
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User registered: ${userId} with socket ${socket.id}`);
    socket.emit('registered', { userId, socketId: socket.id });
  });

  // Handle image sharing to specific recipient
  socket.on('shareImage', ({ recipientId, imageData }) => {
    const recipientSocketId = connectedUsers.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receiveImage', {
        senderId: socket.userId || 'Anonymous',
        imageUrl: imageData.imageUrl,
        filename: imageData.filename,
        timestamp: new Date().toISOString()
      });
      socket.emit('shareSent', { success: true, recipientId });
      console.log(`Image shared from ${socket.userId} to ${recipientId}`);
    } else {
      socket.emit('shareError', { error: 'Recipient not found or offline' });
      console.log(`Recipient ${recipientId} not found`);
    }
  });

  // Broadcast to all connected users (optional feature)
  socket.on('broadcastImage', (imageData) => {
    socket.broadcast.emit('receiveImage', {
      senderId: socket.userId || 'Anonymous',
      imageUrl: imageData.imageUrl,
      filename: imageData.filename,
      timestamp: new Date().toISOString()
    });
    console.log(`Image broadcast from ${socket.userId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`User disconnected: ${socket.userId}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
