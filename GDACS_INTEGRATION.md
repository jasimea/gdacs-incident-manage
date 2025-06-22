# GDACS RSS Feed Integration

This project includes integration with the [GDACS (Global Disaster Alert and Coordination System)](https://www.gdacs.org/) RSS feed to store and manage disaster alerts.

## Overview

The GDACS integration provides:

- Automatic parsing of the GDACS RSS feed
- Storage of disaster alerts in a PostgreSQL database
- API endpoints for querying disaster alerts
- Support for various disaster types (Earthquakes, Floods, Wildfires, Droughts, etc.)

## Database Schema

The `DisasterAlert` table stores the following information:

### Core Fields

- `eventId`: Unique identifier for the disaster event
- `eventType`: Type of disaster (EQ, FL, WF, DR, TC, VO)
- `alertLevel`: Alert severity (Green, Orange, Red)
- `title`: Human-readable title of the alert
- `description`: Detailed description of the event

### Location Data

- `country`: Affected country/region
- `latitude`/`longitude`: Event coordinates
- `minLatitude`/`maxLatitude`/`minLongitude`/`maxLongitude`: Bounding box

### Event Details

- `magnitude`: For earthquakes, the magnitude value
- `depth`: For earthquakes, the depth in kilometers
- `affectedPopulation`: Number of people potentially affected
- `affectedArea`: Area affected in square kilometers
- `deaths`: Number of reported deaths
- `displaced`: Number of displaced people

### Timestamps

- `eventTime`: When the disaster occurred
- `startTime`/`endTime`: For ongoing events
- `publishedAt`: When the alert was published
- `lastUpdated`: Last update timestamp

### Metadata

- `severity`: Numeric severity level (1-3)
- `version`: Alert version number
- `isActive`: Whether the alert is still active
- `rawData`: Original RSS item data as JSON

## API Endpoints

### 1. Sync GDACS Feed (Basic)

```http
GET /api/gdacs
POST /api/gdacs
```

Fetches the latest data from the GDACS RSS feed and syncs it with the database.

**Response:**

```json
{
  "success": true,
  "message": "GDACS feed synchronized successfully",
  "results": {
    "total": 25,
    "inserted": 20,
    "updated": 5,
    "errors": 0,
    "details": [...]
  }
}
```

### 2. Sync GDACS Feed (Detailed)

```http
GET /api/gdacs/sync
POST /api/gdacs/sync
```

Enhanced sync endpoint with detailed statistics and performance metrics.

**GET Response (Status):**

```json
{
  "success": true,
  "message": "GDACS sync status retrieved",
  "data": {
    "lastSync": "2025-01-22T10:30:00.000Z",
    "statistics": {
      "totalAlerts": 150,
      "byEventType": { "EQ": 45, "FL": 30, "WF": 25, "DR": 50 },
      "byAlertLevel": { "Green": 100, "Orange": 40, "Red": 10 },
      "recentAlerts": 15
    },
    "sampleAlerts": [...]
  }
}
```

**POST Response (Sync):**

```json
{
  "success": true,
  "message": "GDACS feed synchronized successfully",
  "metadata": {
    "duration": "1250ms",
    "timestamp": "2025-01-22T10:30:00.000Z",
    "beforeCount": 150,
    "afterCount": 175,
    "netChange": 25
  },
  "results": {
    "total": 25,
    "inserted": 20,
    "updated": 5,
    "errors": 0,
    "successRate": "100%"
  },
  "details": [...]
}
```

### 3. Get Disaster Alerts

```http
GET /api/disaster-alerts
```

Query parameters:

- `eventType`: Filter by event type (EQ, FL, WF, DR, etc.)
- `alertLevel`: Filter by alert level (Green, Orange, Red)
- `country`: Filter by country
- `isActive`: Filter by active status (true/false)
- `limit`: Number of results to return (default: 50)
- `offset`: Number of results to skip (default: 0)
- `hours`: Get alerts from last N hours
- `minSeverity`: Get alerts with minimum severity level

**Response:**

```json
{
  "success": true,
  "data": [...],
  "count": 25
}
```

## Usage Examples

### Sync the GDACS Feed via API

```bash
# Basic sync
curl -X POST http://localhost:3000/api/gdacs

# Detailed sync with statistics
curl -X POST http://localhost:3000/api/gdacs/sync

# Get sync status
curl http://localhost:3000/api/gdacs/sync
```

### Sync the GDACS Feed via Code

```typescript
import { syncGDACSFeed } from "@/lib/gdacs-parser";

const results = await syncGDACSFeed();
console.log(`Processed ${results.length} alerts`);
```

### Query Recent Alerts

```typescript
import { getRecentDisasterAlerts } from "@/lib/db/queries";

// Get alerts from last 24 hours
const recentAlerts = await getRecentDisasterAlerts(24);
```

### Query by Event Type

```typescript
import { getDisasterAlerts } from "@/lib/db/queries";

// Get earthquake alerts
const earthquakes = await getDisasterAlerts({
  eventType: "EQ",
  limit: 10,
});
```

### Query by Location

```typescript
import { getDisasterAlertsByLocation } from "@/lib/db/queries";

// Get alerts in a specific region
const alerts = await getDisasterAlertsByLocation(
  35.0, // minLat
  45.0, // maxLat
  -120.0, // minLng
  -110.0 // maxLng
);
```

### Test the API

```bash
# Run the test script
npx tsx scripts/test-gdacs-api.ts
```

## Disaster Types

The system supports the following disaster types:

- `EQ`: Earthquakes
- `FL`: Floods
- `WF`: Wildfires
- `DR`: Droughts
- `TC`: Tropical Cyclones
- `VO`: Volcanic Eruptions

## Alert Levels

- `Green`: Low impact, informational
- `Orange`: Medium impact, requires attention
- `Red`: High impact, immediate action required

## Running the Integration

1. **Setup Database**: Ensure your PostgreSQL database is running and the migration has been applied.

2. **Sync Feed**: Call the sync endpoint or run the test script:

   ```bash
   # Via API
   curl -X POST http://localhost:3000/api/gdacs/sync

   # Via test script
   npx tsx scripts/test-gdacs-api.ts
   ```

3. **Query Data**: Use the API endpoints or database queries to retrieve disaster alerts.

## Data Source

The integration fetches data from the official GDACS RSS feed:

- **URL**: https://www.gdacs.org/xml/rss.xml
- **Update Frequency**: The feed is updated in near real-time
- **License**: Public domain (Joint Research Center of the European Commission)

## Notes

- The system automatically handles duplicate alerts by checking the `eventId`
- Old alerts are automatically cleaned up (configurable retention period)
- All original RSS data is preserved in the `rawData` field for reference
- The parser extracts structured data from the RSS feed using regex patterns
- The API provides detailed statistics and performance metrics
- Both basic and detailed sync endpoints are available for different use cases
