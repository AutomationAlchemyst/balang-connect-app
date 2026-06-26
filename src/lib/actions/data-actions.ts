'use server';

import { 
  getFlavors, 
  getPackages, 
  getAddons, 
  getPromotions, 
  getRegularPackages, 
  getCorporatePackages,
  getFlavorById,
  getPackageById
} from '../firestore-collections';
import type { Flavor, EventPackage, Addon, Promotion } from '../types';

export async function fetchFlavors(): Promise<Flavor[]> {
  try {
    return await getFlavors();
  } catch (error) {
    console.error('Error fetching flavors action:', error);
    return [];
  }
}

export async function fetchPackages(): Promise<EventPackage[]> {
  try {
    return await getPackages();
  } catch (error) {
    console.error('Error fetching packages action:', error);
    return [];
  }
}

export async function fetchAddons(): Promise<Addon[]> {
  try {
    return await getAddons();
  } catch (error) {
    console.error('Error fetching addons action:', error);
    return [];
  }
}

export async function fetchPromotions(): Promise<Promotion[]> {
  try {
    return await getPromotions();
  } catch (error) {
    console.error('Error fetching promotions action:', error);
    return [];
  }
}

export async function fetchRegularPackages(): Promise<EventPackage[]> {
  try {
    return await getRegularPackages();
  } catch (error) {
    console.error('Error fetching regular packages action:', error);
    return [];
  }
}

export async function fetchCorporatePackages(): Promise<EventPackage[]> {
  try {
    return await getCorporatePackages();
  } catch (error) {
    console.error('Error fetching corporate packages action:', error);
    return [];
  }
}

export async function fetchFlavorById(id: string): Promise<Flavor | null> {
  try {
    return await getFlavorById(id);
  } catch (error) {
    console.error(`Error fetching flavor action for id ${id}:`, error);
    return null;
  }
}

export async function fetchPackageById(id: string): Promise<EventPackage | null> {
  try {
    return await getPackageById(id);
  } catch (error) {
    console.error(`Error fetching package action for id ${id}:`, error);
    return null;
  }
}
