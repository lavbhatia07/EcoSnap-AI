'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, Camera, FileImage, AlertCircle, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64Image: string, fileType: string, fileName: string) => void;
}

export default function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate size (10 MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds the 10 MB limit. Please upload a smaller image.');
      return;
    }

    // Validate type (JPG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file format. Only JPG, PNG, and WEBP are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setImagePreview(e.target.result);
        onImageSelected(e.target.result, file.type, file.name);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraSelect = () => {
    cameraInputRef.current?.click();
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload-input"
        aria-label="Upload photo file"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="camera-capture-input"
        aria-label="Take picture with camera"
      />

      {/* Main Drag-Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerFileSelect();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload an image. Drag and drop file here, or press enter to select from library"
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-8 text-center aspect-[4/3] max-h-[360px] ${
          dragActive
            ? 'border-emerald-400 bg-emerald-950/20'
            : imagePreview
            ? 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
            : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/40'
        }`}
      >
        {imagePreview ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-zinc-950">
            <img
              src={imagePreview}
              alt="Uploaded product preview"
              className="w-full h-full object-contain"
            />
            {/* Overlay delete button */}
            <button
              onClick={clearImage}
              className="absolute top-4 right-4 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-full p-2 border border-white/10 backdrop-blur-md transition-colors shadow-lg"
              title="Remove image"
              aria-label="Remove uploaded image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 shadow-inner">
              <Upload className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-zinc-200 font-medium text-base tracking-tight">
                Drag & drop your photo here
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                or click to browse library
              </p>
            </div>
            <div className="text-xs text-zinc-600 bg-zinc-950/50 px-3 py-1.5 rounded-full border border-white/5">
              JPG, PNG, WEBP (Max 10MB)
            </div>
          </div>
        )}
      </div>

      {/* Upload and Capture CTA Buttons */}
      {!imagePreview && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={triggerFileSelect}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-900 text-zinc-200 hover:text-white font-medium rounded-2xl border border-white/5 transition-all text-sm shadow-md"
            aria-label="Choose photo from system library"
          >
            <FileImage className="w-4 h-4 text-emerald-400" />
            Upload File
          </button>
          <button
            onClick={triggerCameraSelect}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-900 text-zinc-200 hover:text-white font-medium rounded-2xl border border-white/5 transition-all text-sm shadow-md"
            aria-label="Use camera to snap photo"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            Take Photo
          </button>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div 
          className="mt-4 flex items-center gap-3 p-4 bg-rose-950/20 border border-rose-900/50 rounded-2xl text-rose-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
