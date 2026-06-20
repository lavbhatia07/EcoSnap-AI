import { CarbonDatabaseItem } from '../types/analysis';

export const carbonDatabase: CarbonDatabaseItem[] = [
  // --- FOOD CATEGORY (13 items) ---
  {
    id: 'f1',
    name: 'Beef',
    category: 'Food',
    carbonValue: 60.0,
    alternative: 'Tofu',
    alternativeCarbonValue: 3.0,
    unit: 'per kg'
  },
  {
    id: 'f1_b',
    name: 'Burger',
    category: 'Food',
    carbonValue: 8.5,
    alternative: 'Veggie Burger',
    alternativeCarbonValue: 2.0,
    unit: 'per burger'
  },
  {
    id: 'f2',
    name: 'Pork',
    category: 'Food',
    carbonValue: 7.0,
    alternative: 'Chicken',
    alternativeCarbonValue: 4.3,
    unit: 'per kg'
  },
  {
    id: 'f3',
    name: 'Chicken',
    category: 'Food',
    carbonValue: 4.3,
    alternative: 'Lentils',
    alternativeCarbonValue: 0.9,
    unit: 'per kg'
  },
  {
    id: 'f4',
    name: 'Cheese',
    category: 'Food',
    carbonValue: 21.0,
    alternative: 'Vegan Cheese',
    alternativeCarbonValue: 2.5,
    unit: 'per kg'
  },
  {
    id: 'f5',
    name: 'Rice',
    category: 'Food',
    carbonValue: 4.0,
    alternative: 'Quinoa',
    alternativeCarbonValue: 1.2,
    unit: 'per kg'
  },
  {
    id: 'f6',
    name: 'Avocado',
    category: 'Food',
    carbonValue: 2.5,
    alternative: 'Local Apples',
    alternativeCarbonValue: 0.4,
    unit: 'per kg'
  },
  {
    id: 'f7',
    name: 'Chocolate',
    category: 'Food',
    carbonValue: 19.0,
    alternative: 'Dark Chocolate (Local/Fairtrade)',
    alternativeCarbonValue: 8.0,
    unit: 'per kg'
  },
  {
    id: 'f8',
    name: 'Eggs',
    category: 'Food',
    carbonValue: 4.8,
    alternative: 'Flaxseed meal replacement',
    alternativeCarbonValue: 0.8,
    unit: 'per kg'
  },
  {
    id: 'f9',
    name: 'Cow Milk',
    category: 'Food',
    carbonValue: 3.2,
    alternative: 'Oat Milk',
    alternativeCarbonValue: 0.9,
    unit: 'per liter'
  },
  {
    id: 'fa10',
    name: 'Oat Milk',
    category: 'Food',
    carbonValue: 0.9,
    alternative: 'Almond Milk',
    alternativeCarbonValue: 0.7, // Oat milk has lower water footprint, but let's compare
    unit: 'per liter'
  },
  {
    id: 'fa11',
    name: 'Coffee',
    category: 'Food',
    carbonValue: 17.0,
    alternative: 'Shade-grown organic coffee',
    alternativeCarbonValue: 5.5,
    unit: 'per kg'
  },
  {
    id: 'fa12',
    name: 'Apples',
    category: 'Food',
    carbonValue: 0.4,
    alternative: 'Backyard-grown Apples',
    alternativeCarbonValue: 0.1,
    unit: 'per kg'
  },
  {
    id: 'fa13',
    name: 'Tofu',
    category: 'Food',
    carbonValue: 3.0,
    alternative: 'Peas (locally sourced)',
    alternativeCarbonValue: 0.5,
    unit: 'per kg'
  },

  // --- CLOTHING CATEGORY (7 items) ---
  {
    id: 'c1',
    name: 'Polyester Jacket',
    category: 'Clothing',
    carbonValue: 18.0,
    alternative: 'Recycled Nylon Jacket',
    alternativeCarbonValue: 8.5,
    unit: 'per item'
  },
  {
    id: 'c2',
    name: 'Leather Boots',
    category: 'Clothing',
    carbonValue: 40.0,
    alternative: 'Vegan Cork/Piñatex Boots',
    alternativeCarbonValue: 12.0,
    unit: 'per pair'
  },
  {
    id: 'c3',
    name: 'Jeans (Cotton)',
    category: 'Clothing',
    carbonValue: 16.2,
    alternative: 'Organic/Recycled Denim Jeans',
    alternativeCarbonValue: 7.0,
    unit: 'per pair'
  },
  {
    id: 'c4',
    name: 'Cotton T-Shirt',
    category: 'Clothing',
    carbonValue: 8.0,
    alternative: 'Organic Linen/Hemp T-Shirt',
    alternativeCarbonValue: 2.2,
    unit: 'per item'
  },
  {
    id: 'c5',
    name: 'Wool Sweater',
    category: 'Clothing',
    carbonValue: 28.0,
    alternative: 'Organic Cotton Sweater',
    alternativeCarbonValue: 10.0,
    unit: 'per item'
  },
  {
    id: 'c6',
    name: 'Sneakers (Synthetic)',
    category: 'Clothing',
    carbonValue: 14.0,
    alternative: 'Recycled/Eco Sneakers',
    alternativeCarbonValue: 6.0,
    unit: 'per pair'
  },
  {
    id: 'c7',
    name: 'Linen Shirt',
    category: 'Clothing',
    carbonValue: 3.5,
    alternative: 'Thrifted Linen Shirt',
    alternativeCarbonValue: 0.3,
    unit: 'per item'
  },

  // --- ELECTRONICS CATEGORY (6 items) ---
  {
    id: 'e1',
    name: 'Smartphone',
    category: 'Electronics',
    carbonValue: 80.0,
    alternative: 'Refurbished Smartphone',
    alternativeCarbonValue: 15.0,
    unit: 'per device'
  },
  {
    id: 'e2',
    name: 'Laptop',
    category: 'Electronics',
    carbonValue: 320.0,
    alternative: 'Refurbished Laptop',
    alternativeCarbonValue: 50.0,
    unit: 'per device'
  },
  {
    id: 'e3',
    name: 'Tablet',
    category: 'Electronics',
    carbonValue: 120.0,
    alternative: 'Refurbished Tablet',
    alternativeCarbonValue: 25.0,
    unit: 'per device'
  },
  {
    id: 'e4',
    name: 'Desktop PC',
    category: 'Electronics',
    carbonValue: 800.0,
    alternative: 'Energy Star Mini PC',
    alternativeCarbonValue: 250.0,
    unit: 'per device'
  },
  {
    id: 'e5',
    name: 'Smart TV',
    category: 'Electronics',
    carbonValue: 500.0,
    alternative: 'Projector or Smaller LED TV',
    alternativeCarbonValue: 200.0,
    unit: 'per device'
  },
  {
    id: 'e6',
    name: 'Charger',
    category: 'Electronics',
    carbonValue: 2.8,
    alternative: 'Solar Powered Charger',
    alternativeCarbonValue: 0.5,
    unit: 'per device'
  },

  // --- HOUSEHOLD CATEGORY (8 items) ---
  {
    id: 'h1',
    name: 'Plastic Bottle',
    category: 'Household',
    carbonValue: 0.25,
    alternative: 'Reusable Stainless Steel Bottle',
    alternativeCarbonValue: 0.01, // amortized over 100+ uses
    unit: 'per use'
  },
  {
    id: 'h2',
    name: 'Glass Jar',
    category: 'Household',
    carbonValue: 0.4,
    alternative: 'Reused Glass Jar',
    alternativeCarbonValue: 0.0, // zero footprint since reused
    unit: 'per item'
  },
  {
    id: 'h3',
    name: 'Paper Towels',
    category: 'Household',
    carbonValue: 0.05,
    alternative: 'Washable Microfiber Cloth',
    alternativeCarbonValue: 0.002, // amortized over uses
    unit: 'per use'
  },
  {
    id: 'h4',
    name: 'LED Bulb',
    category: 'Household',
    carbonValue: 15.0, // 50,000 hrs operational footprint
    alternative: 'Smart LED (High efficiency)',
    alternativeCarbonValue: 10.0,
    unit: 'per year usage'
  },
  {
    id: 'h5',
    name: 'Incandescent Bulb',
    category: 'Household',
    carbonValue: 90.0, // annual operational footprint
    alternative: 'LED Bulb',
    alternativeCarbonValue: 15.0,
    unit: 'per year usage'
  },
  {
    id: 'h6',
    name: 'Dish Soap (Chemical)',
    category: 'Household',
    carbonValue: 1.5,
    alternative: 'Biodegradable Plant-based Soap',
    alternativeCarbonValue: 0.6,
    unit: 'per bottle'
  },
  {
    id: 'h7',
    name: 'Disposable Cup',
    category: 'Household',
    carbonValue: 0.12,
    alternative: 'Reusable Ceramic Mug',
    alternativeCarbonValue: 0.001, // amortized
    unit: 'per use'
  },
  {
    id: 'h8',
    name: 'Plastic Shopping Bag',
    category: 'Household',
    carbonValue: 0.08,
    alternative: 'Reusable Cotton Tote Bag',
    alternativeCarbonValue: 0.005, // amortized
    unit: 'per use'
  }
];

export const fallbackCarbonValues: Record<string, { value: number; alternative: string; alternativeCarbonValue: number; unit: string }> = {
  Food: {
    value: 5.0,
    alternative: 'Plant-based alternatives',
    alternativeCarbonValue: 1.2,
    unit: 'per kg'
  },
  Clothing: {
    value: 12.0,
    alternative: 'Second-hand/thrifted item',
    alternativeCarbonValue: 1.5,
    unit: 'per item'
  },
  Electronics: {
    value: 200.0,
    alternative: 'Refurbished/recycled device',
    alternativeCarbonValue: 40.0,
    unit: 'per device'
  },
  Household: {
    value: 2.0,
    alternative: 'Reused or zero-waste alternative',
    alternativeCarbonValue: 0.2,
    unit: 'per item'
  }
};
