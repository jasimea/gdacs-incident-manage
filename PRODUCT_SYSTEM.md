# Product System for Disaster Aid Management

This document describes the product system designed to manage disaster aid products and their relationships with disaster types and regions.

## Overview

The product system is designed to work with your disaster alert system to provide intelligent product recommendations based on:

- Disaster type (Earthquakes, Floods, Wildfires, etc.)
- Geographic region and cultural considerations
- Product availability and inventory
- Regional preferences and dietary restrictions

## Database Schema

### Core Tables

#### 1. ProductCategory

Stores product categories for organization:

- `id`: Unique identifier
- `name`: Category name (e.g., "Blankets & Bedding", "First Aid")
- `description`: Category description
- `icon`: Icon identifier for UI
- `color`: Hex color code for UI
- `isActive`: Whether the category is active

#### 2. Product

Stores individual products and kits:

- `id`: Unique identifier
- `name`: Product name
- `description`: Product description
- `categoryId`: Reference to ProductCategory
- `specification`: Detailed product specifications
- `quantity`: Quantity per unit/bag/kit
- `unit`: Unit of measurement (piece, kit, set, etc.)
- `size`: Product size information
- `weight`: Weight in kg (as string)
- `volume`: Volume in liters (as string)
- `dimensions`: Physical dimensions
- `productType`: Type (individual, kit, bundle)
- `isKit`: Whether this is a kit containing multiple items
- `kitContents`: JSON array of items in the kit
- `shelfLife`: Shelf life in days
- `storageConditions`: Storage requirements
- `isHalal`, `isKosher`, `isVegetarian`, `isVegan`: Cultural/dietary flags
- `referencePicture`: URL to product image
- `itemCode`: Internal item code

#### 3. RegionalProductPreference

Stores regional preferences for products:

- `id`: Unique identifier
- `region`: Country or region name
- `productId`: Reference to Product
- `preferenceLevel`: 1-5 scale preference
- `isPreferred`: Whether product is preferred in this region
- `isAvoided`: Whether product should be avoided
- `culturalNotes`: Cultural considerations
- `dietaryRestrictions`: JSON array of restrictions
- `seasonalAvailability`: Months when preferred/avoided

#### 4. ProductInventory

Stores inventory and stock information:

- `id`: Unique identifier
- `productId`: Reference to Product
- `currentStock`: Current available stock
- `reservedStock`: Reserved stock
- `minimumStock`: Minimum stock threshold
- `maximumStock`: Maximum stock capacity
- `warehouseLocation`: Storage location
- `storageZone`: Storage zone
- `expiryDate`: Product expiry date
- `batchNumber`: Batch tracking
- `unitCost`: Cost per unit
- `currency`: Currency code

## Sample Data

The system includes comprehensive sample data based on your requirements:

### Product Categories

1. **Blankets & Bedding** - Blankets, sleeping bags, mats
2. **Winterization Kits** - Complete winter clothing kits
3. **Kitchen Sets** - Cooking utensils and equipment
4. **First Aid** - Medical supplies and kits
5. **Water & Sanitation** - Water containers, filters, purification
6. **Ready-to-Eat Food** - Non-perishable food items
7. **Shelter & Tents** - Tents, tarpaulins, shelter materials

### Sample Products

- **Blankets**: Polyester blankets (210\*220 cm, 3.5kg)
- **Winterization Kits**: Men, Women, Kids (Boy/Girl) kits with jackets, gloves, hats, scarfs, socks
- **Kitchen Sets**: UNHCR standard kitchen sets with pots, pans, bowls, plates, cups, utensils
- **First Aid Kits**: Comprehensive medical supplies (23 items)
- **Water & Sanitation**: Buckets, jerry cans, filters, purification tablets
- **RTE Parcels**: Ready-to-eat food with 9 different items
- **Shelter**: Tents, blankets, sleeping mats, mosquito nets, tarpaulins

## Setup Instructions

### 1. Environment Configuration

Make sure your `.env.local` file contains:

```env
DATABASE_URL=your_neon_database_url_here
```

### 2. Database Migration

Run the database migration to create the tables:

```bash
pnpm run db:generate
pnpm run db:migrate
```

### 3. Populate Sample Data

Run the setup script to populate categories and products:

```bash
pnpm run db:setup
```

## API Usage

### Get All Available Products

```typescript
import { getAllAvailableProducts } from "@/lib/db/queries";

const products = await getAllAvailableProducts();
```

### Get Products by Category

```typescript
import { getProductsByCategory } from "@/lib/db/queries";

const firstAidProducts = await getProductsByCategory(categoryId);
```

### Get Product Categories

```typescript
import { getProductCategories } from "@/lib/db/queries";

const categories = await getProductCategories();
```

### Get Regional Preferences

```typescript
import { getRegionalProductPreferences } from "@/lib/db/queries";

const preferences = await getRegionalProductPreferences("Syria");
```

### Get Low Stock Products

```typescript
import { getLowStockProducts } from "@/lib/db/queries";

const lowStock = await getLowStockProducts(10); // threshold of 10
```

## Integration with LLM

Since you mentioned the LLM will handle disaster type to product mapping, here's how you can integrate:

### 1. Product Data for LLM

```typescript
import { getAllAvailableProducts } from "@/lib/db/queries";

// Get all products with their specifications
const products = await getAllAvailableProducts();

// Format for LLM context
const productContext = products.map((product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  specification: product.specification,
  category: product.categoryName,
  isKit: product.isKit,
  kitContents: product.kitContents,
  cultural: {
    isHalal: product.isHalal,
    isKosher: product.isKosher,
    isVegetarian: product.isVegetarian,
    isVegan: product.isVegan,
  },
}));
```

### 2. Regional Preferences for LLM

```typescript
import { getRegionalProductPreferences } from "@/lib/db/queries";

// Get regional preferences for specific region
const preferences = await getRegionalProductPreferences(disasterRegion);

// Format for LLM context
const regionalContext = preferences.map((pref) => ({
  productId: pref.id,
  productName: pref.name,
  preferenceLevel: pref.preferenceLevel,
  isPreferred: pref.isPreferred,
  isAvoided: pref.isAvoided,
  culturalNotes: pref.culturalNotes,
  dietaryRestrictions: pref.dietaryRestrictions,
}));
```

### 3. LLM Prompt Example

```typescript
const llmPrompt = `
Given a disaster alert:
- Type: ${disasterType}
- Region: ${disasterRegion}
- Affected Population: ${affectedPopulation}
- Severity: ${severity}

Available products: ${JSON.stringify(productContext)}
Regional preferences: ${JSON.stringify(regionalContext)}

Recommend the most appropriate products for this disaster scenario, considering:
1. Disaster type requirements
2. Regional cultural preferences
3. Dietary restrictions
4. Product availability
5. Quantity needed for affected population

Return a structured response with:
- Recommended products with quantities
- Reasoning for each recommendation
- Cultural considerations
- Priority order
`;
```

## Database Queries

### Create a New Product

```typescript
import { createProduct } from "@/lib/db/queries";

const newProduct = await createProduct({
  name: "Emergency Water Filter",
  description: "Portable water filtration system",
  categoryId: "category-uuid-here",
  specification: "Filters 99.9% of bacteria and viruses",
  quantity: 1,
  unit: "piece",
  productType: "individual",
  isKit: false,
  weight: "0.5",
  volume: "1.0",
  referencePicture: "/images/water-filter.jpg",
  itemCode: "EWF-001",
});
```

### Update Product Inventory

```typescript
import { updateProductInventory } from "@/lib/db/queries";

await updateProductInventory(inventoryId, {
  currentStock: 150,
  reservedStock: 25,
  unitCost: "15.50",
});
```

### Get Products with Inventory

```typescript
import { getProductInventory } from "@/lib/db/queries";

const inventory = await getProductInventory(productId);
```

## Cultural Considerations

The system supports various cultural and dietary considerations:

- **Halal**: Products suitable for Islamic dietary laws
- **Kosher**: Products suitable for Jewish dietary laws
- **Vegetarian**: Products without meat
- **Vegan**: Products without animal products

Regional preferences can be set to:

- Mark products as preferred or avoided in specific regions
- Add cultural notes for specific regions
- Set seasonal availability preferences
- Define dietary restrictions per region

## Inventory Management

The inventory system provides:

- Real-time stock tracking
- Reserved stock management
- Minimum/maximum stock thresholds
- Expiry date tracking
- Batch number tracking
- Cost tracking
- Warehouse location management

## Next Steps

1. **Run the setup script** to populate your database with sample data
2. **Customize the sample data** to match your specific product catalog
3. **Integrate with your LLM** to provide product recommendations
4. **Add regional preferences** for your target regions
5. **Set up inventory tracking** for your warehouse
6. **Create API endpoints** to expose product data to your frontend

## Example Usage in Your System

```typescript
// When a disaster alert is received
const disasterAlert = {
  eventType: "EQ", // Earthquake
  country: "Syria",
  affectedPopulation: 5000,
  severity: 3,
};

// Get all available products
const products = await getAllAvailableProducts();

// Get regional preferences for Syria
const regionalPreferences = await getRegionalProductPreferences("Syria");

// Send to LLM for intelligent recommendations
const recommendations = await llm.analyze({
  disaster: disasterAlert,
  products: products,
  regionalPreferences: regionalPreferences,
});

// recommendations will contain:
// - Recommended products with quantities
// - Cultural considerations
// - Priority order
// - Reasoning for each recommendation
```

This system provides a solid foundation for managing disaster aid products and can be easily extended as your requirements evolve.
