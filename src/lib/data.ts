
import type { Flavor, EventPackage, Addon, Promotion, CommunityStory, InfaqNoticeBoardSlot, LeaderboardUser } from './types';
import { format } from 'date-fns';

// Define MosqueData interface here
interface MosqueData {
  name: string;
  address: string;
}

// Define mosqueDataList here
export const mosqueDataList: MosqueData[] = [
  { name: "Abdul Aleem Siddique", address: "90 Lorong K Telok Kurau, Singapore 425723" },
  { name: "Abdul Gafoor", address: "41 Dunlop Street, Singapore 209369" },
  { name: "Abdul Hamid Kampung Pasiran", address: "10 Gentle Road, Singapore 309194" },
  { name: "Ahmad", address: "2 Lorong Sarhad, Singapore 119173" },
  { name: "Ahmad Ibrahim", address: "15 Jalan Ulu Seletar, Singapore 769227" },
  { name: "Al-Abdul Razak", address: "30 Jalan Ismail, Singapore 419285" },
  { name: "Al-Abrar", address: "192 Telok Ayer Street, Singapore 068635" },
  { name: "Al-Amin", address: "50 Telok Blangah Way, Singapore 098801" },
  { name: "Al-Ansar", address: "155 Bedok North Avenue 1, Singapore 469751" },
  { name: "Al-Falah", address: "22 Bideford Road #01-01, Singapore 229923" },
  { name: "Al-Firdaus", address: "11 Jalan Ibadat, Singapore 698955" },
  { name: "Al-Huda", address: "34 Jalan Haji Alias, Singapore 268534" },
  { name: "Al-Iman", address: "10 Bukit Panjang Ring Road, Singapore 679943" },
  { name: "Al-Islah", address: "30, Punggol Field, Singapore 828812" },
  { name: "Al-Istighfar", address: "2 Pasir Ris Walk, Singapore 518239" },
  { name: "Al-Istiqamah", address: "2 Serangoon North Avenue 2, Singapore 555876" },
  { name: "Al-Khair", address: "1 Teck Whye Crescent, Singapore 688847" },
  { name: "Al-Mawaddah", address: "151 Compassvale Bow, Singapore 544997" },
  { name: "Al-Mukminin", address: "271 Jurong East Street 21, Singapore 609603" },
  { name: "Al-Muttaqin", address: "5140 Ang Mo Kio Avenue 6, Singapore 569844" },
  { name: "Al-Taqua", address: "11A Jalan Bilal, Singapore 468862" },
  { name: "Alkaff Kampung Melayu", address: "200 Bedok Reservoir Road, Singapore 479221" },
  { name: "Alkaff Upper Serangoon", address: "66 Pheng Geck Avenue, Singapore 348261" },
  { name: "Angullia", address: "265 Serangoon Road, Singapore 218099" },
  { name: "An-Nahdhah", address: "9A Bishan Street 14, Singapore 579786" },
  { name: "An-Nur", address: "6 Admiralty Road, Singapore 739983" },
  { name: "Ar-Raudhah", address: "30 Bukit Batok East Avenue 2, Singapore 659919" },
  { name: "Assyafaah", address: "1 Admiralty Lane, Singapore 757620" },
  { name: "Assyakirin", address: "550 Yung An Road, Singapore 618617" },
  { name: "Ba'alwie", address: "2 Lewis Road, Singapore 258590" },
  { name: "Bencoolen", address: "59 Bencoolen Street, #01-01, Singapore 189630" },
  { name: "Burhani", address: "39 Hill Street, Singapore 179364" },
  { name: "Darul Aman", address: "1 Jalan Eunos, Singapore 419493" },
  { name: "Darul Ghufran", address: "503 Tampines Avenue 5, Singapore 529651" },
  { name: "Darul Makmur", address: "950 Yishun Avenue 2, Singapore 769099" },
  { name: "Darussalam", address: "3002 Commonwealth Avenue West, Singapore 129579" },
  { name: "En-Naeem", address: "120 Tampines Road, Singapore 535136" },
  { name: "Haji Mohd Salleh (G)", address: "245 Geylang Road, Singapore 389304" },
  { name: "Haji Muhammad Salleh (P)", address: "37 Palmer Road, Singapore 079424" },
  { name: "Haji Yusoff", address: "2 Hillside Drive, Singapore 548920" },
  { name: "Hajjah Fatimah", address: "4001 Beach Road, Singapore 199584" },
  { name: "Hajjah Rahimabi", address: "76 Kim Keat Road, Singapore 328835" },
  { name: "Hang Jebat", address: "100 Jalan Hang Jebat, Singapore 139533" },
  { name: "Hasanah", address: "492 Teban Gardens, Singapore 608878" },
  { name: "Hussein Sulaiman", address: "394 Pasir Panjang Road, Singapore 118730" },
  { name: "Jamae Chulia", address: "218 South Bridge Road, S'pore 058767" },
  { name: "Jamek Queenstown", address: "946 Margaret Drive, Singapore 149309" },
  { name: "Jamiyah Ar-Rabitah", address: "601 Tiong Bahru Road, Singapore 158787" },
  { name: "Kampong Delta", address: "10 Delta Avenue, Singapore 169831" },
  { name: "Kampung Siglap", address: "451 Marine Parade Road, Singapore 449283" },
  { name: "Kassim", address: "450 Changi Road, Singapore 419877" },
  { name: "Khadijah", address: "583 Geylang Road, Singapore 389522" },
  { name: "Khalid", address: "130 Joo Chiat Road, Singapore 427727" },
  { name: "Maarof", address: "20 Jurong West Street 26, Singapore 648125" },
  { name: "Malabar", address: "471 Victoria Street, Singapore 198370" },
  { name: "Moulana Mohd Ali", address: "80 Raffles Place #B1-01, UOB Plaza, Singapore 048624" },
  { name: "Muhajirin", address: "275 Braddell Road, Singapore 579704" },
  { name: "Mujahidin", address: "590 Stirling Road, Singapore 148952" },
  { name: "Mydin", address: "67 Jalan Lapang, Singapore 419007" },
  { name: "Omar Kg Melaka", address: "10 Keng Cheow Street, Singapore 059607" },
  { name: "Omar Salmah", address: "441-B Jalan Mashor, Singapore 299173" },
  { name: "Petempatan Melayu Sembawang", address: "27-B Jalan Mempurong, Singapore 759055" },
  { name: "Pulau Bukom", address: "Pulau Bukom PO Box 1908, Singapore 903808" },
  { name: "Pusara Aman", address: "11 Lim Chu Kang Road, Singapore 719452" },
  { name: "Sallim Mattar", address: "1 Mattar Road, Singapore 387725" },
  { name: "Sultan", address: "3 Muscat Street, Singapore 198833" },
  { name: "Tasek Utara", address: "46 Bristol Road, Singapore 219852" },
  { name: "Tentera Di Raja", address: "81 Clementi Road, Singapore 129797" },
  { name: "Wak Tanjong", address: "25 Paya Lebar Road, Singapore 409004" },
  { name: "Yusof Ishak", address: "10 Woodlands Drive 17, Singapore 737740" }
].sort((a, b) => a.name.localeCompare(b.name));


export const mockFlavors: Flavor[] = [
  {
    id: 'f1',
    name: 'Lemon Mint Asamboi',
    description: 'Lemon juice with cuts of lemons, mint leaves and asamboi.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Best Seller', 'Non Milk Base'],
    color: 'bg-yellow-400',
    dataAiHint: 'lemonade mint'
  },
  {
    id: 'f2',
    name: 'Ribena Lychee',
    description: 'Ribena with soda filled with bits of lychee pieces and jelly.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Recommended', 'Non Milk Base'],
    color: 'bg-pink-500',
    dataAiHint: 'berry drink'
  },
  {
    id: 'f3',
    name: 'Sparkling Longan Lemon Tea',
    description: 'Lemon Tea, soda with bits of longan.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Non Milk Base'],
    color: 'bg-yellow-300',
    dataAiHint: 'iced tea'
  },
  {
    id: 'f4',
    name: 'Vimto Mojito',
    description: 'Vimto - often dubbed the Ribena of the Middle East - has a deeper, slightly bitter profile. Paired with zesty lemon and lime in our special blend, this drink strikes the perfect balance of sweet, tangy, and bold.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Must Try', 'Non Milk Base'],
    color: 'bg-purple-600',
    dataAiHint: 'grape soda'
  },
  {
    id: 'f5',
    name: 'Chrysanthemum Blue Pea Tea',
    description: 'Calming, color-changing floral tea freshly brewed from chrysanthemum and blue pea blossoms. Beautiful, refreshing, and sugar free too!',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['New', 'Sugar-Free', 'Flower Series'],
    color: 'bg-blue-400',
    dataAiHint: 'herbal tea'
  },
  {
    id: 'f6',
    name: 'Roselle Rizz',
    description: 'A zesty, heart-loving blend of roselle, chrysanthemum, oranges and hawthorn - great for digestion, immunity, and a natural refresh.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['New', 'Sugar-Free', 'Flower Series'],
    color: 'bg-red-500',
    dataAiHint: 'hibiscus tea'
  },
  {
    id: 'f7',
    name: 'Rich Chocolate',
    description: 'Rich and milky Belgian chocolate drink.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Milk Base'],
    color: 'bg-yellow-700',
    dataAiHint: 'chocolate milk'
  },
  {
    id: 'f8',
    name: 'Vanilla Blue',
    description: 'Rich and milky vanilla flavoured drink in sky blue colour with crushed Oreo.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Most Popular', 'Milk Base'],
    color: 'bg-sky-400',
    dataAiHint: 'blue drink'
  },
  {
    id: 'f9',
    name: 'Yummy Taro',
    description: 'A sweet somewhat bubblegum flavoured yam or better known as Taro these days.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Milk Base'],
    color: 'bg-purple-400',
    dataAiHint: 'taro smoothie'
  },
  {
    id: 'f10',
    name: 'Milky Corn',
    description: 'Classic favourite thick, milky and smooth corn drink.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Recommended', 'Milk Base'],
    color: 'bg-yellow-400',
    dataAiHint: 'corn drink'
  },
  {
    id: 'f11',
    name: 'Solero Lime',
    description: 'Lime juice infused with milk, vanilla flavour, slices of lime & mint leaves to achieve a very similar taste to the Solero ice-cream.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Recommended', 'Milk Base'],
    color: 'bg-lime-400',
    dataAiHint: 'lime smoothie'
  },
  {
    id: 'f12',
    name: 'Extra Joss Mango',
    description: 'A creamy, sweet kick of bold mango and energy. Extra Joss Mango mixed with milk for a smooth, satisfying treat.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Recommended', 'Milk Base'],
    color: 'bg-orange-500',
    dataAiHint: 'mango lassi'
  },
  {
    id: 'f13',
    name: 'Extra Joss Grape',
    description: 'A creamy, energizing blend of sweet grape and yoghurt-like flavour - Extra Joss Grape with milk for a smooth, fruity boost.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Milk Base'],
    color: 'bg-purple-500',
    dataAiHint: 'grape smoothie'
  },
  {
    id: 'f14',
    name: 'Iced Milk Tea',
    description: 'Your classic iced milk tea, done right - chilled, and creamy.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Milk Base'],
    color: 'bg-amber-600',
    dataAiHint: 'milk tea'
  },
  {
    id: 'f15',
    name: 'Avocado Gula Melaka',
    description: 'Creamy avocado and rich gula melaka: a perfectly smooth, subtly sweet indulgence.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Must Try', 'Milk Base'],
    color: 'bg-green-600',
    dataAiHint: 'avocado smoothie'
  },
  {
    id: 'f16',
    name: 'Pistachio Kunafa',
    description: 'A creamy, nutty dream - the rich pistachio flavour with a light, kunafa-inspired sweetness without the overload.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Milk Base'],
    color: 'bg-green-400',
    dataAiHint: 'pistachio drink'
  },
  {
    id: 'f17',
    name: 'Tiramisu',
    description: 'A creamy, coffee-flavored treat with a hint of sweetness.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['Milk Base'],
    color: 'bg-yellow-700',
    dataAiHint: 'coffee frappe'
  },
  {
    id: 'f18',
    name: 'Osmanthus Mango Tea',
    description: 'A refreshing blend of osmanthus and sweet mango.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['New', 'Non Milk Base'],
    color: 'bg-orange-400',
    dataAiHint: 'mango tea'
  },
  {
    id: 'f19',
    name: 'Cucumber Lemonade',
    description: 'Crisp cucumber paired with tangy lemonade.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['New', 'Non Milk Base'],
    color: 'bg-green-300',
    dataAiHint: 'cucumber lemonade'
  },
  {
    id: 'f20',
    name: 'Guava Chilli',
    description: 'Sweet guava with a surprising kick of chilli.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['New', 'Non Milk Base'],
    color: 'bg-pink-400',
    dataAiHint: 'guava drink'
  },
  {
    id: 'f21',
    name: 'Air Mata Kucing',
    description: 'A traditional herbal drink made with longan, monk fruit, and winter melon.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['New', 'Non Milk Base'],
    color: 'bg-amber-800',
    dataAiHint: 'herbal drink'
  },
  {
    id: 'f22',
    name: 'Da Hong Pao Milk Tea',
    description: 'A premium roasted oolong tea with a rich and creamy milk base.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['New', 'Milk Base'],
    color: 'bg-red-900',
    dataAiHint: 'oolong milk tea'
  },
  {
    id: 'f23',
    name: 'Jasmine Green Milk Tea',
    description: 'A light and fragrant jasmine green tea with a creamy milk base.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['New', 'Milk Base'],
    color: 'bg-green-200',
    dataAiHint: 'jasmine milk tea'
  },
  {
    id: 'f24',
    name: 'Strawberry Mojito',
    description: 'A refreshing mix of strawberries, mint, and lime.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['New', 'Non Milk Base'],
    color: 'bg-red-400',
    dataAiHint: 'strawberry mojito'
  },
  {
    id: 'f25',
    name: 'Blueberry Longan',
    description: 'A sweet and fruity blend of blueberries and longan.',
    imageUrl: 'https://placehold.co/300x200.png',
    pricePerLiter: 5.00,
    tags: ['New', 'Non Milk Base'],
    color: 'bg-purple-400',
    dataAiHint: 'blueberry longan'
  }
];

export const mockPackages: EventPackage[] = [
  {
    id: 'pkg_17l_self_pickup',
    name: '17L Balang (Self-Pickup / Delivery)',
    description: "Suitable for 15-25 pax. Price is for self-pickup. Delivery is available for an additional $20.00. This 17L balang is for you to keep. We don't collect the balang back.",
    price: 98.00,
    setupFee: 0,
    isAllInclusive: false,
    includedItems: ['1 x 17L Balang (Choice of 1 Flavor)'],
    imageUrl: 'https://placehold.co/400x250.png',
    pax: '15-25',
    dataAiHint: 'small party drinks'
  },
  {
    id: 'pkg_opt1',
    name: 'Couple of the Year 2024 (COTY24)',
    description: 'Suitable for 30-80 pax, 2 x 23L balangs. Price INCLUDES setup, teardown, delivery & pickup.',
    price: 235.00,
    setupFee: 190.00, // Informational: value of setup/service component included within the price
    isAllInclusive: true,
    includedItems: ['2 x 23L Balangs (Choice of 2 Flavors)', 'Setup & Teardown Service', 'Delivery & Pickup Fee', 'Cups provided'],
    imageUrl: 'https://placehold.co/400x250.png',
    pax: '30-80',
    dataAiHint: 'party drinks'
  },
  {
    id: 'pkg_opt2',
    name: 'Charlie’s Angels',
    description: 'Suitable for 60-120 pax, 3 x 23L balangs. Price INCLUDES setup, teardown, delivery & pickup.',
    price: 330.00, // All-inclusive price (285 setup + 45 delivery are components of this)
    setupFee: 285.00, // Informational: value of setup/service component included within the price
    isAllInclusive: true,
    includedItems: ['3 x 23L Balangs (Choice of 3 Flavors)', 'Setup & Teardown Service', 'Delivery & Pickup Fee', 'Cups provided'],
    imageUrl: 'https://placehold.co/400x250.png',
    pax: '60-120',
    dataAiHint: 'event catering'
  },
  {
    id: 'pkg_opt3',
    name: 'Bongo Player',
    description: 'Suitable for 100-150 pax, 2 x 40L balangs. Price INCLUDES bal-tender (4hrs), setup, teardown, delivery & pickup.',
    price: 435.00, // All-inclusive price (390 setup + 45 delivery are components of this)
    setupFee: 390.00, // Informational: value of setup/service component included within the price
    isAllInclusive: true,
    includedItems: ['2 x 40L Balangs (Choice of 2 Flavors)', 'Bal-tender service (4 hours)', 'Setup & Teardown Service', 'Delivery & Pickup Fee', 'Cups provided'],
    imageUrl: 'https://placehold.co/400x250.png',
    pax: '100-150',
    dataAiHint: 'large event'
  },
];

export const mockAddons: Addon[] = [
  { id: 'addon_balang_23l', name: 'Additional 1 x 23L Balang', description: 'One extra 23L balang of your chosen flavor.', price: 95.00, category: 'Drinks' },
  { id: 'addon_balang_40l', name: 'Additional 1 x 40L Balang', description: 'One extra 40L balang of your chosen flavor.', price: 165.00, category: 'Drinks' },
  { id: 'addon_bartender_1hr', name: 'Additional Bal-Tender (1 Hour)', description: 'Additional hour of bal-tender service.', price: 15.00, category: 'Services' },
  { id: 'addon_bartender_4hr', name: 'Bal-Tender (4 Hours)', description: '4 hours of dedicated bal-tender service (if not included in package).', price: 60.00, category: 'Services' },
  { id: 'addon_table_rental', name: 'Table Rental', description: 'Rental of one table for your setup.', price: 20.00, category: 'Equipment' },
  { id: 'addon_bobba', name: '3 types of Bobba', description: '3 types of Bobba.', price: 20.00, category: 'Drinks' },
  { id: 'addon_metal_racks', name: 'Metal Racks', description: 'Metal Racks.', price: 80.00, category: 'Equipment' },
  { id: 'addon_infused_water_23l', name: '23L Infused Water (Lemon & Mint leaves)', description: 'Refreshing 23L infused water with lemon & mint leaves.', price: 25.00, category: 'Drinks' },
  { id: 'addon_cups_upgrade_500', name: '500ml Cup Upgrade (with branding)', description: 'Upgrade to 500ml premium cups with branding.', price: 30.00, category: 'Services' },
  { id: 'addon_cups_upgrade_1000', name: '1000ml Cup Upgrade (with branding)', description: 'Upgrade to 1000ml premium cups with branding.', price: 35.00, category: 'Services' },
  { id: 'addon_cup_corn', name: 'Cup Corn Live Station', description: 'Includes server (2hrs). Suitable for 100-120 pax. Note: We require a power point for this station.', price: 250.00, category: 'Live Stations' },
];

export const mockPromotions: Promotion[] = [
  {
    id: 'promo-draw-1',
    title: 'Ramadan Special Lucky Draw',
    description: 'Win a premium Balang catering package for your next private sunset gathering!',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCamc7xsuTEQ2w3z5jSWxH5a3azKD43oG4ERqGdawckYmOMYa0VviV8N_fLXODXhl1W-DNpbGcxsUk4sm0c742NSMcB7Z58zdyyHNCcPJF33ZJeggIucqHzpmC10KzoNXatJcjNF25W7WsiPsHCAegwtvqsB-S0CPVoUjmSKF8hxKi8CK96tVvwhdMzsWihsWGpd781n7Qy7vPQQs_58XRbyRThrJMaKapbDEo5N3FbccvmwoRQAWOk-vYf7ECRacdVk_pMG03xZvY',
    endDate: '2025-04-28T18:00:00.000Z',
    terms: 'Min. order of 1 package. Draw will be held after Ramadan.',
    dataAiHint: 'ramadan celebration'
  },
  {
    id: 'promo-exclusive-1',
    title: 'Early Bird Wedding Discount',
    description: 'Get 20% off for beach-side weddings booked 6 months in advance.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRJaSPBMUL_Lg9SoEzSePvAhKcFcJsFLRRarBnSRcA38vnDmG0sFzrWMmDpy_DD9a9RsVbk2EY-SDhnm65Ry0m1w5Ea97HkYHOFLKiQvzxI-oOBw77fpYfBGvs-W_Vs9ySNIfNAWg-3-p-lr_tIUQyzVwYOJAc1PYO1SuoPxE4iVyiSVvWNOAy001vPKr7byYrH3Tbc2eJvvW-poBJLlwCNR00CfHVJvh_4prme5g0Xz2x3s6cj_sVPBQ93T_hL-TzEDbTU_9kIaE',
    endDate: '2025-12-31T23:59:59.000Z',
    terms: 'Valid for Kenduri Kahwin packages only.',
    dataAiHint: 'wedding offer'
  },
  {
    id: 'promo-flash-1',
    title: 'Free Delivery Weekend',
    description: 'On all beach party orders this weekend only!',
    imageUrl: 'https://placehold.co/400x200.png',
    endDate: '2025-07-06T20:00:00.000Z',
    terms: 'Valid for island-wide delivery excluding Jurong Island.',
    dataAiHint: 'delivery promo'
  },
  {
    id: 'promo-flash-2',
    title: 'BOGO Juice Mix',
    description: 'Buy 1 Get 1 on Summer Mixes for orders over $100.',
    imageUrl: 'https://placehold.co/400x200.png',
    endDate: '2025-07-05T15:00:00.000Z',
    terms: 'Valid for Asam Boi and Lime flavors.',
    dataAiHint: 'bogo offer'
  },
];

export const mockCommunityStories: CommunityStory[] = [
  { id: 'story1', userName: 'Siti & Ahmad', story: 'Balang Kepalang made our wedding day so special! The Katira was a hit with all our guests. Thank you for the amazing service!', imageUrl: 'https://placehold.co/350x250.png', date: '2024-07-15T12:00:00.000Z', eventName: 'Our Wedding Day', avatarUrl: 'https://placehold.co/50x50.png', dataAiHintStory: 'wedding party', dataAiHintAvatar: 'couple avatar' },
  { id: 'story2', userName: 'Mr. Tan', story: "We hired Balang Kepalang for our company's Family Day. The kids loved the Milo Dinosaur and the adults enjoyed the Asam Boi. Professional and friendly team!", imageUrl: 'https://placehold.co/350x250.png', date: '2024-07-01T12:00:00.000Z', eventName: 'Company Family Day', avatarUrl: 'https://placehold.co/50x50.png', dataAiHintStory: 'corporate event', dataAiHintAvatar: 'man avatar' },
  { id: 'story3', userName: "Aisyah's Birthday", story: "The Blue Lagoon soda was perfect for my daughter Aisyah's 10th birthday party. The setup was beautiful and hassle-free. Highly recommend!", date: '2024-06-15T12:00:00.000Z', eventName: "Aisyah's 10th Birthday", avatarUrl: 'https://placehold.co/50x50.png', dataAiHintStory: 'birthday party', dataAiHintAvatar: 'girl avatar' },
];

export const mockLeaderboardUsers: LeaderboardUser[] = [
  { id: 'user1', rank: 1, name: 'Haji Sulaiman', points: 12500, avatarUrl: 'https://placehold.co/50x50.png', badge: 'Community Champion', dataAiHintAvatar: 'senior man' },
  { id: 'user2', rank: 2, name: 'Fatimah Binte Razak', points: 11200, avatarUrl: 'https://placehold.co/50x50.png', badge: 'Masjid Benefactor', dataAiHintAvatar: 'woman hijab' },
  { id: 'user3', rank: 3, name: 'The Tan Family', points: 9800, avatarUrl: 'https://placehold.co/50x50.png', dataAiHintAvatar: 'family portrait' },
  { id: 'user4', rank: 4, name: 'Anonymous Donor', points: 8500 },
  { id: 'user5', rank: 5, name: 'Syed Al-Attas', points: 7650, avatarUrl: 'https://placehold.co/50x50.png', dataAiHintAvatar: 'young man' },
];

// Replaced dynamic date generation with static dates to prevent hydration errors.
const staticUpcomingFriday1 = '2025-07-04T00:00:00.000Z';
const staticUpcomingFriday2 = '2025-07-11T00:00:00.000Z';
const staticUpcomingFriday3 = '2025-07-18T00:00:00.000Z';
const staticPastFriday = '2025-06-27T00:00:00.000Z';

export const mockInfaqNoticeBoardSlots: InfaqNoticeBoardSlot[] = [
  {
    id: 'notice1',
    mosqueName: mosqueDataList[0]?.name || 'Al-Ansar Mosque',
    mosqueAddress: mosqueDataList[0]?.address || '155 Bedok North Avenue 1, Singapore 469751',
    date: staticUpcomingFriday1,
    displayDate: format(new Date(staticUpcomingFriday1), 'PPP'),
    status: 'Slot Open - Be the First!',
    description: "Be the first to contribute for this Friday's Infaq at Al-Ansar. Your contribution helps cover the delivery.",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'mosque exterior'
  },
  {
    id: 'notice2',
    mosqueName: mosqueDataList[1]?.name || 'Sultan Mosque',
    mosqueAddress: mosqueDataList[1]?.address || '3 Muscat Street, Singapore 198833',
    date: staticUpcomingFriday2,
    displayDate: format(new Date(staticUpcomingFriday2), 'PPP'),
    status: 'Delivery Fee Sponsored!',
    description: "A kind soul has sponsored the delivery for Sultan Mosque this Friday. Join in by Infaq-ing a balang!",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'community help'
  },
  {
    id: 'notice3',
    mosqueName: mosqueDataList[2]?.name || 'Darul Ghufran Mosque',
    mosqueAddress: mosqueDataList[2]?.address || '503 Tampines Avenue 5, Singapore 529651',
    date: staticUpcomingFriday3,
    displayDate: format(new Date(staticUpcomingFriday3), 'PPP'),
    status: 'Delivery Secured - Join In!',
    description: "Multiple balangs already Infaq-ed for Darul Ghufran. Delivery is secured. Add your contribution!",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'food donation'
  },
  {
    id: 'notice4',
    mosqueName: mosqueDataList[3]?.name || 'Al-Istiqamah Mosque',
    mosqueAddress: mosqueDataList[3]?.address || '2 Serangoon North Avenue 2, Singapore 555876',
    date: staticPastFriday,
    displayDate: format(new Date(staticPastFriday), 'PPP'),
    status: 'Recently Fulfilled!',
    description: "Thank you to all contributors for last Friday's Infaq at Al-Istiqamah Mosque!",
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'happy people'
  },
];


// Add dataAiHint to Flavor images
mockFlavors.forEach(flavor => {
  if (!flavor.dataAiHint) { // Basic fallback if specific not set above
    flavor.dataAiHint = flavor.name.toLowerCase().split(' ').slice(0, 2).join(' ');
  }
});

// Add dataAiHint to Package images
mockPackages.forEach(pkg => {
  if (!pkg.dataAiHint) {
    pkg.dataAiHint = pkg.name.toLowerCase().includes('wedding') ? 'wedding drinks' : 'event drinks';
  }
});

// Add dataAiHint to Promotion images
mockPromotions.forEach(promo => {
  if (!promo.dataAiHint) {
    promo.dataAiHint = 'special offer';
  }
});

// Ensure community stories have hints
mockCommunityStories.forEach(story => {
  if (story.imageUrl && !story.dataAiHintStory) {
    story.dataAiHintStory = story.eventName ? story.eventName.toLowerCase().split(' ').slice(0, 2).join(' ') : 'community event';
  }
  if (story.avatarUrl && !story.dataAiHintAvatar) {
    story.dataAiHintAvatar = 'person avatar';
  }
});
