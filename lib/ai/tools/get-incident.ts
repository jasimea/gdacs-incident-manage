import { tool } from 'ai';
import { z } from 'zod';
import { getDisasterAlerts } from '@/lib/db/queries';

export const getIncidentList = tool({
  description: 'Get current GDACS incident data from the database',
  parameters: z.object({
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
    eventType: z.enum(['EQ', 'FL', 'WF', 'DR', 'TC', 'VO']).optional(),
    alertLevel: z.enum(['Green', 'Orange', 'Red']).optional(),
    country: z.string().optional(),
  }),
  execute: async ({ limit, offset, eventType, alertLevel, country }) => {
    try {
      console.log('🔍 Fetching incident data from database...');
      
      const alerts = await getDisasterAlerts({ 
        limit, 
        offset,
        eventType,
        alertLevel,
        country 
      });

      // Transform the data for better readability
      const transformedAlerts = alerts.map(alert => ({
        eventId: alert.eventId,
        eventType: alert.eventType,
        alertLevel: alert.alertLevel,
        title: alert.title,
        description: alert.description,
        country: alert.country,
        severity: alert.severity,
        affectedPopulation: alert.affectedPopulation,
        deaths: alert.deaths,
        displaced: alert.displaced,
        publishedAt: alert.publishedAt,
        isActive: alert.isActive,
        coordinates: alert.latitude && alert.longitude ? {
          latitude: alert.latitude,
          longitude: alert.longitude
        } : null
      }));

      return {
        total: transformedAlerts.length,
        incidents: transformedAlerts,
        summary: {
          byEventType: transformedAlerts.reduce((acc, alert) => {
            acc[alert.eventType] = (acc[alert.eventType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byAlertLevel: transformedAlerts.reduce((acc, alert) => {
            acc[alert.alertLevel] = (acc[alert.alertLevel] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          totalAffectedPopulation: transformedAlerts.reduce((sum, alert) => 
            sum + (alert.affectedPopulation || 0), 0
          ),
          totalDeaths: transformedAlerts.reduce((sum, alert) => 
            sum + (alert.deaths || 0), 0
          ),
          totalDisplaced: transformedAlerts.reduce((sum, alert) => 
            sum + (alert.displaced || 0), 0
          )
        }
      };
    } catch (error) {
      console.error('❌ Error fetching incident data:', error);
      return {
        error: `Failed to fetch incident data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        total: 0,
        incidents: [],
        summary: {}
      };
    }
  },
});
