"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Building2,
  ExternalLink,
  Filter,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Search,
  Star,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface LeadCompaniesDialogProps {
  eventId: string;
  productName: string;
  productCategory: string;
  location?: string;
  children: React.ReactNode;
}

interface Company {
  id: string;
  name: string;
  website?: string;
  phone?: string;
  industry?: string;
  address?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  domain?: string;
  employeeCount?: number;
  foundedYear?: number;
  description?: string;
  logo?: string;
  revenue?: number;
  revenueText?: string;
  headcountGrowth?: {
    sixMonth?: number;
    twelveMonth?: number;
    twentyFourMonth?: number;
  };
  relevanceScore?: number;
  suggestedRole?: string;
}

interface LeadCompaniesResponse {
  success: boolean;
  data?: {
    eventId: string;
    companies: Company[];
    totalCompanies: number;
    searchCriteria: {
      location: string;
      keywords: string[];
      limit: number;
      offset: number;
    };
  };
  error?: string;
}

export function LeadCompaniesDialog({
  eventId,
  productName,
  productCategory,
  location = "qatar",
  children,
}: LeadCompaniesDialogProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState(location);

  const fetchLeadCompanies = useCallback(
    async (searchLoc: string = location) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/leads/${eventId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location: searchLoc,
            keywords: generateKeywords(productCategory),
            limit: 20,
            offset: 0,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: LeadCompaniesResponse = await response.json();

        if (result.success && result.data) {
          setCompanies(result.data.companies);
        } else {
          throw new Error(result.error || "Failed to fetch companies");
        }
      } catch (err) {
        console.error("Error fetching lead companies:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    },
    [eventId, location, productCategory]
  );

  const generateKeywords = (category: string): string[] => {
    const baseKeywords = ["non profit", "humanitarian", "relief", "aid"];

    const categoryKeywords: { [key: string]: string[] } = {
      "First Aid": ["medical", "healthcare", "emergency medical", "red cross"],
      "Water & Sanitation": ["water", "sanitation", "hygiene", "clean water"],
      "Ready-to-Eat Food": ["food", "nutrition", "food security", "meals"],
      "Shelter & Tents": ["shelter", "housing", "emergency shelter", "tents"],
      "Kitchen Sets": ["cooking", "kitchen", "food preparation", "meals"],
      "Blankets & Bedding": ["bedding", "comfort", "warmth", "textiles"],
      "Winterization Kits": ["winter", "clothing", "cold weather", "seasonal"],
    };

    return [...baseKeywords, ...(categoryKeywords[category] || [])];
  };

  useEffect(() => {
    if (open && companies.length === 0) {
      fetchLeadCompanies();
    }
  }, [open, companies.length, fetchLeadCompanies]);

  const handleLocationChange = (newLocation: string) => {
    setSearchLocation(newLocation);
    fetchLeadCompanies(newLocation);
  };

  const getRelevanceColor = (score: number = 0) => {
    if (score >= 30) return "text-green-600 bg-green-50";
    if (score >= 20) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <>
      {/* Trigger Button */}
      <div onClick={() => setOpen(true)}>{children}</div>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="size-5 text-blue-600" />
                    Lead Companies for {productName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Find and connect with organizations that can provide{" "}
                    <span className="font-medium text-blue-600">
                      {productCategory}
                    </span>{" "}
                    support for incident #{eventId}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="size-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Search Controls */}
            <div className="flex items-center gap-4 p-6 bg-gray-50">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Location:
                </span>
                <select
                  value={searchLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                  disabled={loading}
                >
                  <option value="qatar">Qatar</option>
                  <option value="uae">UAE</option>
                  <option value="saudi arabia">Saudi Arabia</option>
                  <option value="kuwait">Kuwait</option>
                  <option value="bahrain">Bahrain</option>
                  <option value="oman">Oman</option>
                </select>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchLeadCompanies(searchLocation)}
                disabled={loading}
              >
                <Search className="size-4 mr-1" />
                Refresh
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="size-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Searching for lead companies...
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center max-w-md">
                    <AlertCircle className="size-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-medium mb-2">
                      Error Loading Companies
                    </p>
                    <p className="text-gray-600 text-sm mb-4">{error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchLeadCompanies(searchLocation)}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {!loading && !error && companies.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Building2 className="size-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No companies found for this search.
                    </p>
                    <p className="text-gray-500 text-sm">
                      Try adjusting the location filter.
                    </p>
                  </div>
                </div>
              )}

              {!loading && !error && companies.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Found{" "}
                      <span className="font-semibold text-gray-900">
                        {companies.length}
                      </span>{" "}
                      potential lead companies
                    </p>
                    <Badge variant="outline" className="text-xs">
                      <Filter className="size-3 mr-1" />
                      Sorted by relevance
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    {companies.map((company) => (
                      <div
                        key={company.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <Building2 className="size-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {company.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {company.industry || "Organization"}
                              </p>
                              {company.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                  {company.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getRelevanceColor(
                                company.relevanceScore
                              )}`}
                            >
                              <Star className="size-3 mr-1" />
                              {company.relevanceScore || 0}% match
                            </Badge>
                          </div>
                        </div>

                        {company.suggestedRole && (
                          <div className="mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {company.suggestedRole}
                            </Badge>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-600">
                          {company.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              <span className="truncate">
                                {company.address}
                              </span>
                            </div>
                          )}
                          {company.employeeCount && (
                            <div className="flex items-center gap-1">
                              <Users className="size-3" />
                              <span>{company.employeeCount} employees</span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="size-3" />
                              <span>{company.phone}</span>
                            </div>
                          )}
                          {company.foundedYear && (
                            <div className="flex items-center gap-1">
                              <Globe className="size-3" />
                              <span>Founded {company.foundedYear}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            {company.website && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(company.website, "_blank")
                                }
                              >
                                <Globe className="size-3 mr-1" />
                                Website
                              </Button>
                            )}
                            {company.linkedin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(company.linkedin, "_blank")
                                }
                              >
                                LinkedIn
                              </Button>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <ExternalLink className="size-3 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Data powered by Apollo.io</span>
                <span>Results updated in real-time</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
