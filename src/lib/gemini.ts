import { GoogleGenAI } from '@google/genai';

// Lazily initialize to avoid crashing on startup if key is temporarily missing
let aiInstance: GoogleGenAI | null = null;

export function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Model identifiers based on target specs and gemini-api skill instructions
export const FLASH_MODEL = 'gemini-3.5-flash';
export const PRO_MODEL = 'gemini-3.1-pro-preview';
