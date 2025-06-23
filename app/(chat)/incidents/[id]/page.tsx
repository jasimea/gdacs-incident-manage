"use client";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IncidentDetailPageProps {
  params: {
    id: string;
  };
}

export default function IncidentDetailPage({
  params,
}: IncidentDetailPageProps) {
  const { id } = params;

  // Mock GDACS incident data - based on real GDACS RSS structure
  const incident = {
    id: parseInt(id),
    title:
      "Green alert for tropical cyclone SEPAT-25. Population affected by Category 1 (120 km/h) wind speeds or higher is 0 (0.881 million in Tropical Storm).",
    eventName: "SEPAT-25",
    eventType: "Tropical Cyclone",
    eventTypeCode: "TC",
    eventId: "1001169",
    episodeId: "3",
    location: "NW Pacific",
    country: "Japan",
    iso3: "JPN",
    coordinates: "24.6° N, 144.7° E",
    latitude: 24.6,
    longitude: 144.7,
    alertLevel: "Green",
    alertScore: 1,
    severity: {
      unit: "km/h",
      value: 74.0736,
      description: "Tropical Storm (maximum wind speed of 74 km/h)",
    },
    population: {
      unit: "Pop74",
      value: 0,
      description:
        "Population affected by Category 1 (120 km/h) wind speeds or higher is 0 (0.881 million in Tropical Storm)",
    },
    vulnerability: {
      value: 1,
      level: "Low",
    },
    fromDate: "Sun, 22 Jun 2025 12:00:00 GMT",
    toDate: "Mon, 23 Jun 2025 00:00:00 GMT",
    pubDate: "Sun, 22 Jun 2025 14:06:41 GMT",
    lastModified: "Mon, 23 Jun 2025 05:51:06 GMT",
    isCurrent: true,
    temporary: false,
    bbox: "129.81290057618,155.81290057618,17.7635222754119,43.7635222754119",
    iconUrl: "https://www.gdacs.org/Images/gdacs_icons/alerts/Green/TC.png",
    description:
      "From 22/06/2025 to 23/06/2025, a Tropical Storm (maximum wind speed of 74 km/h) SEPAT-25 was active in NWPacific. The cyclone affects these countries: Japan (vulnerability Low). Estimated population affected by category 1 (120 km/h) wind speeds or higher is 0 (0.881 million in tropical storm).",
    resources: [
      {
        uri: "https://www.gdacs.org/report.aspx?eventtype=TC&eventid=1001169",
        title: "GDACS Report",
      },
      {
        uri: "https://www.gdacs.org/xml/gdacs_cap.xml",
        title: "CAP Alert",
      },
    ],
    affectedCountries: ["Japan"],
    aiAgent: {
      name: "ARIA Emergency AI",
      status: "Active",
      confidence: 94,
      lastUpdate: "2 minutes ago",
      suggestions: [
        "Deploy additional medical teams to affected areas",
        "Establish temporary shelters for displaced families",
        "Coordinate with international rescue organizations",
      ],
      riskAssessment: "High probability of aftershocks in next 24 hours",
    },
    availableProducts: [
      {
        id: 1,
        name: "Emergency Medical Kits",
        category: "Medical",
        quantity: 150,
        eta: "2 hours",
        status: "Ready",
        priority: "High",
        sponsors: 3,
        leadCompany: "RedCross International",
      },
      {
        id: 2,
        name: "Portable Water Purifiers",
        category: "Water & Sanitation",
        quantity: 75,
        eta: "4 hours",
        status: "Ready",
        priority: "High",
        sponsors: 2,
        leadCompany: "UNICEF",
      },
      {
        id: 3,
        name: "Emergency Food Rations",
        category: "Food & Nutrition",
        quantity: 500,
        eta: "6 hours",
        status: "Preparing",
        priority: "Medium",
        sponsors: 5,
        leadCompany: "World Food Programme",
      },
      {
        id: 4,
        name: "Rescue Equipment",
        category: "Search & Rescue",
        quantity: 25,
        eta: "3 hours",
        status: "Ready",
        priority: "High",
        sponsors: 1,
        leadCompany: "Emergency Response Corp",
      },
      {
        id: 5,
        name: "Communication Devices",
        category: "Communication",
        quantity: 100,
        eta: "1 hour",
        status: "Ready",
        priority: "Medium",
        sponsors: 4,
        leadCompany: "TechAid Foundation",
      },
      {
        id: 6,
        name: "Temporary Shelters",
        category: "Shelter",
        quantity: 200,
        eta: "8 hours",
        status: "En Route",
        priority: "High",
        sponsors: 6,
        leadCompany: "Habitat for Humanity",
      },
    ],
  };

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
    <div className="min-h-screen bg-white border-l border-gray-200">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/incidents">
            <Button
              variant="outline"
              className="gap-2 border-gray-300 border-none bg-muted"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {incident.eventType} {incident.eventName}
                </h1>
                <div className="flex gap-2 ml-2">
                  <Badge
                    variant="outline"
                    className={`text-sm rounded-lg ${
                      incident.alertLevel === "Green"
                        ? "border-green-200 text-green-700 bg-green-50"
                        : incident.alertLevel === "Orange"
                        ? "border-orange-200 text-orange-700 bg-orange-50"
                        : "border-red-200 text-red-700 bg-red-50"
                    }`}
                  >
                    <AlertTriangle className="size-3 mr-1" />
                    {incident.alertLevel} Alert
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-sm rounded-lg ${
                      incident.temporary
                        ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                        : "border-gray-200 text-gray-700 bg-gray-50"
                    }`}
                  >
                    <Database className="size-3 mr-1" />
                    {incident.temporary ? "Temporary" : "Persistent"}
                  </Badge>
                </div>
              </div>

              <p className="text-gray-600 mt-1">
                Event ID: {incident.eventId} • Episode #{incident.episodeId} •{" "}
                {incident.country} ({incident.iso3})
              </p>
            </div>
          </div>
        </div>

        {/* Map and AI Agent Widget Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map - 3/4 width */}
          <div className="lg:col-span-3">
            <div className="relative w-full h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDgypfd_nzYtOIC99LpGq5PELcMGDnfMcU&q=${incident.latitude},${incident.longitude}&zoom=10&maptype=satellite`}
                title={`Map showing ${incident.title} location`}
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-red-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {incident.location}
                    </p>
                    <p className="text-xs text-gray-600">
                      {incident.coordinates}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Agent Widget - 1/4 width */}
          <div className="lg:col-span-1">
            <Card className="border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm h-80 md:h-96">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bot className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {incident.aiAgent.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-600">
                          {incident.aiAgent.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="size-4 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {incident.aiAgent.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Confidence</p>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertOctagon className="size-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-800">
                        Risk Assessment
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      {incident.aiAgent.riskAssessment}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-900 mb-2">
                      AI Recommendations
                    </h4>
                    <div className="space-y-2">
                      {incident.aiAgent.suggestions
                        .slice(0, 2)
                        .map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="size-3 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-xs text-gray-700">
                              {suggestion}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-auto">
                    Updated {incident.aiAgent.lastUpdate}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border border-blue-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-xs font-medium">
                    Population Affected
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {incident.population.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Cat 1+ ({incident.population.unit})
                  </p>
                </div>
                <Users className="size-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border border-orange-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-xs font-medium">
                    Alert Score
                  </p>
                  <p className="text-2xl font-bold text-orange-800">
                    {incident.alertScore}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">GDACS Scale</p>
                </div>
                <Shield className="size-6 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border border-green-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-xs font-medium">
                    Max Wind Speed
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {Math.round(incident.severity.value)}{" "}
                    {incident.severity.unit}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Tropical Storm</p>
                </div>
                <Activity className="size-6 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border border-purple-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-xs font-medium">
                    Vulnerability
                  </p>
                  <p className="text-2xl font-bold text-purple-800">
                    {incident.vulnerability.level}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Level {incident.vulnerability.value}
                  </p>
                </div>
                <Globe className="size-6 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incident Overview - Compact Format */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="size-4 text-blue-500" />
            <h3 className="text-base font-semibold text-gray-900">
              Incident Overview
            </h3>
          </div>

          <p className="text-gray-700 leading-relaxed text-sm mb-3">
            {incident.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3 text-blue-500" />
              <span className="text-gray-600">Coordinates:</span>
              <span className="text-gray-900 font-medium">
                {incident.coordinates}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3 text-green-500" />
              <span className="text-gray-600">Active Period:</span>
              <span className="text-gray-900 font-medium">
                {new Date(incident.fromDate).toLocaleDateString()} -{" "}
                {new Date(incident.toDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* GDACS Resources */}
        <div className="mt-8">
          <Card className="border-none bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
                <Database className="size-5 text-blue-500" />
                GDACS Resources
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Official GDACS reports and data sources for this event
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incident.resources.map((resource, index) => (
                  <Card
                    key={index}
                    className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <CardContent className="p-4">
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
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {resource.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-3 break-all">
                            {resource.uri.split("/").pop() || "External Link"}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 group-hover:bg-blue-100"
                            onClick={() => window.open(resource.uri, "_blank")}
                          >
                            <ExternalLink className="size-3 mr-1" />
                            Open Resource
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional GDACS Data Points */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="size-3 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">
                        Event ID
                      </span>
                    </div>
                    <span className="text-sm font-mono text-gray-900">
                      {incident.eventId}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="size-3 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">
                        Episode
                      </span>
                    </div>
                    <span className="text-sm font-mono text-gray-900">
                      #{incident.episodeId}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="size-3 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">
                        Coordinates
                      </span>
                    </div>
                    <span className="text-sm font-mono text-gray-900">
                      {incident.coordinates}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="size-3 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">
                        Status
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        incident.isCurrent ? "text-green-700" : "text-gray-700"
                      }`}
                    >
                      {incident.isCurrent ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Suggested Products */}
        <div className="mt-8">
          <Card className="border-none bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
                <Package className="size-5 text-emerald-500" />
                Suggested Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Grid Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-700">
                <div className="col-span-4">Product</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">ETA</div>
                <div className="col-span-2 text-center">Leads</div>
              </div>

              {/* Grid Rows */}
              <div className="divide-y divide-gray-100 border-x border-gray-100">
                {incident.availableProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                  >
                    {/* Product Info */}
                    <div className="col-span-4">
                      <div className="flex flex-col">
                        <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {product.category}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              product.priority === "High"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {product.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="flex items-center gap-1">
                        {product.status === "Ready" && (
                          <CheckCircle className="size-3 text-green-500" />
                        )}
                        {product.status === "Preparing" && (
                          <Clock className="size-3 text-yellow-500" />
                        )}
                        {product.status === "En Route" && (
                          <Truck className="size-3 text-blue-500" />
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            product.status === "Ready"
                              ? "bg-green-50 text-green-700"
                              : product.status === "Preparing"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-900">
                        {product.quantity}
                      </span>
                    </div>

                    {/* ETA */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-sm text-gray-700">
                        {product.eta}
                      </span>
                    </div>

                    {/* Leads */}
                    <div className="col-span-2 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1 mb-1">
                        <Users2 className="size-3 text-blue-500" />
                        <span className="text-xs font-medium text-gray-900">
                          {product.sponsors}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <ExternalLink className="size-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
