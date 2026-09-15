import { Text } from '@/components/ui/text';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { SparklesIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSheetChrome } from '@/lib/sheetChrome';
import type { Bird } from '../lib/types';
import { BirdArt } from './BirdArt';

const SHEET_BG = '#e9e0ce';

function renderBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      opacity={0.35}
    />
  );
}

/** Detail sheet for a discovered bird. Opened from an unlocked waypoint. */
export const BirdSheet = React.forwardRef<BottomSheetModal, { bird: Bird | null }>(
  function BirdSheet({ bird }, ref) {
    const { t } = useTranslation();
    const chrome = useSheetChrome(SHEET_BG);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={['72%']}
        backdropComponent={renderBackdrop}
        style={{
          shadowColor: '#1a0f00',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 10,
        }}
        {...chrome}>
        <BottomSheetScrollView className="px-5 pb-12 pt-2">
          {bird ? (
            <>
              <View className="mb-4 items-center">
                <View
                  className="mb-3 h-24 w-24 items-center justify-center rounded-full bg-card"
                  style={{ borderWidth: 3, borderColor: '#bf6e1a' }}>
                  <BirdArt id={bird.id} size={72} />
                </View>
                <Text className="text-center font-heading text-3xl text-foreground">
                  {t(bird.nameKey)}
                </Text>
                <Text className="mt-1 text-center text-base italic text-muted-foreground">
                  {bird.scientificName}
                </Text>
              </View>

              <View className="mb-5 flex-row flex-wrap justify-center gap-2">
                <Chip
                  icon={<SparklesIcon size={15} className="text-muted-foreground" />}
                  label={`${bird.xpRequired} XP`}
                />
              </View>

              <View className="mb-4 rounded-2xl bg-card p-5">
                <Text className="mb-2 font-heading text-lg text-foreground">{t('aboutBird')}</Text>
                <Text className="text-base leading-7 text-muted-foreground">
                  {t(bird.descriptionKey)}
                </Text>
              </View>
            </>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-card px-3.5 py-2">
      {icon}
      <Text className="text-sm font-semibold text-foreground">{label}</Text>
    </View>
  );
}
