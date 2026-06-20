export interface CarbonDatabaseItem {
  id: string;
  name: string;
  category: 'Food' | 'Clothing' | 'Electronics' | 'Household';
  carbonValue: number; // in kg CO2e
  alternative: string;
  alternativeCarbonValue: number; // in kg CO2e
  unit: string; // e.g. "per kg", "per item", "per wear"
}

export interface AIVisionResult {
  itemName: string;
  category: 'Food' | 'Clothing' | 'Electronics' | 'Household';
  confidenceScore: number; // 0 to 1
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  itemName: string;
  category: 'Food' | 'Clothing' | 'Electronics' | 'Household';
  confidenceScore: number;
  imageUrl?: string;
  
  // Carbon calculation details
  carbonValue: number; // Current carbon footprint (kg CO2e)
  alternative: string; // Cleaner alternative name
  alternativeCarbonValue: number; // Alternative carbon footprint (kg CO2e)
  unit: string; // Unit used (e.g. "per kg")
  savings: number; // Estimated savings (carbonValue - alternativeCarbonValue)
  
  // AI advice
  whyItMatters: string;
  betterAlternative: string;
  ecoTip: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  result: AnalysisResult;
}
