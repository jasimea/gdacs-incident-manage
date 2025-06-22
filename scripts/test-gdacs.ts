#!/usr/bin/env tsx

import { syncGDACSFeed } from '../lib/gdacs-parser';
import { getDisasterAlerts, getRecentDisasterAlerts } from '../lib/db/queries';

async function testGDACSIntegration() {
  try {
    console.log('🔄 Syncing GDACS feed...');
    const syncResults = await syncGDACSFeed();

    console.log(`✅ Sync completed. Processed ${syncResults.length} alerts:`);
    syncResults.forEach((result) => {
      console.log(`  - ${result.eventId}: ${result.action}`);
    });

    console.log('\n📊 Fetching recent disaster alerts...');
    const recentAlerts = await getRecentDisasterAlerts(24);
    console.log(`Found ${recentAlerts.length} alerts in the last 24 hours`);

    console.log('\n🌍 Fetching all disaster alerts...');
    const allAlerts = await getDisasterAlerts({ limit: 10 });
    console.log(`Found ${allAlerts.length} total alerts (showing first 10):`);

    allAlerts.forEach((alert) => {
      console.log(
        `  - ${alert.eventType} (${alert.alertLevel}): ${alert.title}`,
      );
      console.log(`    Location: ${alert.country || 'Unknown'}`);
      console.log(`    Published: ${alert.publishedAt.toISOString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error testing GDACS integration:', error);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testGDACSIntegration();
}
