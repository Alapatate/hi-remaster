import * as React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import type { SceneryPalette } from '../lib/colors';
import type { Point } from '../lib/layout';
import {
  scatterScenery,
  scatterZones,
  type SceneryItem,
  type ZoneItem,
} from '../lib/scenery';

/**
 * Flat-design nature layer drawn behind the trail: conifers, leafy trees,
 * bushes, grass, rocks, flowers, mushrooms, butterflies, ponds — plus large
 * lake/clearing zones. Each element is drawn with the vivid palette when it
 * sits in the discovered region (above `cutoffY`) and the muted palette beyond
 * it, so the world ahead reads as "not yet discovered". Pure SVG, theme-aware.
 */
export function JourneyScenery({
  points,
  width,
  height,
  palette,
  mutedPalette,
  cutoffY,
  topOffset = 0,
}: {
  points: Point[];
  width: number;
  height: number;
  palette: SceneryPalette;
  mutedPalette: SceneryPalette;
  cutoffY: number;
  topOffset?: number;
}) {
  const items = React.useMemo(
    () => scatterScenery(points, width, height, topOffset),
    [points, width, height, topOffset]
  );
  const zones = React.useMemo(
    () => scatterZones(points, width, height, topOffset),
    [points, width, height, topOffset]
  );

  const palFor = (y: number) => (y <= cutoffY ? palette : mutedPalette);

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none">
      {/* Background regions (lakes, grassy clearings) sit behind everything. */}
      {zones.map((zone, i) => (
        <G key={`z${i}`} transform={`translate(${zone.x} ${zone.y})`}>
          <Zone zone={zone} p={palFor(zone.y)} />
        </G>
      ))}

      {items.map((item, i) => (
        <G
          key={i}
          transform={`translate(${item.x} ${item.y}) scale(${item.flip ? -item.scale : item.scale} ${item.scale})`}>
          <Sprite item={item} p={palFor(item.y)} />
        </G>
      ))}
    </Svg>
  );
}

/** Five small petals around a centre — shared by the flower sprites. */
function petals(cx: number, cy: number, r: number, color: string, center: string) {
  return (
    <>
      <Circle cx={cx} cy={cy - r} r={r} fill={color} />
      <Circle cx={cx - r} cy={cy} r={r} fill={color} />
      <Circle cx={cx + r} cy={cy} r={r} fill={color} />
      <Circle cx={cx - r * 0.7} cy={cy + r * 0.8} r={r} fill={color} />
      <Circle cx={cx + r * 0.7} cy={cy + r * 0.8} r={r} fill={color} />
      <Circle cx={cx} cy={cy} r={r * 0.8} fill={center} />
    </>
  );
}

function Zone({ zone, p }: { zone: ZoneItem; p: SceneryPalette }) {
  if (zone.kind === 'lake') {
    return (
      <>
        <Path d={zone.d} fill={p.pond} />
        <G scale={0.62}>
          <Path d={zone.d} fill={p.pondHi} />
        </G>
        {/* ripples */}
        <Ellipse cx={-4} cy={-3} rx={10} ry={2.2} fill={p.pond} opacity={0.5} />
        <Ellipse cx={9} cy={4} rx={7} ry={1.8} fill={p.pond} opacity={0.5} />
        {/* lily pads + bloom */}
        <Ellipse cx={-16} cy={-2} rx={6} ry={3} fill={p.leafDark} />
        <Circle cx={-16} cy={-3} r={2} fill={p.flower} />
        <Ellipse cx={15} cy={5} rx={5} ry={2.6} fill={p.leafDark} />
        {/* reeds along an edge */}
        <G stroke={p.grass} strokeWidth={2.2} strokeLinecap="round">
          <Line x1={-26} y1={-2} x2={-27} y2={-18} />
          <Line x1={-22} y1={0} x2={-21} y2={-14} />
          <Line x1={-18} y1={1} x2={-18} y2={-12} />
        </G>
      </>
    );
  }
  return (
    <>
      <Path d={zone.d} fill={p.grassZone} opacity={0.6} />
      <G scale={0.58}>
        <Path d={zone.d} fill={p.grassZoneHi} opacity={0.55} />
      </G>
      {/* sprinkled tufts + tiny blooms to make the clearing feel alive */}
      <G stroke={p.grass} strokeWidth={1.8} strokeLinecap="round" opacity={0.8}>
        <Line x1={-16} y1={1} x2={-17} y2={-7} />
        <Line x1={-11} y1={3} x2={-10} y2={-4} />
        <Line x1={12} y1={2} x2={13} y2={-6} />
        <Line x1={5} y1={4} x2={6} y2={-3} />
      </G>
      <Circle cx={2} cy={-1} r={1.8} fill={p.flower} />
      <Circle cx={-6} cy={4} r={1.5} fill={p.flower2} />
      <Circle cx={16} cy={2} r={1.5} fill={p.flowerCenter} />
    </>
  );
}

function Sprite({ item, p }: { item: SceneryItem; p: SceneryPalette }) {
  switch (item.kind) {
    case 'pine':
      return (
        <>
          <Rect x={-3} y={-8} width={6} height={9} rx={1} fill={p.trunk} />
          <Polygon points="-17,-8 17,-8 0,-26" fill={p.leafDark} />
          <Polygon points="-14,-9 14,-9 0,-23" fill={p.leaf} />
          <Polygon points="-13,-19 13,-19 0,-35" fill={p.leafDark} />
          <Polygon points="-10,-20 10,-20 0,-32" fill={p.leaf} />
          <Polygon points="-8,-31 8,-31 0,-45" fill={p.leafDark} />
          <Polygon points="-6,-32 6,-32 0,-42" fill={p.leaf} />
          <Polygon points="-3,-24 1,-26 -2,-34" fill={p.leafHi} opacity={0.75} />
        </>
      );
    case 'tree':
      return (
        <>
          <Rect x={-3.5} y={-12} width={7} height={14} rx={2} fill={p.trunk} />
          <Circle cx={-10} cy={-22} r={12} fill={p.leafDark} />
          <Circle cx={10} cy={-22} r={12} fill={p.leafDark} />
          <Circle cx={0} cy={-30} r={14} fill={p.leafDark} />
          <Circle cx={0} cy={-27} r={12} fill={p.leaf} />
          <Circle cx={-7} cy={-20} r={8} fill={p.leaf} />
          <Circle cx={7} cy={-20} r={8} fill={p.leaf} />
          <Circle cx={-4} cy={-31} r={6} fill={p.leafHi} opacity={0.8} />
          <Circle cx={6} cy={-17} r={1.8} fill={p.flower} />
          <Circle cx={-8} cy={-25} r={1.8} fill={p.flower2} />
        </>
      );
    case 'bush':
      return (
        <>
          <Rect x={-2} y={-6} width={4} height={6} fill={p.trunk} />
          <Circle cx={-10} cy={-11} r={10} fill={p.leafDark} />
          <Circle cx={10} cy={-11} r={10} fill={p.leafDark} />
          <Circle cx={0} cy={-16} r={12} fill={p.leafDark} />
          <Circle cx={0} cy={-13} r={9} fill={p.leaf} />
          <Circle cx={-7} cy={-9} r={7} fill={p.leaf} />
          <Circle cx={7} cy={-9} r={7} fill={p.leaf} />
          <Circle cx={-3} cy={-16} r={5} fill={p.leafHi} opacity={0.8} />
          <Circle cx={5} cy={-6} r={1.8} fill={p.flower} />
          <Circle cx={-6} cy={-5} r={1.8} fill={p.flower} />
          <Circle cx={1} cy={-4} r={1.8} fill={p.flower} />
        </>
      );
    case 'grass':
      return (
        <>
          <G fill="none" stroke={p.grass} strokeWidth={2.6} strokeLinecap="round">
            <Path d="M-10 0 Q-12 -10 -8 -16" />
            <Path d="M-6 0 Q-7 -13 -3 -19" />
            <Path d="M-1 0 Q-1 -15 3 -21" />
            <Path d="M4 0 Q4 -13 8 -18" />
            <Path d="M9 0 Q11 -10 13 -15" />
            <Path d="M2 0 Q3 -8 6 -11" />
          </G>
          <Circle cx={3} cy={-21} r={2.3} fill={p.flower} />
          <Circle cx={3} cy={-21} r={1} fill={p.flowerCenter} />
        </>
      );
    case 'rock':
      return (
        <>
          <Ellipse cx={9} cy={-3} rx={8} ry={5.5} fill={p.rock} />
          <Ellipse cx={-3} cy={-6} rx={15} ry={10} fill={p.rock} />
          <Ellipse cx={-7} cy={-10} rx={6} ry={3.4} fill={p.rockHi} />
          <Ellipse cx={1} cy={-1} rx={7} ry={2.4} fill={p.leafDark} opacity={0.5} />
        </>
      );
    case 'flower':
      return (
        <>
          <Line x1={2} y1={0} x2={2} y2={-16} stroke={p.grass} strokeWidth={2} />
          <Ellipse cx={-2} cy={-9} rx={4} ry={2.4} fill={p.grass} />
          <Line x1={-8} y1={0} x2={-8} y2={-10} stroke={p.grass} strokeWidth={2} />
          {petals(2, -19, 3.6, p.flower, p.flowerCenter)}
          {petals(-8, -13, 2.8, p.flower2, p.flowerCenter)}
        </>
      );
    case 'mushroom':
      return (
        <>
          <Rect x={-2.5} y={-8} width={5} height={8} rx={2} fill={p.mushroomStem} />
          <Ellipse cx={0} cy={-8} rx={9} ry={6} fill={p.mushroomCap} />
          <Circle cx={-3} cy={-9} r={1.6} fill="#fff" opacity={0.85} />
          <Circle cx={3} cy={-7} r={1.3} fill="#fff" opacity={0.85} />
          <Circle cx={0} cy={-11} r={1.2} fill="#fff" opacity={0.85} />
          <Rect x={6} y={-4} width={3} height={4} rx={1.5} fill={p.mushroomStem} />
          <Ellipse cx={7.5} cy={-4} rx={5} ry={3.4} fill={p.mushroomCap} />
        </>
      );
    case 'butterfly': {
      const cy = -30;
      return (
        <>
          <Line x1={0} y1={cy - 4} x2={-3} y2={cy - 9} stroke={p.trunk} strokeWidth={1} />
          <Line x1={0} y1={cy - 4} x2={3} y2={cy - 9} stroke={p.trunk} strokeWidth={1} />
          <Ellipse cx={0} cy={cy} rx={1.4} ry={4.5} fill={p.trunk} />
          <Ellipse cx={-5} cy={cy - 3} rx={5} ry={4} fill={p.flower} />
          <Ellipse cx={5} cy={cy - 3} rx={5} ry={4} fill={p.flower} />
          <Ellipse cx={-4} cy={cy + 3} rx={3.6} ry={3} fill={p.flower2} />
          <Ellipse cx={4} cy={cy + 3} rx={3.6} ry={3} fill={p.flower2} />
        </>
      );
    }
    case 'pond':
      return (
        <>
          <Ellipse cx={0} cy={-4} rx={22} ry={8} fill={p.pond} />
          <Ellipse cx={0} cy={-5} rx={15} ry={4.6} fill={p.pondHi} />
          <Ellipse cx={-9} cy={-5} rx={4.5} ry={2.4} fill={p.leafDark} />
          <Ellipse cx={6} cy={-3} rx={5} ry={1.4} fill={p.pond} opacity={0.5} />
          <G stroke={p.grass} strokeWidth={2} strokeLinecap="round">
            <Line x1={16} y1={-6} x2={16} y2={-18} />
            <Line x1={19} y1={-6} x2={20} y2={-15} />
          </G>
        </>
      );
    default:
      return null;
  }
}
