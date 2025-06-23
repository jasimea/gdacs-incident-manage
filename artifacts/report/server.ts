import { createDocumentHandler } from "@/lib/artifacts/server";
import {
  generateReport,
  fetchGDACSIncidentData,
  generateHTMLReport,
  type GDACSIncidentData,
} from "@/lib/report-generator";
import {
  getRecommendedProducts,
  type ProductListRequestBody,
  type IncidentDetails,
} from "@/lib/product-recommendations";

// Re-export the generateReport function for convenience
export { generateReport } from "@/lib/report-generator";

export const reportDocumentHandler = createDocumentHandler({
  kind: "report",
  onCreateDocument: async ({ id, options, title, dataStream, session }) => {
    const { eventId, products } = options;

    // Fetch incident data from GDACS
    const incidentData = await fetchGDACSIncidentData(eventId);
    console.log("incidentData", incidentData);

    if (!incidentData) {
      throw new Error(`Failed to fetch incident data for event ID: ${eventId}`);
    }

    // Convert GDACS data to our IncidentDetails format
    const incidentDetails: IncidentDetails = {
      eventId: incidentData.eventId,
      title: incidentData.title,
      description: incidentData.description,
      eventType: incidentData.eventType,
      alertLevel: incidentData.alertLevel,
      country: incidentData.country,
      affectedPopulation: incidentData.affectedPopulation || 0,
      coordinates: incidentData.coordinates
        ? `${incidentData.coordinates.lat},${incidentData.coordinates.lng}`
        : undefined,
    };

    // Prepare request body for product recommendations
    const requestBody: ProductListRequestBody = {
      eventType: incidentData.eventType,
      alertLevel: incidentData.alertLevel,
      affectedPopulation: incidentData.affectedPopulation,
      region: incidentData.country,
    };

    // Get recommended products using the shared logic
    const recommendedProducts = await getRecommendedProducts(
      incidentDetails,
      requestBody
    );

    // If specific product codes are provided in options, filter to only those
    const filteredProducts =
      products && products.length > 0
        ? recommendedProducts.filter((product) =>
            products.some((p: any) => p.itemCode === product.itemCode)
          )
        : recommendedProducts;

    // Generate the HTML report
    const htmlContent = await generateHTMLReport(
      incidentData,
      filteredProducts
    );

    // Stream the content
    dataStream.writeData({
      type: "text-delta",
      content: htmlContent,
    });

    return htmlContent;
  },
  onUpdateDocument: async ({ document, description, dataStream, session }) => {
    console.log("Update");
    // For updates, we could regenerate the report with new data
    // For now, just return the existing content
    return document.content || "";
  },
});
