"use client";

import type { HierarchyPointLink } from "d3-hierarchy";
import { hierarchy, tree } from "d3-hierarchy";
import { linkRadial } from "d3-shape";
import { useMemo } from "react";

export type HierarchyNode = {
  id: string;
  title: string;
  personName: string | null;
  /** Fully-qualified, locale-prefixed path to the office-holder's detail page, or null if there isn't one to link to. */
  href: string | null;
  children?: HierarchyNode[];
};

const RADIUS = 380;
// Position titles ("Union Minister of Consumer Affairs, Food and Public Distribution")
// run far longer than person names did — wide enough margin that the longest ones
// still clear the viewBox edge rather than getting clipped.
const MARGIN = 560;
const SIZE = (RADIUS + MARGIN) * 2;

/**
 * Rounds to a fixed precision so the server and client render identical strings.
 * `Math.sin`/`Math.cos` can differ in their last bit between Node's V8 and the
 * browser's — imperceptible visually, but enough to fail React's hydration
 * string-equality check on every node's `transform` attribute.
 */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * A radial org chart from HierarchyEdge data: the root Position at the centre,
 * every direct subordinate Position arranged around it. D3 supplies the layout
 * math only (`tree()` for node placement, `linkRadial()` for the connecting
 * paths) — the SVG itself is plain React/JSX, not D3 DOM manipulation, so it
 * stays a normal React tree the rest of the app can reason about.
 *
 * Two levels today (PM → each ministerial Position) render as a clean radial
 * layout without crowding; deeper hierarchies in later phases may need a
 * collapsible or force-directed treatment instead.
 */
export function HierarchyMindMap({ root }: { root: HierarchyNode }) {
  const { nodes, links } = useMemo(() => {
    const layout = tree<HierarchyNode>()
      .size([2 * Math.PI, RADIUS])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
    // tree() mutates its argument but only the *returned* reference is typed with
    // x/y guaranteed defined (HierarchyPointNode) — use that, not root_ itself.
    const points = layout(hierarchy(root));

    const linkPath = linkRadial<
      HierarchyPointLink<HierarchyNode>,
      { x: number; y: number }
    >()
      .angle((d) => d.x)
      .radius((d) => d.y)
      .source((d) => d.source)
      .target((d) => d.target);

    return {
      nodes: points.descendants(),
      links: points.links().map((link) => linkPath(link) ?? ""),
    };
  }, [root]);

  return (
    <svg
      viewBox={`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`}
      className="mx-auto w-full max-w-page"
      role="img"
      aria-label={`Organisation chart centred on ${root.title}`}
    >
      <g className="stroke-rule" fill="none" strokeWidth={1}>
        {links.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g>
        {nodes.map((node) => {
          const x = round(node.y * Math.sin(node.x));
          const y = round(-node.y * Math.cos(node.x));
          const isRoot = node.depth === 0;
          // Flip label text on the left half of the circle so it never reads upside down.
          const angleDeg = round((node.x * 180) / Math.PI - 90);
          const flip = node.x > Math.PI;

          const label = node.data.title;
          const linkLabel = node.data.personName
            ? `${label} — ${node.data.personName}`
            : label;
          const content = (
            <>
              {node.data.personName && <title>{node.data.personName}</title>}
              <circle
                r={isRoot ? 8 : 5}
                className={`transition-colors ${isRoot ? "fill-brand" : "fill-accent"} ${
                  node.data.href ? "group-hover:fill-brand" : ""
                }`}
              />
              <text
                className={`fill-ink text-[16px] ${node.data.href ? "group-hover:underline" : ""}`}
                textAnchor={isRoot ? "middle" : flip ? "end" : "start"}
                transform={
                  isRoot
                    ? undefined
                    : `rotate(${flip ? angleDeg + 180 : angleDeg}) translate(${flip ? -20 : 20}, 0)`
                }
                dy={isRoot ? -24 : "0.32em"}
              >
                {label}
              </text>
            </>
          );

          return (
            <g key={node.data.id} transform={`translate(${x}, ${y})`}>
              {node.data.href ? (
                <a
                  href={node.data.href}
                  className="group cursor-pointer"
                  aria-label={linkLabel}
                >
                  {content}
                </a>
              ) : (
                content
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
