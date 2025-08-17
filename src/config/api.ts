export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002',
  ENDPOINTS: {
    MAPS: '/api/maps',
    CARDS: '/api/cards',
    CARDS_GENERATE_LEVERAGE: '/api/cards/generate-leverage',
    CARDS_GENERATION_STATUS: '/api/cards/generate-leverage/status',
    TOPICS: '/api/topics',
    SCENARIOS: '/api/scenarios',
    HEALTH: '/health',
  },
  TIMEOUT: 30000, // Increased timeout for sophisticated card generation
} as const;

export const API_HEADERS = {
  'Content-Type': 'application/json',
} as const;
