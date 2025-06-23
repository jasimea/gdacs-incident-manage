"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Building2,
  Filter,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  User,
  Calendar,
} from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  phone?: string;
  industry?: string;
  address?: string;
  domain?: string;
  foundedYear?: number;
  description?: string;
  logo?: string;
  revenue?: number;
  revenueText?: string;
  headcountGrowth?: {
    sixMonth: number;
    twelveMonth: number;
    twentyFourMonth: number;
  };
  relevanceScore?: number;
  suggestedRole?: string;
}

interface LeadCompaniesSheetProps {
  eventId: string;
  children: React.ReactNode;
}

export function LeadCompaniesSheet({
  eventId,
  children,
}: LeadCompaniesSheetProps) {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [sendingReports, setSendingReports] = useState<Set<string>>(new Set());

  // Send report function
  const handleSendReport = async (company: CompanyData) => {
    setSendingReports((prev) => new Set(prev).add(company.id));

    try {
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: company.name,
          companyData: company,
          eventId: eventId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send report");
      }

      // Show success feedback (you can replace this with a toast notification)
      alert(
        `Report for ${company.name} sent successfully to jasimea@gmail.com!`
      );
    } catch (error) {
      console.error("Error sending report:", error);
      // Show error feedback (you can replace this with a toast notification)
      alert(`Failed to send report for ${company.name}. Please try again.`);
    } finally {
      setSendingReports((prev) => {
        const newSet = new Set(prev);
        newSet.delete(company.id);
        return newSet;
      });
    }
  };

  // Fetch companies when sheet opens
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/leads/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 50,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched companies:", data);

      if (data.error) {
        throw new Error(data.error);
      }
      console.log("Companies data:", data.companies);

      setCompanies(data.data.companies || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError(err instanceof Error ? err.message : "Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (isOpen && companies.length === 0) {
      fetchCompanies();
    }
  }, [isOpen, companies.length, fetchCompanies]);

  // Filter companies based on search and country
  useEffect(() => {
    // Only filter if we have companies data
    if (companies.length === 0) {
      return;
    }

    let filtered = companies;
    console.log("Filtering companies:", companies.length, "companies");

    if (searchTerm) {
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.suggestedRole
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (countryFilter !== "all") {
      filtered = filtered.filter((company) =>
        company.address?.includes(countryFilter)
      );
    }

    console.log("Filtered to:", filtered.length, "companies");
    setFilteredCompanies(filtered);
  }, [companies, searchTerm, countryFilter]);

  const getUniqueCountries = () => {
    const locations = companies
      .map((company) => company.address)
      .filter((address): address is string => Boolean(address))
      .map((address) => {
        // Extract country-like information from address
        const parts = address.split(",").map((p) => p.trim());
        return parts[parts.length - 1]; // Last part usually contains country
      });
    return Array.from(new Set(locations)).sort();
  };

  const formatEmployeeCount = (count?: number) => {
    if (!count) return "N/A";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K+`;
    }
    return count.toString();
  };

  const formatRevenue = (revenue?: number) => {
    if (!revenue) return "N/A";
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M+`;
    }
    if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(1)}K+`;
    }
    return `$${revenue}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="w-[800px]!">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users2 className="size-5" />
            Organization Leads
          </SheetTitle>
          <SheetDescription>
            Relevant organizations for disaster response and relief efforts
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 max-w-full">
          {/* Search and Filter Controls */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {getUniqueCountries().map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          {!loading && !error && (
            <div className="text-sm text-gray-600">
              Showing {filteredCompanies.length} of {companies.length}{" "}
              organizations
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="size-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600">Loading organizations...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <AlertCircle className="size-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Failed to Load Organizations
                </h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchCompanies} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Companies List */}
          {!loading && !error && (
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="size-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No organizations found</p>
                  {searchTerm || countryFilter !== "all" ? (
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search or filters
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 pb-4">
                  {filteredCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-200 w-80"
                    >
                      {/* Header with Logo and Name */}
                      <div className="flex items-center gap-3 mb-3">
                        {company.logo ? (
                          <Image
                            src={company.logo}
                            alt={`${company.name} logo`}
                            width={40}
                            height={40}
                            className="size-10 rounded-lg object-contain bg-gray-50 p-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="size-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                            <Building2 className="size-5 text-blue-600" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base truncate">
                            {company.name}
                          </h3>
                          {company.relevanceScore && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700 border-green-200 mt-1"
                            >
                              {company.relevanceScore}% Match
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Suggested Role */}
                      {company.suggestedRole && (
                        <div className="mb-3">
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium"
                          >
                            {company.suggestedRole}
                          </Badge>
                        </div>
                      )}

                      {/* Description */}
                      {company.description && (
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                          {company.description}
                        </p>
                      )}

                      {/* Company Details */}
                      <div className="space-y-2 mb-4">
                        {company.industry && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="size-3 text-gray-400 shrink-0" />
                            <span className="text-gray-600 truncate text-xs">
                              {company.industry}
                            </span>
                          </div>
                        )}

                        {company.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="size-3 text-gray-400 shrink-0" />
                            <span className="text-gray-600 truncate text-xs">
                              {company.address}
                            </span>
                          </div>
                        )}

                        {company.foundedYear && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="size-3 text-gray-400 shrink-0" />
                            <span className="text-gray-600 text-xs">
                              Founded {company.foundedYear}
                            </span>
                          </div>
                        )}

                        {company.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="size-3 text-gray-400 shrink-0" />
                            <a
                              href={`tel:${company.phone}`}
                              className="text-blue-600 hover:text-blue-700 truncate text-xs"
                            >
                              {company.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Growth Metrics - Compact */}
                      {company.headcountGrowth && (
                        <div className="mb-4 p-2 bg-gray-50 rounded-md">
                          <h4 className="text-xs font-semibold text-gray-700 mb-1">
                            Growth
                          </h4>
                          <div className="flex justify-between text-xs">
                            <div className="text-center">
                              <div
                                className={`font-medium ${
                                  company.headcountGrowth.sixMonth >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {(
                                  company.headcountGrowth.sixMonth * 100
                                ).toFixed(1)}
                                %
                              </div>
                              <div className="text-gray-500">6m</div>
                            </div>
                            <div className="text-center">
                              <div
                                className={`font-medium ${
                                  company.headcountGrowth.twelveMonth >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {(
                                  company.headcountGrowth.twelveMonth * 100
                                ).toFixed(1)}
                                %
                              </div>
                              <div className="text-gray-500">12m</div>
                            </div>
                            <div className="text-center">
                              <div
                                className={`font-medium ${
                                  company.headcountGrowth.twentyFourMonth >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {(
                                  company.headcountGrowth.twentyFourMonth * 100
                                ).toFixed(1)}
                                %
                              </div>
                              <div className="text-gray-500">24m</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contact Links */}
                      <div className="flex items-center gap-3 mb-3 pt-2 border-t border-gray-100">
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
                            title="Website"
                          >
                            <Globe className="size-3" />
                          </a>
                        )}

                        {company.linkedin && (
                          <a
                            href={company.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-xs"
                            title="LinkedIn"
                          >
                            LinkedIn
                          </a>
                        )}

                        {company.twitter && (
                          <a
                            href={company.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-xs"
                            title="Twitter"
                          >
                            Twitter
                          </a>
                        )}

                        {company.facebook && (
                          <a
                            href={company.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-xs"
                            title="Facebook"
                          >
                            Facebook
                          </a>
                        )}
                      </div>

                      {/* Send Report Button */}
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
                        onClick={() => handleSendReport(company)}
                        disabled={sendingReports.has(company.id)}
                      >
                        {sendingReports.has(company.id) ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-3 animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          "Send Report"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
