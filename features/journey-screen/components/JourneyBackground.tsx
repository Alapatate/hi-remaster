import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { scatterMeadow } from '../lib/scenery';

/**
 * Uneven, watercolor-style meadow wash behind the whole journey. The screen
 * itself is filled with `base`; this layer adds large overlapping translucent
 * blobs (each built up from two nested copies so pigment "pools" in the centre)
 * to give a soft, hand-painted, irregular prairie texture.
 */
export function JourneyBackground({
  width,
  height,
  blobs,
}: {
  width: number;
  height: number;
  blobs: readonly string[];
}) {
  const splotches = React.useMemo(
    () => scatterMeadow(width, height, blobs.length),
    [width, height, blobs.length]
  );

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none">
      {splotches.map((s, i) => (
        <G key={i} transform={`translate(${s.x} ${s.y})`}>
          <Path d={s.d} fill={blobs[s.tone]} opacity={0.22} />
          <G scale={0.6}>
            <Path d={s.d} fill={blobs[s.tone]} opacity={0.22} />
          </G>
        </G>
      ))}
    </Svg>
  );
}
