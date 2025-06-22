import { NextRequest, NextResponse } from 'next/server';
import { syncGDACSFeed } from '@/lib/gdacs-parser';

export async function GET(request: NextRequest) {
  try {
    const results = await syncGDACSFeed();

    return NextResponse.json({
      success: true,
      message: 'GDACS feed synchronized successfully',
      results: {
        total: results.length,
        inserted: results.filter((r) => r.action === 'inserted').length,
        updated: results.filter((r) => r.action === 'updated').length,
        errors: results.filter((r) => r.action === 'error').length,
        details: results,
      },
    });
  } catch (error) {
    console.error('Error syncing GDACS feed:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to sync GDACS feed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const results = await syncGDACSFeed();

    return NextResponse.json({
      success: true,
      message: 'GDACS feed synchronized successfully',
      results: {
        total: results.length,
        inserted: results.filter((r) => r.action === 'inserted').length,
        updated: results.filter((r) => r.action === 'updated').length,
        errors: results.filter((r) => r.action === 'error').length,
        details: results,
      },
    });
  } catch (error) {
    console.error('Error syncing GDACS feed:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to sync GDACS feed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
