
export interface Flavor {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pricePerLiter: number;
  tags?: string[];
  color?: string; // for UI accent, e.g., 'bg-red-500'
  dataAiHint?: string;
}

export interface EventPackage {
  id: string;
  name: string;
  description: string;
  price: number; // Base price of the package or all-inclusive price
  includedItems: string[];
  imageUrl: string;
  pax?: string; // e.g., 'Suitable for 50-100 pax'
  setupFee: number; // Component value of setup/service fee. Added to total if not isAllInclusive.
  isAllInclusive?: boolean; // If true, price includes setup and delivery
  dataAiHint?: string;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Drinks' | 'Food' | 'Equipment' | 'Services' | 'Live Stations';
  imageUrl?: string;
  requiresFlavor?: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  endDate?: string; // ISO date string
  terms?: string;
  dataAiHint?: string;
}

export interface CommunityStory {
  id: string;
  userName: string;
  avatarUrl?: string;
  story: string;
  imageUrl?: string;
  date: string; // ISO date string
  eventName?: string;
  dataAiHintStory?: string;
  dataAiHintAvatar?: string;
}

export interface InfaqOrder {
  donorName: string;
  dedicationName?: string;
  email: string;
  phone?: string;
  quantity: number;
  mosqueName?: string;
  mosqueAddress?: string;
  deliveryDate: string;
  deliveryDisplayDate: string;
  message?: string;
  anonymous?: boolean;
  howHeard?: string;
  consent: boolean;
  pricePerBalang?: number;
  calculatedSubtotal?: number;
  deliveryFee?: number;
  calculatedTotal?: number;
  orderType?: 'balang_infaq' | 'delivery_sponsorship';
  coverDeliveryFee?: boolean;
  targetSlotId?: string;
  paymentProofUrl?: string;
}

export interface InfaqContribution {
  type: 'BALANG' | 'DELIVERY_SPONSORSHIP';
  donorName: string;
  quantity?: number; // For balangs
  amount?: number; // For sponsorship amount
  timestamp: any; // Firestore Timestamp
  sponsoredDelivery?: boolean;
}

export interface InfaqNoticeBoardSlot {
  id: string;
  mosqueName: string;
  mosqueAddress?: string;
  date: string; // ISO Date string for the target Friday (used for form pre-fill)
  displayDate: string; // Pre-formatted date string for display on card (e.g., "June 13th, 2025")
  status:
  | 'Delivery Secured - Join In!'
  | 'Delivery Fee Sponsored!'
  | 'Slot Open - Be the First!'
  | 'Contributions Open (Shared Delivery Pending)'
  | 'Contributions Welcome - Delivery Needed'
  | 'Recently Fulfilled!';
  description?: string;
  imageUrl?: string;
  dataAiHint?: string;
  totalBalangsInfaqed?: number;
  isDeliveryFeeCovered?: boolean;
  contributions?: InfaqContribution[];
}

export interface BlockedDate {
  id: string; // YYYY-MM-DD
  date: Date;
  reason?: string;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  points: number;
  avatarUrl?: string;
  badge?: string; // e.g., "Community Champion", "Masjid Benefactor"
  dataAiHintAvatar?: string;
}
