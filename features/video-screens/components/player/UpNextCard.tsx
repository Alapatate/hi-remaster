import { Text } from '@/components/ui/text';
import { PlayIcon } from 'lucide-react-native';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { teacherPhotoSource } from '../../lib/data';
import { formatDuration } from '../../lib/format';
import type { Video } from '../../lib/types';
import { PLAYER } from './playerTheme';

/**
 * The next exercise in the session, and the only way to skip ahead — which is
 * why it is absent when nothing follows.
 */
export function UpNextCard({ video, onPress }: { video: Video; onPress: () => void }) {
  const { t } = useTranslation();
  const duration = video.duration ? formatDuration(video.duration) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mx-5 mb-2 mt-3.5 flex-row items-center gap-3"
      style={{ backgroundColor: PLAYER.card, borderRadius: 22, padding: 12 }}>
      <Image
        source={teacherPhotoSource(video.teacher)}
        style={{ width: 52, height: 36, borderRadius: 10 }}
        resizeMode="cover"
      />

      <View className="flex-1">
        <Text
          className="font-body-semibold uppercase tracking-widest"
          style={{ color: '#c0b6a5', fontSize: 11 }}>
          {t('upNext')}
        </Text>
        <Text
          className="font-body-semibold"
          numberOfLines={1}
          style={{ color: PLAYER.text, fontSize: 15 }}>
          {duration ? `${video.title} · ${duration}` : video.title}
        </Text>
      </View>

      <View
        className="items-center justify-center"
        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(249,244,237,0.16)' }}>
        <PlayIcon size={16} color={PLAYER.text} fill={PLAYER.text} style={{ marginLeft: 2 }} />
      </View>
    </TouchableOpacity>
  );
}
