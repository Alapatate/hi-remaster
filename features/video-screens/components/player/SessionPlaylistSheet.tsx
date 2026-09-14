import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { PlayIcon } from 'lucide-react-native';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { teacherFullName } from '../../lib/data';
import { formatDuration } from '../../lib/format';
import type { Video } from '../../lib/types';
import { useSheetChrome } from '@/lib/sheetChrome';
import { renderBackdrop, SHEET_SHADOW } from './sheetHelpers';

const SHEET_BG = '#f4eddd';

/** Cream bottom sheet listing the videos of the current session. */
export const SessionPlaylistSheet = React.forwardRef<
  BottomSheetModal,
  {
    videos: Video[];
    currentId: string;
    onSelect: (id: string) => void;
  }
>(function SessionPlaylistSheet({ videos, currentId, onSelect }, ref) {
  const { t } = useTranslation();
  const chrome = useSheetChrome(SHEET_BG);

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      style={SHEET_SHADOW}
      {...chrome}>
      <BottomSheetScrollView className="px-5 pb-10 pt-2">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="font-heading text-2xl text-foreground">{t('sessionPlaylist')}</Text>
          <View className="rounded-full bg-primary/15 px-3 py-1.5">
            <Text className="text-sm font-semibold text-primary">
              {t('videosCount', { count: videos.length })}
            </Text>
          </View>
        </View>

        {videos.map((video, index) => {
          const isCurrent = video.$id === currentId;
          return (
            <TouchableOpacity
              key={video.$id}
              activeOpacity={0.7}
              onPress={() => {
                if (!isCurrent) onSelect(video.$id);
              }}
              className={cn(
                'mb-2 flex-row items-center gap-3 rounded-2xl px-3 py-3',
                isCurrent && 'bg-primary/10'
              )}>
              <View
                className={cn(
                  'h-12 w-12 items-center justify-center rounded-full',
                  isCurrent ? 'bg-primary' : 'bg-secondary'
                )}>
                {isCurrent ? (
                  <PlayIcon size={18} color="white" fill="white" />
                ) : (
                  <Text className="text-base font-bold text-muted-foreground">{index + 1}</Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
                  {video.title}
                </Text>
                <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                  {isCurrent ? (
                    <Text className="text-sm font-semibold text-primary">{t('nowPlaying')}</Text>
                  ) : null}
                  {isCurrent && video.teacher ? '  ·  ' : ''}
                  {teacherFullName(video.teacher)}
                </Text>
              </View>

              {video.duration != null && video.duration > 0 ? (
                <View className="rounded-lg bg-secondary px-2.5 py-1">
                  <Text className="text-sm font-medium text-foreground">
                    {formatDuration(video.duration)}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
