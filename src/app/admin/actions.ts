'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import type { Flavor, Addon, EventPackage, Promotion, BlockedDate } from '@/lib/types';

// Converts a JS Date to a YYYY-MM-DD string for use as a Firestore document ID
function dateToId(date: Date): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight
  return d.toISOString().split('T')[0];
}

// Authentication verify helper
async function verifyAdmin(idToken: string | undefined): Promise<boolean> {
  if (!idToken) return false;
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const allowedUidsDoc = await adminDb.collection('admins').doc('allowedUids').get();
    if (!allowedUidsDoc.exists) {
      console.warn("admins/allowedUids document does not exist in Firestore.");
      return false;
    }
    const uids = allowedUidsDoc.data()?.uids || [];
    return uids.includes(uid);
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return false;
  }
}

// --- Blocked Dates Actions ---
export async function getBlockedDates(): Promise<BlockedDate[]> {
  try {
    const blockedDatesCollection = adminDb.collection('blockedDates');
    const querySnapshot = await blockedDatesCollection.get();

    const dates: BlockedDate[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = (data.date as Timestamp).toDate();
      dates.push({
        id: doc.id,
        date: date,
        reason: data.reason || ''
      });
    });
    return dates;
  } catch (error: any) {
    console.error("Error fetching blocked dates: ", error);
    throw new Error("Failed to fetch blocked dates.");
  }
}

export async function blockDates(dates: Date[], reason: string, idToken: string): Promise<{ success: boolean; message: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) {
    return { success: false, message: 'Unauthorized. You must be an admin to block dates.' };
  }

  if (!dates || dates.length === 0) {
    return { success: false, message: 'No dates provided to block.' };
  }

  try {
    const blockedDatesCollection = adminDb.collection('blockedDates');
    const batch = adminDb.batch();

    dates.forEach(date => {
      const docId = dateToId(date);
      const docRef = blockedDatesCollection.doc(docId);
      const normalizedDate = new Date(date);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      batch.set(docRef, { 
        date: Timestamp.fromDate(normalizedDate),
        reason: reason || 'Not Available'
      });
    });

    await batch.commit();

    revalidatePath('/event-builder');
    revalidatePath('/infaq');
    revalidatePath('/admin');
    revalidatePath('/wedding-corporate-orders');

    return { success: true, message: `${dates.length} date(s) blocked successfully.` };
  } catch (error: any) {
    console.error("Error blocking dates: ", error);
    return { success: false, message: `Failed to block dates: ${error.message}` };
  }
}

export async function unblockDates(dateIds: string[], idToken: string): Promise<{ success: boolean; message: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) {
    return { success: false, message: 'Unauthorized. You must be an admin to unblock dates.' };
  }

  if (!dateIds || dateIds.length === 0) {
    return { success: false, message: 'No dates provided to unblock.' };
  }
  
  try {
    const blockedDatesCollection = adminDb.collection('blockedDates');
    const batch = adminDb.batch();

    dateIds.forEach(id => {
      const docRef = blockedDatesCollection.doc(id);
      batch.delete(docRef);
    });
    
    await batch.commit();

    revalidatePath('/event-builder');
    revalidatePath('/infaq');
    revalidatePath('/admin');
    revalidatePath('/wedding-corporate-orders');
    
    return { success: true, message: `${dateIds.length} date(s) unblocked successfully.` };
  } catch (error: any) {
    console.error("Error unblocking dates: ", error);
    return { success: false, message: `Failed to unblock dates: ${error.message}` };
  }
}

// --- Flavor CRUD Actions ---
export async function createFlavor(data: Omit<Flavor, 'id'> & { customId?: string }, idToken: string): Promise<{ success: boolean; message: string; id?: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    let id: string;
    if (data.customId) {
      id = data.customId;
      const { customId, ...cleanData } = data;
      await adminDb.collection('flavors').doc(id).set(cleanData);
    } else {
      const docRef = await adminDb.collection('flavors').add(data);
      id = docRef.id;
    }
    revalidatePath('/flavors');
    revalidatePath('/event-builder');
    revalidatePath('/wedding-corporate-orders');
    revalidatePath('/ai-stylist');
    return { success: true, message: 'Flavor created successfully.', id };
  } catch (error: any) {
    console.error('Error creating flavor:', error);
    return { success: false, message: error.message };
  }
}

export async function updateFlavor(id: string, data: Partial<Flavor>, idToken: string): Promise<{ success: boolean; message: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    const { id: _, ...cleanData } = data as any;
    await adminDb.collection('flavors').doc(id).update(cleanData);
    revalidatePath('/flavors');
    revalidatePath('/event-builder');
    revalidatePath('/wedding-corporate-orders');
    revalidatePath('/ai-stylist');
    return { success: true, message: 'Flavor updated successfully.' };
  } catch (error: any) {
    console.error('Error updating flavor:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteFlavor(id: string, idToken: string): Promise<{ success: boolean; message: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    await adminDb.collection('flavors').doc(id).delete();
    revalidatePath('/flavors');
    revalidatePath('/event-builder');
    revalidatePath('/wedding-corporate-orders');
    revalidatePath('/ai-stylist');
    return { success: true, message: 'Flavor deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting flavor:', error);
    return { success: false, message: error.message };
  }
}

// --- Package CRUD Actions ---
export async function createPackage(data: Omit<EventPackage, 'id'> & { customId?: string }, idToken: string): Promise<{ success: boolean; message: string; id?: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    let id: string;
    if (data.customId) {
      id = data.customId;
      const { customId, ...cleanData } = data;
      await adminDb.collection('packages').doc(id).set(cleanData);
    } else {
      const docRef = await adminDb.collection('packages').add(data);
      id = docRef.id;
    }
    revalidatePath('/event-builder');
    revalidatePath('/wedding-corporate-orders');
    return { success: true, message: 'Package created successfully.', id };
  } catch (error: any) {
    console.error('Error creating package:', error);
    return { success: false, message: error.message };
  }
}

export async function updatePackage(id: string, data: Partial<EventPackage>, idToken: string): Promise<{ success: boolean; message: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    const { id: _, ...cleanData } = data as any;
    await adminDb.collection('packages').doc(id).update(cleanData);
    revalidatePath('/event-builder');
    revalidatePath('/wedding-corporate-orders');
    return { success: true, message: 'Package updated successfully.' };
  } catch (error: any) {
    console.error('Error updating package:', error);
    return { success: false, message: error.message };
  }
}

export async function deletePackage(id: string, idToken: string): Promise<{ success: boolean; message: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    await adminDb.collection('packages').doc(id).delete();
    revalidatePath('/event-builder');
    revalidatePath('/wedding-corporate-orders');
    return { success: true, message: 'Package deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting package:', error);
    return { success: false, message: error.message };
  }
}

// --- Addon CRUD Actions ---
export async function createAddon(data: Omit<Addon, 'id'> & { customId?: string }, idToken: string): Promise<{ success: boolean; message: string; id?: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    let id: string;
    if (data.customId) {
      id = data.customId;
      const { customId, ...cleanData } = data;
      await adminDb.collection('addons').doc(id).set(cleanData);
    } else {
      const docRef = await adminDb.collection('addons').add(data);
      id = docRef.id;
    }
    revalidatePath('/event-builder');
    revalidatePath('/wedding-corporate-orders');
    return { success: true, message: 'Addon created successfully.', id };
  } catch (error: any) {
    console.error('Error creating addon:', error);
    return { success: false, message: error.message };
  }
}

export async function updateAddon(id: string, data: Partial<Addon>, idToken: string): Promise<{ success: boolean; message: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    const { id: _, ...cleanData } = data as any;
    await adminDb.collection('addons').doc(id).update(cleanData);
    revalidatePath('/event-builder');
    revalidatePath('/wedding-corporate-orders');
    return { success: true, message: 'Addon updated successfully.' };
  } catch (error: any) {
    console.error('Error updating addon:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteAddon(id: string, idToken: string): Promise<{ success: boolean; message: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    await adminDb.collection('addons').doc(id).delete();
    revalidatePath('/event-builder');
    revalidatePath('/wedding-corporate-orders');
    return { success: true, message: 'Addon deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting addon:', error);
    return { success: false, message: error.message };
  }
}

// --- Promotion CRUD Actions ---
export async function createPromotion(data: Omit<Promotion, 'id'> & { customId?: string }, idToken: string): Promise<{ success: boolean; message: string; id?: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    let id: string;
    if (data.customId) {
      id = data.customId;
      const { customId, ...cleanData } = data;
      await adminDb.collection('promotions').doc(id).set(cleanData);
    } else {
      const docRef = await adminDb.collection('promotions').add(data);
      id = docRef.id;
    }
    revalidatePath('/promotions');
    revalidatePath('/');
    return { success: true, message: 'Promotion created successfully.', id };
  } catch (error: any) {
    console.error('Error creating promotion:', error);
    return { success: false, message: error.message };
  }
}

export async function updatePromotion(id: string, data: Partial<Promotion>, idToken: string): Promise<{ success: boolean; message: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    const { id: _, ...cleanData } = data as any;
    await adminDb.collection('promotions').doc(id).update(cleanData);
    revalidatePath('/promotions');
    revalidatePath('/');
    return { success: true, message: 'Promotion updated successfully.' };
  } catch (error: any) {
    console.error('Error updating promotion:', error);
    return { success: false, message: error.message };
  }
}

export async function deletePromotion(id: string, idToken: string): Promise<{ success: boolean; message: string }> {
  const isAdmin = await verifyAdmin(idToken);
  if (!isAdmin) return { success: false, message: 'Unauthorized.' };

  try {
    await adminDb.collection('promotions').doc(id).delete();
    revalidatePath('/promotions');
    revalidatePath('/');
    return { success: true, message: 'Promotion deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting promotion:', error);
    return { success: false, message: error.message };
  }
}
