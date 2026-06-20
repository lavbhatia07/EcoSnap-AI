/**
 * Sanitizes a filename by stripping any non-alphanumeric characters, spaces, dashes, dots, and underscores.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';
  return fileName.replace(/[^a-zA-Z0-9.\-_ ]/g, '').trim();
}

/**
 * Estimates the size of base64 data in bytes (roughly length * 0.75).
 */
export function estimateBase64Size(base64Data: string): number {
  if (!base64Data) return 0;
  return base64Data.length * 0.75;
}

/**
 * Validates the image buffer's magic numbers to prevent malformed/malicious file uploads.
 * Supports JPEG (FF D8 FF), PNG (89 50 4E 47), and WEBP (RIFF / WEBP).
 */
export function validateImageMagicNumbers(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }

  // WEBP: Starts with RIFF (52 49 46 46) and has WEBP (57 45 42 50) at offset 8
  const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  if (isRiff && buffer.length >= 12) {
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isWebp;
  }

  return false;
}

/**
 * Calculates visual bar width percentage based on a max comparison value.
 */
export function calculateBarWidth(value: number, maxVal: number): number {
  if (maxVal <= 0) return 0;
  return Math.round((Math.max(value, 0) / maxVal) * 100);
}

/**
 * Calculates carbon savings percentage relative to current footprint.
 */
export function calculateSavingsPercent(savings: number, currentVal: number): number {
  if (currentVal <= 0) return 0;
  return Math.round((Math.max(savings, 0) / currentVal) * 100);
}

/**
 * Standardized parsing for base64 image strings.
 */
export function cleanBase64Data(imageStr: string): { base64Data: string; mimeType: string } {
  if (imageStr.startsWith('data:')) {
    const match = imageStr.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      return {
        mimeType: match[1],
        base64Data: match[2],
      };
    }
    throw new Error('Invalid base64 image format.');
  }
  return {
    mimeType: '',
    base64Data: imageStr,
  };
}
