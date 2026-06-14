import { Text } from '@/components/ui/text';
import { PlayIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '../lib/format';

const OLIVE = '#4f5d2f';
const OLIVE_MUTED = '#c9d2b0';

/** Olive "continue watching" card showing the last session's progress. */
export function LastSessionCard({
  teacherName,
  progress,
  totalSeconds,
  onPress,
}: {
  teacherName: string;
  progress: number;
  totalSeconds: number;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="rounded-2xl px-5 py-3"
      style={{ backgroundColor: OLIVE }}>
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: OLIVE_MUTED }}>
            {t('lastSession')}
          </Text>
          <Text className="mt-0.5 text-base font-bold text-white">{teacherName}</Text>
          <Text className="text-xs" style={{ color: OLIVE_MUTED }}>
            {t('percentComplete', { percent: Math.round(pct) })}
            {totalSeconds > 0 ? `  ·  ${formatDuration(totalSeconds)}` : ''}
          </Text>
        </View>
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
          <PlayIcon size={18} color="white" fill="white" />
        </View>
      </View>

      {/* Progress bar */}
      <View
        className="mt-3 h-1.5 overflow-hidden rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: OLIVE_MUTED }}
        />
      </View>
    </TouchableOpacity>
  );
}
