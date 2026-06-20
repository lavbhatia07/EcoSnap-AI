/**
 * EcoSnap AI Constants
 */

// File upload restrictions
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit
export const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Rate limit settings
export const RATE_LIMIT_MAX = 20; // 20 requests
export const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

// Carbon footprint classification thresholds (in kg CO2e)
export const CARBON_THRESHOLD_EXCELLENT = 3.0;
export const CARBON_THRESHOLD_MODERATE = 8.0;

// Maximum history count to store
export const MAX_HISTORY_ITEMS = 10;
export const LOCAL_STORAGE_KEY = 'ecosnap_history';

// Scanner status messages
export const SCANNING_MESSAGES = [
  'AI Vision Analyzing...',
  'Calculating Carbon Impact...',
  'Generating Sustainability Advice...',
  'Finalizing Eco-Score Dashboard...'
];
