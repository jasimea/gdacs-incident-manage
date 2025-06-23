import {
  getRecommendedProducts,
  type ProductListRequestBody,
  type IncidentDetails,
} from "./product-recommendations";
import { type GDACSIncidentData, generateReport } from "./report-generator";

/**
 * GDACS Incident Data Utilities
 *
 * This module provides utilities for working with GDACS incident data and
 * converting it to the format expected by our product recommendation system.
 */

/**
 * Converts GDACS incident data to the IncidentDetails format used by the
 * product recommendation system.
 */
export function convertGDACSToIncidentDetails(
  gdacsData: GDACSIncidentData
): IncidentDetails {
  return {
    eventId: gdacsData.eventId,
    title: gdacsData.title,
    description: gdacsData.description || gdacsData.impact || "",
    eventType: gdacsData.eventType,
    alertLevel: gdacsData.alertLevel,
    country: gdacsData.country,
    affectedPopulation: gdacsData.affectedPopulation || 0,
    coordinates:
      typeof gdacsData.coordinates === "string"
        ? gdacsData.coordinates
        : gdacsData.coordinates
          ? `${gdacsData.coordinates.lat},${gdacsData.coordinates.lng}`
          : undefined,
  };
}

/**
 * Example function showing how to get product recommendations for an incident
 *
 * @param gdacsData - The incident data from GDACS
 * @param culturalRequirements - Optional cultural requirements for filtering products
 * @param weatherConditions - Optional weather conditions affecting the disaster
 * @returns Array of recommended products
 */
export function getIncidentProductRecommendations(
  gdacsData: GDACSIncidentData,
  options: {
    culturalRequirements?: {
      isHalal?: boolean;
      isKosher?: boolean;
      isVegetarian?: boolean;
      isVegan?: boolean;
    };
    weatherConditions?: string;
    region?: string;
  } = {}
) {
  // Convert GDACS data to our standard format
  const incidentDetails = convertGDACSToIncidentDetails(gdacsData);

  // Prepare the request body with optional parameters
  const requestBody: ProductListRequestBody = {
    eventType: gdacsData.eventType,
    alertLevel: gdacsData.alertLevel,
    affectedPopulation: gdacsData.affectedPopulation,
    region: options.region || gdacsData.country,
    weatherConditions: options.weatherConditions,
    culturalRequirements: options.culturalRequirements,
  };

  // Get recommendations using the shared logic
  return getRecommendedProducts(incidentDetails, requestBody);
}

/**
 * Example: Get recommendations for earthquake response
 */
export function getEarthquakeRecommendations(
  affectedPopulation: number,
  country: string
) {
  const earthquakeIncident: GDACSIncidentData = {
    eventId: "example-eq-001",
    title: `Earthquake in ${country}`,
    description: `Major earthquake affecting ${affectedPopulation} people in ${country}`,
    eventType: "EQ",
    alertLevel: "Red",
    country: country,
    startDate: new Date().toISOString().split("T")[0],
    duration: "Ongoing",
    impact: "High",
    affectedPopulation: affectedPopulation,
  };

  return getIncidentProductRecommendations(earthquakeIncident);
}

/**
 * Example: Get recommendations for flood response with cultural requirements
 */
export function getFloodRecommendationsWithCultural(
  affectedPopulation: number,
  country: string,
  isHalal: boolean = false
) {
  const floodIncident: GDACSIncidentData = {
    eventId: "example-fl-001",
    title: `Flood in ${country}`,
    description: `Severe flooding affecting ${affectedPopulation} people in ${country}`,
    eventType: "FL",
    alertLevel: "Orange",
    country: country,
    startDate: new Date().toISOString().split("T")[0],
    duration: "Ongoing",
    impact: "Medium",
    affectedPopulation: affectedPopulation,
  };

  return getIncidentProductRecommendations(floodIncident, {
    culturalRequirements: {
      isHalal: isHalal,
    },
  });
}

/**
 * Example: Generate a complete HTML report for an incident
 */
export async function generateIncidentReport(
  eventId: string,
  productCodes?: string[]
) {
  return await generateReport(eventId, productCodes);
}
