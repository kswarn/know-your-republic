'use client';

import { ChevronDown } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { jurisdictionNameForFeature } from '../../content/geography/geojson-name-map';
import { Link, useRouter } from '@/i18n/navigation';
import { spiralPack } from '@/lib/circlePack';
import { featureCentroid, type MultiPolygonGeometry, type PolygonGeometry } from '@/lib/geoCentroid';
import { jurisdictionSlug } from '@/lib/geography';
import type { House, RepresentativePoint } from '@/lib/representatives';

type ChamberFilter = 'all' | 'lok-sabha' | 'rajya-sabha';

/** Colours must be literal hex, not Tailwind classes — MapLibre paints a WebGL canvas. */
const FILL_HOVER = '#f0dfb4';
const LINE_COLOR = '#000000';
const GRID_LINE = '#eae8e2';
const MAP_ASPECT_RATIO = '88 / 75';
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [68.09, 6.75],
  [97.42, 37.08],
];

const HOUSE_COLOR: Record<House, string> = {
  'Lok Sabha': '#1d5fbf',
  'Rajya Sabha': '#b3261e',
  Government: '#1e7a46',
};

const DOT_SIZE = 8; // px diameter at 100% zoom
const PACK_SPACING = 7; // px between spiral rings within one cluster, at 100% zoom
// Fixed on-screen box for representatives with no single state (Union
// Ministers, nominated Rajya Sabha members) — a fraction of container size so
// it repositions correctly on resize, but never tied to map pan/zoom.
const NATIONAL_ANCHOR_FRACTION = { x: 0.11, y: 0.14 };

type HoverLabel = { name: string; x: number; y: number };
type TooltipState = { person: RepresentativePoint; anchorX: number; anchorY: number; transform: string };
type PlacedDot = { person: RepresentativePoint; state: string | null; dx: number; dy: number };
type GeoFeature = {
  properties: { STNAME_SH: string };
  geometry: PolygonGeometry | MultiPolygonGeometry;
};

const TOOLTIP_WIDTH = 208;
const EDGE_PADDING = 8;
const TOP_CLEARANCE = 110;

function placeTooltip(dotRect: DOMRect, containerRect: DOMRect) {
  const left = dotRect.left - containerRect.left;
  const right = dotRect.right - containerRect.left;
  const centerX = (left + right) / 2;
  const top = dotRect.top - containerRect.top;
  const bottom = dotRect.bottom - containerRect.top;

  let align: 'left' | 'center' | 'right' = 'center';
  if (centerX - TOOLTIP_WIDTH / 2 < EDGE_PADDING) align = 'left';
  else if (centerX + TOOLTIP_WIDTH / 2 > containerRect.width - EDGE_PADDING) align = 'right';

  const showBelow = top < TOP_CLEARANCE;

  return {
    anchorX: align === 'left' ? left : align === 'right' ? right : centerX,
    anchorY: showBelow ? bottom : top,
    transform: `translate(${align === 'left' ? '0%' : align === 'right' ? '-100%' : '-50%'}, ${
      showBelow ? '8px' : 'calc(-100% - 8px)'
    })`,
  };
}

/** Packs one cluster's representatives into a flat spiral of offsets from its anchor. */
function packCluster(people: RepresentativePoint[]): { person: RepresentativePoint; dx: number; dy: number }[] {
  return spiralPack(people.length, PACK_SPACING).map((offset, i) => ({ person: people[i], ...offset }));
}

/**
 * The Overview map: India's outline (hover a state, click to open its detail
 * page — unchanged from before) with every Minister/MP plotted as a dot
 * clustered around their state's centroid, packed with a dependency-free
 * spiral so dense states (e.g. Uttar Pradesh's 80+ Lok Sabha MPs) still fan
 * out from a single anchor rather than overlapping into a solid blob.
 *
 * Dot positions are written directly to each dot's DOM node on every map
 * 'move' event, bypassing React re-renders entirely — re-rendering ~800
 * React elements on every frame of a pan/zoom would visibly stutter, and
 * nothing about screen position needs to live in React state.
 */
export function OverviewMap({ people }: { people: RepresentativePoint[] }) {
  const t = useTranslations('me');
  const houseLabel: Record<House, string> = {
    'Lok Sabha': t('house.lokSabha'),
    'Rajya Sabha': t('house.rajyaSabha'),
    Government: t('house.government'),
  };
  const independent = t('independent');

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const baseZoomRef = useRef(0);
  const dotRefs = useRef(new Map<string, HTMLDivElement>());
  const rafRef = useRef<number | null>(null);
  const router = useRouter();

  const [hoverLabel, setHoverLabel] = useState<HoverLabel | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [stateAnchors, setStateAnchors] = useState<Map<string, { lng: number; lat: number }> | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [canHover] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches);

  const [chamber, setChamber] = useState<ChamberFilter>('all');
  const [partyFilter, setPartyFilter] = useState('all');

  const parties = useMemo(
    () => Array.from(new Set(people.map((p) => p.partyName).filter((s): s is string => !!s))).sort(),
    [people],
  );

  const filtered = useMemo(() => {
    return people.filter((p) => {
      if (chamber === 'lok-sabha' && p.house !== 'Lok Sabha') return false;
      if (chamber === 'rajya-sabha' && p.house !== 'Rajya Sabha') return false;
      if (partyFilter !== 'all' && p.partyName !== partyFilter) return false;
      return true;
    });
  }, [people, chamber, partyFilter]);

  const placedDots = useMemo<PlacedDot[]>(() => {
    const byState = new Map<string, RepresentativePoint[]>();
    const national: RepresentativePoint[] = [];
    for (const p of filtered) {
      if (p.state) {
        const list = byState.get(p.state) ?? [];
        list.push(p);
        byState.set(p.state, list);
      } else {
        national.push(p);
      }
    }
    const result: PlacedDot[] = [];
    for (const [state, group] of byState) {
      for (const placement of packCluster(group)) {
        result.push({ state, ...placement });
      }
    }
    for (const placement of packCluster(national)) {
      result.push({ state: null, ...placement });
    }
    return result;
  }, [filtered]);

  const reposition = useCallback(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container || !stateAnchors) return;
    const zoom = map.getZoom();
    const scale = 2 ** (zoom - baseZoomRef.current);
    setZoomPercent(Math.round(scale * 100));
    const { width, height } = container.getBoundingClientRect();
    const nationalAnchor = { x: width * NATIONAL_ANCHOR_FRACTION.x, y: height * NATIONAL_ANCHOR_FRACTION.y };

    for (const { person, state, dx, dy } of placedDots) {
      const el = dotRefs.current.get(person.id);
      if (!el) continue;
      let x: number;
      let y: number;
      if (state === null) {
        x = nationalAnchor.x + dx;
        y = nationalAnchor.y + dy;
      } else {
        const anchor = stateAnchors.get(state);
        if (!anchor) {
          el.style.display = 'none';
          continue;
        }
        const projected = map.project([anchor.lng, anchor.lat]);
        x = projected.x + dx * scale;
        y = projected.y + dy * scale;
      }
      el.style.display = '';
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }
  }, [placedDots, stateAnchors]);

  // The map-creation effect below binds `scheduleReposition` to native map
  // events exactly once, at mount. Routing every call through a ref (rather
  // than depending on `reposition` directly) means that one-time binding
  // always runs the *current* reposition logic — otherwise every pan/zoom
  // after the first filter change would replay a stale, outdated closure and
  // the zoom-% readout would silently stop updating.
  const repositionRef = useRef(reposition);
  useEffect(() => {
    repositionRef.current = reposition;
  }, [reposition]);

  const scheduleReposition = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      repositionRef.current();
    });
  }, []);

  // Load state boundary geometry directly (not via MapLibre's internal
  // source, which may tile/clip large GeoJSON) so centroids are computed
  // from complete, unclipped geometry.
  useEffect(() => {
    let cancelled = false;
    fetch('/geo/india-states.geojson')
      .then((res) => res.json())
      .then((data: { features: GeoFeature[] }) => {
        if (cancelled) return;
        const anchors = new Map<string, { lng: number; lat: number }>();
        for (const feature of data.features) {
          const name = jurisdictionNameForFeature(feature.properties.STNAME_SH);
          anchors.set(name, featureCentroid(feature.geometry));
        }
        setStateAnchors(anchors);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: { version: 8, sources: {}, layers: [] },
      bounds: INDIA_BOUNDS,
      fitBoundsOptions: { padding: 24 },
      attributionControl: false,
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      keyboard: false,
      doubleClickZoom: false,
      touchPitch: false,
      // Buttons are the primary, discoverable zoom control (cursor/scroll
      // zoom tested poorly); drag-to-pan and pinch-zoom stay on since
      // they're standard, expected map gestures, especially on touch.
      dragPan: true,
      touchZoomRotate: true,
    });
    mapRef.current = map;

    map.on('load', () => {
      baseZoomRef.current = map.getZoom();
      setMapReady(true);

      map.addSource('india', {
        type: 'geojson',
        data: '/geo/india-states.geojson',
        generateId: true,
      });

      map.addLayer({
        id: 'india-fill',
        type: 'fill',
        source: 'india',
        paint: {
          'fill-color': ['case', ['boolean', ['feature-state', 'hover'], false], FILL_HOVER, 'rgba(0, 0, 0, 0)'],
        },
      });

      map.addLayer({
        id: 'india-line',
        type: 'line',
        source: 'india',
        paint: { 'line-color': LINE_COLOR, 'line-width': 1 },
      });

      let hoveredId: number | string | null = null;

      map.on('mousemove', 'india-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = e.features?.[0];
        const id = feature?.id;
        const stnameSh = feature?.properties?.STNAME_SH as string | undefined;

        if (stnameSh) {
          setHoverLabel({ name: jurisdictionNameForFeature(stnameSh), x: e.point.x, y: e.point.y });
        }

        if (id === undefined || id === hoveredId) return;
        if (hoveredId !== null) map.setFeatureState({ source: 'india', id: hoveredId }, { hover: false });
        hoveredId = id ?? null;
        if (hoveredId !== null) map.setFeatureState({ source: 'india', id: hoveredId }, { hover: true });
      });

      map.on('mouseleave', 'india-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredId !== null) map.setFeatureState({ source: 'india', id: hoveredId }, { hover: false });
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

    map.on('move', scheduleReposition);
    map.on('zoom', scheduleReposition);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
      map.fitBounds(INDIA_BOUNDS, { padding: 24, duration: 0 });
      scheduleReposition();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once; scheduleReposition is re-subscribed via its own effect below
  }, [router]);

  // Re-run whenever what needs repositioning changes (filters/groupBy, or the
  // state anchors finishing their fetch) — covers the initial paint and every
  // subsequent filter change, independent of map 'move' events.
  useEffect(() => {
    if (mapReady) reposition();
  }, [mapReady, reposition]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  const registerDot = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) dotRefs.current.set(id, el);
    else dotRefs.current.delete(id);
  }, []);

  const handleDotHover = useCallback(
    (target: HTMLElement, person: RepresentativePoint) => {
      if (!canHover || !containerRef.current) return;
      const placement = placeTooltip(target.getBoundingClientRect(), containerRef.current.getBoundingClientRect());
      setTooltip({ person, ...placement });
    },
    [canHover],
  );
  const handleDotLeave = useCallback(() => setTooltip(null), []);

  function zoomBy(delta: number) {
    mapRef.current?.zoomTo(mapRef.current.getZoom() + delta, { duration: 200 });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <SegmentedControl
          label={null}
          value={chamber}
          onChange={setChamber}
          options={(['all', 'lok-sabha', 'rajya-sabha'] as const).map((v) => ({ value: v, label: t(`chamberOptions.${v}`) }))}
        />
        <label className="text-small">
          <span className="text-ink-muted mb-1 block">{t('partyFilterLabel')}</span>
          <span className="border-rule relative inline-flex border">
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="text-body max-w-40 appearance-none bg-transparent py-2 ps-3 pe-8 outline-none"
            >
              <option value="all">{t('allParties')}</option>
              {parties.map((party) => (
                <option key={party} value={party}>
                  {party}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="text-ink-muted pointer-events-none absolute inset-y-0 inset-e-2 my-auto size-4"
            />
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <p className="text-meta text-ink-muted">{t('resultCount', { count: filtered.length })}</p>
        {(['Lok Sabha', 'Rajya Sabha', 'Government'] as const).map((house) => (
          <span key={house} className="text-meta text-ink-muted inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block size-2.5 rounded-full" style={{ backgroundColor: HOUSE_COLOR[house] }} />
            {houseLabel[house]}
          </span>
        ))}
      </div>

      <div className="relative w-full overflow-hidden" style={{ aspectRatio: MAP_ASPECT_RATIO }}>
        <div
          ref={containerRef}
          role="img"
          aria-label="Map of India, showing every current Minister and Member of Parliament plotted near their state"
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="border-rule bg-paper-raised absolute top-2 right-2 z-30 flex items-center gap-1 border px-1 py-1 shadow-sm">
          <button
            type="button"
            onClick={() => zoomBy(-1)}
            aria-label={t('zoomOut')}
            className="text-ink hover:bg-accent-soft flex size-7 items-center justify-center text-lg leading-none"
          >
            −
          </button>
          <span className="text-meta text-ink-muted w-10 text-center tabular-nums">{zoomPercent}%</span>
          <button
            type="button"
            onClick={() => zoomBy(1)}
            aria-label={t('zoomIn')}
            className="text-ink hover:bg-accent-soft flex size-7 items-center justify-center text-lg leading-none"
          >
            +
          </button>
        </div>

        <span className="text-meta text-ink-muted absolute top-2 left-2 z-10 flex h-7 items-center font-semibold">
          {t('nationalZone')}
        </span>

        <DotOverlay placedDots={placedDots} registerDot={registerDot} onDotHover={handleDotHover} onDotLeave={handleDotLeave} />

        {hoverLabel && (
          <div
            aria-hidden="true"
            className="border-rule bg-paper-raised text-ink text-small pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full border px-2 py-1 shadow-sm"
            style={{ left: hoverLabel.x, top: hoverLabel.y - 8 }}
          >
            {hoverLabel.name}
          </div>
        )}

        {tooltip && (
          <div
            className="border-rule bg-paper-raised pointer-events-none absolute z-30 w-52 border p-3 text-left shadow-md"
            style={{ left: tooltip.anchorX, top: tooltip.anchorY, transform: tooltip.transform }}
          >
            <div className="flex items-center gap-2">
              {tooltip.person.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- one tiny fixed-size preview at a time, not worth next/image's overhead here
                <img src={tooltip.person.photoUrl} alt="" className="size-10 shrink-0 rounded-full object-cover" />
              ) : (
                <span aria-hidden="true" className="inline-block size-10 shrink-0 rounded-full" style={{ backgroundColor: HOUSE_COLOR[tooltip.person.house] }} />
              )}
              <div className="min-w-0">
                <p className="text-small text-ink truncate font-semibold">{tooltip.person.fullName}</p>
                <p className="text-meta text-ink-muted truncate">
                  {tooltip.person.partyAbbreviation ?? tooltip.person.partyName ?? independent}
                </p>
              </div>
            </div>
            <p className="text-meta text-ink-muted mt-2">
              {houseLabel[tooltip.person.house]}
              {tooltip.person.state ? ` · ${tooltip.person.state}` : ` · ${t('nationalZone')}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type DotOverlayProps = {
  placedDots: PlacedDot[];
  registerDot: (id: string, el: HTMLDivElement | null) => void;
  onDotHover: (target: HTMLElement, person: RepresentativePoint) => void;
  onDotLeave: () => void;
};

/**
 * Memoized so that hover (which only updates tooltip state in the parent)
 * never re-renders these ~800 elements — position updates happen entirely
 * outside React via `registerDot`'s refs.
 */
const DotOverlay = memo(function DotOverlay({ placedDots, registerDot, onDotHover, onDotLeave }: DotOverlayProps) {
  return (
    <>
      {placedDots.map(({ person }) => (
        <div key={person.id} ref={(el) => registerDot(person.id, el)} className="absolute top-0 left-0">
          <Link
            href={person.slug ? `/people/${person.slug}` : '/people'}
            onMouseEnter={(e) => onDotHover(e.currentTarget, person)}
            onMouseLeave={onDotLeave}
            onFocus={(e) => onDotHover(e.currentTarget, person)}
            onBlur={onDotLeave}
            className="block rounded-full transition-transform hover:z-20 hover:scale-125 focus-visible:z-20 focus-visible:scale-125"
            style={{ width: DOT_SIZE, height: DOT_SIZE, backgroundColor: HOUSE_COLOR[person.house] }}
            aria-label={`${person.fullName} — ${person.partyAbbreviation ?? person.partyName ?? ''}, ${person.house}${person.state ? `, ${person.state}` : ''}`}
          />
        </div>
      ))}
    </>
  );
});

function SegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string | null;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="text-small">
      {label && <span className="text-ink-muted mb-1 block">{label}</span>}
      <div className="border-rule inline-flex border" role="radiogroup" aria-label={label ?? undefined}>
        {options.map(({ value: v, label: optionLabel }, i) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={`px-3 py-2 whitespace-nowrap transition-colors ${i > 0 ? 'border-rule border-s' : ''} ${
              value === v ? 'bg-accent-soft text-accent font-semibold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
