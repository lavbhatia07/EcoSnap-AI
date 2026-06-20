import { findCarbonMatch, calculateCarbonDetails } from '../lib/carbonCalculator';
import { carbonDatabase, fallbackCarbonValues } from '../data/carbonDatabase';

describe('Carbon Footprint Engine & Calculator Tests', () => {
  
  test('Exact matching matches items properly after normalization', () => {
    // Exact match
    const matchBeef = findCarbonMatch('Beef', 'Food');
    expect(matchBeef).not.toBeNull();
    expect(matchBeef?.name).toBe('Beef');
    expect(matchBeef?.carbonValue).toBe(60.0);
  });

  test('Fuzzy matching matches plurals and slightly different casing', () => {
    // Plural match and lowercasing
    const matchApples = findCarbonMatch('apples', 'Food');
    expect(matchApples).not.toBeNull();
    expect(matchApples?.name).toBe('Apples');
    expect(matchApples?.carbonValue).toBe(0.4);
  });

  test('Keyword matching matches names with extra adjectives', () => {
    // Keyword match
    const matchMilk = findCarbonMatch('fresh organic cow milk', 'Food');
    expect(matchMilk).not.toBeNull();
    expect(matchMilk?.name).toBe('Cow Milk');
    expect(matchMilk?.carbonValue).toBe(3.2);
  });

  test('Returns null if item category is mismatching and no word overlaps', () => {
    // Mismatch category and name
    const mismatch = findCarbonMatch('Completely Unknown Gadget', 'Food');
    expect(mismatch).toBeNull();
  });

  test('calculateCarbonDetails returns correct calculations for exact matches', () => {
    const details = calculateCarbonDetails('Beef', 'Food');
    expect(details.carbonValue).toBe(60.0);
    expect(details.alternative).toBe('Tofu');
    expect(details.alternativeCarbonValue).toBe(3.0);
    expect(details.savings).toBe(57.0); // 60.0 - 3.0
    expect(details.matchedDbItem).toBe('Beef');
  });

  test('calculateCarbonDetails uses fallbacks for unknown items', () => {
    const details = calculateCarbonDetails('Alien Food', 'Food');
    const fallbackFood = fallbackCarbonValues['Food'];
    
    expect(details.carbonValue).toBe(fallbackFood.value);
    expect(details.alternative).toBe(fallbackFood.alternative);
    expect(details.alternativeCarbonValue).toBe(fallbackFood.alternativeCarbonValue);
    expect(details.savings).toBe(fallbackFood.value - fallbackFood.alternativeCarbonValue);
    expect(details.matchedDbItem).toBe('Category Fallback');
  });

  test('Database contains more than 30 items', () => {
    expect(carbonDatabase.length).toBeGreaterThanOrEqual(30);
  });

  test('All database entries have non-negative carbon values and correct categories', () => {
    const validCategories = ['Food', 'Clothing', 'Electronics', 'Household'];
    for (const item of carbonDatabase) {
      expect(item.carbonValue).toBeGreaterThanOrEqual(0);
      expect(item.alternativeCarbonValue).toBeGreaterThanOrEqual(0);
      expect(validCategories).toContain(item.category);
    }
  });

  test('findCarbonMatch handles category mismatch with substring and keyword overlap', () => {
    // 1. Substring match within the same category after category mismatch
    const matchSubstring = findCarbonMatch('Rice Plastic Bottle', 'Household');
    expect(matchSubstring).not.toBeNull();
    expect(matchSubstring?.name).toBe('Plastic Bottle');

    // 2. Keyword overlap within the same category after category mismatch
    const matchOverlap = findCarbonMatch('Rice Disposable', 'Household');
    expect(matchOverlap).not.toBeNull();
    expect(matchOverlap?.name).toBe('Disposable Cup');
  });

});
