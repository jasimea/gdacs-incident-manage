import type { NewProductCategory, NewProduct } from './db/schema';

// Sample Product Categories
export const sampleProductCategories: NewProductCategory[] = [
  {
    name: 'Blankets & Bedding',
    description: 'Blankets, sleeping bags, and bedding materials',
    icon: 'blanket',
    color: '#4A90E2',
  },
  {
    name: 'Winterization Kits',
    description: 'Complete winter clothing and gear kits',
    icon: 'winter',
    color: '#7ED321',
  },
  {
    name: 'Kitchen Sets',
    description: 'Cooking utensils and kitchen equipment',
    icon: 'kitchen',
    color: '#F5A623',
  },
  {
    name: 'First Aid',
    description: 'Medical supplies and first aid kits',
    icon: 'first-aid',
    color: '#D0021B',
  },
  {
    name: 'Water & Sanitation',
    description: 'Water containers, filters, and purification',
    icon: 'water',
    color: '#50E3C2',
  },
  {
    name: 'Ready-to-Eat Food',
    description: 'Non-perishable food items',
    icon: 'food',
    color: '#9013FE',
  },
  {
    name: 'Shelter & Tents',
    description: 'Tents, tarpaulins, and shelter materials',
    icon: 'tent',
    color: '#8B572A',
  },
];

// Sample Products - Blankets
export const sampleBlanketProducts: NewProduct[] = [
  {
    name: 'Blanket (Polyester)',
    description: 'Warm polyester blanket for emergency situations',
    specification: '210*220 cm, 3.5kg minimum weight',
    quantity: 1,
    unit: 'piece',
    size: '210*220',
    weight: '3.5',
    dimensions: '210*220 cm',
    productType: 'individual',
    isKit: false,
    referencePicture: '/images/blanket-polyester.jpg',
    itemCode: 'BLK-001',
    categoryId: 'blankets-bedding', // Will be replaced during setup
  },
];

// Sample Products - Winterization Kits
export const sampleWinterizationProducts: NewProduct[] = [
  {
    name: 'Men Winterization Kit',
    description: 'Complete winter clothing kit for adult men',
    specification: 'Includes jacket, gloves, hat, scarf, socks, and bag',
    quantity: 1,
    unit: 'kit',
    productType: 'kit',
    isKit: true,
    kitContents: [
      { item: 'Men Winter Jacket (Adult)', quantity: 1, size: 'L,XL' },
      { item: 'Winter Gloves, Hat and Scarf Set (Adult)', quantity: 1, size: 'M,L' },
      { item: 'Winter Socks Men (Adult)', quantity: 1, size: 'Adult Size' },
      { item: 'Bag with Logo Printed', quantity: 1, size: '55*25*25 cm, 400 grams' },
    ],
    dimensions: '55*25*25 cm',
    weight: '0.4',
    referencePicture: '/images/men-winter-kit.jpg',
    itemCode: 'WWK-MEN-001',
    categoryId: 'winterization-kits', // Will be replaced during setup
  },
  {
    name: 'Women Winterization Kit',
    description: 'Complete winter clothing kit for adult women',
    specification: 'Includes jacket, gloves, hat, scarf, socks, and bag',
    quantity: 1,
    unit: 'kit',
    productType: 'kit',
    isKit: true,
    kitContents: [
      { item: 'Woman Winter Jacket (Adult)', quantity: 1, size: 'M,L' },
      { item: 'Winter Gloves, Hat and Scarf Set (Adult)', quantity: 1, size: 'M,L' },
      { item: 'Winter Socks Woman (Adult)', quantity: 1, size: 'Adult Size' },
      { item: 'Bag with Logo Printed', quantity: 1, size: '55*25*25 cm, 400 grams' },
    ],
    dimensions: '55*25*25 cm',
    weight: '0.4',
    referencePicture: '/images/women-winter-kit.jpg',
    itemCode: 'WWK-WOMEN-001',
    categoryId: 'winterization-kits', // Will be replaced during setup
  },
  {
    name: 'Kids (Boy) Winterization Kit',
    description: 'Complete winter clothing kit for boys aged 8-12',
    specification: 'Includes jacket, gloves, hat, scarf, socks, and bag',
    quantity: 1,
    unit: 'kit',
    productType: 'kit',
    isKit: true,
    kitContents: [
      { item: 'Winter Jacket (Kids Size)', quantity: 1, size: 'Age between 8-12' },
      { item: 'Winter Gloves, Hat and Scarf Set (Kids Size)', quantity: 1, size: 'Age between 8-12' },
      { item: 'Winter Socks (Kids Size)', quantity: 1, size: 'Age between 8-12' },
      { item: 'Bag with Logo Printed', quantity: 1, size: '55*25*25 cm, 400 grams' },
    ],
    dimensions: '55*25*25 cm',
    weight: '0.4',
    referencePicture: '/images/kids-boy-winter-kit.jpg',
    itemCode: 'WWK-KIDS-BOY-001',
    categoryId: 'winterization-kits', // Will be replaced during setup
  },
  {
    name: 'Kids (Girl) Winterization Kit',
    description: 'Complete winter clothing kit for girls aged 8-12',
    specification: 'Includes jacket, gloves, hat, scarf, socks, and bag',
    quantity: 1,
    unit: 'kit',
    productType: 'kit',
    isKit: true,
    kitContents: [
      { item: 'Winter Jacket (Kids Size)', quantity: 1, size: 'Age between 8-12' },
      { item: 'Winter Gloves, Hat and Scarf Set (Kids Size)', quantity: 1, size: 'Age between 8-12' },
      { item: 'Socks (Kids Size)', quantity: 1, size: 'Age between 8-12' },
      { item: 'Bag with Logo Printed', quantity: 1, size: '55*25*25 cm, 400 grams' },
    ],
    dimensions: '55*25*25 cm',
    weight: '0.4',
    referencePicture: '/images/kids-girl-winter-kit.jpg',
    itemCode: 'WWK-KIDS-GIRL-001',
    categoryId: 'winterization-kits', // Will be replaced during setup
  },
];

// Sample Products - Kitchen Sets
export const sampleKitchenProducts: NewProduct[] = [
  {
    name: 'Kitchen Set - UNHCR (Type B - SS)',
    description: 'Complete kitchen set with stainless steel cookware',
    specification: 'Includes cooking pots, pans, bowls, plates, cups, and utensils',
    quantity: 1,
    unit: 'set',
    productType: 'kit',
    isKit: true,
    kitContents: [
      { item: 'Cooking Pot 7L', quantity: 1, specification: '7 Ltr' },
      { item: 'Frying Pan 2.5L (used as Lid for Cooking Pot 7L)', quantity: 1, specification: '2.5 Ltr' },
      { item: 'Cooking Pot 5L with Lid', quantity: 1, specification: '5 Ltr' },
      { item: 'Bowl 1L', quantity: 5, specification: '1 Ltr' },
      { item: 'Plates 0.75L', quantity: 5, specification: '0.75 Ltr' },
      { item: 'Cups 0.3L', quantity: 5, specification: '0.3 Ltr' },
      { item: 'Table Spoon 10ML', quantity: 5, specification: '10 ML' },
      { item: 'Table Fork 17cm', quantity: 5, specification: '17 Cm' },
      { item: 'Table Knife 17cm', quantity: 5, specification: '17 Cm' },
      { item: 'Kitchen Knife 15cm', quantity: 1, specification: '15 cm' },
      { item: 'Spoon Wooden Stirring 30cm', quantity: 1, specification: '20 cm' },
      { item: 'Serving Spoon 30cm', quantity: 2, specification: '30 cm' },
      { item: 'Scoring Pad', quantity: 2, specification: '' },
    ],
    referencePicture: '/images/kitchen-set-unhcr.jpg',
    itemCode: 'KIT-UNHCR-001',
    categoryId: 'kitchen-sets', // Will be replaced during setup
  },
];

// Sample Products - First Aid
export const sampleFirstAidProducts: NewProduct[] = [
  {
    name: 'First Aid Kit',
    description: 'Comprehensive first aid kit for emergency situations',
    specification: 'Complete medical supplies kit with 23 items',
    quantity: 1,
    unit: 'kit',
    productType: 'kit',
    isKit: true,
    kitContents: [
      { item: 'Adhesive tape, 1/2" x 5yrds', quantity: 1 },
      { item: 'Safety pins', quantity: 12 },
      { item: 'Scissors', quantity: 1 },
      { item: 'Plastic tweezers', quantity: 1 },
      { item: 'Alcohol wipes', quantity: 5 },
      { item: 'Antiseptic wipes', quantity: 3 },
      { item: 'Disposable cold pack, 100g', quantity: 1 },
      { item: 'Sterile eye pad', quantity: 2 },
      { item: 'Tourniquets', quantity: 1 },
      { item: 'Emergency blanket, silver/golden, size:130x210cm', quantity: 1 },
      { item: 'Digital Thermometer', quantity: 1 },
      { item: 'Sterile gauze 2" * 2"cm', quantity: 3 },
      { item: 'Sterile gauze 3" * 3"cm', quantity: 3 },
      { item: 'Sterile gauze 4" * 4"cm, 8ply, 2\'s/pkt', quantity: 3 },
      { item: 'Conforming bandage, size: 5cm*450cm', quantity: 1 },
      { item: 'Conforming bandage, size: 7.5cm*450cm', quantity: 1 },
      { item: 'Conforming bandage, size: 10cm*450cm', quantity: 1 },
      { item: 'Cotton ball, 10pcs/pack', quantity: 2 },
      { item: 'Triangular bandage, cotton material, 90*90*127cm', quantity: 1 },
      { item: 'PE adhesive bandage, 72*19mm', quantity: 10 },
      { item: 'Medical gloves, 1 pair/pack', quantity: 2 },
      { item: 'First aid leaflet', quantity: 1 },
      { item: 'White plastic box, size:25*18*9cm', quantity: 1 },
    ],
    dimensions: '25*18*9cm',
    referencePicture: '/images/first-aid-kit.jpg',
    itemCode: 'FAK-001',
    categoryId: 'first-aid', // Will be replaced during setup
  },
];

// Sample Products - Water & Sanitation
export const sampleWaterProducts: NewProduct[] = [
  {
    name: 'Plastic Water Buckets with and Without Taps',
    description: 'UNHCR Standard heavy-duty plastic water buckets',
    specification: 'Manufactured HDPE and LDPE, Non-collapsible, heavy-duty, 14L plastic water bucket with tight-fitting lid, handle and attached clip-on cap, UV-resistant and safe for food and water storage, Stackable and easy to carry by hand, available with or without spigot, Ideal for family or individual drinking water container for general household use, Colour: White',
    quantity: 1,
    unit: 'piece',
    productType: 'individual',
    isKit: false,
    volume: '14',
    referencePicture: '/images/water-bucket.jpg',
    itemCode: 'WB-001',
    categoryId: 'water-sanitation', // Will be replaced during setup
  },
  {
    name: 'Jerry Cans (Semi and Full Collapsible)',
    description: 'For storing and carrying water. Easy to use light and handy, space saving',
    specification: 'Food grade PE resin material. SGS certified product. LDPE, Transparent / Colorless, 10L, 20L, Weight: 0.17 KG / PC(10L), 0.27 KG / PC(20L), Dimension: 20 x 20 x 6 cm(10L), Dimension: 26 x 24.7 cm(20L)',
    quantity: 1,
    unit: 'piece',
    productType: 'individual',
    isKit: false,
    volume: '10',
    weight: '0.17',
    dimensions: '20 x 20 x 6 cm',
    referencePicture: '/images/jerry-can.jpg',
    itemCode: 'JC-001',
    categoryId: 'water-sanitation', // Will be replaced during setup
  },
  {
    name: 'Stainless Steel Water Filter',
    description: 'SS Water Bucket with 2-stage filtration system',
    specification: 'SS Water Bucket: 24 Liters, 2 buckets, Height: 12.5", Length: 11.5", Width: 10.5", Weight: 2.330 kgs with Packing',
    quantity: 1,
    unit: 'set',
    productType: 'kit',
    isKit: true,
    volume: '24',
    weight: '2.33',
    dimensions: '12.5" x 11.5" x 10.5"',
    referencePicture: '/images/ss-water-filter.jpg',
    itemCode: 'SSWF-001',
    categoryId: 'water-sanitation', // Will be replaced during setup
  },
  {
    name: 'Bottle Filters',
    description: 'Portable water filtration bottles',
    specification: '600 Ml, Tritan Material, with 2 stage Filters',
    quantity: 1,
    unit: 'piece',
    productType: 'individual',
    isKit: false,
    volume: '0.6',
    referencePicture: '/images/bottle-filter.jpg',
    itemCode: 'BF-001',
    categoryId: 'water-sanitation', // Will be replaced during setup
  },
  {
    name: 'Water Purification Tablets',
    description: 'Water purification tablets for emergency use',
    specification: '50/100 Pcs in 1 Bottle/Strip (Assorted brand)',
    quantity: 1,
    unit: 'bottle',
    productType: 'individual',
    isKit: false,
    referencePicture: '/images/water-tablets.jpg',
    itemCode: 'WPT-001',
    categoryId: 'water-sanitation', // Will be replaced during setup
  },
];

// Sample Products - Ready-to-Eat Food
export const sampleFoodProducts: NewProduct[] = [
  {
    name: 'RTE Parcel',
    description: 'Ready-to-eat food parcel with various non-perishable items',
    specification: 'Complete food parcel with 9 different food items',
    quantity: 1,
    unit: 'parcel',
    productType: 'kit',
    isKit: true,
    kitContents: [
      { item: 'JAM 450 gr.', quantity: 2 },
      { item: 'LUNCHEON MEAT 340 gr', quantity: 4 },
      { item: 'TUNA 160 gr', quantity: 4 },
      { item: 'BAKED BEANS 420 gr', quantity: 4 },
      { item: 'CHICK PEAS 400 gr', quantity: 4 },
      { item: 'SARDINE 155 gr', quantity: 4 },
      { item: 'FOUL MEDAMMAS 400 gr', quantity: 4 },
      { item: 'HUMMUS THAHINA 380 gr', quantity: 4 },
      { item: 'HALAWA 900 gr', quantity: 2 },
    ],
    shelfLife: 365, // 1 year
    storageConditions: 'Store in cool, dry place',
    referencePicture: '/images/rte-parcel.jpg',
    itemCode: 'RTE-001',
    categoryId: 'ready-to-eat-food', // Will be replaced during setup
  },
];

// Sample Products - Shelter & Tents
export const sampleShelterProducts: NewProduct[] = [
  {
    name: 'Tents UNHCR Standards',
    description: 'Standard UNHCR tent for family shelter',
    specification: 'Area: 26 m2 (approx.), Size: 6.50 x 4.00 m, Material: Made of natural colour 320 g/m2 polyester / cotton, rot proof & water proof blend fabric, Weight: 55 Kgs (approx.), 0.16 cbm (approx.-1 Pc)',
    quantity: 1,
    unit: 'piece',
    productType: 'individual',
    isKit: false,
    weight: '55',
    dimensions: '6.50 x 4.00 m',
    referencePicture: '/images/tent-unhcr.jpg',
    itemCode: 'TENT-001',
    categoryId: 'shelter-tents', // Will be replaced during setup
  },
  {
    name: 'Thermal Fleece Blankets (Low, Medium and High) UNHCR Standard',
    description: 'Thermal fleece blankets in different thickness levels',
    specification: '150*200 Cm, 1.15 to 1.35 kg, 100% Polyester',
    quantity: 1,
    unit: 'piece',
    productType: 'individual',
    isKit: false,
    size: '150*200',
    weight: '1.25',
    dimensions: '150*200 cm',
    referencePicture: '/images/thermal-blanket.jpg',
    itemCode: 'TBL-001',
    categoryId: 'shelter-tents', // Will be replaced during setup
  },
  {
    name: 'Sleeping Mats UNHCR Standard',
    description: 'Waterproof sleeping mats for outdoor use',
    specification: '90*180 Cm/1.62 Sqm, Waterproof, tearproof and material trim finish, Suitable for one adult or two children, Will last for +12 months of use under hard tropical conditions',
    quantity: 1,
    unit: 'piece',
    productType: 'individual',
    isKit: false,
    size: '90*180',
    dimensions: '90*180 cm',
    referencePicture: '/images/sleeping-mat.jpg',
    itemCode: 'SM-001',
    categoryId: 'shelter-tents', // Will be replaced during setup
  },
  {
    name: 'Sleeping Bag',
    description: 'Square angle shape sleeping bag with 2 sides opening',
    specification: 'Sleeping bag, square angle shape, 2 sides opening, 0.7 x 1.9m, folded (= 1.4 x 1.9m open), Dark colour lining outside, and light colour inside – not white, 30mm for one layer (when open), 2 strong zips of each 1.9m and 0.7m, plastic.',
    quantity: 1,
    unit: 'piece',
    productType: 'individual',
    isKit: false,
    dimensions: '0.7 x 1.9m',
    referencePicture: '/images/sleeping-bag.jpg',
    itemCode: 'SB-001',
    categoryId: 'shelter-tents', // Will be replaced during setup
  },
  {
    name: 'Mosquito Net WHO Approved',
    description: 'WHO approved mosquito net for malaria prevention',
    specification: 'Fabric weight: 30 gram per square meter +10%, Enhanced durability: 21 + washes, Flammability test: Class 1 (16-CFR 1610CS191-53), Size: 190cm width x150cm height x180cm length, Material: 100% Polyester, Colour: White, Mesh Size: Minimum 130 holes per inch2',
    quantity: 1,
    unit: 'piece',
    productType: 'individual',
    isKit: false,
    dimensions: '190cm x 150cm x 180cm',
    referencePicture: '/images/mosquito-net.jpg',
    itemCode: 'MN-001',
    categoryId: 'shelter-tents', // Will be replaced during setup
  },
  {
    name: 'Tarpaulin UNHCR Standard',
    description: 'Fire retardant, waterproof tarpaulin for shelter protection',
    specification: 'Fire retardant (optional)*, waterproof, rotproof and UV-resistant, Reinforced plastic tarpaulin in 4m x 5m sheet or 4m x 50m roll developed by international research project and designed for long outdoor use in all climates, Highly recommended for family shelter protection, Made of woven high density black polyethylene (HDPE) fibers, warp x weft, laminated on both sides with low density polyethylene (LDPE) coating',
    quantity: 1,
    unit: 'piece',
    productType: 'individual',
    isKit: false,
    dimensions: '4m x 5m',
    referencePicture: '/images/tarpaulin.jpg',
    itemCode: 'TARP-001',
    categoryId: 'shelter-tents', // Will be replaced during setup
  },
];

// Helper function to get all sample products
export function getAllSampleProducts(): NewProduct[] {
  return [
    ...sampleBlanketProducts,
    ...sampleWinterizationProducts,
    ...sampleKitchenProducts,
    ...sampleFirstAidProducts,
    ...sampleWaterProducts,
    ...sampleFoodProducts,
    ...sampleShelterProducts,
  ];
}

