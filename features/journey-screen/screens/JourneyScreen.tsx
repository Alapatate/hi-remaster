import { useBottomDockSpace } from '@/components/navigation/FloatingTabBar';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BirdSheet } from '../components/BirdSheet';
import { JourneyHeader } from '../components/JourneyHeader';
import { JourneyPath } from '../components/JourneyPath';
import { JourneyScenery } from '../components/JourneyScenery';
import { WaypointNode } from '../components/WaypointNode';
import { useJourney } from '../hooks/useJourney';
import { JOURNEY_COLORS } from '../lib/colors';
import type { Bird, Waypoint } from '../lib/types';

export function JourneyScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const dockSpace = useBottomDockSpace();
  const { colorScheme } = useColorScheme();
  const palette = JOURNEY_COLORS[colorScheme === 'dark' ? 'dark' : 'light'];

  const journey = useJourney(width);
  const { waypoints, frontierIndex, markerPosition, canvasHeight } = journey;

  const scrollRef = React.useRef<ScrollView>(null);
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const [selectedBird, setSelectedBird] = React.useState<Bird | null>(null);

  const nextBird = waypoints[frontierIndex + 1]?.bird ?? null;

  const openBird = React.useCallback((w: Waypoint) => {
    setSelectedBird(w.bird);
    sheetRef.current?.present();
  }, []);

  // Drop the user near their current position rather than at the very top.
  React.useEffect(() => {
    const target = Math.max(0, markerPosition.y - height * 0.4);
    const id = setTimeout(() => scrollRef.current?.scrollTo({ y: target, animated: true }), 450);
    return () => clearTimeout(id);
    // Run once on mount; marker position is stable for a given XP value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: dockSpace }}>
        <JourneyHeader
          xp={journey.xp}
          unlockedCount={journey.unlockedCount}
          total={waypoints.length}
          progressToNext={journey.progressToNext}
          xpToNext={journey.xpToNext}
          nextBirdName={nextBird?.name ?? null}
          accent={palette.accent}
        />

        <View style={{ width, height: canvasHeight }}>
          <JourneyScenery
            points={waypoints}
            width={width}
            height={canvasHeight}
            palette={palette.scenery}
            mutedPalette={palette.sceneryMuted}
            cutoffY={markerPosition.y}
          />

          <JourneyPath
            points={waypoints}
            frontierIndex={frontierIndex}
            width={width}
            height={canvasHeight}
            cutoffY={markerPosition.y}
            doneColor={palette.accent}
            todoColor={palette.trailTodo}
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
              onPress={openBird}
            />
          ))}

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
      </ScrollView>

      <BirdSheet ref={sheetRef} bird={selectedBird} />
    </View>
  );
}
