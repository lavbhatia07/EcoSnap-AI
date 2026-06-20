import { useState, useRef, DragEvent, ChangeEvent, MouseEvent } from 'react';
import { MAX_FILE_SIZE, SUPPORTED_MIME_TYPES } from '../constants';

export function useImageUpload(onImageSelected: (base64Image: string, fileType: string, fileName: string) => void) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate size (10 MB limit)
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 10 MB limit. Please upload a smaller image.');
      return;
    }

    // Validate type (JPG, PNG, WEBP)
    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
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
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
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

  const clearImage = (e: MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    setError(null);
  };

  return {
    dragActive,
    imagePreview,
    error,
    fileInputRef,
    cameraInputRef,
    handleDrag,
    handleDrop,
    handleFileChange,
    triggerFileSelect,
    triggerCameraSelect,
    clearImage,
    setImagePreview,
    setError
  };
}
