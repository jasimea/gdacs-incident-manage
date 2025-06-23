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

  // Mock detailed incident data - replace with actual data fetching
  const incident = {
    id: parseInt(id),
    title: "Earthquake - Magnitude 6.2",
    location: "Central Turkey",
    coordinates: "39.7392° N, 32.8511° E",
    severity: "High",
    status: "Active",
    date: "2025-06-23",
    time: "14:32 UTC",
    description:
      "Strong earthquake detected in central Turkey region. Emergency response teams deployed to affected areas. Magnitude 6.2 earthquake struck at a depth of 10km, causing significant structural damage in nearby settlements.",
    type: "Earthquake",
    affectedPopulation: "2.3M",
    responseTeams: 12,
    magnitude: "6.2",
    depth: "10 km",
    epicenter: "15km NE of Ankara",
    casualties: {
      confirmed: 45,
      injured: 312,
      missing: 8,
    },
    infrastructure: {
      buildingsCollapsed: 127,
      roadsClosed: 23,
      bridgesDamaged: 5,
      powerOutages: "65%",
    },
    response: {
      searchRescueTeams: 12,
      medicalTeams: 8,
      evacuationCenters: 15,
      emergencySupplies: "Deployed",
    },
    timeline: [
      { time: "14:32", event: "Earthquake detected - Magnitude 6.2" },
      { time: "14:35", event: "Emergency alert system activated" },
      { time: "14:40", event: "First response teams dispatched" },
      { time: "15:15", event: "International aid requested" },
      { time: "16:30", event: "Evacuation centers established" },
      { time: "18:00", event: "Search and rescue operations ongoing" },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/incidents">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Incidents
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <span className="text-2xl">{getTypeIcon(incident.type)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {incident.title}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Incident ID: #{incident.id} • {incident.location}
              </p>
            </div>
            <div className="flex gap-2 ml-auto">
              <Badge
                variant={getSeverityColor(incident.severity)}
                className="text-sm font-semibold"
              >
                {incident.severity}
              </Badge>
              <Badge
                variant={getStatusColor(incident.status)}
                className="text-sm font-semibold"
              >
                {incident.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">
                    Affected Population
                  </p>
                  <p className="text-3xl font-bold">
                    {incident.affectedPopulation}
                  </p>
                </div>
                <Users className="size-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Response Teams
                  </p>
                  <p className="text-3xl font-bold">{incident.responseTeams}</p>
                </div>
                <Shield className="size-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Magnitude</p>
                  <p className="text-3xl font-bold">{incident.magnitude}</p>
                </div>
                <Activity className="size-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Depth</p>
                  <p className="text-3xl font-bold">{incident.depth}</p>
                </div>
                <Globe className="size-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Incident Overview */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="size-5" />
                  Incident Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {incident.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="size-4 text-blue-500" />
                      <span className="font-medium">Coordinates:</span>
                    </div>
                    <p className="text-gray-900 dark:text-white ml-6">
                      {incident.coordinates}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="size-4 text-green-500" />
                      <span className="font-medium">Time:</span>
                    </div>
                    <p className="text-gray-900 dark:text-white ml-6">
                      {incident.time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Casualties */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  Casualties & Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {incident.casualties.confirmed}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Confirmed
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {incident.casualties.injured}
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Injured
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {incident.casualties.missing}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Missing
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Infrastructure Impact
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Buildings Collapsed:</span>
                      <span className="font-semibold">
                        {incident.infrastructure.buildingsCollapsed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Roads Closed:</span>
                      <span className="font-semibold">
                        {incident.infrastructure.roadsClosed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bridges Damaged:</span>
                      <span className="font-semibold">
                        {incident.infrastructure.bridgesDamaged}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Power Outages:</span>
                      <span className="font-semibold text-red-600">
                        {incident.infrastructure.powerOutages}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Response Operations */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Response Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="size-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Search & Rescue
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {incident.response.searchRescueTeams}
                    </p>
                    <p className="text-xs text-gray-600">Teams Deployed</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="size-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Medical Teams</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {incident.response.medicalTeams}
                    </p>
                    <p className="text-xs text-gray-600">Teams Active</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="size-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Evacuation Centers
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {incident.response.evacuationCenters}
                    </p>
                    <p className="text-xs text-gray-600">Centers Active</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="size-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">Supplies</span>
                    </div>
                    <p className="text-lg font-bold text-orange-600">
                      {incident.response.emergencySupplies}
                    </p>
                    <p className="text-xs text-gray-600">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Incident Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incident.timeline.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="size-3 bg-blue-500 rounded-full"></div>
                        {index < incident.timeline.length - 1 && (
                          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-blue-600">
                            {event.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {event.event}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
