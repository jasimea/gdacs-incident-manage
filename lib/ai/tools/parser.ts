import https from 'https';
import { DOMParser } from 'xmldom';

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
}

class GDACSRSSParser {
  private readonly rssUrl = 'https://www.gdacs.org/xml/rss.xml';

  /**
   * Downloads and parses the GDACS RSS feed
   * @returns Promise<GDACSEvent[]> Array of parsed disaster events
   */
  async fetchAndParseEvents(): Promise<GDACSEvent[]> {
    try {
      const xmlText = await this.downloadXML();
      return this.parseXML(xmlText);
    } catch (error) {
      console.error('Error fetching GDACS RSS feed:', error);
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
            https.get(response.headers.location, this.handleResponse(resolve, reject));
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP error! status: ${response.statusCode}`));
          return;
        }

        let data = '';
        response.setEncoding('utf8');
        
        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          resolve(data);
        });
      });

      request.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * Helper method to handle HTTP response
   * @param resolve Promise resolve function
   * @param reject Promise reject function
   * @returns Response handler function
   */
  private handleResponse(resolve: (value: string) => void, reject: (reason: Error) => void) {
    return (response: any) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP error! status: ${response.statusCode}`));
        return;
      }

      let data = '';
      response.setEncoding('utf8');
      
      response.on('data', (chunk: string) => {
        data += chunk;
      });

      response.on('end', () => {
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
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
    if (parserError) {
      throw new Error('XML parsing error: ' + parserError.textContent);
    }

    const items = xmlDoc.getElementsByTagName('item');
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
      const title = this.getElementText(item, 'title');
      const link = this.getElementText(item, 'link');
      const description = this.getElementText(item, 'description');
      const pubDate = this.getElementText(item, 'pubDate');
      const guid = this.getElementText(item, 'guid');

      if (!title || !link || !description || !pubDate) {
        console.warn('Skipping item with missing required fields');
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
      event.category = this.getElementText(item, 'category') as string | undefined;
      
      // Parse coordinates from georss:point if available
      const geoPoint = this.getElementText(item, 'georss:point') || 
                      this.getElementText(item, 'geo:point') ||
                      this.getElementText(item, 'point');
      if (geoPoint) {
        const coords = geoPoint.trim().split(' ');
        if (coords.length === 2) {
          event.coordinates = {
            lat: parseFloat(coords[0]),
            lon: parseFloat(coords[1])
          };
        }
      }

      // Extract event type and alert level from title or description
      event.eventType = this.extractEventType(title);
      event.alertLevel = this.extractAlertLevel(title);
      event.country = this.extractCountry(title);

      return event;
    } catch (error) {
      console.error('Error parsing RSS item:', error);
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
    const eventTypes = ['Earthquake', 'Flood', 'Tropical Cyclone', 'Volcano', 'Drought', 'Fire'];
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
    const alertLevels = ['Red', 'Orange', 'Green'];
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
      if (!['Earthquake', 'Flood', 'Cyclone', 'Volcano', 'Drought', 'Fire'].some(
        type => potential.includes(type)
      )) {
        return potential;
      }
    }
    
    return undefined;
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
      console.log(`   Type: ${event.eventType || 'Unknown'}`);
      console.log(`   Alert: ${event.alertLevel || 'No alert'}`);
      console.log(`   Country: ${event.country || 'Unknown'}`);
      if (event.coordinates) {
        console.log(`   Location: ${event.coordinates.lat}, ${event.coordinates.lon}`);
      }
      console.log(`   Link: ${event.link}`);
      console.log('');
    });
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }
}

// Uncomment to run the example
// main();

export { GDACSRSSParser, type GDACSEvent };