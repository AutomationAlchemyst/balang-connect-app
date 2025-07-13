
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import type { BlockedDate } from '@/lib/types';

// Converts a JS Date to a YYYY-MM-DD string for use as a Firestore document ID
function dateToId(date: Date): string {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight
    return d.toISOString().split('T')[0];
}

export async function getBlockedDates(): Promise<BlockedDate[]> {
    try {
        const blockedDatesCollection = adminDb.collection('blockedDates');
        const querySnapshot = await blockedDatesCollection.get();

        const dates: BlockedDate[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Firestore timestamps need to be converted to JS Dates
            const date = (data.date as Timestamp).toDate();
            dates.push({
                id: doc.id,
                date: date,
                reason: data.reason || ''
            });
        });
        return dates;
    } catch (error: any) {
        console.error("Error fetching blocked dates with Admin SDK: ", error);
        // Re-throw a simpler error for the client component to display
        throw new Error(`Failed to fetch blocked dates. Please check server logs. [Code: ${error.code}]`);
    }
}

export async function blockDates(dates: Date[], reason: string): Promise<{ success: boolean; message: string }> {
    if (!dates || dates.length === 0) {
        return { success: false, message: 'No dates provided to block.' };
    }

    try {
        const blockedDatesCollection = adminDb.collection('blockedDates');
        const batch = adminDb.batch();

        dates.forEach(date => {
            const docId = dateToId(date);
            const docRef = blockedDatesCollection.doc(docId);
             // Normalize date to midnight UTC before storing
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
        revalidatePath('/admin/manage-dates');

        return { success: true, message: `${dates.length} date(s) blocked successfully.` };
    } catch (error: any) {
        console.error("Error blocking dates with Admin SDK: ", error);
        return { success: false, message: `Failed to block dates: ${error.message}` };
    }
}

export async function unblockDates(dateIds: string[]): Promise<{ success: boolean; message: string }> {
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
        revalidatePath('/admin/manage-dates');
        
        return { success: true, message: `${dateIds.length} date(s) unblocked successfully.` };
    } catch (error: any) {
        console.error("Error unblocking dates with Admin SDK: ", error);
        return { success: false, message: `Failed to unblock dates: ${error.message}` };
    }
}
