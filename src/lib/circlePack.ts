export type PackOffset = { dx: number; dy: number };

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Sunflower/phyllotaxis layout: point i sits at radius `spacing * sqrt(i)`,
 * angle `i * goldenAngle`. Cheap, dependency-free, and — unlike a grid — grows
 * outward from a single anchor in every direction at a roughly even density,
 * which is what a dot cluster fanning out from a state's centroid needs.
 * Some overlap at high counts is expected and acceptable (a stylized density
 * cue, not a strict non-overlap packing).
 */
export function spiralPack(count: number, spacing: number): PackOffset[] {
  const offsets: PackOffset[] = [];
  for (let i = 0; i < count; i++) {
    const r = spacing * Math.sqrt(i);
    const theta = i * GOLDEN_ANGLE;
    offsets.push({ dx: r * Math.cos(theta), dy: r * Math.sin(theta) });
  }
  return offsets;
}
