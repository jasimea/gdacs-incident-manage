"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Calendar,
  MapPin,
  AlertCircle,
  ArrowLeft,
  Users,
  Shield,
  Clock,
  Globe,
  TrendingUp,
  Activity,
  Bot,
  Zap,
  Package,
  CheckCircle,
  AlertOctagon,
  Truck,
  ExternalLink,
  Users2,
  FileText,
  Database,
  Link2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadCompaniesDialog } from "@/components/lead-companies-dialog";
import Link from "next/link";

interface IncidentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

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

async function fetchIncidentData(
  eventId: string
): Promise<IncidentDetailData | null> {
  try {
    const response = await fetch(`/api/incident/${eventId}`, {
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || "Failed to fetch incident details");
    }
  } catch (error) {
    console.error("Error fetching incident data:", error);
    return null;
  }
}

async function fetchProductsData(eventId: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/products/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data.products || [];
    } else {
      throw new Error(result.error || "Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products data:", error);
    return [];
  }
}

export default function IncidentDetailPage({
  params,
}: IncidentDetailPageProps) {
  const [id, setId] = useState<string>("");
  const [incident, setIncident] = useState<IncidentDetailData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve params Promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // Mock AI agent data since it's not in GDACS RSS
  const mockAiAgent = {
    name: "ARIA Emergency AI",
    status: "Active",
    confidence: 94,
    lastUpdate: "2 minutes ago",
    suggestions: [
      "Deploy additional medical teams to affected areas",
      "Establish temporary shelters for displaced families",
      "Coordinate with international rescue organizations",
    ],
    riskAssessment:
      incident?.eventType === "Tropical Cyclone"
        ? "High probability of wind damage in next 24 hours"
        : incident?.eventType === "Earthquake"
        ? "High probability of aftershocks in next 24 hours"
        : "Monitor situation for potential escalation",
  };

  // Map products from API to display format
  const displayProducts = products.map((product, index) => ({
    id: index + 1,
    name: product.name,
    category: product.categoryName,
    quantity: product.estimatedQuantityNeeded,
    eta: `${Math.floor(Math.random() * 8) + 1} hours`, // Mock ETA
    status: ["Ready", "Preparing", "En Route"][Math.floor(Math.random() * 3)],
    priority: product.priority >= 4 ? "High" : "Medium",
    sponsors: Math.floor(Math.random() * 6) + 1, // Mock sponsors
    leadCompany: getLeadCompanyForCategory(product.categoryName),
  }));

  function getLeadCompanyForCategory(category: string): string {
    const companyMap: { [key: string]: string } = {
      "First Aid": "RedCross International",
      "Water & Sanitation": "UNICEF",
      "Ready-to-Eat Food": "World Food Programme",
      "Shelter & Tents": "Habitat for Humanity",
      "Kitchen Sets": "Relief International",
      "Blankets & Bedding": "UNHCR",
      "Winterization Kits": "Save the Children",
    };
    return companyMap[category] || "International Aid Foundation";
  }

  // Fetch incident data on component mount
  useEffect(() => {
    if (!id) return; // Wait for id to be resolved

    const loadIncident = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch incident data and products in parallel
        const [incidentData, productsData] = await Promise.all([
          fetchIncidentData(id),
          fetchProductsData(id),
        ]);

        if (incidentData) {
          setIncident(incidentData);
          setProducts(productsData);
        } else {
          setError("Incident not found");
        }
      } catch (err) {
        console.error("Error loading incident:", err);
        setError("Failed to load incident details");
      } finally {
        setLoading(false);
      }
    };

    loadIncident();
  }, [id]);

  // Fetch products data when incident ID is available
  useEffect(() => {
    const loadProducts = async () => {
      if (!id) return;

      try {
        const productsData = await fetchProductsData(id);
        setProducts(productsData);
      } catch (err) {
        console.error("Error loading products:", err);
      }
    };

    loadProducts();
  }, [id]);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "earthquake":
        return "🏔️";
      case "cyclone":
        return "🌪️";
      case "flood":
        return "🌊";
      case "wildfire":
        return "🔥";
      case "volcano":
        return "🌋";
      default:
        return "⚠️";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "destructive";
      case "monitoring":
        return "default";
      case "watch":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-white border-l">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full size-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <span className="text-lg text-gray-600">
              Loading incident details...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertTriangle className="size-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Incident
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/incidents">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Incidents
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Incident Data */}
      {incident && !loading && !error && (
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/incidents">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                </Link>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">
                      {incident.eventType}{" "}
                      {incident.eventName || incident.title}
                    </h1>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          incident.alertLevel === "Green"
                            ? "border-green-300 text-green-700 bg-green-50"
                            : incident.alertLevel === "Orange"
                            ? "border-orange-300 text-orange-700 bg-orange-50"
                            : "border-red-300 text-red-700 bg-red-50"
                        }`}
                      >
                        <AlertTriangle className="size-3 mr-1" />
                        {incident.alertLevel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-300 text-gray-700 bg-gray-50"
                      >
                        <Database className="size-3 mr-1" />
                        {incident.temporary ? "Temporary" : "Persistent"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Event ID: {incident.eventId} • Episode #
                    {incident.episodeId || "N/A"} • {incident.country} (
                    {incident.iso3})
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">
                    {incident.population.value.toLocaleString()}
                  </div>
                  <div className="text-gray-500">Affected</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">
                    {incident.alertScore}
                  </div>
                  <div className="text-gray-500">Alert Score</div>
                </div>
                <div className="text-center">
                  <div
                    className={`font-semibold ${
                      incident.isCurrent ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {incident.isCurrent ? "Active" : "Inactive"}
                  </div>
                  <div className="text-gray-500">Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-8">
            {/* Geographic Overview Section */}
            <div className="grid grid-cols-12 gap-8">
              {/* Map Section */}
              <div className="col-span-12 lg:col-span-8">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Geographic Impact Zone
                  </h2>
                  <p className="text-sm text-gray-600">
                    Real-time satellite view of the affected area showing the
                    incident&apos;s geographic footprint and surrounding
                    infrastructure.
                  </p>
                </div>
                <div className="relative h-[420px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyDgypfd_nzYtOIC99LpGq5PELcMGDnfMcU&center=${incident.latitude},${incident.longitude}&zoom=10&maptype=satellite`}
                    title={`Map showing ${incident.title} location`}
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-red-100 rounded-full">
                        <MapPin className="size-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {incident.location}
                        </p>
                        <p className="text-xs text-gray-600">
                          {incident.coordinates}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          Zoom: Satellite View
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Globe className="size-3" />
                      <span>Live Geographic Data</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Emergency Analysis */}
              <div className="col-span-12 lg:col-span-4">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    AI Emergency Analysis
                  </h2>
                  <p className="text-sm text-gray-600">
                    Real-time AI-powered risk assessment and response
                    recommendations based on current incident data and
                    predictive modeling.
                  </p>
                </div>

                <div className="h-[420px] space-y-6">
                  {/* AI Agent Status Header */}
                  <div className="bg-gray-50 rounded-xl p-5 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Bot className="size-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {mockAiAgent.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-green-600">
                            {mockAiAgent.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            • Last updated {mockAiAgent.lastUpdate}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1 font-medium">
                          • Real-time disaster response AI system
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Confidence */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Zap className="size-5 text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          Analysis Confidence Level
                        </span>
                      </div>
                      <div className="flex items-baseline justify-center gap-1 mb-3">
                        <span className="text-4xl font-bold text-blue-600">
                          {mockAiAgent.confidence}
                        </span>
                        <span className="text-lg font-semibold text-gray-600">
                          %
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3 mx-4">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700 shadow-sm"
                          style={{ width: `${mockAiAgent.confidence}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Based on {incident.eventType} pattern analysis and
                        regional data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Assessment Metrics */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Impact Assessment & Key Metrics
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Quantitative analysis of the incident&apos;s scale, severity,
                and potential impact on affected populations and infrastructure.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="size-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      POPULATION
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Population Affected
                    </p>
                    <p className="text-3xl font-bold text-blue-600 mb-1">
                      {incident.population.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Category 1+ wind speeds ({incident.population.unit})
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      • Evacuation zones identified
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-l-orange-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Shield className="size-6 text-orange-600" />
                    </div>
                    <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                      ALERT
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      GDACS Alert Score
                    </p>
                    <p className="text-3xl font-bold text-orange-600 mb-1">
                      {incident.alertScore}
                    </p>
                    <p className="text-xs text-gray-500">
                      Global Disaster Alerting Scale (1-3)
                    </p>
                    <p className="text-xs text-orange-600 mt-2 font-medium">
                      • {incident.alertLevel} alert level active
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="size-6 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      SEVERITY
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Severity Measurement
                    </p>
                    <p className="text-3xl font-bold text-green-600 mb-1">
                      {incident.severity.value > 0
                        ? Math.round(incident.severity.value)
                        : "N/A"}
                      {incident.severity.value > 0 && (
                        <span className="text-lg ml-1">
                          {incident.severity.unit}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {incident.severity.description || incident.eventType}
                    </p>
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      • Monitoring systems active
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-l-purple-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Globe className="size-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      RISK
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Vulnerability Index
                    </p>
                    <p className="text-3xl font-bold text-purple-600 mb-1">
                      {incident.vulnerability.level}
                    </p>
                    <p className="text-xs text-gray-500">
                      Level {incident.vulnerability.value} infrastructure
                      resilience
                    </p>
                    <p className="text-xs text-purple-600 mt-2 font-medium">
                      • Risk assessment complete
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Details & Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Incident Analysis & Key Information
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Comprehensive analysis of the incident including geographic
                data, timeline information, and official resources from GDACS
                systems.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Incident Description & Overview */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Primary Description */}
                  <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="size-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        Incident Description
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {incident.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 rounded-full mt-1">
                          <MapPin className="size-3 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            Geographic Coordinates
                          </span>
                          <p className="text-sm text-gray-600">
                            {incident.coordinates}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            • Precise location data from GDACS satellite systems
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-green-100 rounded-full mt-1">
                          <Clock className="size-3 text-green-600" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            Active Duration
                          </span>
                          <p className="text-sm text-gray-600">
                            {new Date(incident.fromDate).toLocaleDateString()} -{" "}
                            {new Date(incident.toDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            • Real-time monitoring and updates available
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GDACS Official Resources */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="size-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        Official GDACS Data Sources
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Access real-time reports, alerts, and data feeds directly
                      from GDACS monitoring systems and partner organizations.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {incident.resources.map((resource, index) => (
                        <div
                          key={index}
                          className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => window.open(resource.uri, "_blank")}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                              {resource.title.includes("Report") ? (
                                <FileText className="size-4 text-blue-600" />
                              ) : resource.title.includes("CAP") ? (
                                <AlertTriangle className="size-4 text-blue-600" />
                              ) : (
                                <Link2 className="size-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                {resource.title}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2">
                                {resource.uri.split("/").pop() ||
                                  "External GDACS Resource"}
                              </p>
                              <div className="flex items-center gap-1">
                                <div className="size-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600 font-medium">
                                  Live Data Feed
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="size-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Event Technical Details */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="size-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Technical Event Data
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete technical specifications and identifiers as
                    recorded in the GDACS global monitoring systems.
                  </p>

                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            Event Identifier
                          </span>
                          <span className="text-xs text-gray-500">
                            GDACS unique tracking ID
                          </span>
                        </div>
                        <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {incident.eventId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            Episode Number
                          </span>
                          <span className="text-xs text-gray-500">
                            Sequence within event series
                          </span>
                        </div>
                        <span className="text-sm font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          #{incident.episodeId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            Disaster Category
                          </span>
                          <span className="text-xs text-gray-500">
                            Primary hazard classification
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 font-medium">
                          {incident.eventType}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            Affected Nation
                          </span>
                          <span className="text-xs text-gray-500">
                            Primary impact location
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-900 font-medium block">
                            {incident.country}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({incident.iso3})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            Current Status
                          </span>
                          <span className="text-xs text-gray-500">
                            Real-time monitoring status
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full ${
                              incident.isCurrent
                                ? "bg-green-500 animate-pulse"
                                : "bg-gray-400"
                            }`}
                          ></div>
                          <span
                            className={`text-sm font-semibold ${
                              incident.isCurrent
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {incident.isCurrent ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            Event Duration
                          </span>
                          <span className="text-xs text-gray-500">
                            Expected persistence pattern
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            incident.temporary
                              ? "text-orange-600 bg-orange-50"
                              : "text-blue-600 bg-blue-50"
                          }`}
                        >
                          {incident.temporary ? "Temporary" : "Persistent"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Response Products */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="size-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Emergency Response Products & Resources
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                AI-curated emergency supplies and resources strategically
                positioned for rapid deployment based on incident analysis and
                affected population needs.
              </p>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left p-4 font-semibold text-gray-800 text-sm">
                          Product & Category
                          <p className="font-normal text-xs text-gray-500 mt-1">
                            Resource type and priority classification
                          </p>
                        </th>
                        <th className="text-center p-4 font-semibold text-gray-800 text-sm">
                          Deployment Status
                          <p className="font-normal text-xs text-gray-500 mt-1">
                            Current readiness level
                          </p>
                        </th>
                        <th className="text-center p-4 font-semibold text-gray-800 text-sm">
                          Available Units
                          <p className="font-normal text-xs text-gray-500 mt-1">
                            Ready for deployment
                          </p>
                        </th>
                        <th className="text-center p-4 font-semibold text-gray-800 text-sm">
                          Estimated Arrival
                          <p className="font-normal text-xs text-gray-500 mt-1">
                            Time to affected area
                          </p>
                        </th>
                        <th className="text-center p-4 font-semibold text-gray-800 text-sm">
                          Sponsor Network
                          <p className="font-normal text-xs text-gray-500 mt-1">
                            Contributing organizations
                          </p>
                        </th>
                        <th className="text-center p-4 font-semibold text-gray-800 text-sm">
                          Details
                          <p className="font-normal text-xs text-gray-500 mt-1">
                            View full specifications
                          </p>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayProducts.map((product: any, index: number) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  product.priority === "High"
                                    ? "bg-red-50"
                                    : "bg-blue-50"
                                }`}
                              >
                                <Package
                                  className={`size-4 ${
                                    product.priority === "High"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  {product.category}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                                      product.priority === "High"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {product.priority} Priority
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    • {product.leadCompany}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center gap-1">
                                {product.status === "Ready" && (
                                  <CheckCircle className="size-4 text-green-500" />
                                )}
                                {product.status === "Preparing" && (
                                  <Clock className="size-4 text-yellow-500" />
                                )}
                                {product.status === "En Route" && (
                                  <Truck className="size-4 text-blue-500" />
                                )}
                                <span
                                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                                    product.status === "Ready"
                                      ? "bg-green-100 text-green-700"
                                      : product.status === "Preparing"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {product.status}
                                </span>
                              </div>
                              {product.status === "Ready" && (
                                <span className="text-xs text-green-600 font-medium">
                                  • Immediate deployment available
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="font-bold text-lg text-gray-900">
                              {product.quantity}
                            </div>
                            <span className="text-xs text-gray-500">
                              units ready
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="font-semibold text-gray-900">
                              {product.eta}
                            </div>
                            <span className="text-xs text-gray-500">
                              to impact zone
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Users2 className="size-4 text-blue-500" />
                              <span className="font-bold text-lg text-blue-600">
                                {product.sponsors}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              active sponsors
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <LeadCompaniesDialog
                              eventId={incident.eventId}
                              productName={product.name}
                              productCategory={product.category}
                              location={
                                incident.country?.toLowerCase() || "qatar"
                              }
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              >
                                <ExternalLink className="size-3 mr-1" />
                                View Details
                              </Button>
                            </LeadCompaniesDialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">
                          {displayProducts.length}
                        </span>{" "}
                        products available
                      </span>
                      <span className="text-gray-600">
                        <span className="font-semibold text-green-600">
                          {
                            displayProducts.filter(
                              (p: any) => p.status === "Ready"
                            ).length
                          }
                        </span>{" "}
                        ready for immediate deployment
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Real-time inventory tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
