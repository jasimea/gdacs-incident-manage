# Report Generation System

This document outlines the refactored report generation system with separated concerns and reusable modules.

## File Structure

### Core Modules

1. **`/lib/report-generator.ts`** - Main report generation logic
   - `generateReport(eventId, productCodes?)` - Generate complete HTML report
   - `fetchGDACSIncidentData(eventId)` - Fetch incident data from GDACS
   - `generateHTMLReport(incidentData, products)` - Generate HTML from data
   - `GDACSIncidentData` interface

2. **`/lib/product-recommendations.ts`** - Product recommendation logic
   - `getRecommendedProducts(incidentDetails, requestBody, allProducts?)` - Core recommendation function
   - All helper functions for priority calculation, quantity estimation, etc.
   - Type definitions: `ProductRecommendation`, `IncidentDetails`, `ProductListRequestBody`

3. **`/lib/gdacs-utils.ts`** - GDACS utility functions
   - `convertGDACSToIncidentDetails(gdacsData)` - Convert GDACS data format
   - `getIncidentProductRecommendations(gdacsData, options)` - Get recommendations for an incident
   - `getEarthquakeRecommendations(population, country)` - Example earthquake recommendations
   - `getFloodRecommendationsWithCultural(population, country, isHalal)` - Example flood recommendations
   - `generateIncidentReport(eventId, productCodes?)` - Generate report wrapper

### Integration Files

4. **`/artifacts/report/server.ts`** - Document handler for reports
   - `reportDocumentHandler` - Document handler for AI agent
   - Re-exports `generateReport` for convenience
   - Uses functions from `/lib/report-generator.ts`

5. **`/app/api/products/[eventId]/route.ts`** - API endpoint for product recommendations
   - Uses shared logic from `/lib/product-recommendations.ts`
   - No duplicate code

## Usage Examples

### Basic Report Generation

```typescript
import { generateReport } from "@/lib/report-generator";

// Generate a complete HTML report for an incident
const htmlReport = await generateReport("1016833");

// Generate report with specific product codes only
const filteredReport = await generateReport("1016833", [
  "BLANKET-001",
  "TENT-002",
]);
```

### Product Recommendations Only

```typescript
import { getRecommendedProducts } from "@/lib/product-recommendations";

const incidentDetails = {
  eventId: "1016833",
  title: "Earthquake in Turkey",
  description: "Major earthquake",
  eventType: "EQ",
  alertLevel: "Red",
  country: "Turkey",
  affectedPopulation: 50000,
};

const requestBody = {
  eventType: "EQ",
  alertLevel: "Red",
  affectedPopulation: 50000,
  culturalRequirements: { isHalal: true },
};

const recommendations = getRecommendedProducts(incidentDetails, requestBody);
```

### Using Utility Functions

```typescript
import {
  getEarthquakeRecommendations,
  generateIncidentReport,
} from "@/lib/gdacs-utils";

// Quick earthquake recommendations
const products = getEarthquakeRecommendations(50000, "Turkey");

// Generate complete report
const report = await generateIncidentReport("1016833");
```

### API Usage

```typescript
// POST /api/products/1016833
// Body: { eventType: "EQ", alertLevel: "Red", culturalRequirements: { isHalal: true } }
// Returns: { success: true, data: { products: [...], incidentDetails: {...} } }
```

## Benefits

1. **Separation of Concerns**: Each file has a single responsibility
2. **Reusability**: Functions can be used across different parts of the app
3. **No Code Duplication**: Single source of truth for all logic
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Easy Testing**: Each module can be tested independently
6. **Easy Maintenance**: Updates in one place affect all consumers

## Import Paths

- Report generation: `@/lib/report-generator`
- Product recommendations: `@/lib/product-recommendations`
- GDACS utilities: `@/lib/gdacs-utils`
- Document handler: `/artifacts/report/server` (for AI agent use)
