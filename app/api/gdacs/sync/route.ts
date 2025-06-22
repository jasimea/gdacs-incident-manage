import { NextRequest, NextResponse } from 'next/server';
import { syncGDACSFeed } from '@/lib/gdacs-parser';
import { getDisasterAlerts } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🔄 Starting GDACS feed synchronization...');

    // Get current alert count before sync
    const existingAlerts = await getDisasterAlerts({ limit: 1000 });
    const beforeCount = existingAlerts.length;

    // Sync the feed
    const results = await syncGDACSFeed();

    // Get updated alert count
    const updatedAlerts = await getDisasterAlerts({ limit: 1000 });
    const afterCount = updatedAlerts.length;

    const duration = Date.now() - startTime;

    // Calculate statistics
    const inserted = results.filter((r) => r.action === 'inserted').length;
    const updated = results.filter((r) => r.action === 'updated').length;
    const errors = results.filter((r) => r.action === 'error').length;
    const total = results.length;

    console.log(`✅ GDACS sync completed in ${duration}ms`);
    console.log(
      `📊 Results: ${inserted} inserted, ${updated} updated, ${errors} errors`,
    );

    return NextResponse.json({
      success: true,
      message: 'GDACS feed synchronized successfully',
      metadata: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        beforeCount,
        afterCount,
        netChange: afterCount - beforeCount,
      },
      results: {
        total,
        inserted,
        updated,
        errors,
        successRate:
          total > 0
            ? (((total - errors) / total) * 100).toFixed(2) + '%'
            : '0%',
      },
      details: results.map((result) => ({
        eventId: result.eventId,
        action: result.action,
        error:
          result.error &&
          typeof result.error === 'object' &&
          'message' in result.error
            ? (result.error as { message: string }).message
            : result.error instanceof Error
            ? result.error.message
            : null,
      })),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ GDACS sync failed:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to sync GDACS feed',
        metadata: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// export async function GET(request: NextRequest) {
//   try {
//     console.log('📊 Getting GDACS sync status...');
    
//     // Return sync status and statistics
//     const alerts = await getDisasterAlerts({ limit: 1000 });

//     const stats = {
//       totalAlerts: alerts.length,
//       byEventType: {} as Record<string, number>,
//       byAlertLevel: {} as Record<string, number>,
//       recentAlerts: alerts.filter((a) => {
//         const hoursAgo = Date.now() - a.publishedAt.getTime();
//         return hoursAgo < 24 * 60 * 60 * 1000; // Last 24 hours
//       }).length,
//     };

//     // Calculate statistics
//     alerts.forEach((alert) => {
//       stats.byEventType[alert.eventType] =
//         (stats.byEventType[alert.eventType] || 0) + 1;
//       stats.byAlertLevel[alert.alertLevel] =
//         (stats.byAlertLevel[alert.alertLevel] || 0) + 1;
//     });

//     console.log(`✅ Retrieved status for ${alerts.length} alerts`);

//     return NextResponse.json({
//       success: true,
//       message: 'GDACS sync status retrieved',
//       data: {
//         lastSync: new Date().toISOString(),
//         statistics: stats,
//         sampleAlerts: alerts.slice(0, 5).map((alert) => ({
//           eventId: alert.eventId,
//           eventType: alert.eventType,
//           alertLevel: alert.alertLevel,
//           title: alert.title,
//           country: alert.country,
//           publishedAt: alert.publishedAt,
//         })),
//       },
//     });
//   } catch (error) {
//     console.error('❌ Error getting GDACS sync status:', error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to get GDACS sync status',
//         error: error instanceof Error ? error.message : 'Unknown error',
//       },
//       { status: 500 },
//     );
//   }
// }
