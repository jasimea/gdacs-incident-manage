import { Package, Calendar, Download, Eye, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  // Mock product data - replace with actual data fetching
  const products = [
    {
      id: 1,
      name: "Earthquake Risk Assessment Report",
      type: "Risk Assessment",
      format: "PDF",
      size: "2.4 MB",
      createdDate: "2025-06-23",
      description:
        "Comprehensive earthquake risk analysis for Central Turkey region including vulnerability maps and recommendations.",
      status: "Available",
      region: "Central Turkey",
    },
    {
      id: 2,
      name: "Tropical Cyclone Track Forecast",
      type: "Forecast",
      format: "GeoJSON",
      size: "856 KB",
      createdDate: "2025-06-22",
      description:
        "Real-time tracking data and forecast models for Tropical Cyclone approaching Philippines.",
      status: "Updated",
      region: "Philippines",
    },
    {
      id: 3,
      name: "Flood Impact Analysis",
      type: "Impact Analysis",
      format: "Excel",
      size: "1.2 MB",
      createdDate: "2025-06-21",
      description:
        "Detailed analysis of flood impact on population and infrastructure in Bangladesh.",
      status: "Available",
      region: "Bangladesh",
    },
    {
      id: 4,
      name: "Emergency Response Plan",
      type: "Response Plan",
      format: "PDF",
      size: "3.1 MB",
      createdDate: "2025-06-20",
      description:
        "Updated emergency response protocols and evacuation procedures for disaster management.",
      status: "Available",
      region: "Multi-region",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "updated":
        return "default";
      case "available":
        return "secondary";
      case "processing":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "risk assessment":
        return "destructive";
      case "forecast":
        return "default";
      case "impact analysis":
        return "secondary";
      case "response plan":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="size-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Products & Reports</h1>
          <p className="text-muted-foreground">
            Access disaster management products and analytical reports
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {products.map((product) => (
          <Card key={product.id} className="w-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5" />
                    {product.name}
                  </CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getTypeColor(product.type)}>
                    {product.type}
                  </Badge>
                  <Badge variant={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-muted-foreground" />
                  <span className="font-medium">Format:</span>
                  <span>{product.format}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="font-medium">Size:</span>
                  <span>{product.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span>{product.createdDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-muted-foreground" />
                  <span className="font-medium">Region:</span>
                  <span>{product.region}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="size-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="size-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No products available</p>
            <p className="text-muted-foreground">
              No reports or products to display
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
