import { Text } from '@/components/ui/text';
import { ListMusicIcon, SettingsIcon, XIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PLAYER } from './playerTheme';

/**
 * Top overlay: close on the left, the session position and title centred, and
 * the playlist / quality controls on the right.
 */
export function PlayerTopBar({
  onBack,
  index,
  total,
  hasSession,
  onPlaylist,
  onQuality,
  hasVariants,
}: {
  onBack: () => void;
  index: number;
  total: number;
  hasSession: boolean;
  onPlaylist: () => void;
  onQuality: () => void;
  hasVariants: boolean;
}) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between px-5 pt-2">
      <CircleButton onPress={onBack}>
        <XIcon size={19} color={PLAYER.text} />
      </CircleButton>

      {/* Position only. The comp puts an exercise name here and the video title
          below, but a video carries one title, so showing it twice is noise —
          the title block owns it. */}
      <View className="flex-1 items-center px-2">
        {hasSession ? (
          <Text
            className="font-body-bold uppercase tracking-widest"
            style={{ color: PLAYER.eyebrow, fontSize: 11 }}>
            {t('exerciseOf', { index: index + 1, total })}
          </Text>
        ) : null}
      </View>

      <View className="flex-row items-center gap-2">
        {hasSession ? (
          <CircleButton onPress={onPlaylist}>
            <ListMusicIcon size={19} color={PLAYER.text} />
          </CircleButton>
        ) : null}
        {hasVariants ? (
          <CircleButton onPress={onQuality}>
            <SettingsIcon size={19} color={PLAYER.text} />
          </CircleButton>
        ) : null}
      </View>
    </View>
  );
}

function CircleButton({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="items-center justify-center"
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: PLAYER.chip }}>
      {children}
    </TouchableOpacity>
  );
}
