'use server';
import { ai } from '@/ai/genkit';
import { UnipileClient } from 'unipile-node-sdk';
import { z } from 'zod';

const WhatsAppMessageSchema = z.object({
  phone: z.string(),
  customerName: z.string(),
  orderId: z.string(),
  totalAmount: z.number(),
});

export const sendWhatsAppMessage = ai.defineTool(
  {
    name: 'sendWhatsAppMessage',
    description: 'Sends a WhatsApp message to a customer for order confirmation.',
    inputSchema: WhatsAppMessageSchema,
    outputSchema: z.any(),
  },
  async (input) => {
    const { phone, customerName, orderId, totalAmount } = input;

    const unipileDsn = process.env.UNIFILE_DSN;
    const unipileApiKey = process.env.UNIFILE_API_KEY;
    const unipileAccountId = process.env.UNIFILE_ACCOUNT_ID;

    if (!unipileDsn || !unipileApiKey || !unipileAccountId) {
      const errorMsg = 'Unipile environment variables not set.';
      console.error('sendWhatsAppMessage:', errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const client = new UnipileClient(unipileDsn, unipileApiKey);

      const message = `Salam ${customerName}! Thank you for your order with Balang Kepalang.\n\nYour order #${orderId} is confirmed.\nTotal: S$${totalAmount.toFixed(2)}\n\nWe'll be in touch shortly regarding your event. Alhamdulillah!`;

      const response = await client.messaging.startNewChat({
        account_id: unipileAccountId,
        attendees_ids: [phone],
        text: message,
      });

      return { success: true, message: 'WhatsApp message sent.', response };
    } catch (error: any) {
      console.error('sendWhatsAppMessage: Error sending WhatsApp message:', error);
      const specificError = error.body?.message || error.message || 'An unknown error occurred.';
      return { success: false, error: `Could not send WhatsApp message. Reason: ${specificError}` };
    }
  }
);
