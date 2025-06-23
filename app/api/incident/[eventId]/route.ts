import { NextRequest, NextResponse } from "next/server";

interface IncidentDetailData {
  id: number;
  eventId: string;
  title: string;
  eventName: string;
  eventType: string;
  eventTypeCode: string;
  episodeId: string;
  location: string;
  country: string;
  iso3: string;
  coordinates: string;
  latitude: number;
  longitude: number;
  alertLevel: string;
  alertScore: number;
  severity: {
    unit: string;
    value: number;
    description: string;
  };
  population: {
    unit: string;
    value: number;
    description: string;
  };
  vulnerability: {
    value: number;
    level: string;
  };
  fromDate: string;
  toDate: string;
  pubDate: string;
  lastModified: string;
  isCurrent: boolean;
  temporary: boolean;
  bbox: string;
  iconUrl: string;
  description: string;
  resources: Array<{
    uri: string;
    title: string;
  }>;
  affectedCountries: string[];
}

async function fetchIncidentByEventId(
  eventId: string
): Promise<IncidentDetailData | null> {
  try {
    const response = await fetch("https://www.gdacs.org/xml/rss.xml", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IncidentReporter/1.0)",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();

    // Parse XML to find the specific incident
    const incident = parseGDACSXMLForEventId(xmlText, eventId);

    return incident;
  } catch (error) {
    console.error("Error fetching GDACS incident:", error);
    return null;
  }
}

function parseGDACSXMLForEventId(
  xmlText: string,
  targetEventId: string
): IncidentDetailData | null {
  // Extract items using regex
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let id = 1;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    const title = extractTagContent(itemContent, "title");
    const description = extractTagContent(itemContent, "description");
    const link = extractTagContent(itemContent, "link");
    const pubDate = extractTagContent(itemContent, "pubDate");
    const category = extractTagContent(itemContent, "category");

    // Skip items that are just resource descriptions
    if (
      title === "Event in rss format" ||
      title === "Joint Research Center of the European Commission"
    ) {
      continue;
    }

    // Extract GDACS-specific fields
    const eventId =
      extractTagContent(itemContent, "gdacs:eventid") ||
      extractEventIdFromLink(link) ||
      `event_${id}`;

    // Check if this is the incident we're looking for
    if (eventId !== targetEventId) {
      id++;
      continue;
    }

    // Extract all the detailed information
    const country =
      extractTagContent(itemContent, "gdacs:country") ||
      extractCountryFromTitle(title);
    const alertLevel =
      extractTagContent(itemContent, "gdacs:alertlevel") ||
      extractAlertLevelFromTitle(title);
    const eventType =
      extractTagContent(itemContent, "gdacs:eventtype") ||
      extractEventTypeFromCategory(category);
    const population =
      extractTagContent(itemContent, "gdacs:population") || "0";
    const severity = extractTagContent(itemContent, "gdacs:severity") || "0";
    const coordinates =
      extractTagContent(itemContent, "gdacs:coordinates") ||
      extractCoordinatesFromPoint(itemContent);
    const bbox = extractTagContent(itemContent, "gdacs:bbox") || "";
    const fromDate =
      extractTagContent(itemContent, "gdacs:fromdate") || pubDate;
    const toDate = extractTagContent(itemContent, "gdacs:todate") || pubDate;
    const episodeId = extractTagContent(itemContent, "gdacs:episodeid") || "1";
    const temporary =
      extractTagContent(itemContent, "gdacs:temporary") === "true";
    const version = extractTagContent(itemContent, "gdacs:version") || "1";

    // Parse coordinates
    const coordsMatch = coordinates.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    const latitude = coordsMatch ? parseFloat(coordsMatch[2]) : 0;
    const longitude = coordsMatch ? parseFloat(coordsMatch[1]) : 0;

    // Parse severity value
    const severityMatch = severity.match(/(\d+\.?\d*)/);
    const severityValue = severityMatch ? parseFloat(severityMatch[1]) : 0;

    // Parse population value
    const populationMatch = population.match(/(\d+)/);
    const populationValue = populationMatch ? parseInt(populationMatch[1]) : 0;

    // Extract event name from title
    const eventName = extractEventNameFromTitle(title, eventType);

    // Build the detailed incident data
    const incident: IncidentDetailData = {
      id: parseInt(targetEventId),
      eventId: eventId,
      title: title || "Unknown Incident",
      eventName: eventName,
      eventType: mapEventTypeToFullName(eventType),
      eventTypeCode: eventType,
      episodeId: episodeId,
      location:
        extractLocationFromTitle(title) || country || "Unknown Location",
      country: country || "Unknown",
      iso3: mapCountryToISO3(country),
      coordinates: coordinates || `${latitude}° N, ${longitude}° E`,
      latitude: latitude,
      longitude: longitude,
      alertLevel: alertLevel || "Green",
      alertScore: mapAlertLevelToScore(alertLevel),
      severity: {
        unit: getSeverityUnit(eventType),
        value: severityValue,
        description: buildSeverityDescription(eventType, severityValue),
      },
      population: {
        unit: getPopulationUnit(eventType),
        value: populationValue,
        description: population || `Population affected: ${populationValue}`,
      },
      vulnerability: {
        value: calculateVulnerabilityValue(alertLevel, populationValue),
        level: calculateVulnerabilityLevel(alertLevel, populationValue),
      },
      fromDate: fromDate || pubDate,
      toDate: toDate || pubDate,
      pubDate: pubDate || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isCurrent: true,
      temporary: temporary,
      bbox: bbox,
      iconUrl: `https://www.gdacs.org/Images/gdacs_icons/alerts/${alertLevel}/${eventType}.png`,
      description: description || "No description available",
      resources: [
        {
          uri: `https://www.gdacs.org/report.aspx?eventtype=${eventType}&eventid=${eventId}`,
          title: "GDACS Report",
        },
        {
          uri: "https://www.gdacs.org/xml/gdacs_cap.xml",
          title: "CAP Alert",
        },
      ],
      affectedCountries: [country || "Unknown"],
    };

    return incident;
  }

  return null;
}

// Helper functions
function extractTagContent(content: string, tagName: string): string {
  const simpleRegex = new RegExp(`<${tagName}>([^<]*)<\/${tagName}>`);
  const attrRegex = new RegExp(`<${tagName}[^>]*>([^<]*)<\/${tagName}>`);

  let match = content.match(simpleRegex);
  if (!match) {
    match = content.match(attrRegex);
  }

  return match ? match[1].trim() : "";
}

function extractEventIdFromLink(link: string): string {
  const eventIdMatch = link.match(/eventid=(\d+)/);
  return eventIdMatch ? eventIdMatch[1] : "";
}

function extractCountryFromTitle(title: string): string {
  const countryMatch = title.match(/in\s+([A-Za-z\s,]+?)(?:\s+\d|$)/);
  return countryMatch ? countryMatch[1].trim() : "Unknown";
}

function extractAlertLevelFromTitle(title: string): string {
  if (title.includes("Red")) return "Red";
  if (title.includes("Orange")) return "Orange";
  if (title.includes("Green")) return "Green";
  return "Green";
}

function extractEventTypeFromCategory(category: string): string {
  const eventTypeMap: { [key: string]: string } = {
    EQ: "EQ",
    FL: "FL",
    WF: "WF",
    DR: "DR",
    TC: "TC",
    VO: "VO",
  };
  return eventTypeMap[category] || category || "TC";
}

function extractCoordinatesFromPoint(content: string): string {
  const pointMatch = content.match(
    /<georss:point>([\d\.\-\s,]+)<\/georss:point>/
  );
  if (pointMatch) {
    const coords = pointMatch[1].trim().split(/[\s,]+/);
    if (coords.length >= 2) {
      return `${coords[1]}, ${coords[0]}`;
    }
  }
  return "";
}

function extractEventNameFromTitle(title: string, eventType: string): string {
  if (eventType === "TC") {
    const cycloneMatch = title.match(/cyclone\s+([A-Z0-9\-]+)/i);
    if (cycloneMatch) return cycloneMatch[1];
  }

  if (eventType === "EQ") {
    const magnitudeMatch = title.match(/magnitude\s+(\d+\.?\d*)/i);
    if (magnitudeMatch) return `M${magnitudeMatch[1]}`;
  }

  return `${eventType}-Event`;
}

function extractLocationFromTitle(title: string): string {
  const locationPatterns = [
    /in\s+([A-Za-z\s,]+?)(?:\s+\d|$)/,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*$/,
  ];

  for (const pattern of locationPatterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }

  return "";
}

function mapEventTypeToFullName(eventType: string): string {
  const typeMap: { [key: string]: string } = {
    EQ: "Earthquake",
    FL: "Flood",
    WF: "Wildfire",
    DR: "Drought",
    TC: "Tropical Cyclone",
    VO: "Volcano",
  };
  return typeMap[eventType] || "Unknown Event";
}

function mapCountryToISO3(country: string): string {
  const countryMap: { [key: string]: string } = {
    Japan: "JPN",
    Philippines: "PHL",
    Indonesia: "IDN",
    Bangladesh: "BGD",
    "United States": "USA",
    Turkey: "TUR",
  };
  return countryMap[country] || "UNK";
}

function mapAlertLevelToScore(alertLevel: string): number {
  switch (alertLevel) {
    case "Red":
      return 3;
    case "Orange":
      return 2;
    case "Green":
      return 1;
    default:
      return 1;
  }
}

function getSeverityUnit(eventType: string): string {
  switch (eventType) {
    case "TC":
      return "km/h";
    case "EQ":
      return "magnitude";
    case "FL":
      return "mm";
    default:
      return "scale";
  }
}

function buildSeverityDescription(eventType: string, value: number): string {
  switch (eventType) {
    case "TC":
      return `Tropical Storm (maximum wind speed of ${Math.round(value)} km/h)`;
    case "EQ":
      return `Earthquake magnitude ${value}`;
    case "FL":
      return `Flood level ${value}mm`;
    default:
      return `Severity level ${value}`;
  }
}

function getPopulationUnit(eventType: string): string {
  switch (eventType) {
    case "TC":
      return "Pop74";
    case "EQ":
      return "PopExp";
    default:
      return "Pop";
  }
}

function calculateVulnerabilityValue(
  alertLevel: string,
  population: number
): number {
  if (alertLevel === "Red") return 3;
  if (alertLevel === "Orange") return 2;
  if (population > 1000000) return 2;
  return 1;
}

function calculateVulnerabilityLevel(
  alertLevel: string,
  population: number
): string {
  const value = calculateVulnerabilityValue(alertLevel, population);
  switch (value) {
    case 3:
      return "High";
    case 2:
      return "Medium";
    default:
      return "Low";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: "Event ID is required",
        },
        { status: 400 }
      );
    }

    const incident = await fetchIncidentByEventId(eventId);

    if (!incident) {
      return NextResponse.json(
        {
          success: false,
          error: "Incident not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: incident,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Error fetching incident details:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch incident details",
      },
      { status: 500 }
    );
  }
}
