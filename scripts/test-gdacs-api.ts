#!/usr/bin/env tsx

const API_BASE = 'http://localhost:3000/api';

async function testGDACSAPI() {
  console.log('🧪 Testing GDACS API endpoints...\n');

  try {
    // Test 1: Get sync status
    console.log('1️⃣ Getting sync status...');
    const statusResponse = await fetch(`${API_BASE}/gdacs/sync`);
    const statusData = await statusResponse.json();

    if (statusData.success) {
      console.log('✅ Status retrieved successfully');
      console.log(`📊 Total alerts: ${statusData.data.statistics.totalAlerts}`);
      console.log(
        `🕒 Recent alerts (24h): ${statusData.data.statistics.recentAlerts}`,
      );
      console.log(`📈 By event type:`, statusData.data.statistics.byEventType);
      console.log(
        `🚨 By alert level:`,
        statusData.data.statistics.byAlertLevel,
      );
    } else {
      console.log('❌ Failed to get status:', statusData.error);
    }

    console.log('\n2️⃣ Syncing GDACS feed...');
    const syncResponse = await fetch(`${API_BASE}/gdacs/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const syncData = await syncResponse.json();

    if (syncData.success) {
      console.log('✅ Sync completed successfully');
      console.log(`⏱️  Duration: ${syncData.metadata.duration}`);
      console.log(`📊 Results:`);
      console.log(`   - Total processed: ${syncData.results.total}`);
      console.log(`   - Inserted: ${syncData.results.inserted}`);
      console.log(`   - Updated: ${syncData.results.updated}`);
      console.log(`   - Errors: ${syncData.results.errors}`);
      console.log(`   - Success rate: ${syncData.results.successRate}`);

      if (syncData.results.errors > 0) {
        console.log('\n❌ Errors encountered:');
        syncData.details
          .filter((d: any) => d.action === 'error')
          .forEach((error: any) => {
            console.log(`   - ${error.eventId}: ${error.error}`);
          });
      }
    } else {
      console.log('❌ Sync failed:', syncData.error);
    }

    console.log('\n3️⃣ Testing basic GDACS endpoint...');
    const basicResponse = await fetch(`${API_BASE}/gdacs`);
    const basicData = await basicResponse.json();

    if (basicData.success) {
      console.log('✅ Basic endpoint works');
      console.log(`📊 Processed ${basicData.results.total} items`);
    } else {
      console.log('❌ Basic endpoint failed:', basicData.error);
    }

    console.log('\n4️⃣ Testing disaster alerts endpoint...');
    const alertsResponse = await fetch(`${API_BASE}/disaster-alerts?limit=5`);
    const alertsData = await alertsResponse.json();

    if (alertsData.success) {
      console.log('✅ Alerts endpoint works');
      console.log(`📊 Retrieved ${alertsData.count} alerts`);

      if (alertsData.data.length > 0) {
        console.log('\n📋 Sample alerts:');
        alertsData.data.slice(0, 3).forEach((alert: any) => {
          console.log(
            `   - ${alert.eventType} (${alert.alertLevel}): ${alert.title}`,
          );
          console.log(`     Location: ${alert.country || 'Unknown'}`);
          console.log(
            `     Published: ${new Date(alert.publishedAt).toLocaleString()}`,
          );
        });
      }
    } else {
      console.log('❌ Alerts endpoint failed:', alertsData.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testGDACSAPI();
}
