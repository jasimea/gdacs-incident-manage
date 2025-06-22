import { NextRequest, NextResponse } from 'next/server';
import {
  getDisasterAlerts,
  getRecentDisasterAlerts,
  getDisasterAlertsBySeverity,
} from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const eventType = searchParams.get('eventType');
    const alertLevel = searchParams.get('alertLevel');
    const country = searchParams.get('country');
    const isActive = searchParams.get('isActive');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const hours = parseInt(searchParams.get('hours') || '0');
    const minSeverity = parseInt(searchParams.get('minSeverity') || '0');

    let alerts;

    if (hours > 0) {
      alerts = await getRecentDisasterAlerts(hours);
    } else if (minSeverity > 0) {
      alerts = await getDisasterAlertsBySeverity(minSeverity);
    } else {
      alerts = await getDisasterAlerts({
        eventType: eventType || undefined,
        alertLevel: alertLevel || undefined,
        country: country || undefined,
        isActive: isActive ? isActive === 'true' : undefined,
        limit,
        offset,
      });
    }

    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error fetching disaster alerts:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch disaster alerts',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
