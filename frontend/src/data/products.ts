import { Product, Deal, Category } from '@/types/pos';

// Import images
import burgerImg from '@/assets/burger.jpg';
import wrapImg from '@/assets/wrap.jpg';
import chickenImg from '@/assets/chicken.jpg';
import friesImg from '@/assets/fries.jpg';
import drinkImg from '@/assets/drink.jpg';
import comboImg from '@/assets/combo.jpg';

// Mock Products Data
export const products: Product[] = [
  // Burgers
  {
    id: 'burger-001',
    name: 'Classic Cheeseburger',
    code: 'BRG-001',
    price: 207.99,
    category: 'burgers',
    image: burgerImg,
    description: 'Juicy beef patty with melted cheese, lettuce, and tomato',
  },
  {
    id: 'burger-002',
    name: 'Double Stack',
    code: 'BRG-002',
    price: 210.99,
    category: 'burgers',
    image: burgerImg,
    description: 'Two beef patties, double cheese, special sauce',
  },
  {
    id: 'burger-003',
    name: 'Bacon Deluxe',
    code: 'BRG-003',
    price: 209.49,
    category: 'burgers',
    image: burgerImg,
    description: 'Crispy bacon, cheddar, caramelized onions',
  },
  {
    id: 'burger-004',
    name: 'Veggie Burger',
    code: 'BRG-004',
    price: 208.49,
    category: 'burgers',
    image: burgerImg,
    description: 'Plant-based patty with fresh vegetables',
  },
  
  // Wraps
  {
    id: 'wrap-001',
    name: 'Chicken Caesar Wrap',
    code: 'WRP-001',
    price: 208.49,
    category: 'wraps',
    image: wrapImg,
    description: 'Grilled chicken, romaine, parmesan, caesar dressing',
  },
  {
    id: 'wrap-002',
    name: 'Spicy Buffalo Wrap',
    code: 'WRP-002',
    price: 208.99,
    category: 'wraps',
    image: wrapImg,
    description: 'Crispy chicken, buffalo sauce, ranch, celery',
  },
  {
    id: 'wrap-003',
    name: 'BBQ Ranch Wrap',
    code: 'WRP-003',
    price: 208.49,
    category: 'wraps',
    image: wrapImg,
    description: 'Grilled chicken, BBQ sauce, bacon, ranch',
  },
  
  // Fried Chicken
  {
    id: 'chicken-001',
    name: '3pc Crispy Tenders',
    code: 'CHK-001',
    price: 206.99,
    category: 'chicken',
    image: chickenImg,
    description: 'Golden crispy chicken tenders with dipping sauce',
  },
  {
    id: 'chicken-002',
    name: '5pc Crispy Tenders',
    code: 'CHK-002',
    price: 209.99,
    category: 'chicken',
    image: chickenImg,
    description: 'Five golden crispy chicken tenders',
  },
  {
    id: 'chicken-003',
    name: 'Chicken Wings (6pc)',
    code: 'CHK-003',
    price: 208.49,
    category: 'chicken',
    image: chickenImg,
    description: 'Classic or buffalo style wings',
  },
  {
    id: 'chicken-004',
    name: 'Chicken Wings (12pc)',
    code: 'CHK-004',
    price: 214.99,
    category: 'chicken',
    image: chickenImg,
    description: 'Party size wings, choice of sauce',
  },
  
  // Fries
  {
    id: 'fries-001',
    name: 'Regular Fries',
    code: 'FRS-001',
    price: 202.99,
    category: 'fries',
    image: friesImg,
    description: 'Classic golden crispy fries',
  },
  {
    id: 'fries-002',
    name: 'Large Fries',
    code: 'FRS-002',
    price: 203.99,
    category: 'fries',
    image: friesImg,
    description: 'Extra large portion of golden fries',
  },
  {
    id: 'fries-003',
    name: 'Loaded Fries',
    code: 'FRS-003',
    price: 205.99,
    category: 'fries',
    image: friesImg,
    description: 'Fries with cheese, bacon, and jalapeños',
  },
  {
    id: 'fries-004',
    name: 'Sweet Potato Fries',
    code: 'FRS-004',
    price: 204.49,
    category: 'fries',
    image: friesImg,
    description: 'Crispy sweet potato fries with aioli',
  },
  
  // Drinks
  {
    id: 'drink-001',
    name: 'Soft Drink (Reg)',
    code: 'DRK-001',
    price: 201.99,
    category: 'drinks',
    image: drinkImg,
    description: 'Choice of cola, sprite, or fanta',
  },
  {
    id: 'drink-002',
    name: 'Soft Drink (Large)',
    code: 'DRK-002',
    price: 202.49,
    category: 'drinks',
    image: drinkImg,
    description: 'Large refreshing beverage',
  },
  {
    id: 'drink-003',
    name: 'Milkshake',
    code: 'DRK-003',
    price: 204.99,
    category: 'drinks',
    image: drinkImg,
    description: 'Vanilla, chocolate, or strawberry',
  },
  {
    id: 'drink-004',
    name: 'Iced Tea',
    code: 'DRK-004',
    price: 202.29,
    category: 'drinks',
    image: drinkImg,
    description: 'Fresh brewed iced tea',
  },
  {
    id: 'drink-005',
    name: 'Lemonade',
    code: 'DRK-005',
    price: 202.49,
    category: 'drinks',
    image: drinkImg,
    description: 'Freshly squeezed lemonade',
  },
];

// Mock Deals Data
export const deals: Deal[] = [
  {
    id: 'deal-001',
    name: 'Classic Combo',
    code: 'DEAL-001',
    price: 209.99,
    originalPrice: 212.97,
    products: [
      products.find(p => p.id === 'burger-001')!,
      products.find(p => p.id === 'fries-001')!,
      products.find(p => p.id === 'drink-001')!,
    ],
    image: comboImg,
    description: 'Cheeseburger + Fries + Drink',
  },
  {
    id: 'deal-002',
    name: 'Double Trouble',
    code: 'DEAL-002',
    price: 214.99,
    originalPrice: 218.47,
    products: [
      products.find(p => p.id === 'burger-002')!,
      products.find(p => p.id === 'fries-002')!,
      products.find(p => p.id === 'drink-002')!,
    ],
    image: comboImg,
    description: 'Double Stack + Large Fries + Large Drink',
  },
  {
    id: 'deal-003',
    name: 'Chicken Feast',
    code: 'DEAL-003',
    price: 212.99,
    originalPrice: 216.47,
    products: [
      products.find(p => p.id === 'chicken-002')!,
      products.find(p => p.id === 'fries-002')!,
      products.find(p => p.id === 'drink-002')!,
    ],
    image: comboImg,
    description: '5pc Tenders + Large Fries + Large Drink',
  },
  {
    id: 'deal-004',
    name: 'Wrap & Go',
    code: 'DEAL-004',
    price: 210.99,
    originalPrice: 213.47,
    products: [
      products.find(p => p.id === 'wrap-001')!,
      products.find(p => p.id === 'fries-001')!,
      products.find(p => p.id === 'drink-001')!,
    ],
    image: comboImg,
    description: 'Caesar Wrap + Fries + Drink',
  },
  {
    id: 'deal-005',
    name: 'Family Pack',
    code: 'DEAL-005',
    price: 234.99,
    originalPrice: 245.95,
    products: [
      products.find(p => p.id === 'burger-001')!,
      products.find(p => p.id === 'burger-002')!,
      products.find(p => p.id === 'chicken-002')!,
      products.find(p => p.id === 'fries-002')!,
      products.find(p => p.id === 'fries-002')!,
      products.find(p => p.id === 'drink-002')!,
      products.find(p => p.id === 'drink-002')!,
    ],
    image: comboImg,
    description: '2 Burgers + 5pc Tenders + 2 Large Fries + 2 Large Drinks',
  },
];

// Category labels for UI
export const categoryLabels: Record<Category, string> = {
  burgers: '🍔 Burgers',
  wraps: '🌯 Wraps',
  chicken: '🍗 Chicken',
  fries: '🍟 Fries',
  drinks: '🥤 Drinks',
  deals: '🎉 Deals',
};

// Get products by category
export const getProductsByCategory = (category: Category): Product[] => {
  return products.filter(p => p.category === category);
};
