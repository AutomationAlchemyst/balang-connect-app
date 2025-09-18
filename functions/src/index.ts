import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { UnipileClient } from "unipile-node-sdk";
import { google } from "googleapis";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";

// ✅ This ensures the Firebase Admin SDK is initialized only ONCE.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// ✅ This function is necessary for the 2nd Gen function health check.
export const healthcheck = onRequest((req, res) => {
  res.send("OK");
});


/**
 * =================================================================================
 * FUNCTION 1: Send WhatsApp Order Confirmation (v2 Syntax)
 * =================================================================================
 */
export const sendOrderConfirmation = onDocumentCreated(
  { document: "orders/{orderId}", region: "asia-southeast1" },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }
    const orderData = snapshot.data();
    const orderId = event.params.orderId;

    functions.logger.info(
      `New order ${orderId}, preparing WhatsApp confirmation.`
    );

    if (!orderData || !orderData.customerPhone) {
      functions.logger.error(
        "Order data is missing 'customerPhone' field.",
        { orderId: orderId }
      );
      return;
    }

    const unipileAccountId = functions.config().unipile.account_id;
    if (!unipileAccountId) {
      functions.logger.error(
        "Unipile Account ID is not set in Firebase config.",
        { orderId: orderId }
      );
      return;
    }

    let phoneNumber = String(orderData.customerPhone).replace(/\s+/g, "");
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = `+65${phoneNumber}`;
    }

    const customerName = orderData.customerName || "Customer";
    const totalAmount = Number(orderData.total || 0);
    const messageBody =
      `Salam ${customerName}! ` +
      "Thank you for your order with BalangConnect.\n\n" +
      `Your order #${orderId.substring(0, 6)} is confirmed.\n` +
      `Total: S$${totalAmount.toFixed(2)}\n\n` +
      "We'll be in touch shortly regarding your event. Alhamdulillah!";

    try {
      // ✅ Unipile Client is now initialized safely inside the function.
      const unipile = new UnipileClient(
        "https://api4.unipile.com:13497",
        functions.config().unipile.key
      );

      const payload = {
        account_id: unipileAccountId,
        attendees_ids: [phoneNumber],
        text: messageBody,
      };
      console.log("Sending to Unipile with payload:", JSON.stringify(payload, null, 2));
      // --- END OF DEBUGGING BLOCK ---

      await unipile.messaging.startNewChat(payload); // Use the payload variable here

      functions.logger.info(
        "WhatsApp confirmation sent successfully!", {orderId: orderId},
      );

      // await unipile.messaging.startNewChat({
        // account_id: unipileAccountId,
        // attendees_ids: [phoneNumber],
        // text: messageBody,
      // });

      // functions.logger.info(
        // "WhatsApp confirmation sent successfully!",
        // { orderId: orderId }
      // );
      await snapshot.ref.update({
        confirmationSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      functions.logger.error("Error sending WhatsApp message via Unipile:", {
        orderId,
        error,
      });
    }
  }
);

/**
 * =================================================================================
 * FUNCTION 2: Sync New Order to Google Sheets (v2 Syntax)
 * =================================================================================
 */
export const syncOrderToSheet = onDocumentCreated(
  { document: "orders/{orderId}", region: "asia-southeast1" },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }
    const orderData = snapshot.data();
    const orderId = event.params.orderId;

    functions.logger.info(`Syncing order ${orderId} to Google Sheet.`);

    if (!orderData) {
      functions.logger.error("No data for sheets sync.", { orderId: orderId });
      return;
    }

    try {
      const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth: auth });
      const spreadsheetId = functions.config().sheets.id;

      const headers = [
        "ID", "Date Submitted", "Name", "Email", "Contact", "Event Date",
        "Event Type", "Venue", "Package", "Pax", "Flavours", "Add Ons",
        "Total Price", "Payment Proof", "Payment Status",
      ];

      const newRow = headers.map((header) => {
        switch (header) {
          case "ID": return orderId;
          case "Date Submitted":
            return orderData.createdAt?.toDate
              ? orderData.createdAt.toDate().toISOString()
              : new Date().toISOString();
          case "Name": return orderData.customerName || "";
          case "Email": return orderData.customerEmail || "";
          case "Contact": return orderData.customerPhone || "";
          case "Event Date": return orderData.eventDate || "";
          case "Event Type": return orderData.eventType || "";
          case "Venue": return orderData.venue || "";
          case "Package": return orderData.packageName || "";
          case "Pax": return orderData.pax || "";
          case "Flavours":
            return Array.isArray(orderData.flavors)
              ? orderData.flavors.join(", ")
              : "";
          case "Add Ons":
            return Array.isArray(orderData.addOns)
              ? orderData.addOns.join(", ")
              : "";
          case "Total Price": return orderData.total || 0;
          case "Payment Proof": return orderData.paymentProofUrl || "";
          case "Payment Status": return "Confirmed";
          default: return "";
        }
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [newRow],
        },
      });

      functions.logger.info(`Successfully synced order ${orderId} to Sheet.`);
    } catch (error: any) {
      functions.logger.error("Error syncing data to Google Sheets:", {
        orderId,
        errorMessage: error.message,
        errorStack: error.stack,
      });
    }
  }
);