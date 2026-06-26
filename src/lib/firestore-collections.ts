/**
 * Firestore Collection Constants & Server-Side Data Fetchers
 * 
 * These helpers use firebase-admin (server-side only) to fetch data
 * from Firestore. They are designed for use in Server Components
 * and Server Actions.
 */

import { adminDb } from './firebase-admin';
import type { Flavor, EventPackage, Addon, Promotion } from './types';

// ---- Collection Name Constants ----

export const COLLECTIONS = {
  FLAVORS: 'flavors',
  PACKAGES: 'packages',
  ADDONS: 'addons',
  PROMOTIONS: 'promotions',
  INFAQ_SLOTS: 'infaqSlots',
  BLOCKED_DATES: 'blockedDates',
  ADMINS: 'admins',
} as const;

// ---- Generic Fetcher ----

async function fetchCollection<T>(
  collectionName: string,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'asc'
): Promise<T[]> {
  try {
    let query: FirebaseFirestore.Query = adminDb.collection(collectionName);
    
    if (orderByField) {
      query = query.orderBy(orderByField, orderDirection);
    }

    const snapshot = await query.get();
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`[Firestore] Error fetching collection "${collectionName}":`, error);
    return [];
  }
}

// ---- Typed Data Fetchers ----

/**
 * Fetch all flavors from Firestore, ordered by name.
 */
export async function getFlavors(): Promise<Flavor[]> {
  return fetchCollection<Flavor>(COLLECTIONS.FLAVORS, 'name');
}

/**
 * Fetch all event packages from Firestore, ordered by price.
 */
export async function getPackages(): Promise<EventPackage[]> {
  return fetchCollection<EventPackage>(COLLECTIONS.PACKAGES, 'price');
}

/**
 * Fetch all addons from Firestore, ordered by category then name.
 */
export async function getAddons(): Promise<Addon[]> {
  return fetchCollection<Addon>(COLLECTIONS.ADDONS, 'category');
}

/**
 * Fetch all promotions from Firestore.
 */
export async function getPromotions(): Promise<Promotion[]> {
  return fetchCollection<Promotion>(COLLECTIONS.PROMOTIONS);
}

/**
 * Fetch packages filtered by type (regular vs corporate).
 * Regular packages have ids starting with 'pkg_', corporate with 'corp_'.
 */
export async function getRegularPackages(): Promise<EventPackage[]> {
  const allPackages = await getPackages();
  return allPackages.filter(p => p.id.startsWith('pkg_'));
}

export async function getCorporatePackages(): Promise<EventPackage[]> {
  const allPackages = await getPackages();
  return allPackages.filter(p => p.id.startsWith('corp_') || p.id === 'pkg_17l_self_pickup');
}

// ---- Single Document Fetchers ----

export async function getFlavorById(id: string): Promise<Flavor | null> {
  try {
    const doc = await adminDb.collection(COLLECTIONS.FLAVORS).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Flavor;
  } catch (error) {
    console.error(`[Firestore] Error fetching flavor "${id}":`, error);
    return null;
  }
}

export async function getPackageById(id: string): Promise<EventPackage | null> {
  try {
    const doc = await adminDb.collection(COLLECTIONS.PACKAGES).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as EventPackage;
  } catch (error) {
    console.error(`[Firestore] Error fetching package "${id}":`, error);
    return null;
  }
}
