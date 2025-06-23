# Products API Documentation

## Overview

The Products API endpoint provides intelligent product recommendations based on GDACS incident data. It fetches real-time disaster information and returns a prioritized list of humanitarian aid products suitable for the specific incident type, severity, and context.

## Endpoint

```http
POST /api/products/[eventId]
```

## Parameters

### Path Parameters

- `eventId` (string, required): The GDACS event ID for the incident

### Request Body

The request body is optional and can include the following filters:

```typescript
{
  eventType?: string;                    // Override detected event type
  alertLevel?: string;                   // Override detected alert level
  affectedPopulation?: number;           // Override detected population
  region?: string;                       // Specify target region
  weatherConditions?: string;            // Weather context (e.g., "cold", "hot")
  culturalRequirements?: {
    isHalal?: boolean;                   // Filter for Halal products
    isKosher?: boolean;                  // Filter for Kosher products
    isVegetarian?: boolean;              // Filter for Vegetarian products
    isVegan?: boolean;                   // Filter for Vegan products
  };
}
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "incidentDetails": {
      "eventId": "1000023",
      "title": "Green tropical cyclone alert (Windy) in Philippines",
      "eventType": "TC",
      "alertLevel": "Green",
      "country": "Philippines",
      "affectedPopulation": 15000
    },
    "products": [
      {
        "id": "uuid-here",
        "name": "First Aid Kit",
        "description": "Comprehensive first aid kit for emergency situations",
        "specification": "Complete medical supplies kit with 23 items",
        "quantity": 1,
        "unit": "kit",
        "productType": "kit",
        "isKit": true,
        "kitContents": [...],
        "categoryName": "First Aid",
        "categoryIcon": "first-aid",
        "categoryColor": "#D0021B",
        "recommendationReason": "Essential medical supplies for treating injuries during tropical cyclone response.",
        "priority": 5,
        "estimatedQuantityNeeded": 30
      }
    ],
    "totalProducts": 15,
    "requestParameters": {...}
  },
  "timestamp": "2025-06-23T10:30:00.000Z"
}
```

### Error Response (400/404/500)

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## Product Priority System

Products are prioritized based on:

### Event Type Priorities

- **Earthquake (EQ)**: Shelter → Blankets → Kitchen Sets
- **Flood (FL)**: Water & Sanitation → Blankets → Kitchen Sets
- **Tropical Cyclone (TC)**: Shelter → Blankets → Kitchen Sets → Winter Kits
- **Wildfire (WF)**: Shelter → Blankets
- **Drought (DR)**: Water & Sanitation → Food
- **Volcano (VO)**: Shelter → Blankets

### Alert Level Adjustments

- **Red Alert**: All priorities increased by +1
- **Orange Alert**: Standard priorities
- **Green Alert**: Lower priorities reduced by -1

### Population Scale Adjustments

- **Large Population (>100k)**: Kitchen Sets and Shelter priorities increased

## Product Categories

1. **First Aid** (Priority: 5) - Always highest priority
2. **Water & Sanitation** (Priority: 5) - Always highest priority
3. **Ready-to-Eat Food** (Priority: 4) - Always important
4. **Shelter & Tents** (Variable) - Based on event type
5. **Blankets & Bedding** (Variable) - Based on event type
6. **Kitchen Sets** (Variable) - Based on event type and population
7. **Winterization Kits** (Variable) - Based on event type and weather

## Quantity Estimation

Estimated quantities are calculated based on:

- **First Aid**: 1 kit per 500 people
- **Water & Sanitation**: 1 bucket per 100 people
- **Food**: 1 parcel per 50 people
- **Shelter**: 1 tent per 5 people (family unit)
- **Blankets**: 1 blanket per 2 people
- **Kitchen Sets**: 1 set per 5 people (family unit)
- **Winter Kits**: 1 kit per 3 people

Quantities are adjusted by alert level:

- Red: +50%
- Orange: Standard
- Green: -30%

## Usage Examples

### Basic Request

```javascript
const response = await fetch("/api/products/1000023", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({}),
});

const data = await response.json();
```

### With Cultural Requirements

```javascript
const response = await fetch("/api/products/1000023", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    culturalRequirements: {
      isHalal: true,
      isVegetarian: true,
    },
  }),
});
```

### With Override Parameters

```javascript
const response = await fetch("/api/products/1000023", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    eventType: "TC",
    alertLevel: "Red",
    affectedPopulation: 50000,
    region: "Southeast Asia",
    weatherConditions: "cold",
    culturalRequirements: {
      isHalal: true,
    },
  }),
});
```

## Error Handling

The API handles various error scenarios:

- **400**: Missing or invalid eventId
- **404**: Event not found in GDACS data
- **500**: Server error or GDACS fetch failure

Always check the `success` field in the response to determine if the request was successful.

## Testing

Use the provided test script to validate the API:

```bash
npm run test:products
```

Or run the test script directly:

```bash
npx tsx scripts/test-products-api.ts
```

## Integration Notes

1. The API fetches real-time data from GDACS RSS feed
2. Data is cached for 5 minutes to avoid excessive requests
3. Product recommendations are based on humanitarian aid best practices
4. Cultural and dietary filters ensure appropriate product selection
5. Quantity estimates help with procurement planning

## Dependencies

- GDACS RSS XML feed for incident data
- Database with product catalog and categories
- Real-time product availability status
