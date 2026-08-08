import { Text } from '@/components/ui/text';
import { SparklesIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

const OLIVE = '#4f5d2f';

/**
 * What the session is worth. XP is awarded per minute of playback, so the
 * figure is the session length in minutes. `nextBird` is only passed when the
 * session actually covers the XP still needed to reach it.
 */
export function XpRewardNote({ xp, nextBird }: { xp: number; nextBird?: string }) {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row items-center gap-3 rounded-2xl border p-4"
      style={{ backgroundColor: `${OLIVE}14`, borderColor: `${OLIVE}4d` }}>
      <View
        className="items-center justify-center"
        style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: OLIVE }}>
        <SparklesIcon size={17} color="#f5ead8" />
      </View>
      <Text className="flex-1 font-body" style={{ fontSize: 14.5, lineHeight: 20, color: OLIVE }}>
        {nextBird ? t('xpReachNote', { xp, name: nextBird }) : t('xpEarnNote', { xp })}
      </Text>
    </View>
  );
}
