import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageUploader from '../components/ImageUploader';

describe('ImageUploader Component Tests', () => {
  const mockOnImageSelected = jest.fn();

  beforeEach(() => {
    mockOnImageSelected.mockClear();
    jest.restoreAllMocks();
  });

  test('Renders drag and drop area and file select buttons', () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);

    // Check uploader header texts
    expect(screen.getByText(/Drag & drop your photo here/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to browse library/i)).toBeInTheDocument();
    
    // Check buttons are present
    expect(screen.getByRole('button', { name: /Choose photo from system library/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use camera to snap photo/i })).toBeInTheDocument();
  });

  test('Handles file selection via file input', async () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    
    const input = document.getElementById('file-upload-input') as HTMLInputElement;
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    // Mock FileReader
    const readAsDataURLMock = jest.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function(this: FileReader) {
      if (this.onload) {
        this.onload({
          target: { result: 'data:image/png;base64,dummy' }
        } as ProgressEvent<FileReader>);
      }
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnImageSelected).toHaveBeenCalledWith('data:image/png;base64,dummy', 'image/png', 'test.png');
    });

    // Check if preview image is rendered
    expect(screen.getByAltText(/Uploaded product preview/i)).toBeInTheDocument();
    
    readAsDataURLMock.mockRestore();
  });

  test('Handles file selection via file input with null target', async () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    
    const input = document.getElementById('file-upload-input') as HTMLInputElement;
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    const readAsDataURLMock = jest.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function(this: FileReader) {
      if (this.onload) {
        this.onload({
          target: null // Null target branch coverage
        } as unknown as ProgressEvent<FileReader>);
      }
    });

    fireEvent.change(input, { target: { files: [file] } });
    
    // Should not trigger onImageSelected
    expect(mockOnImageSelected).not.toHaveBeenCalled();
    readAsDataURLMock.mockRestore();
  });

  test('Shows error message for invalid file type', () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    
    const input = document.getElementById('file-upload-input') as HTMLInputElement;
    const file = new File(['dummy content'], 'test.gif', { type: 'image/gif' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/Invalid file format/i)).toBeInTheDocument();
    expect(mockOnImageSelected).not.toHaveBeenCalled();
  });

  test('Shows error message for files exceeding 10MB limit', () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    
    const input = document.getElementById('file-upload-input') as HTMLInputElement;
    const file = new File(['dummy content'], 'large.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/File size exceeds the 10 MB limit/i)).toBeInTheDocument();
    expect(mockOnImageSelected).not.toHaveBeenCalled();
  });

  test('Allows clearing the selected image preview', async () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    
    const input = document.getElementById('file-upload-input') as HTMLInputElement;
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    const readAsDataURLMock = jest.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function(this: FileReader) {
      if (this.onload) {
        this.onload({
          target: { result: 'data:image/png;base64,dummy' }
        } as ProgressEvent<FileReader>);
      }
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText(/Uploaded product preview/i)).toBeInTheDocument();
    });

    // Click remove image button
    const clearButton = screen.getByRole('button', { name: /Remove uploaded image/i });
    fireEvent.click(clearButton);

    expect(screen.queryByAltText(/Uploaded product preview/i)).not.toBeInTheDocument();
    
    readAsDataURLMock.mockRestore();
  });

  test('handles drag and drop events', () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    const dropzone = screen.getByRole('button', { name: /Upload an image/i });

    // Drag enter/over
    fireEvent.dragEnter(dropzone);
    fireEvent.dragOver(dropzone);
    expect(dropzone.className).toContain('focus-visible:ring-2');

    // Drag leave
    fireEvent.dragLeave(dropzone);
    expect(dropzone.className).not.toContain('bg-emerald-950/20');

    // Drag start (implicit else branch coverage)
    fireEvent.dragStart(dropzone);
    expect(dropzone.className).not.toContain('bg-emerald-950/20');

    // Drop file
    const file = new File(['dummy content'], 'drop.png', { type: 'image/png' });
    const readAsDataURLMock = jest.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function(this: FileReader) {
      if (this.onload) {
        this.onload({
          target: { result: 'data:image/png;base64,dropped' }
        } as ProgressEvent<FileReader>);
      }
    });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file]
      }
    });

    expect(mockOnImageSelected).toHaveBeenCalledWith('data:image/png;base64,dropped', 'image/png', 'drop.png');
    readAsDataURLMock.mockRestore();
  });

  test('handles drag drop events with empty or null files', () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    const dropzone = screen.getByRole('button', { name: /Upload an image/i });

    // Drop with empty files
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: []
      }
    });
    expect(mockOnImageSelected).not.toHaveBeenCalled();

    // Drop without dataTransfer
    fireEvent.drop(dropzone, {});
    expect(mockOnImageSelected).not.toHaveBeenCalled();
  });

  test('handles file input change with empty files list', () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    const input = document.getElementById('file-upload-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [] } });
    expect(mockOnImageSelected).not.toHaveBeenCalled();
  });

  test('triggers file input selection when Enter or Space is pressed on dropzone', () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    const dropzone = screen.getByRole('button', { name: /Upload an image/i });
    
    const input = document.getElementById('file-upload-input') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => {});

    // Space key
    fireEvent.keyDown(dropzone, { key: ' ' });
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockClear();

    // Enter key
    fireEvent.keyDown(dropzone, { key: 'Enter' });
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockClear();

    // Escape key (falsy branch coverage)
    fireEvent.keyDown(dropzone, { key: 'Escape' });
    expect(clickSpy).not.toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  test('handles FileReader read errors gracefully', async () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    const input = document.getElementById('file-upload-input') as HTMLInputElement;
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    const readAsDataURLMock = jest.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function(this: FileReader) {
      if (this.onerror) {
        this.onerror({} as ProgressEvent<FileReader>);
      }
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Failed to read file/i)).toBeInTheDocument();
    });

    readAsDataURLMock.mockRestore();
  });

  test('triggers camera input click programmatically when Take Photo button is clicked', () => {
    render(<ImageUploader onImageSelected={mockOnImageSelected} />);
    const cameraBtn = screen.getByRole('button', { name: /Use camera to snap photo/i });
    const cameraInput = document.getElementById('camera-capture-input') as HTMLInputElement;
    const clickSpy = jest.spyOn(cameraInput, 'click').mockImplementation(() => {});

    fireEvent.click(cameraBtn);
    expect(clickSpy).toHaveBeenCalled();
    
    clickSpy.mockRestore();
  });
});
