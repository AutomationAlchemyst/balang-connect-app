import { Waves, Star, Coffee, Droplets, Flower2, LucideIcon } from 'lucide-react';

export interface FlavorCategory {
    id: string;
    label: string;
    icon: LucideIcon;
}

export const FLAVOR_CATEGORIES: FlavorCategory[] = [
    { id: 'all', label: 'All Sips', icon: Waves },
    { id: 'featured', label: 'Voted Best', icon: Star },
    { id: 'creamy', label: 'Creamy Base', icon: Coffee },
    { id: 'cordial', label: 'Crystal Clear', icon: Droplets },
    { id: 'tea', label: 'Botanticals', icon: Flower2 },
    { id: 'coffee', label: 'Coffee', icon: Coffee },
];

export const mockFlavors = [
    // --- ORIGINAL 25 FLAVORS ---

    // f1 - Cordial
    {
        id: 'f1',
        name: 'Lemon Mint Asamboi',
        category: 'cordial',
        tags: ['Best Seller', 'Non Milk Base'],
        description: 'Lemon juice with cuts of lemons, mint leaves and asamboi.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: true
    },
    // f2 - Cordial
    {
        id: 'f2',
        name: 'Ribena Lychee',
        category: 'cordial',
        tags: ['Recommended', 'Non Milk Base'],
        description: 'Ribena with soda filled with bits of lychee pieces and jelly.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: true
    },
    // f3 - Tea
    {
        id: 'f3',
        name: 'Sparkling Longan Lemon Tea',
        category: 'tea',
        tags: ['Non Milk Base'],
        description: 'Lemon Tea, soda with bits of longan.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f4 - Cordial
    {
        id: 'f4',
        name: 'Vimto Mojito',
        category: 'cordial',
        tags: ['Must Try', 'Non Milk Base'],
        description: 'Vimto paired with zesty lemon and lime. Sweet, tangy, and bold.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: true
    },
    // f5 - Tea
    {
        id: 'f5',
        name: 'Chrysanthemum Blue Pea Tea',
        category: 'tea',
        tags: ['New', 'Sugar-Free', 'Flower Series'],
        description: 'Calming, color-changing floral tea freshly brewed from chrysanthemum and blue pea blossoms.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.50,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f6 - Tea
    {
        id: 'f6',
        name: 'Roselle Rizz',
        category: 'tea',
        tags: ['New', 'Sugar-Free', 'Flower Series'],
        description: 'Zesty blend of roselle, chrysanthemum, oranges and hawthorn.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.50,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f7 - Creamy
    {
        id: 'f7',
        name: 'Rich Chocolate',
        category: 'creamy',
        tags: ['Milk Base'],
        description: 'Rich and milky Belgian chocolate drink.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f8 - Creamy
    {
        id: 'f8',
        name: 'Vanilla Blue',
        category: 'creamy',
        tags: ['Most Popular', 'Milk Base'],
        description: 'Rich and milky vanilla flavoured drink in sky blue colour with crushed Oreo.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: true
    },
    // f9 - Creamy
    {
        id: 'f9',
        name: 'Yummy Taro',
        category: 'creamy',
        tags: ['Milk Base'],
        description: 'Sweet bubblegum-like Taro flavor.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f10 - Creamy
    {
        id: 'f10',
        name: 'Milky Corn',
        category: 'creamy',
        tags: ['Recommended', 'Milk Base'],
        description: 'Classic favourite thick, milky and smooth corn drink.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f11 - Creamy
    {
        id: 'f11',
        name: 'Solero Lime',
        category: 'creamy',
        tags: ['Recommended', 'Milk Base'],
        description: 'Lime juice infused with milk, vanilla, lime slices & mint. Tastes like Solero ice-cream.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.50,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f12 - Creamy
    {
        id: 'f12',
        name: 'Extra Joss Mango',
        category: 'creamy',
        tags: ['Recommended', 'Milk Base'],
        description: 'A creamy, sweet kick of bold mango and energy with milk.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.50,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f13 - Creamy
    {
        id: 'f13',
        name: 'Extra Joss Grape',
        category: 'creamy',
        tags: ['Milk Base'],
        description: 'A creamy, energizing blend of sweet grape and yoghurt-like flavour.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.50,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f14 - Tea
    {
        id: 'f14',
        name: 'Iced Milk Tea',
        category: 'tea',
        tags: ['Milk Base'],
        description: 'Classic iced milk tea, chilled and creamy.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f15 - Creamy
    {
        id: 'f15',
        name: 'Avocado Gula Melaka',
        category: 'creamy',
        tags: ['Must Try', 'Milk Base'],
        description: 'Creamy avocado and rich gula melaka.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 4.00,
        pricePerLiter: 5.00,
        isFeatured: true
    },
    // f16 - Creamy
    {
        id: 'f16',
        name: 'Pistachio Kunafa',
        category: 'creamy',
        tags: ['Milk Base'],
        description: 'Creamy, nutty pistachio flavour with kunafa-inspired sweetness.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 4.50,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f17 - Coffee
    {
        id: 'f17',
        name: 'Tiramisu',
        category: 'coffee',
        tags: ['Milk Base'],
        description: 'Creamy, coffee-flavored treat with a hint of sweetness.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 4.00,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f18 - Tea
    {
        id: 'f18',
        name: 'Osmanthus Mango Tea',
        category: 'tea',
        tags: ['New', 'Non Milk Base'],
        description: 'Refreshing blend of osmanthus and sweet mango.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.50,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f19 - Cordial
    {
        id: 'f19',
        name: 'Cucumber Lemonade',
        category: 'cordial',
        tags: ['New', 'Non Milk Base'],
        description: 'Crisp cucumber paired with tangy lemonade.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f20 - Cordial
    {
        id: 'f20',
        name: 'Guava Chilli',
        category: 'cordial',
        tags: ['New', 'Non Milk Base'],
        description: 'Sweet guava with a surprising kick of chilli.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.50,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f21 - Tea
    {
        id: 'f21',
        name: 'Air Mata Kucing',
        category: 'tea',
        tags: ['New', 'Non Milk Base'],
        description: 'Traditional herbal drink made with longan, monk fruit, and winter melon.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.00,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f22 - Tea
    {
        id: 'f22',
        name: 'Da Hong Pao Milk Tea',
        category: 'tea',
        tags: ['New', 'Milk Base'],
        description: 'Premium roasted oolong tea with a rich and creamy milk base.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 4.00,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f23 - Tea
    {
        id: 'f23',
        name: 'Jasmine Green Milk Tea',
        category: 'tea',
        tags: ['New', 'Milk Base'],
        description: 'Light and fragrant jasmine green tea with a creamy milk base.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.50,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f24 - Cordial
    {
        id: 'f24',
        name: 'Strawberry Mojito',
        category: 'cordial',
        tags: ['New', 'Non Milk Base'],
        description: 'Refreshing mix of strawberries, mint, and lime.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.50,
        pricePerLiter: 5.00,
        isFeatured: false
    },
    // f25 - Cordial
    {
        id: 'f25',
        name: 'Blueberry Longan',
        category: 'cordial',
        tags: ['New', 'Non Milk Base'],
        description: 'Sweet and fruity blend of blueberries and longan.',
        imageUrl: 'https://placehold.co/300x200.png',
        price: 3.50,
        pricePerLiter: 5.00,
        isFeatured: false
    }
];
