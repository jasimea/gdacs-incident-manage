import type { NewDisasterAlert } from './db/schema';

export interface GDACSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
  category: string;
  [key: string]: any; // For additional GDACS-specific fields
}

export interface GDACSRSS {
  rss: {
    channel: {
      title: string;
      description: string;
      link: string;
      item: GDACSItem[];
    };
  };
}

export function parseGDACSItem(item: GDACSItem): NewDisasterAlert {
  // Extract event ID from GDACS eventid or guid
  const eventId = item.eventid || item.guid || item.link?.split('eventid=')?.[1] || item.guid;

  // Extract event type from GDACS eventtype or category
  const eventType = item.eventtype || item.category || extractEventType(item.title);

  // Extract alert level from GDACS alertlevel or title
  const alertLevel = item.alertlevel || extractAlertLevel(item.title);

  // Extract location data
  const locationData = extractLocationData(item);

  // Extract event details
  const eventDetails = extractEventDetails(item);

  // Extract timestamps
  const timestamps = extractTimestamps(item);

  // Extract URLs
  const urls = extractURLs(item);

  // Extract severity
  const severity = extractSeverity(item);

  return {
    eventId,
    eventType,
    alertLevel,
    title: item.title,
    description: item.description,
    ...locationData,
    ...eventDetails,
    ...timestamps,
    ...urls,
    severity,
    version: 1,
    isActive: true,
    rawData: item,
    publishedAt: new Date(item.pubDate),
    lastUpdated: new Date(),
  };
}

function extractEventType(title: string): string {
  const eventTypes = ['EQ', 'FL', 'WF', 'DR', 'TC', 'VO'];
  for (const type of eventTypes) {
    if (title.includes(type)) {
      return type;
    }
  }
  return 'UNKNOWN';
}

function extractAlertLevel(title: string): string {
  if (title.includes('Green')) return 'Green';
  if (title.includes('Orange')) return 'Orange';
  if (title.includes('Red')) return 'Red';
  return 'Green'; // Default
}

function extractLocationData(item: GDACSItem): Partial<NewDisasterAlert> {
  // Extract country from GDACS country field or title
  const country = item.country || (() => {
  const countryMatch = item.title.match(/in\s+([A-Za-z\s,]+?)(?:\s+\d|$)/);
    return countryMatch ? countryMatch[1].trim() : null;
  })();

  // Extract coordinates from GDACS fields - convert to strings for decimal fields
  const lat = item.latitude ? parseFloat(item.latitude).toString() : null;
  const lng = item.longitude ? parseFloat(item.longitude).toString() : null;
  const minLat = item.minLatitude ? parseFloat(item.minLatitude).toString() : null;
  const maxLat = item.maxLatitude ? parseFloat(item.maxLatitude).toString() : null;
  const minLng = item.minLongitude ? parseFloat(item.minLongitude).toString() : null;
  const maxLng = item.maxLongitude ? parseFloat(item.maxLongitude).toString() : null;

  return {
    country,
    latitude: lat,
    longitude: lng,
    minLatitude: minLat,
    maxLatitude: maxLat,
    minLongitude: minLng,
    maxLongitude: maxLng,
  };
}

function extractEventDetails(item: GDACSItem): Partial<NewDisasterAlert> {
  // Extract magnitude from GDACS severity or title
  let magnitude = null;
  if (item.severity) {
    const magnitudeMatch = item.severity.match(/Magnitude\s+([\d.]+)/);
    if (magnitudeMatch) {
      magnitude = parseFloat(magnitudeMatch[1]).toString();
    }
  }
  if (!magnitude) {
  const magnitudeMatch = item.title.match(/Magnitude\s+([\d.]+)M/);
    magnitude = magnitudeMatch ? parseFloat(magnitudeMatch[1]).toString() : null;
  }

  // Extract depth from title
  const depthMatch = item.title.match(/Depth:([\d.]+)km/);
  const depth = depthMatch ? parseFloat(depthMatch[1]).toString() : null;

  // Extract affected population from GDACS population or title
  let affectedPopulation = null;
  if (item.population) {
    const populationMatch = item.population.match(/(\d+)\s+people/);
    if (populationMatch) {
      affectedPopulation = parseInt(populationMatch[1]);
    }
  }
  if (!affectedPopulation) {
  const populationMatch = item.title.match(/(\d+)\s+thousand\s+in/);
    affectedPopulation = populationMatch ? parseInt(populationMatch[1]) * 1000 : null;
  }

  // Extract deaths and displaced from description
  const deathsMatch = item.description.match(/(\d+)\s+deaths/);
  const deaths = deathsMatch ? parseInt(deathsMatch[1]) : null;

  const displacedMatch = item.description.match(/(\d+)\s+displaced/);
  const displaced = displacedMatch ? parseInt(displacedMatch[1]) : null;

  return {
    magnitude,
    depth,
    affectedPopulation,
    deaths,
    displaced,
  };
}

function extractTimestamps(item: GDACSItem): Partial<NewDisasterAlert> {
  // Extract event time from GDACS fields or title
  let eventTime = null;
  if (item.dateAdded) {
    eventTime = new Date(item.dateAdded);
  } else {
  const eventTimeMatch = item.title.match(
    /(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s+[AP]M)/,
  );
    eventTime = eventTimeMatch ? new Date(eventTimeMatch[1]) : null;
  }

  // Extract start and end times from GDACS fields
  const startTime = item.startTime ? new Date(item.startTime) : null;
  const endTime = item.endTime ? new Date(item.endTime) : null;

  return {
    eventTime,
    startTime,
    endTime,
  };
}

function extractURLs(item: GDACSItem): Partial<NewDisasterAlert> {
  return {
    reportUrl: item.link,
    capUrl: item.capUrl,
    iconUrl: item.iconUrl,
  };
}

function extractSeverity(item: GDACSItem): number {
  // Use GDACS alertscore if available, otherwise map alert levels to severity (0-3)
  if (item.alertscore) {
    return parseInt(item.alertscore);
  }
  
  const alertLevel = item.alertlevel || extractAlertLevel(item.title);
  switch (alertLevel) {
    case 'Green':
      return 1;
    case 'Orange':
      return 2;
    case 'Red':
      return 3;
    default:
      return 1;
  }
}

// Simple XML parser for server-side use
function parseXML(xmlText: string): { items: GDACSItem[] } {
  // Use a simple regex-based parser for basic RSS parsing
  // This is a simplified approach - in production, you might want to use a proper XML parser
  const items: GDACSItem[] = [];
  
  // Extract items using regex
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    const title = extractTagContent(itemContent, 'title');
    const description = extractTagContent(itemContent, 'description');
    const link = extractTagContent(itemContent, 'link');
    const pubDate = extractTagContent(itemContent, 'pubDate');
    const guid = extractTagContent(itemContent, 'guid');
    const category = extractTagContent(itemContent, 'category');
    
    // Skip items that are just resource descriptions, not actual disaster alerts
    if (title === 'Event in rss format' || title === 'Joint Research Center of the European Commission') {
      continue;
    }
    
    const item: GDACSItem = {
      title,
      description,
      link,
      pubDate,
      guid,
      category,
    };
    
    // Extract additional GDACS-specific fields
    const gdacsFields = itemContent.match(/<gdacs:(\w+)>([^<]+)<\/gdacs:\w+>/g);
    if (gdacsFields) {
      gdacsFields.forEach(field => {
        const fieldMatch = field.match(/<gdacs:(\w+)>([^<]+)<\/gdacs:\w+>/);
        if (fieldMatch) {
          const [, fieldName, fieldValue] = fieldMatch;
          item[fieldName] = fieldValue;
        }
      });
    }

    // Extract geo coordinates
    const geoLat = extractTagContent(itemContent, 'geo:lat');
    const geoLong = extractTagContent(itemContent, 'geo:long');
    if (geoLat) item.latitude = geoLat;
    if (geoLong) item.longitude = geoLong;

    // Extract georss point
    const georssPoint = extractTagContent(itemContent, 'georss:point');
    if (georssPoint) {
      const [lat, lng] = georssPoint.split(' ');
      if (lat && lng) {
        item.latitude = lat;
        item.longitude = lng;
      }
    }

    // Extract bbox coordinates
    const bbox = extractTagContent(itemContent, 'gdacs:bbox');
    if (bbox) {
      const [minLng, maxLng, minLat, maxLat] = bbox.split(' ');
      if (minLng && maxLng && minLat && maxLat) {
        item.minLongitude = minLng;
        item.maxLongitude = maxLng;
        item.minLatitude = minLat;
        item.maxLatitude = maxLat;
      }
    }

    // Extract additional URLs
    const capUrl = extractTagContent(itemContent, 'gdacs:cap');
    const iconUrl = extractTagContent(itemContent, 'gdacs:icon');
    if (capUrl) item.capUrl = capUrl;
    if (iconUrl) item.iconUrl = iconUrl;

    // Extract timestamps
    const dateAdded = extractTagContent(itemContent, 'gdacs:dateadded');
    const dateModified = extractTagContent(itemContent, 'gdacs:datemodified');
    const fromDate = extractTagContent(itemContent, 'gdacs:fromdate');
    const toDate = extractTagContent(itemContent, 'gdacs:todate');
    if (dateAdded) item.dateAdded = dateAdded;
    if (dateModified) item.dateModified = dateModified;
    if (fromDate) item.startTime = fromDate;
    if (toDate) item.endTime = toDate;

    // Extract severity information
    const severity = extractTagContent(itemContent, 'gdacs:severity');
    if (severity) item.severity = severity;

    // Extract population information
    const population = extractTagContent(itemContent, 'gdacs:population');
    if (population) item.population = population;

    // Extract vulnerability
    const vulnerability = extractTagContent(itemContent, 'gdacs:vulnerability');
    if (vulnerability) item.vulnerability = vulnerability;

    // Extract GLIDE number
    const glide = extractTagContent(itemContent, 'gdacs:glide');
    if (glide) item.glide = glide;
    
    items.push(item);
  }
  
  return { items };
}

function extractTagContent(content: string, tagName: string): string {
  // Handle both simple tags and tags with attributes
  const simpleRegex = new RegExp(`<${tagName}>([^<]*)<\/${tagName}>`);
  const attrRegex = new RegExp(`<${tagName}[^>]*>([^<]*)<\/${tagName}>`);
  
  let match = content.match(simpleRegex);
  if (!match) {
    match = content.match(attrRegex);
  }
  
  return match ? match[1].trim() : '';
}

export async function fetchGDACSFeed(): Promise<GDACSItem[]> {
  try {
    console.log('🌐 Fetching GDACS RSS feed...');
    const response = await fetch('https://www.gdacs.org/xml/rss.xml', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IncidentReporter/1.0)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });


    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    console.log(`📄 Received ${xmlText.length} characters of XML data`);
    console.log(xmlText);

    // Parse XML using our simple parser
    const parsed = parseXML(xmlText);
    const items = parsed.items || [];

    console.log(`✅ Successfully parsed ${items.length} GDACS items`);
    return items;
  } catch (error) {
    console.error('❌ Error fetching GDACS feed:', error);
    throw new Error(`Failed to fetch GDACS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function syncGDACSFeed() {
  try {
    console.log('🔄 Starting GDACS feed synchronization...');
    
    const items = await fetchGDACSFeed();
    console.log(`📊 Processing ${items.length} GDACS items...`);
    
    const alerts: NewDisasterAlert[] = items.map((item, index) => {
      try {
        return parseGDACSItem(item);
      } catch (error) {
        console.error(`❌ Error parsing item ${index}:`, error);
        throw error;
      }
    });

    // Import the database functions
    const {
      insertDisasterAlert,
      getDisasterAlertByEventId,
      updateDisasterAlert,
    } = await import('./db/queries');

    const results = [];

    for (const alert of alerts) {
      try {
        // Check if alert already exists
        const existing = await getDisasterAlertByEventId(alert.eventId);

        if (existing) {
          // Update existing alert
          const updated = await updateDisasterAlert(alert.eventId, alert);
          results.push({
            eventId: alert.eventId,
            action: 'updated',
            data: updated,
          });
        } else {
          // Insert new alert
          const inserted = await insertDisasterAlert(alert);
          results.push({
            eventId: alert.eventId,
            action: 'inserted',
            data: inserted,
          });
        }
      } catch (error) {
        console.error(`❌ Error processing alert ${alert.eventId}:`, error);
        results.push({ eventId: alert.eventId, action: 'error', error });
      }
    }

    console.log(`✅ GDACS sync completed. Processed ${results.length} alerts.`);
    return results;
  } catch (error) {
    console.error('❌ Error syncing GDACS feed:', error);
    throw error;
  }
}
