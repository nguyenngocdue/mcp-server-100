import { z } from "zod";
import type { MCPJson } from "../../types";

type BoundingBox = { south: number; north: number; west: number; east: number };

type CoordinateResult = {
  latitude: number;
  longitude: number;
  display_name: string;
  place_id: number | string;
  type: string;
  class: string;
  importance: number;
  bounding_box: BoundingBox;
};

type GeocodeResponse =
  | { error: string; query: string; suggestions?: string[] }
  | { query: string; results_count: number; coordinates: CoordinateResult[] };

async function geocodeLocation(location: string, limit = 1): Promise<GeocodeResponse> {
  if (!location || !location.trim()) {
    return { error: 'Location parameter is required and cannot be empty', query: location };
  }
  console.log("Geocoding location:", location, "with limit:", limit);

  const encoded = encodeURIComponent(location);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=${limit}&addressdetails=1`;
  const headers = { 'User-Agent': 'MCP-Geocoding-Tool/1.0 (TypeScript)' };

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      return { error: `Nominatim API error: ${res.status} ${res.statusText}`, query: location };
    }
    const data = await res.json();
    if (!data || data.length === 0) {
      return {
        error: 'No coordinates found for the specified location',
        query: location,
        suggestions: [
          'Try including more specific details (e.g., state, country)',
          'Check spelling of the location name',
          'Use a more general location (e.g., city instead of specific address)',
        ],
      };
    }
    const results: CoordinateResult[] = data.map((item: any) => ({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      display_name: item.display_name,
      place_id: item.place_id,
      type: item.type || '',
      class: item.class || '',
      importance: item.importance || 0,
      bounding_box: {
        south: parseFloat(item.boundingbox[0]),
        north: parseFloat(item.boundingbox[1]),
        west: parseFloat(item.boundingbox[2]),
        east: parseFloat(item.boundingbox[3]),
      },
    }));
    return { query: location, results_count: results.length, coordinates: results };
  } catch (err: any) {
    return { error: `Network error: Unable to connect to geocoding service - ${err.message || String(err)}`, query: location };
  }
}

export default {
  name: 'get_coordinates',
  description: 'Returns the coordinates (latitude, longitude) for a place name or address using OpenStreetMap Nominatim.',
  inputSchema: z.object({
    location: z.string().describe('The place name or address to geocode.'),
    limit: z.number().int().min(1).max(10).default(1).describe('Maximum number of results to return'),
  }),
  async handler({ location, limit = 1 }: { location: string; limit?: number }) {
    // Normalize inputs similar to the Python implementation: trim location and clamp limit to 10
    console.log("Handler received location:", location, "limit:", limit);
    const loc = (location || '').trim();
    const lim = Math.min(Math.max(Math.floor(limit || 1), 1), 10);

    if (!loc) {
      const err = { error: 'Location parameter is required and cannot be empty', query: location };
      const content: MCPJson = { type: 'json', json: err };
      return { content: [content] };
    }

    const result = await geocodeLocation(loc, lim);
    const content: MCPJson = { type: 'json', json: result };
    return { content: [content] };
  }
}
