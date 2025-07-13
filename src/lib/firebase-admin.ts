import admin from 'firebase-admin';

const initializeAdminApp = () => {
  // Check if we are on Vercel and the special variable exists
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.log("Initializing Firebase Admin with Vercel environment variable...");
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    
    // Check if app is already initialized to avoid errors
    if (!admin.apps.length) {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    return admin.app();
  } 
  
  // This is for your local development (npm run dev)
  console.log("Initializing Firebase Admin with local file path...");
  if (!admin.apps.length) {
    return admin.initializeApp();
  }
  return admin.app();
};

const adminApp = initializeAdminApp();
const adminDb = admin.firestore(adminApp);

export { adminApp, adminDb };