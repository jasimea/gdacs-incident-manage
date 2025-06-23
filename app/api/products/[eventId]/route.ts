import { NextRequest, NextResponse } from "next/server";
import {
  getRecommendedProducts,
  type ProductListRequestBody,
  type IncidentDetails,
} from "@/lib/product-recommendations";

async function fetchIncidentDetails(eventId: string) {
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
    return parseGDACSXMLForEventId(xmlText, eventId);
  } catch (error) {
    console.error("Error fetching GDACS incident:", error);
    return null;
  }
}

function parseGDACSXMLForEventId(xmlText: string, targetEventId: string) {
  // Extract items using regex
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    const title = extractTagContent(itemContent, "title");
    const description = extractTagContent(itemContent, "description");
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
      extractEventIdFromLink(extractTagContent(itemContent, "link"));

    // Check if this is the incident we're looking for
    if (eventId !== targetEventId) {
      continue;
    }

    // Extract incident details
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
    const coordinates =
      extractTagContent(itemContent, "gdacs:coordinates") ||
      extractCoordinatesFromPoint(itemContent);

    // Parse population value
    const populationMatch = population.match(/(\d+)/);
    const populationValue = populationMatch ? parseInt(populationMatch[1]) : 0;

    return {
      eventId,
      title,
      description,
      eventType,
      alertLevel,
      country,
      affectedPopulation: populationValue,
      coordinates,
    };
  }

  return null;
}

// Helper functions (reused from incident route)
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

// Helper function to map category ID to category name
function mapCategoryIdToName(categoryId: string): string {
  const categoryMap: { [key: string]: string } = {
    "blankets-bedding": "Blankets & Bedding",
    "winterization-kits": "Winterization Kits",
    "kitchen-sets": "Kitchen Sets",
    "first-aid": "First Aid",
    "water-sanitation": "Water & Sanitation",
    "ready-to-eat-food": "Ready-to-Eat Food",
    "shelter-tents": "Shelter & Tents",
  };
  return categoryMap[categoryId] || categoryId;
}

// Helper function to get category icon
function getCategoryIcon(categoryName: string): string {
  const iconMap: { [key: string]: string } = {
    "Blankets & Bedding": "blanket",
    "Winterization Kits": "winter",
    "Kitchen Sets": "kitchen",
    "First Aid": "first-aid",
    "Water & Sanitation": "water",
    "Ready-to-Eat Food": "food",
    "Shelter & Tents": "tent",
  };
  return iconMap[categoryName] || "package";
}

// Helper function to get category color
function getCategoryColor(categoryName: string): string {
  const colorMap: { [key: string]: string } = {
    "Blankets & Bedding": "#4A90E2",
    "Winterization Kits": "#7ED321",
    "Kitchen Sets": "#F5A623",
    "First Aid": "#D0021B",
    "Water & Sanitation": "#50E3C2",
    "Ready-to-Eat Food": "#9013FE",
    "Shelter & Tents": "#8B572A",
  };
  return colorMap[categoryName] || "#6B7280";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const requestBody: ProductListRequestBody = await request.json();

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: "Event ID is required",
        },
        { status: 400 }
      );
    }

    // Fetch incident details from GDACS
    const incidentDetails = await fetchIncidentDetails(eventId);

    if (!incidentDetails) {
      return NextResponse.json(
        {
          success: false,
          error: "Incident not found or unable to fetch details",
        },
        { status: 404 }
      );
    }

    // Convert the incident data to the format expected by our shared function
    const incidentDetailsFormatted: IncidentDetails = {
      eventId: incidentDetails.eventId,
      title: incidentDetails.title,
      description: incidentDetails.description || "",
      eventType: incidentDetails.eventType,
      alertLevel: incidentDetails.alertLevel,
      country: incidentDetails.country,
      affectedPopulation: incidentDetails.affectedPopulation || 0,
      coordinates: incidentDetails.coordinates,
    };

    // Get recommended products using the shared logic
    const recommendedProducts = getRecommendedProducts(
      incidentDetailsFormatted,
      requestBody
    );

    return NextResponse.json({
      success: true,
      data: {
        incidentDetails: {
          eventId: incidentDetails.eventId,
          title: incidentDetails.title,
          eventType: incidentDetails.eventType,
          alertLevel: incidentDetails.alertLevel,
          country: incidentDetails.country,
          affectedPopulation: incidentDetails.affectedPopulation,
        },
        products: recommendedProducts,
        totalProducts: recommendedProducts.length,
        requestParameters: requestBody,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Error fetching product recommendations:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
