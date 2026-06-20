import OpenAI from 'openai';
import { AIVisionResult } from '../types/analysis';

// Initialize the OpenAI client
// It will automatically pull the OPENAI_API_KEY from environment variables
const apiKey = process.env.OPENAI_API_KEY;

export const openai = new OpenAI({
  apiKey: apiKey || 'mock-key-for-linting', // fallback to allow building/testing without key
});

/**
 * Step 1: Use OpenAI Vision to identify the item in the image.
 * Uses structured JSON outputs.
 */
export async function identifyItemWithVision(base64Image: string, fileName?: string): Promise<AIVisionResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('No OpenAI API key found. Returning mock analysis.');
    return getMockVisionResult(fileName);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an AI specialized in identifying products and items for sustainability analysis. 
Identify the main object in the image.
You must return a JSON object with the following structure:
{
  "itemName": "Specific item name (e.g. Cotton T-Shirt, Beef, Laptop, Plastic Bottle)",
  "category": "One of: Food, Clothing, Electronics, Household",
  "confidenceScore": 0.85
}
Be precise. Confidence score should be between 0.0 and 1.0.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Identify the main object in this image and return the structured JSON.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI Vision API.');
    }

    const parsed = JSON.parse(content) as AIVisionResult;
    
    // Validate response fields
    if (!parsed.itemName || !parsed.category || typeof parsed.confidenceScore !== 'number') {
      throw new Error('Invalid response structure from OpenAI Vision.');
    }

    // Sanitize category
    const validCategories = ['Food', 'Clothing', 'Electronics', 'Household'];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'Household'; // fallback
    }

    return parsed;
  } catch (error) {
    console.error('Error in OpenAI Vision Analysis:', error);
    throw error;
  }
}

/**
 * Step 3: Generate detailed sustainability explanation, alternative argument, and eco tip
 * based on the matched database values.
 */
export async function generateSustainabilityAdvice(
  itemName: string,
  category: string,
  carbonValue: number,
  alternative: string,
  alternativeCarbonValue: number,
  savings: number
): Promise<{ whyItMatters: string; betterAlternative: string; ecoTip: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return getMockAdvice(itemName, category, carbonValue, alternative, alternativeCarbonValue, savings);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an AI environmental sustainability consultant. 
You will be provided with an item, its carbon footprint, a recommended greener alternative, and the carbon footprint of that alternative.
Generate three engaging paragraphs explaining the impact and advice.
You must return a JSON object with the following structure:
{
  "whyItMatters": "Explain the environmental impact of the item (e.g. why its carbon footprint is high/low, raw material extraction, water usage, landfill issues, manufacturing energy). Connect this explanation to the footprint value provided.",
  "betterAlternative": "Explain why the suggested alternative is a greener option and how switching makes a difference. Reference the savings value.",
  "ecoTip": "Provide one highly actionable, simple eco tip for using, recycling, or purchasing this product responsibly to reduce emissions."
}`
        },
        {
          role: 'user',
          content: `Item: ${itemName}
Category: ${category}
Footprint: ${carbonValue} kg CO2e
Suggested Alternative: ${alternative}
Alternative Footprint: ${alternativeCarbonValue} kg CO2e
Carbon Savings by switching: ${savings} kg CO2e`
        }
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI Completion API.');
    }

    return JSON.parse(content) as { whyItMatters: string; betterAlternative: string; ecoTip: string };
  } catch (error) {
    console.error('Error generating advice from OpenAI:', error);
    return getMockAdvice(itemName, category, carbonValue, alternative, alternativeCarbonValue, savings);
  }
}

/**
 * Mock vision results for fallback/testing/when API key is missing
 */
function getMockVisionResult(fileName?: string): AIVisionResult {
  if (fileName) {
    const cleanName = fileName.toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9\s-_]/g, '');
    
    if (cleanName.includes('burger')) {
      return { itemName: 'Burger', category: 'Food', confidenceScore: 0.98 };
    }
    if (cleanName.includes('beef')) {
      return { itemName: 'Beef', category: 'Food', confidenceScore: 0.96 };
    }
    if (cleanName.includes('tshirt') || cleanName.includes('t-shirt') || cleanName.includes('shirt')) {
      return { itemName: 'Cotton T-Shirt', category: 'Clothing', confidenceScore: 0.92 };
    }
    if (cleanName.includes('phone') || cleanName.includes('mobile')) {
      return { itemName: 'Smartphone', category: 'Electronics', confidenceScore: 0.95 };
    }
    if (cleanName.includes('bottle')) {
      return { itemName: 'Plastic Bottle', category: 'Household', confidenceScore: 0.98 };
    }
    if (cleanName.includes('apple')) {
      return { itemName: 'Apples', category: 'Food', confidenceScore: 0.99 };
    }
    if (cleanName.includes('avocado')) {
      return { itemName: 'Avocado', category: 'Food', confidenceScore: 0.94 };
    }
    if (cleanName.includes('milk')) {
      return { itemName: 'Cow Milk', category: 'Food', confidenceScore: 0.95 };
    }
    if (cleanName.includes('jeans') || cleanName.includes('denim')) {
      return { itemName: 'Jeans (Cotton)', category: 'Clothing', confidenceScore: 0.91 };
    }
    if (cleanName.includes('boot')) {
      return { itemName: 'Leather Boots', category: 'Clothing', confidenceScore: 0.93 };
    }
    if (cleanName.includes('laptop') || cleanName.includes('notebook')) {
      return { itemName: 'Laptop', category: 'Electronics', confidenceScore: 0.97 };
    }
    if (cleanName.includes('tablet') || cleanName.includes('ipad')) {
      return { itemName: 'Tablet', category: 'Electronics', confidenceScore: 0.96 };
    }
    if (cleanName.includes('tv') || cleanName.includes('television')) {
      return { itemName: 'Smart TV', category: 'Electronics', confidenceScore: 0.98 };
    }
    
    if (cleanName.includes('food') || cleanName.includes('eat') || cleanName.includes('recipe')) {
      return { itemName: 'Beef', category: 'Food', confidenceScore: 0.85 };
    }
    if (cleanName.includes('cloth') || cleanName.includes('wear') || cleanName.includes('dress')) {
      return { itemName: 'Cotton T-Shirt', category: 'Clothing', confidenceScore: 0.85 };
    }
    if (cleanName.includes('tech') || cleanName.includes('device') || cleanName.includes('gadget')) {
      return { itemName: 'Smartphone', category: 'Electronics', confidenceScore: 0.85 };
    }
  }

  const mocks: AIVisionResult[] = [
    { itemName: 'Burger', category: 'Food', confidenceScore: 0.98 },
    { itemName: 'Cotton T-Shirt', category: 'Clothing', confidenceScore: 0.92 },
    { itemName: 'Smartphone', category: 'Electronics', confidenceScore: 0.95 },
    { itemName: 'Plastic Bottle', category: 'Household', confidenceScore: 0.98 },
  ];

  if (fileName) {
    let hash = 0;
    for (let i = 0; i < fileName.length; i++) {
      hash = fileName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % mocks.length;
    return mocks[index];
  }

  return mocks[0];
}

/**
 * Mock advice generator for fallback
 */
function getMockAdvice(
  itemName: string,
  category: string,
  carbonValue: number,
  alternative: string,
  alternativeCarbonValue: number,
  savings: number
) {
  return {
    whyItMatters: `Standard production of ${itemName} within the ${category} category contributes approximately ${carbonValue} kg CO2e to the atmosphere. This emissions footprint stems from resource-intensive manufacturing cycles, logistics, and raw material harvesting (e.g., intensive farming, petrochemical synthesis, or rare metal extraction).`,
    betterAlternative: `Choosing a ${alternative} significantly reduces environmental degradation. This choice incurs only ${alternativeCarbonValue} kg CO2e, representing an immediate carbon footprint reduction of ${savings} kg CO2e. This reduction represents a massive decrease in greenhouse gas loading per cycle.`,
    ecoTip: `To maximize sustainability, consider shopping for certified eco-conscious brands, reusing existing items as long as possible, and recycling this item properly at the end of its life cycle.`
  };
}
