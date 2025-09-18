
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { InfaqNoticeBoardSlot, InfaqOrder, InfaqContribution } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { format } from "date-fns";
import { createBookingFlow } from '@/ai/flows/createBookingFlow';

const DELIVERY_FEE = 25.00;

export async function getInfaqSlots(): Promise<InfaqNoticeBoardSlot[]> {
  try {
    const infaqSlotsCollection = adminDb.collection('infaqSlots');
    const querySnapshot = await infaqSlotsCollection.get();

    const slots: InfaqNoticeBoardSlot[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      let isoDateString = '';
      let displayDate = data.displayDate;
      let eventDate: Date | null = null;

      if (data.date instanceof Timestamp) {
        eventDate = data.date.toDate();
      } else if (typeof data.date === 'object' && data.date?.seconds) {
        eventDate = new Timestamp(data.date.seconds, data.date.nanoseconds).toDate();
      }

      if (eventDate) {
        isoDateString = new Date(Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate())).toISOString();
        if (!displayDate) {
            displayDate = format(eventDate, "PPP");
        }
      } else {
        console.warn(`Invalid or missing date field for slot ID ${doc.id}. Using displayDate if available.`);
        if (!displayDate) {
            displayDate = 'Invalid Date';
        }
      }
      
      slots.push({
        id: doc.id,
        mosqueName: data.mosqueName,
        mosqueAddress: data.mosqueAddress || '',
        date: isoDateString, 
        displayDate: displayDate, 
        status: data.status as InfaqNoticeBoardSlot['status'],
        description: data.description || '',
        imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
        dataAiHint: data.dataAiHint || 'community event',
        totalBalangsInfaqed: data.totalBalangsInfaqed || 0,
        isDeliveryFeeCovered: data.isDeliveryFeeCovered || false,
      });
    });
    
    slots.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return dateA.getTime() - dateB.getTime();
    });

    return slots;
  } catch (error: any) {
    console.error("Error fetching Infaq slots with Admin SDK: ", error);
    throw new Error(`Failed to fetch Infaq slots. Please check server logs. [Code: ${error.code}]`);
  }
}

export async function submitInfaqContribution(
  orderData: InfaqOrder 
): Promise<{ success: boolean; message: string; slotId?: string }> {
  const infaqSlotsCollection = adminDb.collection('infaqSlots');
    
  if (typeof orderData.deliveryDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(orderData.deliveryDate)) {
    return { success: false, message: 'Invalid delivery date format provided.' };
  }

  if (!orderData.deliveryDisplayDate) {
    console.warn("Missing deliveryDisplayDate in orderData for submitInfaqContribution. Client-side formatting might have failed.");
    orderData.deliveryDisplayDate = format(new Date(orderData.deliveryDate.replace(/-/g, '/')), "PPP");
  }

  const dateParts = orderData.deliveryDate.split('-').map(Number);
  const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  if (isNaN(localDate.getTime())) {
    return { success: false, message: 'Invalid delivery date provided.' };
  }
  const utcDateForTimestamp = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
  const deliveryDateTimestamp = Timestamp.fromDate(utcDateForTimestamp);


  try {
    const slotId = await adminDb.runTransaction(async (transaction) => {
      let targetSlotRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | null = null;
      let existingSlotData: InfaqNoticeBoardSlot | null = null;

      if (orderData.targetSlotId) {
        const docRef = infaqSlotsCollection.doc(orderData.targetSlotId);
        const slotDoc = await transaction.get(docRef);
        if (slotDoc.exists) {
          targetSlotRef = docRef;
          existingSlotData = slotDoc.data() as InfaqNoticeBoardSlot;
        } else {
            console.warn(`Targeted Infaq slot with ID ${orderData.targetSlotId} does not exist. Will attempt to find by date/mosque or create a new one.`);
        }
      }

      if (!targetSlotRef && orderData.orderType === 'balang_infaq' && orderData.mosqueName) {
        const query = infaqSlotsCollection
            .where('mosqueName', '==', orderData.mosqueName)
            .where('date', '==', deliveryDateTimestamp)
            .limit(1);
        const querySnapshot = await transaction.get(query);
        if (!querySnapshot.empty) {
            const slotDoc = querySnapshot.docs[0];
            targetSlotRef = slotDoc.ref;
            existingSlotData = slotDoc.data() as InfaqNoticeBoardSlot;
        }
      }
      
      const contribution: InfaqContribution = {
        type: orderData.orderType === 'balang_infaq' ? 'BALANG' : 'DELIVERY_SPONSORSHIP',
        donorName: orderData.anonymous ? (orderData.orderType === 'balang_infaq' ? 'Anonymous Donor' : 'Anonymous Sponsor') : orderData.donorName,
        timestamp: Timestamp.now(),
      };

      if (existingSlotData && targetSlotRef) {
        if (orderData.orderType === 'balang_infaq') {
            contribution.quantity = orderData.quantity;
            contribution.sponsoredDelivery = !!orderData.coverDeliveryFee;

            const newTotalBalangs = (existingSlotData.totalBalangsInfaqed || 0) + orderData.quantity;
            const deliveryNowCovered = existingSlotData.isDeliveryFeeCovered || !!orderData.coverDeliveryFee;
            const newStatus = deliveryNowCovered ? 'Delivery Secured - Join In!' : 'Contributions Open (Shared Delivery Pending)';
            
            transaction.update(targetSlotRef, {
                totalBalangsInfaqed: FieldValue.increment(orderData.quantity),
                isDeliveryFeeCovered: deliveryNowCovered,
                status: newStatus,
                description: `${newTotalBalangs} balang(s) now contributed. ${deliveryNowCovered ? 'Delivery is secured!' : 'Delivery fee will be shared.'} More contributions welcome!`,
                contributions: FieldValue.arrayUnion(contribution)
            });
        } else {
            contribution.amount = orderData.calculatedTotal;
            transaction.update(targetSlotRef, {
                isDeliveryFeeCovered: true,
                status: 'Delivery Secured - Join In!',
                description: `The delivery for this slot has now been sponsored! ${existingSlotData.totalBalangsInfaqed || 0} balang(s) are ready to go. More contributions welcome.`,
                contributions: FieldValue.arrayUnion(contribution)
            });
        }
        return targetSlotRef.id;
      } 
      else {
        let slotStatus: InfaqNoticeBoardSlot['status'];
        let slotDescription = '';
        let initialTotalBalangs = 0;
        let initialDeliveryFeeCovered = false;

        if (orderData.orderType === 'balang_infaq') {
          initialTotalBalangs = orderData.quantity;
          contribution.quantity = orderData.quantity;
          
          if (orderData.coverDeliveryFee) {
            initialDeliveryFeeCovered = true;
            slotStatus = 'Delivery Secured - Join In!';
            slotDescription = `${contribution.donorName} has initiated an Infaq for ${orderData.quantity} balang(s) to ${orderData.mosqueName || 'a mosque'} on ${orderData.deliveryDisplayDate}, and delivery is covered! More contributions welcome.`;
            contribution.sponsoredDelivery = true;
          } else {
            initialDeliveryFeeCovered = false;
            slotStatus = 'Contributions Open (Shared Delivery Pending)';
            slotDescription = `${contribution.donorName} has contributed ${orderData.quantity} balang(s) for the event on ${orderData.deliveryDisplayDate}. The delivery fee for this slot will be shared among all contributors.`;
            contribution.sponsoredDelivery = false;
          }
        } else { 
          slotStatus = 'Delivery Fee Sponsored!';
          slotDescription = `The delivery fee for a Jumaat event on ${orderData.deliveryDisplayDate} (mosque to be assigned or for ${orderData.mosqueName || 'general community'}) has been kindly sponsored by ${contribution.donorName}. Balang Infaqs are welcome!`;
          initialDeliveryFeeCovered = true;
          contribution.amount = orderData.calculatedTotal; 
        }
        
        const newSlotData = {
          mosqueName: orderData.mosqueName || 'To Be Assigned (Sponsored Delivery)',
          mosqueAddress: orderData.mosqueAddress || '',
          date: deliveryDateTimestamp, 
          displayDate: orderData.deliveryDisplayDate,
          status: slotStatus,
          description: slotDescription,
          imageUrl: 'https://placehold.co/600x400.png', 
          dataAiHint: 'community sharing',
          totalBalangsInfaqed: initialTotalBalangs,
          isDeliveryFeeCovered: initialDeliveryFeeCovered,
          contributions: [contribution], 
          createdAt: Timestamp.now(), 
        };

        const newDocRef = infaqSlotsCollection.doc();
        transaction.set(newDocRef, newSlotData);
        return newDocRef.id;
      }
    });

    createBookingFlow({
        type: 'Infaq',
        customerName: orderData.anonymous ? 'Anonymous' : orderData.donorName,
        email: orderData.email,
        phone: orderData.phone || 'N/A',
        eventDate: orderData.deliveryDate,
        details: `Type: ${orderData.orderType}. Mosque: ${orderData.mosqueName || 'N/A'}. Address: ${orderData.mosqueAddress || 'N/A'}. For Date: ${orderData.deliveryDisplayDate}. Qty: ${orderData.quantity || 0}. Dedication: ${orderData.dedicationName || 'None'}. Message: ${orderData.message || 'None'}. Delivery covered: ${!!orderData.coverDeliveryFee || orderData.orderType === 'delivery_sponsorship'}`,
        totalAmount: orderData.calculatedTotal || 0,
        paymentProofUrl: orderData.paymentProofUrl,
    }).catch(e => {
        console.error("Failed to sync Infaq booking with Google services:", e);
    });

    revalidatePath('/infaq'); 

    return { 
      success: true, 
      message: 'Infaq contribution submitted successfully!', 
      slotId: slotId 
    };

  } catch (error: any) {
    console.error("Error submitting Infaq contribution with Admin SDK: ", error);
    return { 
      success: false, 
      message: `Failed to submit Infaq contribution: ${error.message}`
    };
  }
}
