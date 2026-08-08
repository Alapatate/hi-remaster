import { Text } from '@/components/ui/text';
import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { teacherPhotoSource } from '../lib/data';
import { formatDuration } from '../lib/format';
import { orderByPhase, PHASES } from '../lib/phases';
import type { Teacher, Video } from '../lib/types';

/**
 * The step 3 recap: guide strip, the chosen exercises in playback order, and a
 * total. One card rather than the two it replaces, matching the comp.
 */
export function SessionRecapCard({
  teacher,
  teacherName,
  videos,
  total,
}: {
  teacher?: Teacher;
  teacherName: string;
  videos: Video[];
  total: number;
}) {
  const { t } = useTranslation();
  const ordered = orderByPhase(videos);

  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Guide */}
      <View className="flex-row items-center gap-3.5 bg-primary/10 p-4">
        <Image
          source={teacherPhotoSource(teacher)}
          style={{ width: 56, height: 56, borderRadius: 28 }}
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text
            className="font-body-semibold uppercase tracking-widest text-primary"
            style={{ fontSize: 11 }}>
            {t('yourGuide')}
          </Text>
          <Text className="mt-0.5 font-heading" style={{ fontSize: 20 }} numberOfLines={1}>
            {teacherName}
          </Text>
        </View>
      </View>

      {/* Exercises, in the order they will play */}
      <View className="px-4">
        {ordered.map((video, index) => {
          const color = PHASES[video.type]?.color ?? '#bf6e1a';
          const isLast = index === ordered.length - 1;
          return (
            <View
              key={video.$id}
              className={`flex-row items-center gap-3 py-3.5 ${isLast ? '' : 'border-b border-border'}`}>
              <View
                className="items-center justify-center"
                style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: `${color}33` }}>
                <Text className="font-body-semibold" style={{ fontSize: 12, color }}>
                  {index + 1}
                </Text>
              </View>
              <Text
                className="flex-1 font-body-medium"
                style={{ fontSize: 15.5 }}
                numberOfLines={1}>
                {video.title}
              </Text>
              <Text className="font-body-semibold text-muted-foreground" style={{ fontSize: 15 }}>
                {formatDuration(video.duration ?? 0)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Total */}
      <View className="flex-row items-baseline justify-between bg-secondary px-4 py-3.5">
        <Text
          className="font-body-semibold uppercase tracking-widest text-muted-foreground"
          style={{ fontSize: 11 }}>
          {t('totalLabel')}
        </Text>
        <Text className="font-heading" style={{ fontSize: 24 }}>
          {formatDuration(total)}
        </Text>
      </View>
    </View>
  );
}
