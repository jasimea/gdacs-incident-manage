import { getAllSampleProducts } from '@/lib/sample-product-data';
import { tool } from 'ai';
import { z } from 'zod';

export const getProducts = tool({
  description: 'Get list of products currently available in the database',
  parameters: z.object({
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
  }),
  execute: async ({ limit, offset }) => {
    const products = getAllSampleProducts();
    return products.map((product) => ({
      name: product.name,
      description: product.description,
      specification: product.specification,
      itemCode: product.itemCode,
      category: product.categoryId,
    }));
  },
});
