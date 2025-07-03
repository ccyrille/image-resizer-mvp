import React, { useState, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import Resizer from 'react-image-file-resizer';
import './App.css';

const App = () => {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ processed: 0, totalSize: 0, savedSize: 0 });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processImage = useCallback((file) => {
    return new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        800, // maxWidth
        800, // maxHeight
        'JPEG', // compressFormat
        80, // quality
        0, // rotation
        (uri) => {
          const originalSize = file.size;
          const resizedSize = Math.round((uri.length * 3) / 4); // Approximate base64 to bytes
          
          resolve({
            id: Date.now() + Math.random(),
            name: file.name,
            originalSize,
            resizedSize,
            dataUrl: uri,
            compressionRatio: ((originalSize - resizedSize) / originalSize * 100).toFixed(1)
          });
        },
        'base64' // outputType
      );
    });
  }, []);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    const newImages = [];
    let totalOriginalSize = 0;
    let totalResizedSize = 0;

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const processedImage = await processImage(file);
          newImages.push(processedImage);
          totalOriginalSize += processedImage.originalSize;
          totalResizedSize += processedImage.resizedSize;
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setStats(prev => ({
      processed: prev.processed + newImages.length,
      totalSize: prev.totalSize + totalOriginalSize,
      savedSize: prev.savedSize + (totalOriginalSize - totalResizedSize)
    }));
    
    setIsProcessing(false);
    event.target.value = ''; // Clear input
  };

  const removeImage = (id) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        setStats(prevStats => ({
          processed: prevStats.processed - 1,
          totalSize: prevStats.totalSize - imageToRemove.originalSize,
          savedSize: prevStats.savedSize - (imageToRemove.originalSize - imageToRemove.resizedSize)
        }));
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const clearAll = () => {
    setImages([]);
    setStats({ processed: 0, totalSize: 0, savedSize: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Client-Side Image Resizer MVP
          </h1>
          <p className="text-gray-600">
            Resize images at scale directly in your browser - no server required!
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-center">
            <label className="relative cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <div className="flex items-center space-x-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors">
                <Upload size={20} />
                <span className="font-medium">
                  {isProcessing ? 'Processing...' : 'Upload Images'}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Stats Section */}
        {stats.processed > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.processed}</div>
              <div className="text-sm text-gray-600">Images Processed</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-green-600">{formatFileSize(stats.totalSize)}</div>
              <div className="text-sm text-gray-600">Original Size</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-purple-600">{formatFileSize(stats.savedSize)}</div>
              <div className="text-sm text-gray-600">Size Saved</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalSize > 0 ? ((stats.savedSize / stats.totalSize) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Compression</div>
            </div>
          </div>
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Resized Images ({images.length})
              </h2>
              <button
                onClick={clearAll}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group border rounded-lg overflow-hidden shadow-md">
                  <img
                    src={image.dataUrl}
                    alt={image.name}
                    className="w-full h-48 object-cover"
                  />
                  
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  
                  <div className="p-3 bg-white">
                    <div className="text-sm font-medium text-gray-800 truncate mb-1">
                      {image.name}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Original: {formatFileSize(image.originalSize)}</div>
                      <div>Resized: {formatFileSize(image.resizedSize)}</div>
                      <div className="text-green-600 font-medium">
                        Saved: {image.compressionRatio}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !isProcessing && (
          <div className="text-center py-12">
            <ImageIcon size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No images uploaded yet
            </h3>
            <p className="text-gray-500">
              Click "Upload Images" to get started with client-side resizing
            </p>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your images...</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Images are processed entirely in your browser. Original files are automatically freed from memory after processing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;