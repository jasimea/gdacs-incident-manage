import { NextRequest, NextResponse } from "next/server";
import { getAllSampleProducts } from "@/lib/sample-product-data";

interface ProductListRequestBody {
  eventType?: string;
  alertLevel?: string;
  affectedPopulation?: number;
  region?: string;
  weatherConditions?: string;
  culturalRequirements?: {
    isHalal?: boolean;
    isKosher?: boolean;
    isVegetarian?: boolean;
    isVegan?: boolean;
  };
}

interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  specification: string;
  quantity: number;
  unit: string;
  size?: string;
  weight?: string;
  volume?: string;
  dimensions?: string;
  productType: string;
  isKit: boolean;
  kitContents?: any;
  referencePicture?: string;
  itemCode?: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  recommendationReason: string;
  priority: number;
  estimatedQuantityNeeded: number;
}

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

function getRecommendedProducts(
  allProducts: any[],
  incidentDetails: any,
  requestBody: ProductListRequestBody
): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = [];

  // Determine priority categories based on incident type and severity
  const priorityCategories = determinePriorityCategories(
    incidentDetails.eventType,
    incidentDetails.alertLevel,
    incidentDetails.affectedPopulation
  );

  for (const product of allProducts) {
    // Map category from categoryId to actual category name
    const categoryName = mapCategoryIdToName(product.categoryId);

    // Apply cultural filters if specified
    if (requestBody.culturalRequirements) {
      const cultural = requestBody.culturalRequirements;
      if (cultural.isHalal && !product.isHalal) continue;
      if (cultural.isKosher && !product.isKosher) continue;
      if (cultural.isVegetarian && !product.isVegetarian) continue;
      if (cultural.isVegan && !product.isVegan) continue;
    }

    // Calculate priority and recommendation reason
    const categoryPriority = priorityCategories[categoryName] || 0;
    if (categoryPriority === 0) continue; // Skip non-priority categories

    const recommendationReason = generateRecommendationReason(
      { ...product, categoryName },
      incidentDetails,
      categoryPriority
    );

    const estimatedQuantity = calculateEstimatedQuantity(
      { ...product, categoryName },
      incidentDetails.affectedPopulation,
      incidentDetails.alertLevel
    );

    recommendations.push({
      id: product.itemCode || `product-${Math.random()}`, // Use itemCode as ID
      name: product.name,
      description: product.description,
      specification: product.specification,
      quantity: product.quantity,
      unit: product.unit,
      size: product.size,
      weight: product.weight,
      volume: product.volume,
      dimensions: product.dimensions,
      productType: product.productType,
      isKit: product.isKit,
      kitContents: product.kitContents,
      referencePicture: product.referencePicture,
      itemCode: product.itemCode,
      categoryName: categoryName,
      categoryIcon: getCategoryIcon(categoryName),
      categoryColor: getCategoryColor(categoryName),
      recommendationReason,
      priority: categoryPriority,
      estimatedQuantityNeeded: estimatedQuantity,
    });
  }

  // Sort by priority (higher first) then by category
  return recommendations.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return a.categoryName.localeCompare(b.categoryName);
  });
}

function determinePriorityCategories(
  eventType: string,
  alertLevel: string,
  affectedPopulation: number
): { [categoryName: string]: number } {
  const priorities: { [categoryName: string]: number } = {};

  // Base priorities for all disasters
  priorities["First Aid"] = 5; // Always high priority
  priorities["Water & Sanitation"] = 5; // Always high priority
  priorities["Ready-to-Eat Food"] = 4; // Always important

  // Event type specific priorities
  switch (eventType) {
    case "EQ": // Earthquake
      priorities["Shelter & Tents"] = 5;
      priorities["Blankets & Bedding"] = 4;
      priorities["Kitchen Sets"] = 3;
      break;
    case "FL": // Flood
      priorities["Water & Sanitation"] = 5;
      priorities["Blankets & Bedding"] = 4;
      priorities["Kitchen Sets"] = 3;
      break;
    case "TC": // Tropical Cyclone
      priorities["Shelter & Tents"] = 5;
      priorities["Blankets & Bedding"] = 4;
      priorities["Kitchen Sets"] = 3;
      priorities["Winterization Kits"] = 2;
      break;
    case "WF": // Wildfire
      priorities["Shelter & Tents"] = 4;
      priorities["Blankets & Bedding"] = 3;
      break;
    case "DR": // Drought
      priorities["Water & Sanitation"] = 5;
      priorities["Ready-to-Eat Food"] = 5;
      break;
    case "VO": // Volcano
      priorities["Shelter & Tents"] = 4;
      priorities["Blankets & Bedding"] = 3;
      break;
  }

  // Adjust priorities based on alert level
  if (alertLevel === "Red") {
    // Increase all priorities for red alerts
    Object.keys(priorities).forEach((key) => {
      priorities[key] = Math.min(priorities[key] + 1, 5);
    });
  } else if (alertLevel === "Green") {
    // Decrease some priorities for green alerts
    Object.keys(priorities).forEach((key) => {
      if (priorities[key] <= 3) {
        priorities[key] = Math.max(priorities[key] - 1, 1);
      }
    });
  }

  // Adjust for large affected populations
  if (affectedPopulation > 100000) {
    priorities["Kitchen Sets"] = Math.min(
      (priorities["Kitchen Sets"] || 0) + 1,
      5
    );
    priorities["Shelter & Tents"] = Math.min(
      (priorities["Shelter & Tents"] || 0) + 1,
      5
    );
  }

  return priorities;
}

function generateRecommendationReason(
  product: any,
  incidentDetails: any,
  priority: number
): string {
  const eventTypeNames: { [key: string]: string } = {
    EQ: "earthquake",
    FL: "flood",
    TC: "tropical cyclone",
    WF: "wildfire",
    DR: "drought",
    VO: "volcanic eruption",
  };

  const eventName = eventTypeNames[incidentDetails.eventType] || "disaster";

  // Category-specific recommendation reasons
  switch (product.categoryName) {
    case "First Aid":
      return `Essential medical supplies for treating injuries during ${eventName} response.`;
    case "Water & Sanitation":
      return `Critical for ensuring safe drinking water and sanitation in ${eventName} affected areas.`;
    case "Ready-to-Eat Food":
      return `Immediate nutrition support for displaced populations from ${eventName}.`;
    case "Shelter & Tents":
      return `Emergency shelter for families displaced by ${eventName}.`;
    case "Blankets & Bedding":
      return `Warmth and comfort for those affected by ${eventName}.`;
    case "Kitchen Sets":
      return `Essential cooking equipment for displaced families from ${eventName}.`;
    case "Winterization Kits":
      return `Protection from cold weather conditions following ${eventName}.`;
    default:
      return `Recommended support item for ${eventName} response operations.`;
  }
}

function calculateEstimatedQuantity(
  product: any,
  affectedPopulation: number,
  alertLevel: string
): number {
  // Base calculation factors
  let baseQuantity = Math.ceil(affectedPopulation / 1000); // 1 unit per 1000 people as baseline

  // Adjust based on product type
  switch (product.categoryName) {
    case "First Aid":
      baseQuantity = Math.ceil(affectedPopulation / 500); // 1 kit per 500 people
      break;
    case "Water & Sanitation":
      baseQuantity = Math.ceil(affectedPopulation / 100); // 1 bucket per 100 people
      break;
    case "Ready-to-Eat Food":
      baseQuantity = Math.ceil(affectedPopulation / 50); // 1 parcel per 50 people
      break;
    case "Shelter & Tents":
      baseQuantity = Math.ceil(affectedPopulation / 5); // 1 tent per 5 people (family)
      break;
    case "Blankets & Bedding":
      baseQuantity = Math.ceil(affectedPopulation / 2); // 1 blanket per 2 people
      break;
    case "Kitchen Sets":
      baseQuantity = Math.ceil(affectedPopulation / 5); // 1 set per family
      break;
    case "Winterization Kits":
      baseQuantity = Math.ceil(affectedPopulation / 3); // 1 kit per 3 people
      break;
  }

  // Adjust based on alert level
  if (alertLevel === "Red") {
    baseQuantity = Math.ceil(baseQuantity * 1.5); // Increase by 50%
  } else if (alertLevel === "Green") {
    baseQuantity = Math.ceil(baseQuantity * 0.7); // Reduce by 30%
  }

  return Math.max(1, baseQuantity); // Minimum 1 unit
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

    // Get all available products
    const allProducts = getAllSampleProducts();

    // Get recommended products based on incident details and request parameters
    const recommendedProducts = getRecommendedProducts(
      allProducts,
      incidentDetails,
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
