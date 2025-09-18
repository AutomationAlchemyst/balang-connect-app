'use server';
/**
 * @fileOverview A flow for creating a booking and syncing it with Google Sheets and Google Calendar.
 * Client-side handles file uploads to Firebase Storage.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { sendWhatsAppMessage } from './sendWhatsAppMessage';

const SHEET_NAME = 'Sheet1';

const AddonDetailSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  flavors: z.array(z.string()).optional(),
});

const BookingFlowInputSchema = z.object({
  type: z.enum(['Event', 'Infaq']),
  customerName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  eventDate: z.string(), // e.g., "2025-06-30"
  eventTime: z.string().optional(),
  details: z.string().optional(), // Main details for Infaq, or a fallback
  totalAmount: z.number(),
  pickupTime: z.string().optional(),
  packageName: z.string().optional(),
  packageFlavors: z.array(z.string()).optional(),
  addons: z.array(AddonDetailSchema).optional(),
  paymentProofUrl: z.string().url().optional().describe("The public URL of the payment proof uploaded to Firebase Storage."),
});

export type BookingFlowInput = z.infer<typeof BookingFlowInputSchema>;

// =================================================================
//  THIS IS THE CORRECTED AUTHENTICATION FUNCTION
// =================================================================
const getGoogleAuthClient = () => {
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/calendar',
  ];

  // This block runs on Vercel where the JSON key is stored in an environment variable
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.log("Using GOOGLE_SERVICE_ACCOUNT_JSON from environment variables for Google APIs.");
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    return new GoogleAuth({
      credentials,
      scopes,
    });
  }
  
  // This block runs on your local machine, relying on the GOOGLE_APPLICATION_CREDENTIALS
  // file path set in your package.json dev script.
  console.log("Using local Application Default Credentials for Google APIs.");
  return new GoogleAuth({
    scopes,
  });
};
// =================================================================
//  END OF FIX
// =================================================================

const generateOrderId = () => {
  return Math.random().toString(36).substring(2, 8);
};

const addBookingToSheet = ai.defineTool(
  {
    name: 'addBookingToSheet',
    description: 'Adds a new booking row to a Google Sheet with structured data.',
    inputSchema: BookingFlowInputSchema,
    outputSchema: z.any(),
  },
  async (input) => {
    const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
    if (!SPREADSHEET_ID) {
      const errorMsg = 'GOOGLE_SPREADSHEET_ID environment variable not set.';
      console.error('addBookingToSheet:', errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const auth = getGoogleAuthClient();
      const authenticatedSheets = google.sheets({ version: 'v4', auth });

      const now = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });
      
      const addonsText = input.addons?.map(a => `${a.name} (x${a.quantity})`).join(' | ') || 'None';
      const addonFlavorsText = input.addons
        ?.filter(a => a.flavors && a.flavors.length > 0)
        .map(a => `${a.name}: ${a.flavors!.join(',')}`)
        .join(' | ') || 'N/A';
      
      const values = [
        [ 
          now, 
          input.type, 
          input.customerName, 
          `${input.eventDate} ${input.eventTime || ''}`.trim(), 
          input.packageName || (input.type === 'Event' ? 'Custom Build' : 'N/A'),
          input.packageFlavors?.join(' | ') || 'N/A',
          addonsText,
          addonFlavorsText,
          input.pickupTime || 'N/A',
          input.details || '',
          input.totalAmount.toFixed(2), 
          input.email, 
          input.phone,
          input.paymentProofUrl || 'N/A'
        ],
      ];

      await authenticatedSheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
      return { success: true, message: 'Added to Google Sheet.' };
    } catch (error: any) {
      console.error('addBookingToSheet: Error adding to Google Sheet:', error);
      const specificError = error.errors?.[0]?.message || error.message || 'An unknown error occurred.';
      return { success: false, error: `Could not write to Google Sheet. Reason: ${specificError}` };
    }
  }
);

const createCalendarEvent = ai.defineTool(
  {
    name: 'createCalendarEvent',
    description: 'Creates a new event in Google Calendar for a booking.',
    inputSchema: BookingFlowInputSchema,
    outputSchema: z.any(),
  },
  async (input) => {
    const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
    if (!CALENDAR_ID) {
      const errorMsg = 'GOOGLE_CALENDAR_ID environment variable not set.';
      console.error('createCalendarEvent:', errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const auth = getGoogleAuthClient();
      const authenticatedCalendar = google.calendar({ version: 'v3', auth });
      
      let start, end;

      if (input.type === 'Infaq') {
          start = { date: input.eventDate };
          end = { date: input.eventDate };
      } else {
          if (!input.eventTime) throw new Error('Event time is missing for "Event" type booking.');

          const convert12hTo24hFormat = (time12h: string): string => {
              const [time, modifier] = time12h.split(' ');
              let [hours, minutes] = time.split(':');

              if (hours === '12') {
                  hours = modifier.toUpperCase() === 'AM' ? '00' : '12';
              }
              if (modifier.toUpperCase() === 'PM' && hours !== '12') {
                  hours = (parseInt(hours, 10) + 12).toString();
              }
              return `${hours.padStart(2, '0')}:${minutes}:00`;
          };

          const startTime24h = convert12hTo24hFormat(input.eventTime);
          const startDateTimeString = `${input.eventDate}T${startTime24h}`;

          const [year, month, day] = input.eventDate.split('-').map(Number);
          const [hours, minutes, seconds] = startTime24h.split(':').map(Number);
          
          const startDateUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
          if (isNaN(startDateUtc.getTime())) throw new Error(`Could not parse the Event date/time: "${startDateTimeString}"`);
          
          const endDateUtc = new Date(startDateUtc.getTime() + 2 * 60 * 60 * 1000);
          const endDateTimeString = endDateUtc.toISOString().slice(0, 19);
          
          start = { dateTime: startDateTimeString, timeZone: 'Asia/Singapore' };
          end = { dateTime: endDateTimeString, timeZone: 'Asia/Singapore' };
      }

      let description = '';
      if (input.type === 'Event') {
          const packageInfo = input.packageName ? `Package: ${input.packageName}\n` : 'Custom Build\n';
          const packageFlavorsInfo = input.packageFlavors?.length ? `- Package Flavors: ${input.packageFlavors.join(', ')}\n` : '';
          const addonsInfo = input.addons?.length 
            ? `- Addons: ${input.addons.map(a => {
                const flavorString = a.flavors && a.flavors.length > 0 ? ` (${a.flavors.join(', ')})` : '';
                return `${a.name} (x${a.quantity})${flavorString}`;
              }).join('; ')}\n` 
            : '';
          description = `${packageInfo}${packageFlavorsInfo}${addonsInfo}`;
      } else {
          description = input.details || 'Infaq details not provided.';
      }

      const event = {
        summary: `${input.type} Booking: ${input.customerName}`,
        description: `Details:
${description}

Pickup/Dismantle Time: ${input.pickupTime || 'Not specified'}

Total: ${input.totalAmount.toFixed(2)}
Contact: ${input.email} / ${input.phone}
Payment Proof: ${input.paymentProofUrl || 'Not provided'}`,
        start,
        end,
      };

      await authenticatedCalendar.events.insert({ calendarId: CALENDAR_ID, requestBody: event });
      return { success: true, message: 'Calendar event created.' };
    } catch (error: any) {
      console.error('createCalendarEvent: Error creating calendar event:', error);
      const specificError = error.errors?.[0]?.message || error.message || 'An unknown error occurred.';
      return { success: false, error: `Could not create Google Calendar event. Reason: ${specificError}` };
    }
  }
);

export const createBookingFlow = ai.defineFlow(
  {
    name: 'createBookingFlow',
    inputSchema: BookingFlowInputSchema,
    outputSchema: z.object({
      sheet: z.any(),
      calendar: z.any(),
      whatsapp: z.any(),
    }),
  },
  async (input) => {
    try {
      const orderId = generateOrderId();
      const [sheetResult, calendarResult, whatsappResult] = await Promise.all([
        addBookingToSheet(input),
        createCalendarEvent(input),
        sendWhatsAppMessage({ ...input, orderId }),
      ]);

      return { sheet: sheetResult, calendar: calendarResult, whatsapp: whatsappResult };
    } catch (error: any) {
      console.error('createBookingFlow: FATAL - An unhandled error occurred:', error);
      return {
        sheet: { success: false, error: `Flow failed: ${error.message}` },
        calendar: { success: false, error: `Flow failed: ${error.message}` },
        whatsapp: { success: false, error: `Flow failed: ${error.message}` },
      };
    }
  }
);
