import type { BottomTabBarProps } from '@bottom-tabs/react-navigation';
import { CompassIcon, ListMusicIcon, UserIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { LayoutChangeEvent, Platform, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BAR_HEIGHT = 68;
const BAR_MARGIN = 12;
const BAR_PADDING = 8;

const TAB_COLORS = {
  bar: '#FFFFFF',
  activeBg: '#F5E9DA',
  active: '#A66D42',
  inactive: '#7D634C',
} as const;

const TAB_ICONS = {
  dashboard: CompassIcon,
  videos: ListMusicIcon,
  profile: UserIcon,
} as const;

type TabRouteName = keyof typeof TAB_ICONS;

/** Total vertical space the floating dock occupies, for screens to reserve as padding. */
export function useBottomDockSpace(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + BAR_MARGIN + BAR_HEIGHT;
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const barBg = isDark ? '#1c1814' : TAB_COLORS.bar;
  const activeBg = isDark ? '#3d2e22' : TAB_COLORS.activeBg;
  const activeColor = isDark ? '#d4a574' : TAB_COLORS.active;
  const inactiveColor = isDark ? '#9a8470' : TAB_COLORS.inactive;

  const tabCount = state.routes.length;
  const [rowWidth, setRowWidth] = React.useState(0);
  const tabWidth = rowWidth > 0 ? rowWidth / tabCount : 0;

  const translateX = useSharedValue(0);

  React.useEffect(() => {
    if (tabWidth === 0) return;
    translateX.value = withTiming(state.index * tabWidth, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [state.index, tabWidth, translateX]);

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onRowLayout = (e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: insets.bottom + BAR_MARGIN,
      }}>
      <View
        style={{
          height: BAR_HEIGHT,
          borderRadius: 9999,
          backgroundColor: barBg,
          paddingHorizontal: BAR_PADDING,
          justifyContent: 'center',
          ...Platform.select({
            ios: {
              shadowColor: '#3d2a18',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
            },
            android: { elevation: 10 },
            default: {},
          }),
        }}>
        <View style={{ flexDirection: 'row' }} onLayout={onRowLayout}>
          {/* Sliding active highlight */}
          {tabWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: tabWidth,
                  paddingHorizontal: 0,
                },
                highlightStyle,
              ]}>
              <View
                style={{
                  flex: 1,
                  borderRadius: 99999,
                  backgroundColor: activeBg,
                }}
              />
            </Animated.View>
          ) : null}

          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name;

            const Icon = TAB_ICONS[route.name as TabRouteName] ?? CompassIcon;
            const color = focused ? activeColor : inactiveColor;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={String(label)}
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{ flex: 1 }}>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 8,
                  }}>
                  <Icon size={22} color={color} strokeWidth={1.75} />
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      fontWeight: focused ? '600' : '500',
                      color,
                    }}>
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
