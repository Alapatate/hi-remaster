import { Text } from '@/components/ui/text';
import { router, useFocusEffect } from 'expo-router';
import { SparklesIcon } from 'lucide-react-native';
import * as React from 'react';
import { BackHandler, Platform, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACCENT = '#bf6e1a';

/**
 * Wrap-up shown when the last exercise of a session plays to its end. It
 * replaces the player, so both the button and hardware back return to the
 * sessions tab rather than into a finished video.
 */
export default function SessionComplete() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const goToSessions = React.useCallback(() => {
    router.replace({
      pathname: '/(protected)/videos',
      params: { resetAt: String(Date.now()) },
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== 'android') return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goToSessions();
        return true;
      });
      return () => sub.remove();
    }, [goToSessions])
  );

  return (
    <View
      className="flex-1 bg-background px-7"
      style={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) + 12 }}>
      <View className="flex-1 items-center justify-center">
        <Animated.View
          entering={ZoomIn.duration(420)}
          className="mb-7 items-center justify-center rounded-full"
          style={{ width: 112, height: 112, backgroundColor: 'rgba(191,110,26,0.14)' }}>
          <SparklesIcon size={48} color={ACCENT} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(160).duration(320)}>
          <Text className="text-center font-heading text-foreground" style={{ fontSize: 32 }}>
            {t('sessionCompleteTitle')}
          </Text>
          <Text
            className="mt-3 text-center font-body text-muted-foreground"
            style={{ fontSize: 17, lineHeight: 25 }}>
            {t('sessionCompleteMessage')}
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(320).duration(320)}>
        <TouchableOpacity
          onPress={goToSessions}
          activeOpacity={0.85}
          className="items-center justify-center rounded-2xl py-4"
          style={{ backgroundColor: ACCENT }}>
          <Text className="font-body-bold text-white" style={{ fontSize: 16 }}>
            {t('sessionCompleteCta')}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
