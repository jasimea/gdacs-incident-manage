#!/usr/bin/env tsx

import { fetchGDACSFeed, parseGDACSItem } from '../lib/gdacs-parser';

async function testGDACSParser() {
  console.log('🧪 Testing GDACS Parser...\n');

  try {
    // Test fetching the feed
    console.log('1. Testing feed fetching...');
    const items = await fetchGDACSFeed();
    console.log(`✅ Successfully fetched ${items.length} items\n`);

    // Test parsing a few items
    console.log('2. Testing item parsing...');
    const sampleItems = items.slice(0, 3);
    
    for (let i = 0; i < sampleItems.length; i++) {
      const item = sampleItems[i];
      console.log(`\n--- Item ${i + 1} ---`);
      console.log(`Title: ${item.title}`);
      console.log(`Category: ${item.category}`);
      console.log(`GUID: ${item.guid}`);
      
      try {
        const parsed = parseGDACSItem(item);
        console.log(`✅ Parsed successfully:`);
        console.log(`  Event ID: ${parsed.eventId}`);
        console.log(`  Event Type: ${parsed.eventType}`);
        console.log(`  Alert Level: ${parsed.alertLevel}`);
        console.log(`  Country: ${parsed.country || 'N/A'}`);
        console.log(`  Severity: ${parsed.severity}`);
      } catch (error) {
        console.log(`❌ Failed to parse: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Test statistics
    console.log('\n3. Feed Statistics:');
    const eventTypes = new Map<string, number>();
    const alertLevels = new Map<string, number>();
    
    items.forEach(item => {
      const eventType = item.category || 'UNKNOWN';
      eventTypes.set(eventType, (eventTypes.get(eventType) || 0) + 1);
      
      const alertLevel = item.title.includes('Green') ? 'Green' : 
                        item.title.includes('Orange') ? 'Orange' : 
                        item.title.includes('Red') ? 'Red' : 'Green';
      alertLevels.set(alertLevel, (alertLevels.get(alertLevel) || 0) + 1);
    });

    console.log('Event Types:');
    eventTypes.forEach((count, type) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log('\nAlert Levels:');
    alertLevels.forEach((count, level) => {
      console.log(`  ${level}: ${count}`);
    });

    console.log('\n✅ GDACS Parser test completed successfully!');

  } catch (error) {
    console.error('❌ GDACS Parser test failed:', error);
    process.exit(1);
  }
}

// Run the test
testGDACSParser().catch(console.error); 