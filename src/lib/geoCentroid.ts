/**
 * Area-weighted centroid of a single linear ring (shoelace formula), plus the
 * ring's signed area — used to pick the largest part of a MultiPolygon rather
 * than averaging every scattered island into a point over open water.
 */
function ringCentroid(ring: number[][]): { lng: number; lat: number; area: number } {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area /= 2;
  if (area === 0) {
    const [lng, lat] = ring[0];
    return { lng, lat, area: 0 };
  }
  return { lng: cx / (6 * area), lat: cy / (6 * area), area: Math.abs(area) };
}

export type PolygonGeometry = { type: 'Polygon'; coordinates: number[][][] };
export type MultiPolygonGeometry = { type: 'MultiPolygon'; coordinates: number[][][][] };

/**
 * Representative anchor point for a state/UT's GeoJSON geometry. For a
 * MultiPolygon (e.g. archipelagos like Andaman & Nicobar), uses the largest
 * part by area rather than an area-weighted average across all parts, so the
 * anchor lands on the main landmass instead of in open sea between islands.
 */
export function featureCentroid(geometry: PolygonGeometry | MultiPolygonGeometry): { lng: number; lat: number } {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let best: { lng: number; lat: number; area: number } | null = null;
  for (const polygon of polygons) {
    const c = ringCentroid(polygon[0]);
    if (!best || c.area > best.area) best = c;
  }
  if (!best) throw new Error(`Unsupported geometry type: ${geometry.type}`);
  return { lng: best.lng, lat: best.lat };
}
