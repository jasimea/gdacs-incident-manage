import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { getAllSampleProducts, sampleWaterProducts } from '@/lib/sample-product-data';
import { generateObject } from 'ai';
import { z } from 'zod';

interface GDACSIncidentData {
  eventId: string;
  title: string;
  eventType: string;
  alertLevel: string;
  country: string;
  startDate: string;
  duration: string;
  impact: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  affectedPopulation?: number;
  casualties?: number;
}

interface ProductRecommendation {
  itemCode: string;
  name: string;
  quantity: number;
  category: string;
  description: string;
}

async function fetchGDACSIncidentData(eventId: string): Promise<GDACSIncidentData | null> {
  try {
    const response = await fetch(`https://www.gdacs.org/xml/rss.xml`);
    if (!response.ok) {
      throw new Error(`Failed to fetch GDACS data: ${response.status}`);
    }
    
    const html = await response.text();
const {object} = await generateObject({
  model: myProvider.languageModel('chat-model'),
  prompt: `
  You are a helpful assistant that can extract the incident data from the GDACS RSS feed.
  The RSS feed is in XML format.
  The incident data is in the title of the RSS item.
  The incident data is in the following format:
  <item>
<title>Green earthquake alert (Magnitude 6.1M, Depth:10km) in Russia 21/06/2025 21:23 UTC, 30 thousand in 100km.</title>
<description>On 6/21/2025 9:23:17 PM, an earthquake occurred in Russia potentially affecting 30 thousand in 100km. The earthquake had Magnitude 6.1M, Depth:10km.</description>
<enclosure type="image/png" length="1" url="https://www.gdacs.org/contentdata/resources/imgtemp/gdacs/eq/eq1644565_1.png"/>
<gdacs:temporary>false</gdacs:temporary>
<link>https://www.gdacs.org/report.aspx?eventtype=EQ&eventid=1486908</link>
<pubDate>Sat, 21 Jun 2025 21:42:31 GMT</pubDate>
<gdacs:dateadded>Sat, 21 Jun 2025 21:42:31 GMT</gdacs:dateadded>
<gdacs:datemodified>Sat, 21 Jun 2025 23:51:23 GMT</gdacs:datemodified>
<gdacs:iscurrent>true</gdacs:iscurrent>
<gdacs:fromdate>Sat, 21 Jun 2025 21:23:17 GMT</gdacs:fromdate>
<gdacs:todate>Sat, 21 Jun 2025 21:23:17 GMT</gdacs:todate>
<gdacs:durationinweek>0</gdacs:durationinweek>
<gdacs:year>2025</gdacs:year>
<dc:subject>EQ1</dc:subject>
<guid isPermaLink="false">EQ1486908</guid>
<geo:Point>
...
</geo:Point>
<!-- gdacs:bbox format = lonmin lonmax latmin latmax -->
<gdacs:bbox>142.5037 150.5037 38.9017 46.9017</gdacs:bbox>
<georss:point>42.9017 146.5037</georss:point>
<gdacs:cap>https://www.gdacs.org/contentdata/resources/EQ/1486908/cap_1486908.xml</gdacs:cap>
<gdacs:icon>https://www.gdacs.org/Images/gdacs_icons/alerts/Green/EQ.png</gdacs:icon>
<gdacs:version>1</gdacs:version>
<gdacs:eventtype>EQ</gdacs:eventtype>
<gdacs:alertlevel>Green</gdacs:alertlevel>
<gdacs:alertscore>0</gdacs:alertscore>
<gdacs:episodealertlevel>Green</gdacs:episodealertlevel>
<gdacs:episodealertscore>1</gdacs:episodealertscore>
<gdacs:eventname/>
<gdacs:eventid>1486908</gdacs:eventid>
<gdacs:episodeid>1644565</gdacs:episodeid>
<gdacs:calculationtype>earthquakeonly</gdacs:calculationtype>
<gdacs:severity unit="M" value="6.1">Magnitude 6.1M, Depth:10km</gdacs:severity>
<gdacs:population unit="in MMI IV" value="30761">30 thousand in MMI IV</gdacs:population>
<gdacs:vulnerability value="1.3145341380124"/>
<gdacs:iso3>RUS</gdacs:iso3>
<gdacs:country>Russia</gdacs:country>
<gdacs:glide/>
<gdacs:mapimage/>
<gdacs:maplink/>
<gdacs:gtsimage/>
<gdacs:gtslink/>
<gdacs:resources>
...
</gdacs:resources>
</item>
<item>

Extract the incident data from the RSS feed. Extract only the information about the passed event id ${eventId}. check gdacs:eventid property for matching the event id.



  `,
  schema: z.object({
    eventId: z.string(),
    title: z.string(),
    eventType: z.string(),
    alertLevel: z.string(),
    country: z.string(),
    startDate: z.string(),
    duration: z.string(),
    impact: z.string(),
    description: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    affectedPopulation: z.number(),
    casualties: z.number(),
  }),


  
  
})

  return object;

    
  } catch (error) {
    console.error('Error fetching GDACS data:', error);
    return null;
  }
}

async function getProductDetails(itemCode: string): Promise<ProductRecommendation> {
  // This would typically fetch from your product catalog
  // For now, returning mock data
  const productMap: Record<string, ProductRecommendation> = {
    'FOOD-001': {
      itemCode: 'FOOD-001',
      name: 'Emergency Food Rations',
      quantity: 0,
      category: 'Food & Nutrition',
      description: 'High-calorie emergency food rations suitable for disaster relief'
    },
    'WATER-001': {
      itemCode: 'WATER-001',
      name: 'Water Purification Tablets',
      quantity: 0,
      category: 'Water & Sanitation',
      description: 'Portable water purification tablets for emergency use'
    },
    'SHELTER-001': {
      itemCode: 'SHELTER-001',
      name: 'Emergency Tents',
      quantity: 0,
      category: 'Shelter',
      description: 'Weather-resistant emergency shelter tents'
    },
    'MED-001': {
      itemCode: 'MED-001',
      name: 'First Aid Kits',
      quantity: 0,
      category: 'Medical Supplies',
      description: 'Comprehensive first aid kits for emergency medical care'
    },
    'HYGIENE-001': {
      itemCode: 'HYGIENE-001',
      name: 'Hygiene Kits',
      quantity: 0,
      category: 'Hygiene',
      description: 'Personal hygiene kits including soap, toothbrushes, and sanitary items'
    }
  };
  
  return productMap[itemCode] || {
    itemCode,
    name: `Product ${itemCode}`,
    quantity: 0,
    category: 'General',
    description: 'General relief item'
  };
}

function generateHTMLReport(
  incidentData: GDACSIncidentData,
  products: ProductRecommendation[]
): string {
  const alertLevelColor = {
    'Green': 'bg-green-500',
    'Orange': 'bg-orange-500',
    'Red': 'bg-red-500'
  }[incidentData.alertLevel] || 'bg-gray-500';

  const alertLevelBgColor = {
    'Green': 'bg-green-50',
    'Orange': 'bg-orange-50',
    'Red': 'bg-red-50'
  }[incidentData.alertLevel] || 'bg-gray-50';

  const alertLevelBorderColor = {
    'Green': 'border-green-500',
    'Orange': 'border-orange-500',
    'Red': 'border-red-500'
  }[incidentData.alertLevel] || 'border-gray-500';

  const alertLevelTextColor = {
    'Green': 'text-green-700',
    'Orange': 'text-orange-700',
    'Red': 'text-red-700'
  }[incidentData.alertLevel] || 'text-gray-700';

  const totalUnits = products.reduce((sum: number, product: ProductRecommendation) => sum + product.quantity, 0);

  return `
    <div class="size-full overflow-auto bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div class="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        <!-- Alert Level Indicator -->
        <div class="absolute top-0 left-0 right-0 h-1.5 ${alertLevelColor}"></div>
        
        <!-- Header -->
        <div class="bg-gradient-to-br from-slate-800 to-slate-700 text-white p-12 text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          <h1 class="text-5xl font-black mb-4 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent relative z-10">
            ${incidentData.title}
          </h1>
          <div class="text-xl font-light opacity-90 mb-6 relative z-10">Humanitarian Response Report</div>
          <div class="inline-block ${alertLevelColor} text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg uppercase tracking-wider relative z-10">
            ${incidentData.alertLevel} Alert Level
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-12 ${alertLevelBgColor}">
          <!-- Incident Overview Section -->
          <div class="mb-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 class="text-3xl font-bold text-slate-800 border-b-4 ${alertLevelBorderColor} pb-4 mb-8 text-center relative">
              📊 Incident Overview
              <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 ${alertLevelColor} rounded-full"></div>
            </h2>
            
            <!-- Incident Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 relative">
                <div class="absolute top-0 left-0 right-0 h-1 ${alertLevelColor}"></div>
                <h3 class="text-xl font-bold text-slate-800 mb-4 text-center relative">
                  Event Details
                  <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 ${alertLevelColor} rounded-full"></div>
                </h3>
                <div class="space-y-2 text-center">
                  <p class="text-slate-600"><span class="font-semibold text-slate-800">Event ID:</span> ${incidentData.eventId}</p>
                  <p class="text-slate-600"><span class="font-semibold text-slate-800">Event Type:</span> ${incidentData.eventType}</p>
                  <p class="text-slate-600"><span class="font-semibold text-slate-800">Country:</span> ${incidentData.country}</p>
                </div>
              </div>
              
              <div class="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 relative">
                <div class="absolute top-0 left-0 right-0 h-1 ${alertLevelColor}"></div>
                <h3 class="text-xl font-bold text-slate-800 mb-4 text-center relative">
                  ⏰ Timeline
                  <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 ${alertLevelColor} rounded-full"></div>
                </h3>
                <div class="space-y-2 text-center">
                  <p class="text-slate-600"><span class="font-semibold text-slate-800">Start Date:</span> ${incidentData.startDate}</p>
                  <p class="text-slate-600"><span class="font-semibold text-slate-800">Duration:</span> ${incidentData.duration}</p>
                  <p class="text-slate-600"><span class="font-semibold text-slate-800">Generated:</span> ${new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div class="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 relative">
                <div class="absolute top-0 left-0 right-0 h-1 ${alertLevelColor}"></div>
                <h3 class="text-xl font-bold text-slate-800 mb-4 text-center relative">
                  📈 Impact Assessment
                  <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 ${alertLevelColor} rounded-full"></div>
                </h3>
                <div class="space-y-2 text-center">
                  <p class="text-slate-600"><span class="font-semibold text-slate-800">Impact Level:</span> ${incidentData.impact}</p>
                  <p class="text-slate-600"><span class="font-semibold text-slate-800">Alert Level:</span> ${incidentData.alertLevel}</p>
                  <p class="text-slate-600"><span class="font-semibold text-slate-800">Status:</span> <span class="text-green-600 font-bold">Active</span></p>
                </div>
              </div>
            </div>
            
            <!-- Statistics Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-white p-6 rounded-xl text-center shadow-md border border-gray-100">
                <div class="text-3xl font-black ${alertLevelTextColor} mb-2">${incidentData.affectedPopulation?.toLocaleString() || 'N/A'}</div>
                <div class="text-sm text-slate-500 uppercase tracking-wider font-medium">Affected Population</div>
              </div>
              <div class="bg-white p-6 rounded-xl text-center shadow-md border border-gray-100">
                <div class="text-3xl font-black ${alertLevelTextColor} mb-2">${incidentData.casualties?.toLocaleString() || '0'}</div>
                <div class="text-sm text-slate-500 uppercase tracking-wider font-medium">Casualties</div>
              </div>
              <div class="bg-white p-6 rounded-xl text-center shadow-md border border-gray-100">
                <div class="text-3xl font-black ${alertLevelTextColor} mb-2">${products.length}</div>
                <div class="text-sm text-slate-500 uppercase tracking-wider font-medium">Products Recommended</div>
              </div>
              <div class="bg-white p-6 rounded-xl text-center shadow-md border border-gray-100">
                <div class="text-3xl font-black ${alertLevelTextColor} mb-2">${totalUnits.toLocaleString()}</div>
                <div class="text-sm text-slate-500 uppercase tracking-wider font-medium">Total Units</div>
              </div>
            </div>
          </div>
          
          <!-- Products Section -->
          <div class="mb-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 class="text-3xl font-bold text-slate-800 border-b-4 ${alertLevelBorderColor} pb-4 mb-8 text-center relative">
              📦 Recommended Humanitarian Products
              <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 ${alertLevelColor} rounded-full"></div>
            </h2>
            
            <div class="overflow-x-auto">
              <table class="w-full border-collapse rounded-xl overflow-hidden shadow-lg">
                <thead>
                  <tr class="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                    <th class="p-4 text-left font-bold text-sm uppercase tracking-wider">Product Code</th>
                    <th class="p-4 text-left font-bold text-sm uppercase tracking-wider">Product Name</th>
                    <th class="p-4 text-left font-bold text-sm uppercase tracking-wider">Category</th>
                    <th class="p-4 text-center font-bold text-sm uppercase tracking-wider">Quantity</th>
                    <th class="p-4 text-left font-bold text-sm uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody>
                  ${products.map((product: ProductRecommendation, index: number) => `
                    <tr class="${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-200">
                      <td class="p-4 font-bold text-slate-800">${product.itemCode}</td>
                      <td class="p-4 text-slate-700">${product.name}</td>
                      <td class="p-4 text-slate-600">${product.category}</td>
                      <td class="p-4 text-center">
                        <span class="inline-block ${alertLevelColor} text-white px-4 py-2 rounded-full font-bold text-sm shadow-md">
                          ${product.quantity.toLocaleString()}
                        </span>
                      </td>
                      <td class="p-4 text-slate-600">${product.description}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Response Recommendations Section -->
          <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 class="text-3xl font-bold text-slate-800 border-b-4 ${alertLevelBorderColor} pb-4 mb-8 text-center relative">
              🚨 Response Recommendations
              <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 ${alertLevelColor} rounded-full"></div>
            </h2>
            
            <div class="bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300 rounded-2xl p-8">
              <h3 class="text-2xl font-bold text-amber-800 mb-6 text-center">Immediate Actions Required</h3>
              <div class="space-y-4">
                <div class="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-md flex items-center">
                  <span class="text-amber-500 font-bold mr-3 text-xl">→</span>
                  <span class="font-medium text-slate-700">Deploy emergency response teams to affected areas</span>
                </div>
                <div class="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-md flex items-center">
                  <span class="text-amber-500 font-bold mr-3 text-xl">→</span>
                  <span class="font-medium text-slate-700">Establish distribution centers for humanitarian aid</span>
                </div>
                <div class="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-md flex items-center">
                  <span class="text-amber-500 font-bold mr-3 text-xl">→</span>
                  <span class="font-medium text-slate-700">Coordinate with local authorities and NGOs</span>
                </div>
                <div class="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-md flex items-center">
                  <span class="text-amber-500 font-bold mr-3 text-xl">→</span>
                  <span class="font-medium text-slate-700">Monitor situation for escalation</span>
                </div>
                <div class="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-md flex items-center">
                  <span class="text-amber-500 font-bold mr-3 text-xl">→</span>
                  <span class="font-medium text-slate-700">Set up communication channels with affected communities</span>
                </div>
                <div class="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-md flex items-center">
                  <span class="text-amber-500 font-bold mr-3 text-xl">→</span>
                  <span class="font-medium text-slate-700">Prepare medical facilities for potential casualties</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="bg-gradient-to-br from-slate-800 to-slate-700 p-8 text-center text-slate-200 border-t border-slate-600">
          <p class="text-lg font-medium mb-2">Generated by AI Incident Response Coordinator</p>
          <div class="text-sm text-slate-400 italic">
            Report generated on ${new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  `;
}

export const reportDocumentHandler = createDocumentHandler({
  kind: 'report',
  onCreateDocument: async ({ id, options, title, dataStream, session }) => {
    const {eventId, products} = options;
    
    // Extract eventId from the title or generate a random one for demo
    //const eventId = title.match(/Event ID: (\d+)/)?.[1] || '1016833';
    
    // Fetch incident data from GDACS
    const incidentData = await fetchGDACSIncidentData(eventId);
    console.log('incidentData', incidentData);

    if(!products?.length){
      throw new Error('No products provided');
    }
    
    // For demo purposes, use sample products
    // In a real implementation, these would come from the AI agent's analysis
   const allProducts = getAllSampleProducts();
   const sampleProducts = allProducts.filter((product) => products.some((p:any) => p.itemCode === product.itemCode));
   console.log('sampleProducts', sampleProducts.length);
    // Generate the HTML report
    const htmlContent = generateHTMLReport(incidentData!, sampleProducts.map((product) => ({
      itemCode: product.itemCode!,
      name: product.name!,
      quantity: product.quantity!,
      category: product.categoryId!,
      description: product.description!,
    })));
    
    // Stream the content
    dataStream.writeData({
      type: 'text-delta',
      content: htmlContent,
    });

    
    
    return htmlContent;
  },
  onUpdateDocument: async ({ document, description, dataStream, session }) => {
    console.log('Update')
    // For updates, we could regenerate the report with new data
    // For now, just return the existing content
    return document.content || '';
  },
}); 