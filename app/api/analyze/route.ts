import { NextRequest, NextResponse } from 'next/server';
import { identifyItemWithVision, generateSustainabilityAdvice } from '../../../lib/openai';
import { calculateCarbonDetails } from '../../../lib/carbonCalculator';
import { AnalysisResult } from '../../../types/analysis';

// Simple in-memory rate limiting (for demo purposes)
const ipCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20; // 20 requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function applyRateLimit(ip: string): { limitReached: boolean; remaining: number; reset: number } {
  const now = Date.now();
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
  // 1. Rate Limiting Check
  const ip = request.headers.get('x-forwarded-for') || 'anonymous-ip';
  const { limitReached, remaining, reset } = applyRateLimit(ip);

  const headers = {
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

  try {
    // 2. Parse request payload
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400, headers });
    }

    const { image, mimeType, fileName } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image data is required.' }, { status: 400, headers });
    }

    // Extract base64 and clean prefix if it exists
    let base64Data = image;
    let detectedMime = mimeType;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1];
        base64Data = match[2];
      } else {
        return NextResponse.json({ error: 'Invalid base64 image format.' }, { status: 400, headers });
      }
    }

    // 3. Validation
    // Validate MIME type (JPG, PNG, WEBP)
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (detectedMime && !allowedMimes.includes(detectedMime)) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a JPG, PNG, or WEBP image.' },
        { status: 400, headers }
      );
    }

    // Validate size (Max 10MB)
    // base64 size is roughly length * 0.75
    const sizeInBytes = base64Data.length * 0.75;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (sizeInBytes > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image exceeds the maximum allowed size of 10MB.' },
        { status: 400, headers }
      );
    }

    // 4. Step 1: AI Vision Identification
    let visionResult;
    try {
      visionResult = await identifyItemWithVision(base64Data, fileName);
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
    let advice;
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
