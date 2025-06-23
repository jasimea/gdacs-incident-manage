/**
 * Test script for the Product API endpoint
 * Usage: npm run test:products
 */

async function testProductAPI() {
  const baseUrl = "http://localhost:3000"; // Adjust if different
  const eventId = "1000023"; // Example event ID from GDACS

  try {
    console.log("🧪 Testing Product API Endpoint...\n");

    // Test 1: Basic request
    console.log("📋 Test 1: Basic product recommendation request");
    const basicResponse = await fetch(`${baseUrl}/api/products/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (basicResponse.ok) {
      const basicData = await basicResponse.json();
      console.log("✅ Basic request successful");
      console.log(`📊 Incident: ${basicData.data.incidentDetails.title}`);
      console.log(
        `🏷️  Event Type: ${basicData.data.incidentDetails.eventType}`
      );
      console.log(
        `🚨 Alert Level: ${basicData.data.incidentDetails.alertLevel}`
      );
      console.log(
        `👥 Affected Population: ${basicData.data.incidentDetails.affectedPopulation}`
      );
      console.log(
        `📦 Total Products Recommended: ${basicData.data.totalProducts}\n`
      );

      // Show top 3 recommendations
      console.log("🔝 Top 3 Product Recommendations:");
      basicData.data.products
        .slice(0, 3)
        .forEach((product: any, index: number) => {
          console.log(
            `  ${index + 1}. ${product.name} (${product.categoryName})`
          );
          console.log(
            `     Priority: ${product.priority}, Estimated Quantity: ${product.estimatedQuantityNeeded}`
          );
          console.log(`     Reason: ${product.recommendationReason}\n`);
        });
    } else {
      console.log("❌ Basic request failed:", await basicResponse.text());
    }

    // Test 2: Request with cultural requirements
    console.log("📋 Test 2: Request with cultural requirements (Halal)");
    const culturalResponse = await fetch(`${baseUrl}/api/products/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        culturalRequirements: {
          isHalal: true,
        },
      }),
    });

    if (culturalResponse.ok) {
      const culturalData = await culturalResponse.json();
      console.log("✅ Cultural requirements request successful");
      console.log(
        `📦 Halal Products Recommended: ${culturalData.data.totalProducts}\n`
      );
    } else {
      console.log(
        "❌ Cultural requirements request failed:",
        await culturalResponse.text()
      );
    }

    // Test 3: Request with additional filters
    console.log("📋 Test 3: Request with additional filters");
    const filteredResponse = await fetch(`${baseUrl}/api/products/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: "TC",
        alertLevel: "Red",
        affectedPopulation: 50000,
        region: "Asia",
        weatherConditions: "cold",
        culturalRequirements: {
          isVegetarian: true,
        },
      }),
    });

    if (filteredResponse.ok) {
      const filteredData = await filteredResponse.json();
      console.log("✅ Filtered request successful");
      console.log(
        `📦 Filtered Products Recommended: ${filteredData.data.totalProducts}\n`
      );
    } else {
      console.log("❌ Filtered request failed:", await filteredResponse.text());
    }

    // Test 4: Invalid event ID
    console.log("📋 Test 4: Invalid event ID");
    const invalidResponse = await fetch(`${baseUrl}/api/products/invalid123`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!invalidResponse.ok) {
      console.log("✅ Invalid event ID properly handled with error response");
      const errorData = await invalidResponse.json();
      console.log(`❌ Error: ${errorData.error}\n`);
    } else {
      console.log("⚠️  Invalid event ID should have returned an error\n");
    }

    console.log("🎉 Product API testing completed!");
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Example usage in different scenarios
async function exampleUsage() {
  console.log("\n📚 Example API Usage Scenarios:\n");

  console.log("1. Basic earthquake response:");
  console.log(`
POST /api/products/1000023
Content-Type: application/json

{}
`);

  console.log("2. Flood response with Halal requirements:");
  console.log(`
POST /api/products/1000024  
Content-Type: application/json

{
  "culturalRequirements": {
    "isHalal": true
  }
}
`);

  console.log("3. Cyclone response with multiple filters:");
  console.log(`
POST /api/products/1000025
Content-Type: application/json

{
  "eventType": "TC",
  "alertLevel": "Red", 
  "affectedPopulation": 100000,
  "region": "Philippines",
  "weatherConditions": "cold",
  "culturalRequirements": {
    "isVegetarian": true,
    "isHalal": true
  }
}
`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  testProductAPI().then(() => {
    exampleUsage();
  });
}

export { testProductAPI, exampleUsage };
