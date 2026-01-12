import { useState, useEffect, useRef } from 'react'
import './App.css'
import axios from "axios"
import { io } from 'socket.io-client'

const App = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Socket.IO state
    const [userId, setUserId] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [recipientId, setRecipientId] = useState('');
    const [receivedImages, setReceivedImages] = useState([]);
    const [shareMessage, setShareMessage] = useState(null);
    const socketRef = useRef(null);

    // Initialize Socket.IO connection
    useEffect(() => {
        socketRef.current = io('http://localhost:5001');

        socketRef.current.on('connect', () => {
            console.log('Connected to server');
        });

        socketRef.current.on('registered', (data) => {
            setIsConnected(true);
            console.log('Registered with ID:', data.userId);
        });

        socketRef.current.on('receiveImage', (data) => {
            console.log('Received image from:', data.senderId);
            setReceivedImages(prev => [{
                ...data,
                id: Date.now()
            }, ...prev]);
        });

        socketRef.current.on('shareSent', (data) => {
            setShareMessage({ type: 'success', text: `Image sent to ${data.recipientId}!` });
            setTimeout(() => setShareMessage(null), 3000);
        });

        socketRef.current.on('shareError', (data) => {
            setShareMessage({ type: 'error', text: data.error });
            setTimeout(() => setShareMessage(null), 3000);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    // Register user ID
    const handleRegister = () => {
        if (userId.trim()) {
            socketRef.current.emit('register', userId.trim());
        }
    };

    // Share image with specific recipient
    const handleShareImage = () => {
        if (!uploadedImage) {
            setShareMessage({ type: 'error', text: 'Please upload an image first!' });
            setTimeout(() => setShareMessage(null), 3000);
            return;
        }

        if (!recipientId.trim()) {
            setShareMessage({ type: 'error', text: 'Please enter a recipient ID!' });
            setTimeout(() => setShareMessage(null), 3000);
            return;
        }

        socketRef.current.emit('shareImage', {
            recipientId: recipientId.trim(),
            imageData: {
                imageUrl: `http://localhost:5001${uploadedImage.path}`,
                filename: uploadedImage.filename
            }
        });
    };

    // Broadcast image to all users
    const handleBroadcastImage = () => {
        if (!uploadedImage) {
            setShareMessage({ type: 'error', text: 'Please upload an image first!' });
            setTimeout(() => setShareMessage(null), 3000);
            return;
        }

        socketRef.current.emit('broadcastImage', {
            imageUrl: `http://localhost:5001${uploadedImage.path}`,
            filename: uploadedImage.filename
        });
        setShareMessage({ type: 'success', text: 'Image broadcasted to all users!' });
        setTimeout(() => setShareMessage(null), 3000);
    };

    const onFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onFileUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/upload', formData);

            setUploadedImage(response.data);
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <div className="container">
                <h1>Image Upload & Share App</h1>

                {/* User Registration Section */}
                <div className="registration-section">
                    <h3>Your User ID</h3>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Enter your user ID"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            disabled={isConnected}
                            className="text-input"
                        />
                        <button
                            onClick={handleRegister}
                            disabled={isConnected || !userId.trim()}
                            className="register-button"
                        >
                            {isConnected ? '✓ Connected' : 'Connect'}
                        </button>
                    </div>
                    {isConnected && <p className="status-message">Connected as: {userId}</p>}
                </div>

                {/* Upload Section */}
                <div className="upload-section">
                    <h3>Upload Image</h3>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        id="file-input"
                        className="file-input"
                    />
                    <label htmlFor="file-input" className="file-label">
                        Choose Image
                    </label>

                    {previewUrl && (
                        <div className="preview-section">
                            <h4>Preview:</h4>
                            <img src={previewUrl} alt="Preview" className="preview-image" />
                        </div>
                    )}

                    <button
                        onClick={onFileUpload}
                        disabled={!selectedFile || loading}
                        className="upload-button"
                    >
                        {loading ? 'Uploading...' : 'Upload Image'}
                    </button>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                </div>

                {/* Share Section */}
                {uploadedImage && (
                    <div className="share-section">
                        <h3>Share Your Image</h3>
                        <div className="uploaded-details">
                            <p><strong>Filename:</strong> {uploadedImage.filename}</p>
                            <p><strong>Size:</strong> {(uploadedImage.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <img
                            src={`http://localhost:5001${uploadedImage.path}`}
                            alt="Uploaded"
                            className="uploaded-image"
                        />

                        <div className="share-controls">
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Recipient's User ID"
                                    value={recipientId}
                                    onChange={(e) => setRecipientId(e.target.value)}
                                    className="text-input"
                                />
                                <button
                                    onClick={handleShareImage}
                                    disabled={!isConnected}
                                    className="share-button"
                                >
                                    Send to User
                                </button>
                            </div>
                            <button
                                onClick={handleBroadcastImage}
                                disabled={!isConnected}
                                className="broadcast-button"
                            >
                                Broadcast to All
                            </button>
                        </div>

                        {shareMessage && (
                            <div className={`share-message ${shareMessage.type}`}>
                                {shareMessage.text}
                            </div>
                        )}
                    </div>
                )}

                {/* Received Images Section */}
                {receivedImages.length > 0 && (
                    <div className="received-section">
                        <h3>Received Images ({receivedImages.length})</h3>
                        <div className="received-images-grid">
                            {receivedImages.map((img) => (
                                <div key={img.id} className="received-image-card">
                                    <div className="card-header">
                                        <p><strong>From:</strong> {img.senderId}</p>
                                        <p className="timestamp">
                                            {new Date(img.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <img
                                        src={img.imageUrl}
                                        alt={img.filename}
                                        className="received-image"
                                    />
                                    <p className="filename">{img.filename}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
