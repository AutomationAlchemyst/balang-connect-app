
'use server';
/**
 * @fileOverview An AI-powered event stylist that suggests themes, colors, flavors, and packages.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { mockFlavors, mockPackages } from '@/lib/data';

// Prepare a simplified list of flavors and packages for the AI prompt
const availableFlavors = mockFlavors.map(f => ({ id: f.id, name: f.name, description: f.description, tags: f.tags }));
const availablePackages = mockPackages.map(p => ({ id: p.id, name: p.name, description: p.description, pax: p.pax }));

const EventStylistInputSchema = z.object({
  eventDescription: z.string().min(10).describe('A description of the event from the user.'),
});
export type EventStylistInput = z.infer<typeof EventStylistInputSchema>;

const EventStylistOutputSchema = z.object({
  themeName: z.string().describe('A creative and catchy name for the event theme.'),
  vibe: z.string().describe('A short phrase (2-3 words) describing the overall vibe of the event. e.g., "Vibrant & Fun", "Elegant & Modern", "Cozy & Rustic".'),
  colorPalette: z.array(z.object({
    hex: z.string().describe('The hex color code, e.g., "#FF5733".'),
    name: z.string().describe('A descriptive name for the color, e.g., "Sunset Orange".'),
  })).length(4).describe('An array of exactly 4 colors that match the theme.'),
  suggestedFlavors: z.array(z.object({
    name: z.string().describe('The name of a suggested flavor, chosen ONLY from the provided list.'),
    reason: z.string().describe('A brief, exciting reason why this flavor is a great fit for the theme.'),
  })).min(2).max(3).describe('An array of 2 to 3 suggested flavors from the available list.'),
  suggestedPackage: z.object({
    name: z.string().describe('The name of the single best package for the event, chosen ONLY from the provided list.'),
    reason: z.string().describe('A brief explanation for why this package is recommended.'),
  }),
});
export type EventStylistOutput = z.infer<typeof EventStylistOutputSchema>;

const stylistPrompt = ai.definePrompt({
  name: 'eventStylistPrompt',
  input: { schema: EventStylistInputSchema },
  output: { schema: EventStylistOutputSchema },
  prompt: `You are an expert Event Stylist for Balang Kepalang, a beverage catering service. A customer needs help planning their event.
    Based on their description, you will generate a creative theme, a color palette, and suggest the best flavors and package from the lists provided.
    Your suggestions must be exciting, relevant, and helpful.

    EVENT DESCRIPTION:
    "{{{eventDescription}}}"

    AVAILABLE FLAVORS (Choose from this list only):
    ${JSON.stringify(availableFlavors, null, 2)}

    AVAILABLE PACKAGES (Choose from this list only):
    ${JSON.stringify(availablePackages, null, 2)}

    Your task is to generate a complete event style guide based on the user's description.
    - The theme name should be creative.
    - The color palette must have exactly 4 colors.
    - You must suggest between 2 and 3 flavors.
    - You must suggest exactly one package.
    - Ensure your suggestions strictly use the names from the provided lists.
    `,
});

export async function eventStylistFlow(input: EventStylistInput): Promise<EventStylistOutput> {
  const { output } = await stylistPrompt(input);
  if (!output) {
    throw new Error('The AI failed to generate event ideas. Please try a different description.');
  }
  return output;
}
