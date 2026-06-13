import * as React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import type { SceneryPalette } from '../lib/colors';
import type { Point } from '../lib/layout';
import { scatterScenery, type SceneryItem } from '../lib/scenery';

/**
 * Flat-design nature layer drawn behind the trail: conifers, bushes, grass
 * tufts, rocks, flowers and the odd pond, scattered in the gutters the path
 * leaves open. Pure SVG — no raster assets, fully theme-aware.
 */
export function JourneyScenery({
  points,
  width,
  height,
  palette,
}: {
  points: Point[];
  width: number;
  height: number;
  palette: SceneryPalette;
}) {
  const items = React.useMemo(
    () => scatterScenery(points, width, height),
    [points, width, height]
  );

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none">
      {items.map((item, i) => (
        <G
          key={i}
          transform={`translate(${item.x} ${item.y}) scale(${item.flip ? -item.scale : item.scale} ${item.scale})`}>
          <Sprite item={item} p={palette} />
        </G>
      ))}
    </Svg>
  );
}

function Sprite({ item, p }: { item: SceneryItem; p: SceneryPalette }) {
  switch (item.kind) {
    case 'pine':
      return (
        <>
          <Rect x={-3} y={-9} width={6} height={9} rx={1} fill={p.trunk} />
          <Polygon points="-16,-9 16,-9 0,-27" fill={p.leaf} />
          <Polygon points="-12,-21 12,-21 0,-37" fill={p.leafDark} />
          <Polygon points="-8,-33 8,-33 0,-47" fill={p.leaf} />
        </>
      );
    case 'bush':
      return (
        <>
          <Rect x={-2} y={-7} width={4} height={7} fill={p.trunk} />
          <Circle cx={-9} cy={-12} r={10} fill={p.leafDark} />
          <Circle cx={9} cy={-12} r={10} fill={p.leafDark} />
          <Circle cx={0} cy={-17} r={12} fill={p.leaf} />
          <Circle cx={-5} cy={-11} r={8} fill={p.leaf} />
        </>
      );
    case 'grass':
      return (
        <G fill="none" stroke={p.grass} strokeWidth={2.6} strokeLinecap="round">
          <Path d="M-8 0 Q-10 -10 -6 -16" />
          <Path d="M-2 0 Q-3 -13 1 -19" />
          <Path d="M4 0 Q4 -12 8 -17" />
          <Path d="M9 0 Q11 -8 13 -13" />
        </G>
      );
    case 'rock':
      return (
        <>
          <Ellipse cx={0} cy={-5} rx={15} ry={10} fill={p.rock} />
          <Ellipse cx={-4} cy={-9} rx={7} ry={4} fill={p.rockHi} />
        </>
      );
    case 'flower':
      return (
        <>
          <Line x1={0} y1={0} x2={0} y2={-15} stroke={p.grass} strokeWidth={2} />
          <Ellipse cx={-5} cy={-8} rx={4} ry={2.4} fill={p.grass} />
          <Circle cx={0} cy={-22} r={3.4} fill={p.flower} />
          <Circle cx={-4} cy={-18} r={3.4} fill={p.flower} />
          <Circle cx={4} cy={-18} r={3.4} fill={p.flower} />
          <Circle cx={0} cy={-14} r={3.4} fill={p.flower} />
          <Circle cx={0} cy={-18} r={3} fill={p.flowerCenter} />
        </>
      );
    case 'pond':
      return (
        <>
          <Ellipse cx={0} cy={-4} rx={22} ry={8} fill={p.pond} />
          <Ellipse cx={0} cy={-5} rx={15} ry={4.5} fill={p.pondHi} />
        </>
      );
    default:
      return null;
  }
}
