
import type { EventPackage, Addon } from './types';

export const mockCorporatePackages: EventPackage[] = [
  {
    id: 'corp_cw_300',
    name: 'Corporate Package CW 300',
    description: 'Suitable for 300-400 guests. Includes 3 x 40L balangs, ~600 cups (200ml), and 1 bal-tender for 4 hours.',
    price: 600.00,
    setupFee: 0,
    isAllInclusive: true,
    includedItems: ['3 x 40L Balangs (Choice of 3 Flavors)', 'Bal-tender service (4 hours)', 'Setup & Teardown Service', 'Delivery & Pickup Fee', 'Unlimited Cups'],
    imageUrl: 'https://placehold.co/400x250.png',
    pax: '300-400',
    dataAiHint: 'corporate event drinks'
  },
  {
    id: 'corp_cw_450',
    name: 'Corporate Package CW 450',
    description: 'Suitable for 400-500 guests. Includes 4 x 40L balangs, ~800 cups (200ml), and 1 bal-tender for 4 hours.',
    price: 765.00,
    setupFee: 0,
    isAllInclusive: true,
    includedItems: ['4 x 40L Balangs (Choice of 4 Flavors)', 'Bal-tender service (4 hours)', 'Setup & Teardown Service', 'Delivery & Pickup Fee', 'Unlimited Cups'],
    imageUrl: 'https://placehold.co/400x250.png',
    pax: '400-500',
    dataAiHint: 'large corporate event drinks'
  },
  {
    id: 'corp_cw_600',
    name: 'Corporate Package CW 600',
    description: 'Suitable for 600-700 guests. Includes 5 x 40L balangs, ~1000 cups (200ml), and 1 bal-tender for 4 hours.',
    price: 930.00,
    setupFee: 0,
    isAllInclusive: true,
    includedItems: ['5 x 40L Balangs (Choice of 5 Flavors)', 'Bal-tender service (4 hours)', 'Setup & Teardown Service', 'Delivery & Pickup Fee', 'Unlimited Cups'],
    imageUrl: 'https://placehold.co/400x250.png',
    pax: '600-700',
    dataAiHint: 'major corporate event drinks'
  },
  {
    id: 'corp_cw_800',
    name: 'Corporate Package CW 800',
    description: 'Suitable for 800-900 guests. Includes 6 x 40L balangs, ~1200 cups (200ml), and 2 bal-tenders for 4 hours.',
    price: 1080.00,
    setupFee: 0,
    isAllInclusive: true,
    includedItems: ['6 x 40L Balangs (Choice of 6 Flavors)', '2 Bal-tenders service (4 hours)', 'Setup & Teardown Service', 'Delivery & Pickup Fee', 'Unlimited Cups'],
    imageUrl: 'https://placehold.co/400x250.png',
    pax: '800-900',
    dataAiHint: 'conference drinks catering'
  },
  {
    id: 'corp_cw_1k',
    name: 'Corporate Package CW 1K',
    description: 'Suitable for 1000 guests. Includes 8 x 40L balangs, ~1600 cups (200ml), and 2 bal-tenders for 4 hours.',
    price: 1260.00,
    setupFee: 0,
    isAllInclusive: true,
    includedItems: ['8 x 40L Balangs (Choice of 8 Flavors)', '2 Bal-tenders service (4 hours)', 'Setup & Teardown Service', 'Delivery & Pickup Fee', 'Unlimited Cups'],
    imageUrl: 'https://placehold.co/400x250.png',
    pax: '1000',
    dataAiHint: 'large scale event drinks'
  },
  {
    id: 'pkg_17l_self_pickup',
    name: '17L Balang (Self-Pickup / Delivery)',
    description: 'Suitable for 15-25 pax. Price is for self-pickup. Delivery is available for an additional $20.00. Includes one 17L balang with your choice of one flavor.',
    price: 98.00,
    setupFee: 0,
    isAllInclusive: false,
    includedItems: ['1 x 17L Balang (Choice of 1 Flavor)'],
    imageUrl: 'https://placehold.co/400x250.png',
    pax: '15-25',
    dataAiHint: 'small party drinks'
  }
];

export const mockCorporateAddons: Addon[] = [
  { id: 'addon_balang_23l', name: 'Additional 1 x 23L Balang', description: 'One extra 23L balang of your chosen flavor.', price: 95.00, category: 'Drinks' },
  { id: 'addon_balang_40l', name: 'Additional 1 x 40L Balang', description: 'One extra 40L balang of your chosen flavor.', price: 165.00, category: 'Drinks' },
  { id: 'addon_bartender_1hr', name: 'Additional Bal-Tender (1 Hour)', description: 'Additional hour of bal-tender service.', price: 15.00, category: 'Services' },
  { id: 'addon_bartender_4hr', name: 'Bal-Tender (4 Hours)', description: '4 hours of dedicated bal-tender service (if not included in package).', price: 60.00, category: 'Services' },
  { id: 'addon_table_rental', name: 'Table Rental', description: 'Rental of one table for your setup.', price: 20.00, category: 'Equipment' },
  { id: 'addon_infused_water_23l', name: '23L Infused Water', description: 'Refreshing 23L infused water (e.g., lemon & mint).', price: 25.00, category: 'Drinks' },
  { id: 'addon_cups_upgrade', name: 'Cups Upgrade (per 100)', description: 'Upgrade to premium cups, priced per 100 units.', price: 30.00, category: 'Services' },
];
