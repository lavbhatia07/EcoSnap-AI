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
export async function identifyItemWithVision(base64Image: string): Promise<AIVisionResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('No OpenAI API key found. Returning mock analysis.');
    return getMockVisionResult();
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
function getMockVisionResult(): AIVisionResult {
  return { itemName: 'Burger', category: 'Food', confidenceScore: 0.98 };
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
