#!/usr/bin/env tsx

import { config } from 'dotenv';
import { db } from '../lib/db/index';
import {
  createProductCategory,
  createProduct,
  getProductCategories,
} from '../lib/db/queries';
import {
  sampleProductCategories,
  getAllSampleProducts,
} from '../lib/sample-product-data';

// Load environment variables
config({ path: '.env' });

async function setupDatabase() {
  console.log('🚀 Setting up database...');

  try {
    // Check if categories already exist
    const existingCategories = await getProductCategories();

    if (existingCategories.length > 0) {
      console.log('✅ Product categories already exist, skipping...');
      return;
    }

    // Create product categories
    console.log('📦 Creating product categories...');
    const createdCategories = [];

    for (const category of sampleProductCategories) {
      const [createdCategory] = await createProductCategory(category);
      createdCategories.push(createdCategory);
      console.log(`✅ Created category: ${createdCategory.name}`);
    }

    // Create a mapping of category names to IDs
    const categoryMap = new Map(
      createdCategories.map((cat) => [cat.name, cat.id]),
    );

    // Get all sample products and assign category IDs
    const allProducts = getAllSampleProducts();

    console.log('📦 Creating products...');
    let productCount = 0;

    for (const product of allProducts) {
      // Map placeholder category IDs to actual category names
      let categoryId = '';
      
      switch (product.categoryId) {
        case 'blankets-bedding':
          categoryId = categoryMap.get('Blankets & Bedding') || '';
          break;
        case 'winterization-kits':
          categoryId = categoryMap.get('Winterization Kits') || '';
          break;
        case 'kitchen-sets':
          categoryId = categoryMap.get('Kitchen Sets') || '';
          break;
        case 'first-aid':
          categoryId = categoryMap.get('First Aid') || '';
          break;
        case 'water-sanitation':
          categoryId = categoryMap.get('Water & Sanitation') || '';
          break;
        case 'ready-to-eat-food':
          categoryId = categoryMap.get('Ready-to-Eat Food') || '';
          break;
        case 'shelter-tents':
          categoryId = categoryMap.get('Shelter & Tents') || '';
          break;
        default:
          console.warn(`⚠️  Unknown category ID: ${product.categoryId} for product: ${product.name}`);
          continue;
      }

      if (categoryId) {
        const productWithCategory = { ...product, categoryId };
        await createProduct(productWithCategory);
        productCount++;
        console.log(`✅ Created product: ${product.name}`);
      } else {
        console.warn(`⚠️  Could not find category for product: ${product.name}`);
      }
    }

    console.log(
      `🎉 Database setup complete! Created ${createdCategories.length} categories and ${productCount} products.`,
    );
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  });
