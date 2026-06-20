import {
  sanitizeFileName,
  estimateBase64Size,
  validateImageMagicNumbers,
  calculateBarWidth,
  calculateSavingsPercent,
  cleanBase64Data
} from '../lib/utils';

describe('Utility Helper Functions Tests', () => {
  describe('sanitizeFileName', () => {
    test('strips unsafe characters but retains normal text and extensions', () => {
      expect(sanitizeFileName('my-cool-image!@#$.png')).toBe('my-cool-image.png');
      expect(sanitizeFileName('../../etc/passwd')).toBe('....etcpasswd');
      expect(sanitizeFileName('spaced name_123.jpg')).toBe('spaced name_123.jpg');
      expect(sanitizeFileName('')).toBe('');
    });
  });

  describe('estimateBase64Size', () => {
    test('calculates correct approximate bytes size of base64 text', () => {
      expect(estimateBase64Size('ABCD')).toBe(3); // 4 * 0.75
      expect(estimateBase64Size('')).toBe(0);
    });
  });

  describe('validateImageMagicNumbers', () => {
    test('correctly identifies valid PNG buffer', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(validateImageMagicNumbers(pngBuffer)).toBe(true);
    });

    test('correctly identifies valid JPEG buffer', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
      expect(validateImageMagicNumbers(jpegBuffer)).toBe(true);
    });

    test('correctly identifies valid WEBP buffer', () => {
      const webpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x12, 0x00, 0x00, 0x00, // length
        0x57, 0x45, 0x42, 0x50  // WEBP
      ]);
      expect(validateImageMagicNumbers(webpBuffer)).toBe(true);
    });

    test('rejects arbitrary buffers', () => {
      const badBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);
      expect(validateImageMagicNumbers(badBuffer)).toBe(false);
      expect(validateImageMagicNumbers(Buffer.from([]))).toBe(false);
    });
  });

  describe('calculateBarWidth', () => {
    test('maps widths correctly with boundaries', () => {
      expect(calculateBarWidth(50, 100)).toBe(50);
      expect(calculateBarWidth(120, 100)).toBe(120);
      expect(calculateBarWidth(-10, 100)).toBe(0);
      expect(calculateBarWidth(50, 0)).toBe(0); // division fallback
    });
  });

  describe('calculateSavingsPercent', () => {
    test('maps savings ratios correctly', () => {
      expect(calculateSavingsPercent(20, 100)).toBe(20);
      expect(calculateSavingsPercent(5, 0)).toBe(0);
      expect(calculateSavingsPercent(-5, 50)).toBe(0);
    });
  });

  describe('cleanBase64Data', () => {
    test('extracts prefix and data from data URL', () => {
      const input = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const cleaned = cleanBase64Data(input);
      expect(cleaned.mimeType).toBe('image/png');
      expect(cleaned.base64Data).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    });

    test('retains raw base64 string if no prefix matches', () => {
      const input = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ';
      const cleaned = cleanBase64Data(input);
      expect(cleaned.mimeType).toBe('');
      expect(cleaned.base64Data).toBe(input);
    });

    test('throws error for malformed data URL header', () => {
      expect(() => cleanBase64Data('data:image/png,notbase64')).toThrow();
    });
  });
});
