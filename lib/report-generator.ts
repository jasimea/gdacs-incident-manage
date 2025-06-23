import { myProvider } from "@/lib/ai/providers";
import { generateObject } from "ai";
import { z } from "zod";
import {
  getRecommendedProducts,
  type ProductListRequestBody,
  type IncidentDetails,
  type ProductRecommendation,
} from "@/lib/product-recommendations";

export interface GDACSIncidentData {
  eventId: string;
  title: string;
  eventType: string;
  alertLevel: string;
  country: string;
  startDate: string;
  duration: string;
  impact: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  affectedPopulation?: number;
  casualties?: number;
}

export async function fetchGDACSIncidentData(
  eventId: string
): Promise<GDACSIncidentData | null> {
  try {
    const response = await fetch(`https://www.gdacs.org/xml/rss.xml`);
    if (!response.ok) {
      throw new Error(`Failed to fetch GDACS data: ${response.status}`);
    }

    const html = await response.text();
    const { object } = await generateObject({
      model: myProvider.languageModel("chat-model"),
      prompt: `
  You are a helpful assistant that can extract the incident data from the GDACS RSS feed.
  The RSS feed is in XML format.
  The incident data is in the title of the RSS item.
 
Extract the incident data from the RSS feed. Extract only the information about the passed event id ${eventId}. check gdacs:eventid property for matching the event id.

here is the rss feed:
${html}
`,
      schema: z.object({
        eventId: z.string(),
        title: z.string(),
        eventType: z.string(),
        alertLevel: z.string(),
        country: z.string(),
        startDate: z.string(),
        duration: z.string(),
        impact: z.string(),
        description: z.string(),
        coordinates: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
        affectedPopulation: z.number(),
        casualties: z.number(),
      }),
    });

    return object;
  } catch (error) {
    console.error("Error fetching GDACS data:", error);
    return null;
  }
}

export async function generateHTMLReport(
  incidentData: GDACSIncidentData,
  products: ProductRecommendation[]
): Promise<string> {
  console.log("Generating HTML Report");

  // Calculate total units
  const totalUnits = products.reduce(
    (sum, product) => sum + product.estimatedQuantityNeeded,
    0
  );

  // Format date
  const generatedDate = new Date().toLocaleDateString("en-GB");
  const generatedTime = new Date().toLocaleTimeString("en-GB");

  // Get priority color and text based on alert level
  const getPriorityInfo = (alertLevel: string) => {
    switch (alertLevel?.toLowerCase()) {
      case "red":
        return { color: "bg-red-600", text: "High Priority" };
      case "orange":
        return { color: "bg-orange-500", text: "Medium Priority" };
      case "green":
        return { color: "bg-green-600", text: "Low Priority" };
      default:
        return { color: "bg-gray-600", text: "Unknown Priority" };
    }
  };

  const priorityInfo = getPriorityInfo(incidentData.alertLevel);

  // Generate product rows
  const productRows = products
    .map(
      (product, index) => `
    <tr class="${index % 2 === 0 ? "bg-white" : "bg-gray-50"}">
      <td class="px-3 py-2 text-sm font-mono font-medium text-gray-900">
        ${product.itemCode || "N/A"}
      </td>
      <td class="px-3 py-2 text-sm font-medium text-gray-900">
        ${product.name || "N/A"}
      </td>
      <td class="px-3 py-2 text-sm text-gray-600">
        ${product.categoryName || "N/A"}
      </td>
      <td class="px-3 py-2 text-center">
        <span class="inline-block bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
          ${product.estimatedQuantityNeeded?.toLocaleString() || "0"}
        </span>
      </td>
      <td class="px-3 py-2 text-sm text-gray-600">
        ${product.description || "No description available"}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <div class="max-w-5xl mx-auto bg-white border-t border-gray-200">
  <div class="border-b-4 border-gray-800 bg-white px-8 py-6">
    <div class="text-center mb-4">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">
        HUMANITARIAN RESPONSE REPORT
      </h1>
      <div class="w-16 h-0.5 bg-gray-800 mx-auto mb-3"></div>
    </div>
    <div class="text-center">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">
        ${incidentData.title || "Incident Response"} - ${
          incidentData.country || "Unknown Region"
        }
      </h2>
      <div
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded ${
          priorityInfo.color
        } text-white font-medium text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-triangle-alert"
        >
          <path
            d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
          ></path>
          <path d="M12 9v4"></path>
          <path d="M12 17h.01"></path></svg
        >${priorityInfo.text}
      </div>
    </div>
    <div class="flex justify-between items-center mt-4 text-xs text-gray-600">
      <div>Report ID: ${incidentData.eventId || "N/A"}</div>
      <div>Generated: ${generatedDate}</div>
    </div>
  </div>
  <div class="px-8 py-6">
    <section class="mb-8">
      <h3
        class="text-lg font-bold text-gray-900 mb-4 pb-1 border-b-2 border-gray-200"
      >
        EXECUTIVE SUMMARY
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <h4 class="font-semibold text-gray-800 mb-2">Incident Information</h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-map-pin text-gray-500"
              >
                <path
                  d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
                ></path>
                <circle cx="12" cy="10" r="3"></circle></svg
              ><span class="text-gray-600">Location:</span
              ><span class="font-medium">${
                incidentData.country || "Unknown"
              }</span>
            </div>
            <div class="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-package text-gray-500"
              >
                <path
                  d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"
                ></path>
                <path d="M12 22V12"></path>
                <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path>
                <path d="m7.5 4.27 9 5.15"></path></svg
              ><span class="text-gray-600">Event Type:</span
              ><span class="font-medium">${
                incidentData.eventType || "Natural Disaster"
              }</span>
            </div>
            <div class="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-calendar text-gray-500"
              >
                <path d="M8 2v4"></path>
                <path d="M16 2v4"></path>
                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                <path d="M3 10h18"></path></svg
              ><span class="text-gray-600">Start Date:</span
              ><span class="font-medium">${
                incidentData.startDate || "Unknown"
              }</span>
            </div>
            <div class="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-clock text-gray-500"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline></svg
              ><span class="text-gray-600">Duration:</span
              ><span class="font-medium">${
                incidentData.duration || "Ongoing"
              }</span>
            </div>
            <div class="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-trending-up text-gray-500"
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline></svg
              ><span class="text-gray-600">Impact Level:</span
              ><span class="font-medium">${
                incidentData.impact || "Unknown"
              }</span>
            </div>
          </div>
        </div>
        <div class="space-y-3">
          <h4 class="font-semibold text-gray-800 mb-2">Key Metrics</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 p-3 rounded border">
              <div class="flex items-center gap-2 mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-users text-gray-600"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg
                ><span
                  class="text-xs font-medium text-gray-600 uppercase tracking-wide"
                  >Affected Population</span
                >
              </div>
              <div class="text-xl font-bold text-gray-900">${
                incidentData.affectedPopulation?.toLocaleString() || "Unknown"
              }</div>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <div class="flex items-center gap-2 mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-activity text-gray-600"
                >
                  <path
                    d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
                  ></path></svg
                ><span
                  class="text-xs font-medium text-gray-600 uppercase tracking-wide"
                  >Casualties</span
                >
              </div>
              <div class="text-xl font-bold text-gray-900">${
                incidentData.casualties?.toLocaleString() || "Unknown"
              }</div>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <div class="flex items-center gap-2 mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-package text-gray-600"
                >
                  <path
                    d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"
                  ></path>
                  <path d="M12 22V12"></path>
                  <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path>
                  <path d="m7.5 4.27 9 5.15"></path></svg
                ><span
                  class="text-xs font-medium text-gray-600 uppercase tracking-wide"
                  >Product Types</span
                >
              </div>
              <div class="text-xl font-bold text-gray-900">${
                products.length
              }</div>
            </div>
            <div class="bg-gray-50 p-3 rounded border">
              <div class="flex items-center gap-2 mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-trending-up text-gray-600"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline></svg
                ><span
                  class="text-xs font-medium text-gray-600 uppercase tracking-wide"
                  >Total Units</span
                >
              </div>
              <div class="text-xl font-bold text-gray-900">${totalUnits.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="mb-8">
      <h3
        class="text-lg font-bold text-gray-900 mb-4 pb-1 border-b-2 border-gray-200"
      >
        RECOMMENDED HUMANITARIAN SUPPLIES
      </h3>
      <div class="overflow-hidden border border-gray-200 rounded">
        <table class="w-full">
          <thead class="bg-gray-800 text-white">
            <tr>
              <th
                class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
              >
                Code
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
              >
                Product Name
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
              >
                Category
              </th>
              <th
                class="px-3 py-2 text-center text-xs font-medium uppercase tracking-wider"
              >
                Quantity
              </th>
              <th
                class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
              >
                Description
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${productRows}
          </tbody>
        </table>
      </div>
    </section>
  </div>
  <div class="bg-gray-800 text-white px-8 py-4 border-t">
    <div class="flex justify-between items-center text-sm">
      <div>Generated by AI Incident Response Coordinator</div>
      <div>${generatedDate}, ${generatedTime}</div>
    </div>
  </div>
</div>
  `;
}

export async function generateReport(eventId: string, productCodes?: string[]) {
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

  // If specific product codes are provided, filter to only those
  const filteredProducts =
    productCodes && productCodes.length > 0
      ? recommendedProducts.filter((product) =>
          productCodes.includes(product.itemCode || "")
        )
      : recommendedProducts;

  // Generate the HTML report
  const htmlContent = await generateHTMLReport(incidentData, filteredProducts);

  return htmlContent;
}
