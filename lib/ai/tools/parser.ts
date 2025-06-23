import https from "https";
import { DOMParser } from "xmldom";

interface GDACSEvent {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  category?: string;
  eventType?: string;
  alertLevel?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  // GDACS-specific fields
  eventId?: string;
  eventName?: string;
  episodeId?: string;
  alertScore?: number;
  severity?: {
    unit: string;
    value: number;
    description: string;
  };
  population?: {
    unit: string;
    value: number;
    description: string;
  };
  vulnerability?: {
    value: number;
    level: string;
  };
  iso3?: string;
  fromDate?: string;
  toDate?: string;
  lastModified?: string;
  bbox?: string;
  iconUrl?: string;
  mapImage?: string;
  isCurrent?: boolean;
  temporary?: boolean;
  // Additional GDACS fields
  eventTypeCode?: string;
  resources?: Array<{
    uri: string;
    title: string;
  }>;
  affectedCountries?: string[];
}

class GDACSRSSParser {
  private readonly rssUrl = "https://www.gdacs.org/xml/rss.xml";

  /**
   * Downloads and parses the GDACS RSS feed
   * @returns Promise<GDACSEvent[]> Array of parsed disaster events
   */
  async fetchAndParseEvents(): Promise<GDACSEvent[]> {
    try {
      const xmlText = await this.downloadXML();
      return this.parseXML(xmlText);
    } catch (error) {
      console.error("Error fetching GDACS RSS feed:", error);
      throw error;
    }
  }

  /**
   * Downloads XML content using Node.js https module
   * @returns Promise<string> Raw XML string
   */
  private downloadXML(): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = https.get(this.rssUrl, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          if (response.headers.location) {
            https.get(
              response.headers.location,
              this.handleResponse(resolve, reject)
            );
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP error! status: ${response.statusCode}`));
          return;
        }

        let data = "";
        response.setEncoding("utf8");

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });
      });

      request.on("error", (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error("Request timeout"));
      });
    });
  }

  /**
   * Helper method to handle HTTP response
   * @param resolve Promise resolve function
   * @param reject Promise reject function
   * @returns Response handler function
   */
  private handleResponse(
    resolve: (value: string) => void,
    reject: (reason: Error) => void
  ) {
    return (response: any) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP error! status: ${response.statusCode}`));
        return;
      }

      let data = "";
      response.setEncoding("utf8");

      response.on("data", (chunk: string) => {
        data += chunk;
      });

      response.on("end", () => {
        resolve(data);
      });
    };
  }

  /**
   * Parses XML string into array of GDACS events
   * @param xmlText Raw XML string
   * @returns GDACSEvent[] Array of parsed events
   */
  private parseXML(xmlText: string): GDACSEvent[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
    if (parserError) {
      throw new Error("XML parsing error: " + parserError.textContent);
    }

    const items = xmlDoc.getElementsByTagName("item");
    const events: GDACSEvent[] = [];

    for (let i = 0; i < items.length; i++) {
      const event = this.parseItem(items[i]);
      if (event) {
        events.push(event);
      }
    }

    return events;
  }

  /**
   * Parses individual RSS item into GDACSEvent
   * @param item XML item element
   * @returns GDACSEvent | null
   */
  private parseItem(item: Element): GDACSEvent | null {
    try {
      const title = this.getElementText(item, "title");
      const link = this.getElementText(item, "link");
      const description = this.getElementText(item, "description");
      const pubDate = this.getElementText(item, "pubDate");
      const guid = this.getElementText(item, "guid");

      if (!title || !link || !description || !pubDate) {
        console.warn("Skipping item with missing required fields");
        return null;
      }

      const event: GDACSEvent = {
        title,
        link,
        description,
        pubDate,
        guid: guid || link,
      };

      // Extract additional information from GDACS-specific elements
      event.category = this.getElementText(item, "category") as
        | string
        | undefined;

      // GDACS-specific elements
      event.eventId = this.getElementText(item, "gdacs:eventid") as
        | string
        | undefined;
      event.eventName = this.getElementText(item, "gdacs:eventname") as
        | string
        | undefined;
      event.episodeId = this.getElementText(item, "gdacs:episodeid") as
        | string
        | undefined;
      event.alertLevel = this.getElementText(item, "gdacs:alertlevel") as
        | string
        | undefined;
      event.iso3 = this.getElementText(item, "gdacs:iso3") as
        | string
        | undefined;
      event.country = this.getElementText(item, "gdacs:country") as
        | string
        | undefined;
      event.fromDate = this.getElementText(item, "gdacs:fromdate") as
        | string
        | undefined;
      event.toDate = this.getElementText(item, "gdacs:todate") as
        | string
        | undefined;
      event.lastModified = this.getElementText(item, "gdacs:lastmodified") as
        | string
        | undefined;
      event.bbox = this.getElementText(item, "gdacs:bbox") as
        | string
        | undefined;
      event.iconUrl = this.getElementText(item, "gdacs:icon") as
        | string
        | undefined;
      event.mapImage = this.getElementText(item, "gdacs:mapimage") as
        | string
        | undefined;
      event.eventTypeCode = this.getElementText(item, "gdacs:eventtype") as
        | string
        | undefined;

      // Parse boolean values
      const isCurrentText = this.getElementText(item, "gdacs:iscurrent");
      event.isCurrent = isCurrentText === "true";
      const temporaryText = this.getElementText(item, "gdacs:temporary");
      event.temporary = temporaryText === "true";

      // Parse alert score
      const alertScoreText = this.getElementText(item, "gdacs:alertscore");
      if (alertScoreText) {
        event.alertScore = parseInt(alertScoreText);
      }

      // Parse resources
      const resourceElements = item.getElementsByTagName("gdacs:resources");
      if (resourceElements.length > 0) {
        event.resources = [];
        for (let j = 0; j < resourceElements.length; j++) {
          const resourceElement = resourceElements[j];
          const uri = resourceElement.getAttribute("uri");
          const title = resourceElement.textContent?.trim();
          if (uri && title) {
            event.resources.push({ uri, title });
          }
        }
      }

      // Parse affected countries
      const affectedCountriesText = this.getElementText(
        item,
        "gdacs:affectedcountries"
      );
      if (affectedCountriesText) {
        event.affectedCountries = affectedCountriesText
          .split(",")
          .map((c) => c.trim());
      }

      // Parse severity with attributes
      const severityElement = item.getElementsByTagName("gdacs:severity")[0];
      if (severityElement) {
        const unit = severityElement.getAttribute("unit");
        const value = severityElement.getAttribute("value");
        const description = severityElement.textContent?.trim();
        if (unit && value && description) {
          event.severity = {
            unit,
            value: parseFloat(value),
            description,
          };
        }
      }

      // Parse population with attributes
      const populationElement =
        item.getElementsByTagName("gdacs:population")[0];
      if (populationElement) {
        const unit = populationElement.getAttribute("unit");
        const value = populationElement.getAttribute("value");
        const description = populationElement.textContent?.trim();
        if (unit && value && description) {
          event.population = {
            unit,
            value: parseFloat(value),
            description,
          };
        }
      }

      // Parse vulnerability
      const vulnerabilityElement = item.getElementsByTagName(
        "gdacs:vulnerability"
      )[0];
      if (vulnerabilityElement) {
        const value = vulnerabilityElement.getAttribute("value");
        const level = vulnerabilityElement.textContent?.trim();
        if (value && level) {
          event.vulnerability = {
            value: parseInt(value),
            level,
          };
        }
      }

      // Parse coordinates from georss:point if available
      const geoPoint =
        this.getElementText(item, "georss:point") ||
        this.getElementText(item, "geo:point") ||
        this.getElementText(item, "point");
      if (geoPoint) {
        const coords = geoPoint.trim().split(" ");
        if (coords.length === 2) {
          event.coordinates = {
            lat: parseFloat(coords[0]),
            lon: parseFloat(coords[1]),
          };
        }
      }

      // Extract event type from gdacs:eventtype or fallback to title parsing
      if (event.eventTypeCode) {
        event.eventType = this.mapEventTypeCode(event.eventTypeCode);
      } else {
        event.eventType = this.extractEventType(title);
      }

      return event;
    } catch (error) {
      console.error("Error parsing RSS item:", error);
      return null;
    }
  }

  /**
   * Safely extracts text content from XML element
   * @param parent Parent element
   * @param tagName Tag name to search for
   * @returns string | null
   */
  private getElementText(parent: Element, tagName: string): string | null {
    const elements = parent.getElementsByTagName(tagName);
    if (elements.length > 0) {
      return elements[0].textContent?.trim() || null;
    }
    return null;
  }

  /**
   * Extracts event type from title
   * @param title Event title
   * @returns string | undefined
   */
  private extractEventType(title: string): string | undefined {
    const eventTypes = [
      "Earthquake",
      "Flood",
      "Tropical Cyclone",
      "Volcano",
      "Drought",
      "Fire",
    ];
    const upperTitle = title.toUpperCase();

    for (const type of eventTypes) {
      if (upperTitle.includes(type.toUpperCase())) {
        return type;
      }
    }

    return undefined;
  }

  /**
   * Extracts alert level from title
   * @param title Event title
   * @returns string | undefined
   */
  private extractAlertLevel(title: string): string | undefined {
    const alertLevels = ["Red", "Orange", "Green"];
    const upperTitle = title.toUpperCase();

    for (const level of alertLevels) {
      if (upperTitle.includes(level.toUpperCase())) {
        return level;
      }
    }

    return undefined;
  }

  /**
   * Extracts country from title
   * @param title Event title
   * @returns string | undefined
   */
  private extractCountry(title: string): string | undefined {
    // Basic country extraction - looks for text after "in " or before " -"
    const inMatch = title.match(/in\s+([^-,]+)/i);
    if (inMatch) {
      return inMatch[1].trim();
    }

    const dashMatch = title.match(/([^-]+)\s*-/);
    if (dashMatch) {
      const potential = dashMatch[1].trim();
      // Simple check to avoid extracting event types as countries
      if (
        !["Earthquake", "Flood", "Cyclone", "Volcano", "Drought", "Fire"].some(
          (type) => potential.includes(type)
        )
      ) {
        return potential;
      }
    }

    return undefined;
  }

  /**
   * Maps GDACS event type codes to readable names
   * @param code GDACS event type code
   * @returns string Readable event type name
   */
  private mapEventTypeCode(code: string): string {
    const typeMap: Record<string, string> = {
      EQ: "Earthquake",
      FL: "Flood",
      TC: "Tropical Cyclone",
      VO: "Volcano",
      DR: "Drought",
      WF: "Wildfire",
      CY: "Cyclone",
    };

    return typeMap[code] || code;
  }
}

// Usage example:
async function main() {
  try {
    const parser = new GDACSRSSParser();
    const events = await parser.fetchAndParseEvents();

    console.log(`Found ${events.length} disaster events:`);
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   Type: ${event.eventType || "Unknown"}`);
      console.log(`   Alert: ${event.alertLevel || "No alert"}`);
      console.log(`   Country: ${event.country || "Unknown"}`);
      if (event.coordinates) {
        console.log(
          `   Location: ${event.coordinates.lat}, ${event.coordinates.lon}`
        );
      }
      console.log(`   Link: ${event.link}`);
      console.log("");
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);
  }
}

// Uncomment to run the example
// main();

export { GDACSRSSParser, type GDACSEvent };
