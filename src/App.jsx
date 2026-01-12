import { useState } from 'react'
import './App.css'
import axios from "axios"

const App = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                <h1>Image Upload App</h1>

                <div className="upload-section">
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
                            <h3>Preview:</h3>
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

                {uploadedImage && (
                    <div className="uploaded-section">
                        <h2>Uploaded Successfully!</h2>
                        <div className="upload-details">
                            <p><strong>Filename:</strong> {uploadedImage.filename}</p>
                            <p><strong>Size:</strong> {(uploadedImage.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <img
                            src={`http://localhost:5001${uploadedImage.path}`}
                            alt="Uploaded"
                            className="uploaded-image"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
