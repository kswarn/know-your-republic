'use client';

import { ChevronDown } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { jurisdictionNameForFeature } from '../../content/geography/geojson-name-map';
import { Link, useRouter } from '@/i18n/navigation';
import { spiralPack } from '@/lib/circlePack';
import type { MultiPolygonGeometry, PolygonGeometry } from '@/lib/geoTypes';
import { jurisdictionSlug } from '@/lib/geography';
import { distributePoints } from '@/lib/pointInPolygon';
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

const DOT_SIZE = 6; // px diameter
const PACK_SPACING = 6; // px between spiral rings in the National/Union cluster
// Fixed on-screen box for representatives with no single state (Union
// Ministers, nominated Rajya Sabha members) — a fraction of container size so
// it repositions correctly on resize.
const NATIONAL_ANCHOR_FRACTION = { x: 0.11, y: 0.14 };

type HoverLabel = { name: string; count: number; x: number; y: number };
type TooltipState = { person: RepresentativePoint; anchorX: number; anchorY: number; transform: string };
/** State dots sit at a real point inside their state's polygon (`map.project`
 * places them correctly at any zoom/pan); National/Union dots have no
 * geography, so they're a flat offset from a fixed on-screen anchor instead. */
type PlacedDot =
  | { person: RepresentativePoint; kind: 'state'; lng: number; lat: number }
  | { person: RepresentativePoint; kind: 'national'; dx: number; dy: number };
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

/**
 * The Overview map: India's outline (hover a state, click to open its detail
 * page — unchanged from before) with every Minister/MP plotted as a dot at a
 * real point inside their state's own polygon — spread across its interior
 * (`distributePoints`), not clustered at its centroid, so a dot never reads
 * as belonging to a neighbouring state and dense states (Uttar Pradesh's 90+
 * seats) still have room to breathe.
 *
 * Dot positions are written directly to each dot's DOM node (via refs) rather
 * than kept in React state — re-rendering ~800 React elements on every filter
 * change would be needless work when only their `transform` needs to move.
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
  const dotRefs = useRef(new Map<string, HTMLDivElement>());
  const rafRef = useRef<number | null>(null);
  const router = useRouter();

  const [hoverLabel, setHoverLabel] = useState<HoverLabel | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [statePointPools, setStatePointPools] = useState<Map<string, [number, number][]> | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [canHover] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches);

  const [chamber, setChamber] = useState<ChamberFilter>('all');
  const [partyFilter, setPartyFilter] = useState('all');

  const parties = useMemo(
    () => Array.from(new Set(people.map((p) => p.partyName).filter((s): s is string => !!s))).sort(),
    [people],
  );

  // Every state's full (unfiltered) headcount — the point pool fetched below
  // is sized to this, so it always has enough points for any filtered subset
  // without needing to be recomputed when filters change.
  const statePeopleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of people) {
      if (p.state) counts.set(p.state, (counts.get(p.state) ?? 0) + 1);
    }
    return counts;
  }, [people]);

  const filtered = useMemo(() => {
    return people.filter((p) => {
      if (chamber === 'lok-sabha' && p.house !== 'Lok Sabha') return false;
      if (chamber === 'rajya-sabha' && p.house !== 'Rajya Sabha') return false;
      if (partyFilter !== 'all' && p.partyName !== partyFilter) return false;
      return true;
    });
  }, [people, chamber, partyFilter]);

  const stateFilteredCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of filtered) {
      if (p.state) counts.set(p.state, (counts.get(p.state) ?? 0) + 1);
    }
    return counts;
  }, [filtered]);
  // The mousemove handler below is bound once, at map creation — routed
  // through a ref for the same reason `reposition` is (see `repositionRef`),
  // so the hover label always reflects the *current* filters' counts.
  const stateFilteredCountsRef = useRef(stateFilteredCounts);
  useEffect(() => {
    stateFilteredCountsRef.current = stateFilteredCounts;
  }, [stateFilteredCounts]);

  const placedDots = useMemo<PlacedDot[]>(() => {
    if (!statePointPools) return [];
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
      const pool = statePointPools.get(state);
      if (!pool) continue;
      group.forEach((person, i) => {
        const [lng, lat] = pool[i];
        result.push({ person, kind: 'state', lng, lat });
      });
    }
    spiralPack(national.length, PACK_SPACING).forEach((offset, i) => {
      result.push({ person: national[i], kind: 'national', ...offset });
    });
    return result;
  }, [filtered, statePointPools]);

  const reposition = useCallback(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return;
    const { width, height } = container.getBoundingClientRect();
    const nationalAnchor = { x: width * NATIONAL_ANCHOR_FRACTION.x, y: height * NATIONAL_ANCHOR_FRACTION.y };

    for (const dot of placedDots) {
      const el = dotRefs.current.get(dot.person.id);
      if (!el) continue;
      let x: number;
      let y: number;
      if (dot.kind === 'national') {
        x = nationalAnchor.x + dot.dx;
        y = nationalAnchor.y + dot.dy;
      } else {
        // A real point inside the state's own polygon.
        const projected = map.project([dot.lng, dot.lat]);
        x = projected.x;
        y = projected.y;
      }
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }
  }, [placedDots]);

  // The map-creation effect below binds `scheduleReposition` to the resize
  // observer exactly once, at mount. Routing every call through a ref
  // (rather than depending on `reposition` directly) means that one-time
  // binding always runs the *current* reposition logic after a filter change,
  // not a stale closure from mount.
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
  // source, which may tile/clip large GeoJSON) so each state's point pool is
  // distributed across its complete, unclipped polygon — a dot computed from
  // a clipped tile could land just outside the real boundary, in a
  // neighbouring state.
  useEffect(() => {
    let cancelled = false;
    fetch('/geo/india-states.geojson')
      .then((res) => res.json())
      .then((data: { features: GeoFeature[] }) => {
        if (cancelled) return;
        const pools = new Map<string, [number, number][]>();
        for (const feature of data.features) {
          const name = jurisdictionNameForFeature(feature.properties.STNAME_SH);
          pools.set(name, distributePoints(feature.geometry, statePeopleCounts.get(name) ?? 0));
        }
        setStatePointPools(pools);
      });
    return () => {
      cancelled = true;
    };
  }, [statePeopleCounts]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: { version: 8, sources: {}, layers: [] },
      bounds: INDIA_BOUNDS,
      fitBoundsOptions: { padding: 24 },
      attributionControl: false,
      // A fixed reference view, not an explorable one: no pan, zoom, or
      // rotate. Dots now spread across each state's own polygon instead of
      // clustering at a point, so there's no crowding problem zoom would need
      // to solve.
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      dragPan: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      touchPitch: false,
    });
    mapRef.current = map;

    map.on('load', () => {
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
          const name = jurisdictionNameForFeature(stnameSh);
          const count = stateFilteredCountsRef.current.get(name) ?? 0;
          setHoverLabel({ name, count, x: e.point.x, y: e.point.y });
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

    const container = containerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
      map.fitBounds(INDIA_BOUNDS, { padding: 24, duration: 0 });
      scheduleReposition();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once; scheduleReposition is re-subscribed via its own effect below
  }, [router]);

  // Re-run whenever what needs repositioning changes (filters, or the point
  // pools finishing their fetch) — covers the initial paint and every
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
          <span className="border-rule relative inline-flex h-9 border">
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="max-w-40 appearance-none bg-transparent ps-3 pe-8 outline-none"
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

        <span className="text-meta text-ink-muted absolute top-2 left-2 z-10 font-semibold">
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
            <span className="text-ink-muted"> · {t('resultCount', { count: hoverLabel.count })}</span>
          </div>
        )}

        {tooltip && (
          <div
            className="border-rule bg-paper-raised pointer-events-none absolute z-30 w-52 border p-3 text-left shadow-md"
            style={{ left: tooltip.anchorX, top: tooltip.anchorY, transform: tooltip.transform }}
          >
            <div className="flex items-center gap-2">
              {tooltip.person.photoUrl ? (
                // next/image, not a raw <img>: source hosts like sansad.in reject
                // the Referer header a browser-native cross-origin <img> request
                // sends, but next/image's server-side fetch doesn't send one.
                <Image
                  src={tooltip.person.photoUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full object-cover"
                />
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
            aria-label={`${person.fullName}, ${person.partyAbbreviation ?? person.partyName ?? ''}, ${person.house}${person.state ? `, ${person.state}` : ''}`}
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
      <div className="border-rule inline-flex h-9 border" role="radiogroup" aria-label={label ?? undefined}>
        {options.map(({ value: v, label: optionLabel }, i) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={`flex items-center px-3 whitespace-nowrap transition-colors ${i > 0 ? 'border-rule border-s' : ''} ${
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
