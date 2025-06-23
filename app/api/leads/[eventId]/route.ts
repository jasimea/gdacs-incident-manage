import { NextRequest, NextResponse } from "next/server";

interface CompanySearchRequestBody {
  location?: string;
  keywords?: string[];
  organizationType?: string;
  limit?: number;
  offset?: number;
}

interface ApolloCompany {
  id: string;
  name: string;
  website_url?: string;
  blog_url?: string;
  angellist_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  primary_phone?: any;
  languages?: string[];
  alexa_ranking?: number;
  phone?: string;
  linkedin_uid?: string;
  founded_year?: number;
  publicly_traded_symbol?: string;
  publicly_traded_exchange?: string;
  logo_url?: string;
  crunchbase_url?: string;
  primary_domain?: string;
  sanitized_phone?: string;
  owned_by_organization_id?: string;
  organization_revenue_printed?: string;
  organization_revenue?: number;
  intent_strength?: number;
  show_intent?: boolean;
  has_intent_signal_account?: boolean;
  intent_signal_account?: any;
  organization_headcount_six_month_growth?: number;
  organization_headcount_twelve_month_growth?: number;
  organization_headcount_twenty_four_month_growth?: number;
  // Additional fields that might be present
  industry?: string;
  organization_raw_address?: string;
  employees_count?: number;
  description?: string;
}

interface ApolloResponse {
  organizations?: ApolloCompany[];
  total_results?: number;
  pagination?: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

async function fetchCompaniesFromApollo(
  location: string = "qatar",
  keywords: string[] = ["non profit"],
  limit: number = 25,
  offset: number = 0
): Promise<ApolloResponse | null> {
  try {
    const url = "https://api.apollo.io/api/v1/mixed_companies/search";

    // Build query parameters
    const params = new URLSearchParams();
    params.append("organization_locations[]", location);

    // Add keywords as query parameters
    keywords.forEach((keyword) => {
      params.append("q_organization_keyword_tags[]", keyword);
    });

    if (limit) params.append("per_page", limit.toString());
    if (offset)
      params.append("page", Math.floor(offset / limit + 1).toString());

    const fullUrl = `${url}?${params.toString()}`;

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        "x-api-key": process.env.APOLLO_API_KEY || "BE1PLiqhZH6xpXBnWzhq-A",
      },
      // Add request body if needed for more complex searches
      body: JSON.stringify({
        // You can add additional search criteria here if needed
      }),
    };

    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      throw new Error(`Apollo API error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching companies from Apollo:", error);
    return null;
  }
}

function getDefaultSearchCriteria(eventType?: string, alertLevel?: string) {
  // Customize search based on incident type
  const baseKeywords = ["non profit", "humanitarian", "relief", "aid"];

  switch (eventType?.toLowerCase()) {
    case "eq": // Earthquake
      return {
        keywords: [
          ...baseKeywords,
          "disaster relief",
          "emergency response",
          "rescue",
        ],
        priority: ["medical", "shelter", "rescue teams"],
      };
    case "fl": // Flood
      return {
        keywords: [
          ...baseKeywords,
          "flood relief",
          "water management",
          "emergency",
        ],
        priority: ["water", "sanitation", "evacuation"],
      };
    case "tc": // Tropical Cyclone
      return {
        keywords: [
          ...baseKeywords,
          "storm relief",
          "emergency shelter",
          "disaster",
        ],
        priority: ["shelter", "emergency supplies", "communications"],
      };
    case "wf": // Wildfire
      return {
        keywords: [...baseKeywords, "fire relief", "evacuation", "emergency"],
        priority: ["evacuation", "medical", "shelter"],
      };
    case "dr": // Drought
      return {
        keywords: [
          ...baseKeywords,
          "water relief",
          "food security",
          "agriculture",
        ],
        priority: ["water", "food", "agricultural support"],
      };
    case "vo": // Volcano
      return {
        keywords: [
          ...baseKeywords,
          "volcanic relief",
          "evacuation",
          "air quality",
        ],
        priority: ["evacuation", "medical", "air filtration"],
      };
    default:
      return {
        keywords: baseKeywords,
        priority: ["general relief", "humanitarian aid"],
      };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const requestBody: CompanySearchRequestBody = await request.json();

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: "Event ID is required",
        },
        { status: 400 }
      );
    }

    // Get search criteria based on incident type (you might want to fetch incident details first)
    const searchCriteria = getDefaultSearchCriteria(
      requestBody.organizationType
      // You could pass alert level here if available
    );

    // Use request body parameters or defaults
    const location = requestBody.location || "qatar";
    const keywords = requestBody.keywords || searchCriteria.keywords;
    const limit = requestBody.limit || 25;
    const offset = requestBody.offset || 0;

    // Fetch companies from Apollo API
    const apolloResponse = await fetchCompaniesFromApollo(
      location,
      keywords,
      limit,
      offset
    );

    if (!apolloResponse) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch companies from Apollo API",
        },
        { status: 500 }
      );
    }

    // Transform the response to match our needs
    const transformedCompanies =
      apolloResponse.organizations?.map((company) => ({
        id: company.id,
        name: company.name,
        website: company.website_url,
        phone: company.phone || company.sanitized_phone,
        industry: company.industry || "Organization", // Fallback if industry not available
        address: company.organization_raw_address || "Address not available",
        linkedin: company.linkedin_url,
        twitter: company.twitter_url,
        facebook: company.facebook_url,
        domain: company.primary_domain,
        employeeCount: company.employees_count,
        foundedYear: company.founded_year,
        description:
          company.description ||
          `${company.name} is a professional organization.`,
        logo: company.logo_url,
        // Apollo-specific fields
        revenue: company.organization_revenue,
        revenueText: company.organization_revenue_printed,
        headcountGrowth: {
          sixMonth: company.organization_headcount_six_month_growth,
          twelveMonth: company.organization_headcount_twelve_month_growth,
          twentyFourMonth:
            company.organization_headcount_twenty_four_month_growth,
        },
        // Add relevance score based on keywords match
        relevanceScore: calculateRelevanceScore(company, keywords),
        // Add suggested involvement based on incident type
        suggestedRole: getSuggestedRole(company, searchCriteria.priority),
      })) || [];

    // Sort by relevance score
    transformedCompanies.sort(
      (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
    );

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        companies: transformedCompanies,
        totalCompanies:
          apolloResponse.total_results || transformedCompanies.length,
        pagination: apolloResponse.pagination,
        searchCriteria: {
          location,
          keywords,
          limit,
          offset,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Error fetching leads:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch company leads",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function calculateRelevanceScore(
  company: ApolloCompany,
  keywords: string[]
): number {
  let score = 0;
  const companyText = [
    company.name,
    company.description || "",
    company.industry || "",
  ]
    .join(" ")
    .toLowerCase();

  keywords.forEach((keyword) => {
    if (companyText.includes(keyword.toLowerCase())) {
      score += 10;
    }
  });

  // Bonus for having contact information
  if (company.website_url) score += 5;
  if (company.phone || company.sanitized_phone) score += 5;
  if (company.linkedin_url) score += 3;
  if (company.twitter_url) score += 2;
  if (company.facebook_url) score += 2;

  // Bonus for recent growth (indicates active organization)
  if (
    company.organization_headcount_twelve_month_growth &&
    company.organization_headcount_twelve_month_growth > 0
  ) {
    score += 5;
  }

  return score;
}

function getSuggestedRole(
  company: ApolloCompany,
  priorities: string[]
): string {
  const companyText = [
    company.name,
    company.description || "",
    company.industry || "",
  ]
    .join(" ")
    .toLowerCase();

  // Check for specific capabilities based on company name and description
  if (
    companyText.includes("medical") ||
    companyText.includes("health") ||
    companyText.includes("hospital") ||
    companyText.includes("clinic")
  ) {
    return "Medical Support & Healthcare";
  }
  if (
    companyText.includes("food") ||
    companyText.includes("nutrition") ||
    companyText.includes("catering")
  ) {
    return "Food & Nutrition Support";
  }
  if (
    companyText.includes("water") ||
    companyText.includes("sanitation") ||
    companyText.includes("hygiene")
  ) {
    return "Water & Sanitation";
  }
  if (
    companyText.includes("shelter") ||
    companyText.includes("housing") ||
    companyText.includes("construction")
  ) {
    return "Shelter & Housing";
  }
  if (
    companyText.includes("education") ||
    companyText.includes("children") ||
    companyText.includes("school")
  ) {
    return "Education & Child Protection";
  }
  if (
    companyText.includes("logistics") ||
    companyText.includes("transport") ||
    companyText.includes("shipping")
  ) {
    return "Logistics & Transportation";
  }
  if (
    companyText.includes("technology") ||
    companyText.includes("communication") ||
    companyText.includes("telecom")
  ) {
    return "Technology & Communications";
  }
  if (
    companyText.includes("financial") ||
    companyText.includes("bank") ||
    companyText.includes("fund")
  ) {
    return "Financial Support & Banking";
  }

  return "General Humanitarian Support";
}

// GET method for simple queries (optional)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);

    const location = searchParams.get("location") || "qatar";
    const keywords = searchParams.get("keywords")?.split(",") || ["non profit"];
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Use the same logic as POST but with query parameters
    const apolloResponse = await fetchCompaniesFromApollo(
      location,
      keywords,
      limit,
      offset
    );

    if (!apolloResponse) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch companies from Apollo API",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        companies: apolloResponse.organizations || [],
        totalCompanies: apolloResponse.total_results || 0,
        pagination: apolloResponse.pagination,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch company leads",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
