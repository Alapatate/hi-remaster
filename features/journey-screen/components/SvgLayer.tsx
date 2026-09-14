import * as React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Wrapper for the decorative, full-canvas SVG layers of the map, opting them
 * out of hit testing for real.
 *
 * `pointerEvents="none"` on an `<Svg>` is not enough on iOS: RNSVGSvgView
 * overrides `hitTest` and, for any point inside its bounds, returns itself
 * without ever consulting `pointerEvents` (see
 * `react-native-svg/apple/Elements/RNSVGSvgView.mm`). A layer drawn above the
 * waypoints therefore swallows every tap. Android honours the prop, which is
 * why this only ever broke on iOS.
 *
 * A plain RN `View` does honour it on both platforms, so this wrapper is what
 * actually lets touches through to the nodes underneath.
 */
export function SvgLayer({ children }: { children: React.ReactNode }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {children}
    </View>
  );
}
