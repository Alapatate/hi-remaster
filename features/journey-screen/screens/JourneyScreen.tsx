import { useBottomDockSpace } from '@/components/navigation/FloatingTabBar';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from 'expo-router';
import * as React from 'react';
import { InteractionManager, ScrollView, useWindowDimensions, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BirdSheet } from '../components/BirdSheet';
import { BirdUnlockedPopup } from '../components/BirdUnlockedPopup';
import { JourneyBackground } from '../components/JourneyBackground';
import { JourneyHeader } from '../components/JourneyHeader';
import { JourneyPath } from '../components/JourneyPath';
import { JourneyScenery } from '../components/JourneyScenery';
import { NightOverlay } from '../components/NightOverlay';
import { WaypointNode } from '../components/WaypointNode';
import { useJourney, type JourneyState } from '../hooks/useJourney';
import { useJourneyReveal } from '../hooks/useJourneyReveal';
import { JOURNEY_COLORS } from '../lib/colors';
import type { Bird, Waypoint } from '../lib/types';

/** Either themed palette (light or dark), as resolved from the colour scheme. */
type Palette = (typeof JOURNEY_COLORS)['light'] | (typeof JOURNEY_COLORS)['dark'];

export function JourneyScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const dockSpace = useBottomDockSpace();
  const { colorScheme } = useColorScheme();
  const palette = JOURNEY_COLORS[colorScheme === 'dark' ? 'dark' : 'light'];

  const [headerHeight, setHeaderHeight] = React.useState(0);

  // Truth from the live prefs — drives the map at its final/current state.
  const journey = useJourney(width, headerHeight);
  const { waypoints, frontierIndex, markerPosition, canvasHeight } = journey;

  // Fetches fresh XP on focus and animates the header from the last-seen value.
  const reveal = useJourneyReveal();
  // Header is driven by the animated value while revealing, the truth otherwise.
  const shownXp = reveal.displayXp ?? journey.xp;
  const headerJourney = useJourney(width, headerHeight, shownXp);
  const headerNextBird = headerJourney.waypoints[headerJourney.frontierIndex + 1]?.bird ?? null;

  // Extend the canvas past the last node so the meadow + night veil reach the
  // very bottom of the screen (behind the floating tab bar) instead of cutting
  // off at the trail's end.
  const renderHeight = canvasHeight + dockSpace + 24;

  const scrollRef = React.useRef<ScrollView>(null);
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const [selectedBird, setSelectedBird] = React.useState<Bird | null>(null);

  const nextBird = waypoints[frontierIndex + 1]?.bird ?? null;

  // Defer heavy SVG mount until the navigation transition animation is done,
  // so the tab switch stays smooth on first visit.
  const [mapReady, setMapReady] = React.useState(false);
  React.useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setMapReady(true));
    return () => task.cancel();
  }, []);

  const openBird = React.useCallback((w: Waypoint) => {
    setSelectedBird(w.bird);
    sheetRef.current?.present();
  }, []);

  // On every focus, centre the last unlocked waypoint in the visible area
  // (accounting for the fixed header above and the tab bar below).
  const frontierY = waypoints[frontierIndex]?.y ?? markerPosition.y;
  useFocusEffect(
    React.useCallback(() => {
      const visibleHeight = height - headerHeight - dockSpace;
      const target = Math.max(0, frontierY - visibleHeight / 2);
      const id = setTimeout(() => scrollRef.current?.scrollTo({ y: target, animated: true }), 350);
      return () => clearTimeout(id);
    }, [frontierY, height, headerHeight, dockSpace])
  );

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: palette.meadow.base }}>
      <ScrollView ref={scrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
        {mapReady ? (
          <JourneyMap
            journey={journey}
            width={width}
            renderHeight={renderHeight}
            palette={palette}
            topOffset={headerHeight}
            nextBird={nextBird}
            onBird={openBird}
          />
        ) : (
          <View style={{ width, height: renderHeight }} />
        )}
      </ScrollView>

      {/* Fixed XP header — stays pinned at the top while the map scrolls beneath */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
        <JourneyHeader
          xp={shownXp}
          unlockedCount={headerJourney.unlockedCount}
          total={waypoints.length}
          progressToNext={headerJourney.progressToNext}
          xpToNext={headerJourney.xpToNext}
          nextBirdName={headerNextBird?.name ?? null}
          accent={palette.accent}
        />
      </View>

      <BirdSheet ref={sheetRef} bird={selectedBird} />

      <BirdUnlockedPopup
        bird={reveal.pendingBird}
        accent={palette.accent}
        onDismiss={reveal.dismissBird}
      />
    </View>
  );
}

/**
 * The scrollable map (background, scenery, trail, waypoints, night veil, marker).
 * Memoised so the per-frame header count-up during a reveal doesn't re-render the
 * heavy SVG layers — its props all come from the stable, truth-state `journey`.
 */
const JourneyMap = React.memo(function JourneyMap({
  journey,
  width,
  renderHeight,
  palette,
  topOffset,
  nextBird,
  onBird,
}: {
  journey: JourneyState;
  width: number;
  renderHeight: number;
  palette: Palette;
  topOffset: number;
  nextBird: Bird | null;
  onBird: (w: Waypoint) => void;
}) {
  const { waypoints, frontierIndex, markerPosition } = journey;

  return (
    <View style={{ width, height: renderHeight }}>
      <JourneyBackground width={width} height={renderHeight} blobs={palette.meadow.blobs} />

      <JourneyScenery
        points={waypoints}
        width={width}
        height={renderHeight}
        palette={palette.scenery}
        mutedPalette={palette.sceneryMuted}
        cutoffY={markerPosition.y}
        topOffset={topOffset}
      />

      <JourneyPath
        points={waypoints}
        frontierIndex={frontierIndex}
        width={width}
        height={renderHeight}
        cutoffY={markerPosition.y}
        dirt={{
          fill: palette.dirt,
          edge: palette.dirtEdge,
          pebbleLight: palette.pebbleLight,
          pebbleDark: palette.pebbleDark,
        }}
        dirtMuted={{
          fill: palette.dirtMuted,
          edge: palette.dirtEdgeMuted,
          pebbleLight: palette.pebbleLightMuted,
          pebbleDark: palette.pebbleDarkMuted,
        }}
      />

      {waypoints.map((w) => (
        <WaypointNode
          key={w.bird.id}
          waypoint={w}
          isFrontier={w.index === frontierIndex}
          accent={palette.accent}
          onPress={onBird}
        />
      ))}

      {/* Night/shadow veil over everything not yet discovered.
          Skipped entirely once the final waypoint is reached. */}
      {journey.unlockedCount < waypoints.length ? (
        <NightOverlay
          width={width}
          height={renderHeight}
          cutoffY={markerPosition.y}
          stops={palette.night.stops}
          starColor={palette.night.star}
        />
      ) : null}

      {/* "You are here" marker, travelling along the trail toward the next stop. */}
      {journey.progressToNext > 0.02 && nextBird ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: markerPosition.x - 10,
            top: markerPosition.y - 10,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: palette.marker,
            borderWidth: 3,
            borderColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        />
      ) : null}
    </View>
  );
});
