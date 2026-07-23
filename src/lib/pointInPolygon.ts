import type { MultiPolygonGeometry, PolygonGeometry } from '@/lib/geoTypes';

type Point = [number, number];

/** Standard ray-casting point-in-polygon test against a single ring's exterior. */
function inRing(point: Point, ring: number[][]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** True if `point` falls inside `geometry`'s exterior ring(s) — holes are ignored,
 * which is immaterial for state/UT outlines at this scale. */
export function pointInGeometry(point: Point, geometry: PolygonGeometry | MultiPolygonGeometry): boolean {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.some((polygon) => inRing(point, polygon[0]));
}

function geometryBounds(geometry: PolygonGeometry | MultiPolygonGeometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const polygon of polygons) {
    for (const [x, y] of polygon[0]) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY };
}

/**
 * `count` points spread across the interior of `geometry` — a jittered grid
 * clipped to the polygon, not a cluster fanning from one anchor. Grid density
 * doubles (halving the step) until there are enough interior points, so
 * dense states (Uttar Pradesh's 90+ seats) still get a full, non-repeating
 * spread rather than reusing points. Deterministic given the same geometry
 * and count, so a filter change re-slicing this array doesn't reshuffle dots
 * that stay visible.
 */
export function distributePoints(geometry: PolygonGeometry | MultiPolygonGeometry, count: number): Point[] {
  if (count === 0) return [];
  const { minX, minY, maxX, maxY } = geometryBounds(geometry);
  const width = maxX - minX;
  const height = maxY - minY;
  if (width <= 0 || height <= 0) return [];

  // A small pseudo-random jitter (seeded by grid index, so it's stable across
  // re-runs) keeps the spread from looking like a rigid lattice.
  function jitter(seed: number): number {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  let step = Math.sqrt((width * height) / Math.max(count * 3, 1));
  for (let attempt = 0; attempt < 8; attempt++) {
    const cols = Math.max(1, Math.ceil(width / step));
    const rows = Math.max(1, Math.ceil(height / step));
    const points: Point[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const seed = row * cols + col;
        const x = minX + (col + 0.3 + jitter(seed) * 0.4) * step;
        const y = minY + (row + 0.3 + jitter(seed + 0.5) * 0.4) * step;
        if (pointInGeometry([x, y], geometry)) points.push([x, y]);
      }
    }
    if (points.length >= count) {
      // Stride-sample down to `count` — candidates are already in raster
      // (row-major) order, so an even stride keeps the spread even rather
      // than clumping in one corner.
      if (points.length === count) return points;
      const result: Point[] = [];
      const strideStep = points.length / count;
      for (let i = 0; i < count; i++) result.push(points[Math.floor(i * strideStep)]);
      return result;
    }
    step /= 1.6;
  }
  // Pathological (tiny sliver polygon): fall back to the bounding-box center
  // repeated — better than throwing, and vanishingly rare in practice.
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return Array.from({ length: count }, () => [cx, cy] as Point);
}
