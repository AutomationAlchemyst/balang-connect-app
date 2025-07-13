import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Genkit will now use Application Default Credentials for Google AI.
// The custom auth logic for Sheets/Calendar is self-contained in createBookingFlow.ts
export const ai = genkit({
  plugins: [
    googleAI()
  ],
  model: 'googleai/gemini-2.0-flash',
});
