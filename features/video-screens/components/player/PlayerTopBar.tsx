import { Text } from '@/components/ui/text';
import { ArrowLeftIcon, ListMusicIcon, SettingsIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RoundIconButton } from '../RoundIconButton';

/** Top overlay of the player: back, playlist position, quality selector. */
export function PlayerTopBar({
  onBack,
  index,
  total,
  hasSession,
  onPlaylist,
  qualityLabel,
  onQuality,
  hasVariants,
}: {
  onBack: () => void;
  index: number;
  total: number;
  hasSession: boolean;
  onPlaylist: () => void;
  qualityLabel: string;
  onQuality: () => void;
  hasVariants: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 pt-2">
      <RoundIconButton size={40} onPress={onBack} className="bg-white/15">
        <ArrowLeftIcon size={20} color="white" />
      </RoundIconButton>

      <View className="flex-row items-center gap-2">
        {hasSession ? (
          <TouchableOpacity
            onPress={onPlaylist}
            activeOpacity={0.7}
            className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-2">
            <ListMusicIcon size={16} color="white" />
            <Text className="text-sm font-medium text-white">
              {index + 1}/{total}
            </Text>
          </TouchableOpacity>
        ) : null}

        {hasVariants ? (
          <TouchableOpacity
            onPress={onQuality}
            activeOpacity={0.7}
            className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-2">
            <SettingsIcon size={16} color="white" />
            <Text className="text-sm font-medium text-white">{qualityLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
