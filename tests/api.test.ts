/**
 * @jest-environment node
 */

import { POST } from '../app/api/analyze/route';
import { NextRequest } from 'next/server';
import { identifyItemWithVision, generateSustainabilityAdvice } from '../lib/openai';

// Mock OpenAI functions
jest.mock('../lib/openai', () => ({
  identifyItemWithVision: jest.fn(),
  generateSustainabilityAdvice: jest.fn()
}));

// Valid base64 strings (matching magic numbers)
// JPEG: starts with FF D8 FF
const validJpegBase64 = Buffer.from([0xFF, 0xD8, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00]).toString('base64');
// Invalid image base64: plain text file
const invalidImageBase64 = Buffer.from('test plain text content').toString('base64');

function createMockRequest(body: unknown, headers: Record<string, string> = {}) {
  const reqHeaders = new Headers(headers);
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    headers: reqHeaders,
    body: JSON.stringify(body)
  });
}

describe('Analyze API Route Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    // Default mock behavior
    (identifyItemWithVision as jest.Mock).mockResolvedValue({
      itemName: 'Burger',
      category: 'Food',
      confidenceScore: 0.98
    });
    (generateSustainabilityAdvice as jest.Mock).mockResolvedValue({
      whyItMatters: 'Mock why it matters',
      betterAlternative: 'Mock alternative',
      ecoTip: 'Mock tip'
    });
  });

  test('should return 200 and analysis results for a valid request', async () => {
    const req = createMockRequest({
      image: `data:image/jpeg;base64,${validJpegBase64}`,
      mimeType: 'image/jpeg',
      fileName: 'burger.jpg'
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.itemName).toBe('Burger');
    expect(json.category).toBe('Food');
    expect(json.confidenceScore).toBe(0.98);
    expect(json.carbonValue).toBe(8.5); // matches burger in carbonDatabase
    expect(json.savings).toBe(6.5); // 8.5 - 2.0
  });

  test('should trigger rate limit random garbage collection cleanup with expired items', async () => {
    // Add entry to cache by making request
    const req = createMockRequest({
      image: `data:image/jpeg;base64,${validJpegBase64}`,
      mimeType: 'image/jpeg'
    }, { 'x-forwarded-for': '9.9.9.9' });
    await POST(req);

    // Mock Date.now to be in the future, and Math.random to trigger cleanup
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 120000);
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.05);

    const cleanupReq = createMockRequest({
      image: `data:image/jpeg;base64,${validJpegBase64}`,
      mimeType: 'image/jpeg'
    });
    const res = await POST(cleanupReq);
    expect(res.status).toBe(200);

    dateSpy.mockRestore();
    randomSpy.mockRestore();
  });

  test('should return 400 for malformed json request', async () => {
    const req = {
      headers: new Headers(),
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Invalid JSON');
  });

  test('should return 400 for missing image data', async () => {
    const req = createMockRequest({
      mimeType: 'image/jpeg',
      fileName: 'burger.jpg'
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Validation error');
  });

  test('should return 400 for unsupported mime type in schema', async () => {
    const req = createMockRequest({
      image: `data:image/gif;base64,${validJpegBase64}`,
      mimeType: 'image/gif',
      fileName: 'burger.gif'
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Validation error');
  });

  test('should return 400 for unsupported mime type override in base64 prefix', async () => {
    const req = createMockRequest({
      image: `data:image/gif;base64,${validJpegBase64}`,
      mimeType: 'image/jpeg', // passes Zod, but cleanBase64Data overrides to image/gif
      fileName: 'burger.jpg'
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Unsupported file format');
  });

  test('should return 400 if Buffer.from throws an error', async () => {
    const bufferSpy = jest.spyOn(Buffer, 'from').mockImplementation(() => {
      throw new Error('Buffer conversion failed');
    });

    const req = createMockRequest({
      image: `data:image/jpeg;base64,${validJpegBase64}`,
      mimeType: 'image/jpeg',
      fileName: 'burger.jpg'
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Malformed base64 image data');

    bufferSpy.mockRestore();
  });

  test('should return 400 if file fails magic numbers verification', async () => {
    const req = createMockRequest({
      image: `data:image/png;base64,${invalidImageBase64}`,
      mimeType: 'image/png',
      fileName: 'malicious.png'
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('not a valid image');
  });

  test('should return 400 if image exceeds 10MB', async () => {
    // Generate large buffer (> 10MB)
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    largeBuffer[0] = 0xFF;
    largeBuffer[1] = 0xD8;
    largeBuffer[2] = 0xFF;
    const largeBase64 = largeBuffer.toString('base64');

    const req = createMockRequest({
      image: largeBase64,
      mimeType: 'image/jpeg',
      fileName: 'huge.jpg'
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('maximum allowed size');
  });

  test('should return 400 for malformed base64 image data url prefix', async () => {
    const req = createMockRequest({
      image: 'data:image/jpeg;invalid_base64_data',
      mimeType: 'image/jpeg',
      fileName: 'burger.jpg'
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid base64 image format');
  });

  test('should return 502 if OpenAI Vision analysis fails', async () => {
    (identifyItemWithVision as jest.Mock).mockRejectedValue(new Error('OpenAI API Error'));

    const req = createMockRequest({
      image: `data:image/jpeg;base64,${validJpegBase64}`,
      mimeType: 'image/jpeg',
      fileName: 'burger.jpg'
    });

    const res = await POST(req);
    expect(res.status).toBe(502);

    const json = await res.json();
    expect(json.error).toContain('AI Vision analysis failed');
  });

  test('should fallback to local advice if OpenAI Completion fails', async () => {
    (identifyItemWithVision as jest.Mock).mockResolvedValue({
      itemName: 'Burger',
      category: 'Food',
      confidenceScore: 0.95
    });
    (generateSustainabilityAdvice as jest.Mock).mockRejectedValue(new Error('Completion Error'));

    const req = createMockRequest({
      image: `data:image/jpeg;base64,${validJpegBase64}`,
      mimeType: 'image/jpeg',
      fileName: 'burger.jpg'
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.whyItMatters).toContain('Burger in the Food category contributes to greenhouse emissions');
  });

  test('should return 500 for critical internal server errors', async () => {
    const req = {
      headers: {
        get: () => { throw new Error('Simulated critical crash'); }
      }
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toContain('Internal server error');
  });

  test('should trigger rate limit 429 after 21 requests', async () => {
    const ip = '1.2.3.4';
    (identifyItemWithVision as jest.Mock).mockResolvedValue({
      itemName: 'Burger',
      category: 'Food',
      confidenceScore: 0.98
    });
    (generateSustainabilityAdvice as jest.Mock).mockResolvedValue({
      whyItMatters: 'Mock matters',
      betterAlternative: 'Mock alternative',
      ecoTip: 'Mock tip'
    });

    // Make 20 valid requests
    for (let i = 0; i < 20; i++) {
      const req = createMockRequest({
        image: `data:image/jpeg;base64,${validJpegBase64}`,
        mimeType: 'image/jpeg',
        fileName: 'burger.jpg'
      }, {
        'x-forwarded-for': ip
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // 21st request should be rate limited
    const req = createMockRequest({
      image: `data:image/jpeg;base64,${validJpegBase64}`,
      mimeType: 'image/jpeg',
      fileName: 'burger.jpg'
    }, {
      'x-forwarded-for': ip
    });
    const res = await POST(req);
    expect(res.status).toBe(429);

    const json = await res.json();
    expect(json.error).toContain('Too many requests');
  });
});
