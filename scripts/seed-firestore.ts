import admin from 'firebase-admin';
import { SEED_FLAVORS, SEED_PACKAGES, SEED_ADDONS, SEED_PROMOTIONS, SEED_INFAQ_NOTICE_BOARD_SLOTS } from '../src/lib/data';
import { SEED_CORPORATE_PACKAGES, SEED_CORPORATE_ADDONS } from '../src/lib/corporate-data';

// Initialize Firebase Admin using credentials from the environment variable GOOGLE_APPLICATION_CREDENTIALS
if (!admin.apps.length) {
  console.log('Initializing Firebase Admin SDK...');
  admin.initializeApp();
}

const db = admin.firestore();

async function seedCollection(collectionName: string, data: any[]) {
  console.log(`Seeding collection: "${collectionName}" with ${data.length} items...`);
  const batch = db.batch();
  
  for (const item of data) {
    const { id, ...docData } = item;
    if (!id) {
      console.warn(`Item in "${collectionName}" is missing an ID. Skipping...`, item);
      continue;
    }
    const docRef = db.collection(collectionName).doc(id);
    batch.set(docRef, docData, { merge: true });
  }
  
  await batch.commit();
  console.log(`Successfully seeded collection "${collectionName}"!`);
}

async function main() {
  try {
    console.log('Starting Firestore Seeding Process...');

    // 1. Seed Flavors
    await seedCollection('flavors', SEED_FLAVORS);

    // 2. Seed Packages (Regular + Corporate)
    const combinedPackages = [...SEED_PACKAGES, ...SEED_CORPORATE_PACKAGES];
    await seedCollection('packages', combinedPackages);

    // 3. Seed Addons (Regular + Corporate)
    const combinedAddons = [...SEED_ADDONS, ...SEED_CORPORATE_ADDONS];
    await seedCollection('addons', combinedAddons);

    // 4. Seed Promotions
    await seedCollection('promotions', SEED_PROMOTIONS);

    // 5. Seed Infaq Slots
    // Convert date string/object representation if needed, but keeping as mock data structure
    await seedCollection('infaqSlots', SEED_INFAQ_NOTICE_BOARD_SLOTS);

    console.log('--- Firestore Seeding Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding Firestore:', error);
    process.exit(1);
  }
}

main();
