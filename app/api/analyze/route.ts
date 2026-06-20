import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { identifyItemWithVision, generateSustainabilityAdvice } from '../../../lib/openai';
import { calculateCarbonDetails } from '../../../lib/carbonCalculator';
import { AnalysisResult, AIVisionResult } from '../../../types/analysis';
import { sanitizeFileName, validateImageMagicNumbers, cleanBase64Data } from '../../../lib/utils';

// Request Validation Schema
const analyzeRequestSchema = z.object({
  image: z.string().min(1, 'Image data is required.'),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Unsupported file format. Please upload a JPG, PNG, or WEBP image.'),
  fileName: z.string().optional()
});

// Simple in-memory rate limiting with cleanup
const ipCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20; // 20 requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function applyRateLimit(ip: string): { limitReached: boolean; remaining: number; reset: number } {
  const now = Date.now();
  
  // Periodically clean up expired entries to prevent memory leaks (10% probability per check)
  if (Math.random() < 0.1) {
    for (const [cachedIp, data] of ipCache.entries()) {
      if (now > data.resetTime) {
        ipCache.delete(cachedIp);
      }
    }
  }

  const cached = ipCache.get(ip);

  if (!cached || now > cached.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW;
    ipCache.set(ip, { count: 1, resetTime });
    return { limitReached: false, remaining: RATE_LIMIT_MAX - 1, reset: resetTime };
  }

  cached.count += 1;
  if (cached.count > RATE_LIMIT_MAX) {
    return { limitReached: true, remaining: 0, reset: cached.resetTime };
  }

  return { limitReached: false, remaining: RATE_LIMIT_MAX - cached.count, reset: cached.resetTime };
}

export async function POST(request: NextRequest) {
  let headers: Record<string, string> = {};
  try {
    // 1. Rate Limiting Check
    const ip = request?.headers?.get('x-forwarded-for') || 'anonymous-ip';
    const { limitReached, remaining, reset } = applyRateLimit(ip);

    headers = {
      'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(reset / 1000).toString(),
    };

    if (limitReached) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429, headers }
      );
    }
    // 2. Parse request payload
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400, headers });
    }

    // 3. Schema validation using Zod
    const validationResult = analyzeRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((issue) => issue.message).join(', ');
      return NextResponse.json({ error: `Validation error: ${errorMsg}` }, { status: 400, headers });
    }

    const { image, mimeType, fileName } = validationResult.data;

    // Clean and split image data from raw base64 or Data URI format
    let base64Data: string;
    let detectedMime = mimeType;

    try {
      const cleaned = cleanBase64Data(image);
      base64Data = cleaned.base64Data;
      if (cleaned.mimeType) {
        detectedMime = cleaned.mimeType;
      }
    } catch (err: unknown) {
      const error = err as Error;
      return NextResponse.json({ error: error.message || 'Invalid base64 image format.' }, { status: 400, headers });
    }

    // Double check allowed MIME types
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(detectedMime)) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a JPG, PNG, or WEBP image.' },
        { status: 400, headers }
      );
    }

    // Validate size and integrity
    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64Data, 'base64');
    } catch {
      return NextResponse.json({ error: 'Malformed base64 image data.' }, { status: 400, headers });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image exceeds the maximum allowed size of 10MB.' },
        { status: 400, headers }
      );
    }

    // Verify magic numbers (prevent malformed file attacks)
    if (!validateImageMagicNumbers(buffer)) {
      return NextResponse.json(
        { error: 'The uploaded file is not a valid image or is corrupted.' },
        { status: 400, headers }
      );
    }

    // Sanitize parameters
    const sanitizedFileName = fileName ? sanitizeFileName(fileName) : undefined;

    // 4. Step 1: AI Vision Identification
    let visionResult: AIVisionResult;
    try {
      visionResult = await identifyItemWithVision(base64Data, sanitizedFileName);
    } catch (e: unknown) {
      const err = e as Error;
      return NextResponse.json(
        { error: `AI Vision analysis failed: ${err.message || 'Unknown error'}` },
        { status: 502, headers }
      );
    }

    const { itemName, category, confidenceScore } = visionResult;

    // 5. Step 2: Database Footprint calculation & matching
    const carbonDetails = calculateCarbonDetails(itemName, category);

    // 6. Step 3: Sustainability Advice generation
    let advice: { whyItMatters: string; betterAlternative: string; ecoTip: string };
    try {
      advice = await generateSustainabilityAdvice(
        itemName,
        category,
        carbonDetails.carbonValue,
        carbonDetails.alternative,
        carbonDetails.alternativeCarbonValue,
        carbonDetails.savings
      );
    } catch (e: unknown) {
      // Fallback advice if GPT call fails
      const err = e as Error;
      console.warn('Sustainability advice generation failed. Using local fallback.', err);
      advice = {
        whyItMatters: `Standard production of ${itemName} in the ${category} category contributes to greenhouse emissions. This is associated with extraction, refining, or farming processes.`,
        betterAlternative: `Choosing ${carbonDetails.alternative} is a greener alternative that reduces emissions.`,
        ecoTip: `To reduce your carbon footprint, recycle this product properly and optimize its lifecycle usage.`
      };
    }

    // 7. Format the complete result
    const result: AnalysisResult = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      itemName,
      category,
      confidenceScore,
      carbonValue: carbonDetails.carbonValue,
      alternative: carbonDetails.alternative,
      alternativeCarbonValue: carbonDetails.alternativeCarbonValue,
      unit: carbonDetails.unit,
      savings: carbonDetails.savings,
      whyItMatters: advice.whyItMatters,
      betterAlternative: advice.betterAlternative,
      ecoTip: advice.ecoTip,
    };

    return NextResponse.json(result, { status: 200, headers });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Fatal error in analyze API route:', err);
    return NextResponse.json(
      { error: `Internal server error: ${err.message || 'Unknown error'}` },
      { status: 500, headers }
    );
  }
}
