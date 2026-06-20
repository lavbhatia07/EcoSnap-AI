import React from 'react';
import { render, screen } from '@testing-library/react';
import ImageUploader from '../components/ImageUploader';

describe('ImageUploader Component Tests', () => {
  const mockOnImageSelected = jest.fn();

  beforeEach(() => {
    mockOnImageSelected.mockClear();
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

});
