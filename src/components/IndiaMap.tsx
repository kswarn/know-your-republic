'use client';

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';

import { jurisdictionNameForFeature } from '../../content/geography/geojson-name-map';
import { useRouter } from '@/i18n/navigation';
import { jurisdictionSlug } from '@/lib/geography';

/**
 * Colours must be literal hex, not Tailwind classes — MapLibre paints a WebGL
 * canvas, which can't read CSS custom properties. Keep these in sync by hand
 * with the tokens in src/app/globals.css if that palette ever changes.
 */
const FILL_HOVER = '#f0dfb4'; // wheat — the only fill this map ever shows, and only on hover
const LINE_COLOR = '#000000'; // state/UT outlines
const GRID_LINE = '#eae8e2'; // lighter than --color-rule — a graph-paper hint, not a border

type HoverLabel = { name: string; x: number; y: number };

const MAP_HEIGHT = 1200;

/**
 * India's bounding box, computed directly from public/geo/india-states.geojson
 * (min/max lng/lat across every coordinate). Used with `fitBounds` rather than a
 * hand-tuned center/zoom — a fixed center+zoom only looks right at the one
 * container aspect ratio it was eyeballed against, and this map's width changes
 * with the viewport while its height stays fixed. `fitBounds` recomputes the
 * correct framing for whatever box it's actually given, on load and on resize.
 */
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [68.09, 6.75],
  [97.42, 37.08],
];

/**
 * A clickable outline map of India's states and UTs, with no base map imagery —
 * just the vendored boundary GeoJSON (public/geo/india-states.geojson, see
 * docs/SOURCES_LEGAL.md) rendered as line layers. Deliberately tile-less: there's
 * no reason to load raster or vector basemap tiles for an administrative outline,
 * and it keeps this fully self-contained and free to serve.
 *
 * It stays an outline at rest — no state carries a fill until the cursor is over
 * it. This is a fixed reference view, not an explorable one: no pan, no zoom,
 * no rotate. The only interactions are hovering a region (highlight + name) and
 * clicking one, which navigates to that state's own page (/me/[state]) rather
 * than showing results in place — there's no reason to keep a "selected" visual
 * state on a map the click immediately navigates away from.
 */
export function IndiaMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hoverLabel, setHoverLabel] = useState<HoverLabel | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: { version: 8, sources: {}, layers: [] },
      bounds: INDIA_BOUNDS,
      fitBoundsOptions: { padding: 24 },
      attributionControl: false,
      // Fixed reference view: no pan, zoom, or rotate — only hover and click.
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      dragPan: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      touchPitch: false,
    });

    map.on('load', () => {
      map.addSource('india', {
        type: 'geojson',
        data: '/geo/india-states.geojson',
        generateId: true,
      });

      // Fill stays fully transparent at rest — present only so clicks/hovers hit-test
      // across the whole polygon, not just its border line.
      map.addLayer({
        id: 'india-fill',
        type: 'fill',
        source: 'india',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            FILL_HOVER,
            'rgba(0, 0, 0, 0)',
          ],
        },
      });

      map.addLayer({
        id: 'india-line',
        type: 'line',
        source: 'india',
        paint: {
          'line-color': LINE_COLOR,
          'line-width': 1,
        },
      });

      let hoveredId: number | string | null = null;

      map.on('mousemove', 'india-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = e.features?.[0];
        const id = feature?.id;
        const stnameSh = feature?.properties?.STNAME_SH as string | undefined;

        if (stnameSh) {
          setHoverLabel({
            name: jurisdictionNameForFeature(stnameSh),
            x: e.point.x,
            y: e.point.y,
          });
        }

        if (id === undefined || id === hoveredId) return;
        if (hoveredId !== null) {
          map.setFeatureState({ source: 'india', id: hoveredId }, { hover: false });
        }
        hoveredId = id ?? null;
        if (hoveredId !== null) {
          map.setFeatureState({ source: 'india', id: hoveredId }, { hover: true });
        }
      });

      map.on('mouseleave', 'india-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredId !== null) {
          map.setFeatureState({ source: 'india', id: hoveredId }, { hover: false });
        }
        hoveredId = null;
        setHoverLabel(null);
      });

      map.on('click', 'india-fill', (e) => {
        const feature = e.features?.[0];
        const stnameSh = feature?.properties?.STNAME_SH as string | undefined;
        if (!stnameSh) return;

        const name = jurisdictionNameForFeature(stnameSh);
        router.push(`/me/${jurisdictionSlug(name)}`);
      });
    });

    // The container is full-width and therefore resizes with the viewport. resize()
    // only updates the canvas's pixel dimensions; fitBounds() re-derives the correct
    // center/zoom for the new aspect ratio so the whole country stays in frame.
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
      map.fitBounds(INDIA_BOUNDS, { padding: 24, duration: 0 });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
    };
  }, [router]);

  return (
    <div className="relative w-full" style={{ height: MAP_HEIGHT }}>
      <div
        ref={containerRef}
        role="img"
        aria-label="Map of India, showing state and union territory boundaries"
        className="h-full w-full"
        style={{
          backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      {hoverLabel && (
        <div
          aria-hidden="true"
          className="border-rule bg-paper-raised text-ink text-small pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full border px-2 py-1 shadow-sm"
          style={{ left: hoverLabel.x, top: hoverLabel.y - 8 }}
        >
          {hoverLabel.name}
        </div>
      )}
    </div>
  );
}
