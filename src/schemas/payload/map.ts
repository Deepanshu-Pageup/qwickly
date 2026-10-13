import { z } from 'zod';

export interface MapAddressInput {
  mode: 'address';
  query: string;
}

export interface MapCoordinatesInput {
  mode: 'coordinates';
  latitude: number;
  longitude: number;
}

export type MapPayloadInput = MapAddressInput | MapCoordinatesInput;

export const mapPayloadSchema = z
  .discriminatedUnion('mode', [
    z.object({
      mode: z.literal('address'),
      query: z
        .string()
        .trim()
        .min(1, 'Please enter a location address or place name')
        .max(300, 'Address query cannot exceed 300 characters'),
    }),
    z.object({
      mode: z.literal('coordinates'),
      latitude: z
        .number({ invalid_type_error: 'Latitude must be a valid number' })
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90'),
      longitude: z
        .number({ invalid_type_error: 'Longitude must be a valid number' })
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180'),
    }),
  ])
  .transform((data) => {
    const url = new URL('https://www.google.com/maps/search/');
    url.searchParams.set('api', '1');

    if (data.mode === 'address') {
      url.searchParams.set('query', data.query);
      return url.toString();
    }

    // Deterministic formatting with up to 6 decimal places without precision rounding out-of-bounds
    const latStr = parseFloat(data.latitude.toFixed(6)).toString();
    const lngStr = parseFloat(data.longitude.toFixed(6)).toString();
    url.searchParams.set('query', `${latStr},${lngStr}`);
    return url.toString();
  });

export type MapPayloadOutput = z.infer<typeof mapPayloadSchema>;
