import { Text } from '@/components/ui/text';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { LightbulbIcon, MapPinIcon, SparklesIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Bird } from '../lib/types';

const SHEET_BG = '#e9e0ce';
const HANDLE = '#c9bfa6';
const CHIP_ICON = '#7a6a52';

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
        backgroundStyle={{ backgroundColor: SHEET_BG }}
        handleIndicatorStyle={{ backgroundColor: HANDLE }}>
        <BottomSheetScrollView className="px-5 pb-12 pt-2">
          {bird ? (
            <>
              <View className="mb-4 items-center">
                <View
                  className="mb-3 h-24 w-24 items-center justify-center rounded-full bg-card"
                  style={{ borderWidth: 3, borderColor: '#bf6e1a' }}>
                  <Text style={{ fontSize: 48 }}>{bird.emoji}</Text>
                </View>
                <Text className="text-center text-3xl font-bold text-foreground">{bird.name}</Text>
                <Text className="mt-1 text-center text-base italic text-muted-foreground">
                  {bird.scientificName}
                </Text>
              </View>

              <View className="mb-5 flex-row flex-wrap justify-center gap-2">
                <Chip icon={<MapPinIcon size={15} color={CHIP_ICON} />} label={bird.habitat} />
                <Chip
                  icon={<SparklesIcon size={15} color={CHIP_ICON} />}
                  label={`${bird.xpRequired} XP`}
                />
              </View>

              <View className="mb-4 rounded-2xl bg-card p-5">
                <Text className="mb-2 text-lg font-bold text-foreground">{t('aboutBird')}</Text>
                <Text className="text-base leading-7 text-muted-foreground">
                  {bird.description}
                </Text>
              </View>

              <View className="flex-row items-start gap-3 rounded-2xl bg-card p-5">
                <LightbulbIcon size={20} color="#bf6e1a" style={{ marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-bold uppercase tracking-wide text-foreground">
                    {t('funFact')}
                  </Text>
                  <Text className="text-base leading-7 text-muted-foreground">{bird.funFact}</Text>
                </View>
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
