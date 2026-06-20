import { carbonDatabase, fallbackCarbonValues } from '../data/carbonDatabase';
import { CarbonDatabaseItem } from '../types/analysis';

/**
 * Normalizes a string for matching (lowercase, trims, removes special characters, removes common plurals)
 */
function normalize(str: string): string {
  let normalized = str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  // Simple plural removal for common cases
  if (normalized.endsWith('s') && !normalized.endsWith('ss')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

/**
 * Finds the closest matching carbon item from the local database
 */
export function findCarbonMatch(itemName: string, category: string): CarbonDatabaseItem | null {
  const normInput = normalize(itemName);
  const inputWords = normInput.split(/\s+/).filter(w => w.length > 2); // only words with >2 chars

  let bestMatch: CarbonDatabaseItem | null = null;
  let highestScore = 0;

  for (const item of carbonDatabase) {
    const normItemName = normalize(item.name);
    
    // 1. Exact match (after normalization)
    if (normItemName === normInput) {
      return item;
    }

    // 2. Substring matching
    if (normInput.includes(normItemName) || normItemName.includes(normInput)) {
      const score = Math.min(normItemName.length, normInput.length) / Math.max(normItemName.length, normInput.length) * 0.9;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    // 3. Keyword overlap score
    const itemWords = normItemName.split(/\s+/).filter(w => w.length > 2);
    let overlapCount = 0;
    for (const word of inputWords) {
      if (itemWords.includes(word)) {
        overlapCount++;
      }
    }

    if (overlapCount > 0) {
      // Calculate overlap score
      const score = (overlapCount / Math.max(inputWords.length, itemWords.length)) * 0.8;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }
  }

  // Double check category alignment if we found a match. If categories don't align, be careful
  if (bestMatch && bestMatch.category.toLowerCase() === category.toLowerCase()) {
    return bestMatch;
  }

  // If the category didn't match, let's filter database items by category and try again
  const categoryItems = carbonDatabase.filter(item => item.category.toLowerCase() === category.toLowerCase());
  for (const item of categoryItems) {
    const normItemName = normalize(item.name);
    // Substring match within the same category
    if (normInput.includes(normItemName) || normItemName.includes(normInput)) {
      return item;
    }
    // Word overlap within the same category
    const itemWords = normItemName.split(/\s+/).filter(w => w.length > 2);
    for (const word of inputWords) {
      if (itemWords.includes(word)) {
        return item;
      }
    }
  }

  return null;
}

/**
 * Calculates carbon footprint and savings for an item.
 * If not found, uses category fallback values.
 */
export function calculateCarbonDetails(itemName: string, category: 'Food' | 'Clothing' | 'Electronics' | 'Household') {
  const match = findCarbonMatch(itemName, category);

  if (match) {
    return {
      carbonValue: match.carbonValue,
      alternative: match.alternative,
      alternativeCarbonValue: match.alternativeCarbonValue,
      unit: match.unit,
      savings: Math.max(0, parseFloat((match.carbonValue - match.alternativeCarbonValue).toFixed(2))),
      matchedDbItem: match.name
    };
  }

  // Fallback calculations based on category
  const fallback = fallbackCarbonValues[category] || fallbackCarbonValues['Household'];
  return {
    carbonValue: fallback.value,
    alternative: fallback.alternative,
    alternativeCarbonValue: fallback.alternativeCarbonValue,
    unit: fallback.unit,
    savings: Math.max(0, parseFloat((fallback.value - fallback.alternativeCarbonValue).toFixed(2))),
    matchedDbItem: 'Category Fallback'
  };
}
