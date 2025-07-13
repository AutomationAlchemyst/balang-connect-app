console.log(">>> Checking credentials path:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

import admin from 'firebase-admin';

// This function ensures we only initialize the app once.
const getAdminApp = () => {
  // Check if the default app has already been initialized.
  if (admin.apps.length > 0) {
    return admin.app(); // Return the existing default app
  }

  // When no argument is provided, initializeApp automatically
  // uses Application Default Credentials (ADC). This is how it finds
  // your GOOGLE_APPLICATION_CREDENTIALS variable.
  console.log("Firebase Admin SDK is initializing...");
  try {
    return admin.initializeApp();
  } catch (error: any) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw new Error(`Could not initialize Firebase Admin SDK. Reason: ${error.message}`);
  }
};

// Initialize the app and export instances for use in other parts of your app.
const adminApp = getAdminApp();
const adminDb = admin.firestore(adminApp);

export { adminApp, adminDb };