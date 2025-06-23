"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Calendar,
  MapPin,
  AlertCircle,
  Filter,
  Eye,
  TrendingUp,
  Clock,
  Globe,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";

function getData() {
  // This function can be used to fetch real incident data from an API
  // For now, we are using mock data directly in the component
  return [];
}

interface IncidentData {
  id: number;
  title: string;
  location: string;
  severity: string;
  status: string;
  date: string;
  description: string;
  type: string;
  affectedPopulation: string;
  responseTeams: number;
  eventId: string;
}

async function fetchGDACSIncidents(): Promise<IncidentData[]> {
  try {
    const response = await fetch("/api/gdacs-incidents", {
      cache: "no-cache", // For client-side fetching
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || "Failed to fetch incidents");
    }
  } catch (error) {
    console.error("Error fetching GDACS data:", error);
    // Return empty array on error so the component doesn't break
    return [];
  }
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fallback mock data
  // const fallbackIncidents: IncidentData[] = [
  //   {
  //     id: 1,
  //     title: "Earthquake - Magnitude 6.2",
  //     location: "Central Turkey",
  //     severity: "High",
  //     status: "Active",
  //     date: "2025-06-23",
  //     description:
  //       "Strong earthquake detected in central Turkey region. Emergency response teams deployed.",
  //     type: "Earthquake",
  //     affectedPopulation: "2.3M",
  //     responseTeams: 12,
  //   },
  //   {
  //     id: 2,
  //     title: "Tropical Cyclone - Category 3",
  //     location: "Philippines",
  //     severity: "Critical",
  //     status: "Monitoring",
  //     date: "2025-06-22",
  //     description:
  //       "Tropical cyclone approaching Philippine coast with winds up to 185 km/h.",
  //     type: "Cyclone",
  //     affectedPopulation: "1.8M",
  //     responseTeams: 8,
  //   },
  //   {
  //     id: 3,
  //     title: "Flood Warning",
  //     location: "Bangladesh",
  //     severity: "Medium",
  //     status: "Watch",
  //     date: "2025-06-21",
  //     description:
  //       "Heavy rainfall causing flooding in low-lying areas. Population advised to relocate.",
  //     type: "Flood",
  //     affectedPopulation: "850K",
  //     responseTeams: 5,
  //   },
  //   {
  //     id: 4,
  //     title: "Wildfire - Forest Fire",
  //     location: "California, USA",
  //     severity: "High",
  //     status: "Active",
  //     date: "2025-06-23",
  //     description:
  //       "Large wildfire spreading through forest areas. Evacuation orders issued for nearby communities.",
  //     type: "Wildfire",
  //     affectedPopulation: "45K",
  //     responseTeams: 15,
  //   },
  //   {
  //     id: 5,
  //     title: "Volcanic Activity",
  //     location: "Indonesia",
  //     severity: "Medium",
  //     status: "Monitoring",
  //     date: "2025-06-20",
  //     description:
  //       "Increased volcanic activity detected. Alert level raised to warning status.",
  //     type: "Volcano",
  //     affectedPopulation: "120K",
  //     responseTeams: 3,
  //   },
  // ];

  // Fetch incidents on component mount
  useEffect(() => {
    const loadIncidents = async () => {
      setLoading(true);
      try {
        const fetchedIncidents = await fetchGDACSIncidents();
        console.log("Fetched incidents:", fetchedIncidents);
        // Use real incidents if available, otherwise use fallback
        setIncidents(fetchedIncidents.length > 0 ? fetchedIncidents : []);
      } catch (error) {
        console.error("Error loading incidents:", error);
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fallbackIncidents is static, so we don't need it in deps

  // Filter incidents based on current filters
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      searchTerm === "" ||
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" ||
      incident.severity.toLowerCase() === severityFilter.toLowerCase();

    const matchesType =
      typeFilter === "all" ||
      incident.type.toLowerCase() === typeFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      incident.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm("");
    setSeverityFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  // Apply filters function (for the apply button)
  const applyFilters = () => {
    // Filters are applied automatically through the filteredIncidents computation
    // This function could be used for additional logic if needed
    console.log("Filters applied:", {
      searchTerm,
      severityFilter,
      typeFilter,
      statusFilter,
      resultCount: filteredIncidents.length,
    });
  };

  // Filter state (in a real app, use useState)
  const filterBySeverity = "all";
  const filterByType = "all";
  const filterByStatus = "all";

  // Statistics for colored hints - using filteredIncidents for real-time stats
  const stats = {
    total: filteredIncidents.length,
    critical: filteredIncidents.filter(
      (i: IncidentData) => i.severity.toLowerCase() === "critical"
    ).length,
    active: filteredIncidents.filter(
      (i: IncidentData) => i.status.toLowerCase() === "active"
    ).length,
    totalAffected: filteredIncidents.reduce((sum: number, i: IncidentData) => {
      const num = parseFloat(i.affectedPopulation.replace(/[MK]/, ""));
      const multiplier = i.affectedPopulation.includes("M") ? 1000000 : 1000;
      return sum + num * multiplier;
    }, 0),
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

  const formatAffectedPopulation = (population: number) => {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`;
    }
    return `${(population / 1000).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen border-l border-gray-200 bg-white">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl border border-orange-200 dark:border-orange-700">
            <AlertTriangle className="size-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              GDACS Incident Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Real-time monitoring and management of global disaster incidents
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full size-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">
              Loading incidents...
            </span>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                        Total Incidents
                      </p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {stats.total}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Active monitoring
                      </p>
                    </div>
                    <Globe className="size-8 text-blue-400 dark:text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                        Critical Alerts
                      </p>
                      <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                        {stats.critical}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Immediate attention
                      </p>
                    </div>
                    <AlertCircle className="size-8 text-red-400 dark:text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-orange-700 dark:text-orange-300 text-sm font-medium">
                        Active Response
                      </p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                        {stats.active}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        Teams deployed
                      </p>
                    </div>
                    <TrendingUp className="size-8 text-orange-400 dark:text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                        Affected Population
                      </p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {formatAffectedPopulation(stats.totalAffected)}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        People impacted
                      </p>
                    </div>
                    <Globe className="size-8 text-purple-400 dark:text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>{" "}
            {/* Filters Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/30 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Filter className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Filter & Search
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Refine incident data
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {filteredIncidents.length} of {incidents.length} incidents
                  {(searchTerm ||
                    severityFilter !== "all" ||
                    typeFilter !== "all" ||
                    statusFilter !== "all") && (
                    <span className="ml-1 text-blue-600 dark:text-blue-400">
                      • Filtered
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-blue-500 rounded-full"></div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Search Incidents
                    </label>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Search by location, type, title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg h-9 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-red-500 rounded-full"></div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Severity Level
                    </label>
                  </div>
                  <Select
                    value={severityFilter}
                    onValueChange={setSeverityFilter}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg h-9 text-sm focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem
                        value="all"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-gray-400 rounded-full"></div>
                          All Severities
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="critical"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-red-500 rounded-full"></div>
                          Critical
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="high"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-orange-500 rounded-full"></div>
                          High
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="medium"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-yellow-500 rounded-full"></div>
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="low"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-green-500 rounded-full"></div>
                          Low
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-green-500 rounded-full"></div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Disaster Type
                    </label>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg h-9 text-sm focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem
                        value="all"
                        className="cursor-pointer text-sm"
                      >
                        All Types
                      </SelectItem>
                      <SelectItem
                        value="earthquake"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🏔️</span>
                          Earthquake
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="cyclone"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🌪️</span>
                          Cyclone
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="flood"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🌊</span>
                          Flood
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="wildfire"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🔥</span>
                          Wildfire
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="volcano"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🌋</span>
                          Volcano
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-purple-500 rounded-full"></div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Response Status
                    </label>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg h-9 text-sm focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem
                        value="all"
                        className="cursor-pointer text-sm"
                      >
                        All Statuses
                      </SelectItem>
                      <SelectItem
                        value="active"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-red-500 rounded-full animate-pulse"></div>
                          Active Response
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="monitoring"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-yellow-500 rounded-full"></div>
                          Monitoring
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="watch"
                        className="cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-blue-500 rounded-full"></div>
                          Watch
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3" />
                    Last updated: 2 min ago
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs h-8 px-3 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyFilters}
                    className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
            {/* Incidents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIncidents.map((incident: IncidentData) => (
                <Card
                  key={incident.id}
                  className="group hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800 border"
                >
                  <CardHeader className="pb-3 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="py-2 px-3 border bg-gray-50 dark:bg-gray-700 rounded-lg shrink-0">
                          <span className="text-xl">
                            {getTypeIcon(incident.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base leading-tight group-hover:text-blue-600 transition-colors truncate mb-1">
                            {incident.title}
                          </CardTitle>
                          <div className="space-x-2 flex">
                            <div className="flex items-center gap-1.5 text-xs">
                              <MapPin className="size-3 text-blue-500 shrink-0" />
                              <span className="truncate text-gray-700 dark:text-gray-300">
                                {incident.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="size-3 text-green-500 shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {incident.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm line-clamp-2 text-gray-600 dark:text-gray-400">
                      {incident.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block">
                          Population
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {incident.affectedPopulation}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block">
                          Teams
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {incident.responseTeams}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={getSeverityColor(incident.severity)}
                          className="text-xs"
                        >
                          {incident.severity}
                        </Badge>
                        <Badge
                          variant={getStatusColor(incident.status)}
                          className="text-xs"
                        >
                          {incident.status}
                        </Badge>
                      </div>
                      <Link
                        href={`/incidents/${incident.eventId}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mt-2"
                      >
                        <Eye className="size-3" />
                        View Details
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredIncidents.length === 0 && !loading && (
              <Card className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-full mb-6">
                    <AlertTriangle className="size-12 text-gray-400" />
                  </div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {incidents.length === 0
                      ? "No incidents available"
                      : "No incidents match your filters"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-4">
                    {incidents.length === 0
                      ? "We're currently loading incident data from GDACS. Please check back in a moment."
                      : "No incidents match your current filters. Try adjusting your search criteria or reset filters to see all incidents."}
                  </p>
                  {incidents.length > 0 && (
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Reset Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
