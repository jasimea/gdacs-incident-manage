import { getAllSampleProducts } from "@/lib/sample-product-data";

export interface ProductListRequestBody {
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

export interface ProductRecommendation {
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

export interface IncidentDetails {
  eventId: string;
  title: string;
  description: string;
  eventType: string;
  alertLevel: string;
  country: string;
  affectedPopulation: number;
  coordinates?: string;
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
  incidentDetails: IncidentDetails,
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

export function getRecommendedProducts(
  incidentDetails: IncidentDetails,
  requestBody: ProductListRequestBody = {},
  allProducts?: any[]
): ProductRecommendation[] {
  // Use provided products or get all sample products
  const products = allProducts || getAllSampleProducts();
  const recommendations: ProductRecommendation[] = [];

  // Determine priority categories based on incident type and severity
  const priorityCategories = determinePriorityCategories(
    incidentDetails.eventType,
    incidentDetails.alertLevel,
    incidentDetails.affectedPopulation
  );

  for (const product of products) {
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

// Utility function to convert ProductRecommendation to simple format for reports
export function convertToSimpleProductFormat(
  recommendations: ProductRecommendation[]
) {
  return recommendations.map((product) => ({
    itemCode: product.itemCode || product.id,
    name: product.name,
    quantity: product.estimatedQuantityNeeded || product.quantity,
    category: product.categoryName,
    description: product.description,
  }));
}
