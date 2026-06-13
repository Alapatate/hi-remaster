import { Text } from '@/components/ui/text';
import { ClockIcon, GraduationCapIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '../lib/format';

/** Header card on the summary step: teacher, total time, exercise count. */
export function SessionSummaryCard({
  teacherName,
  totalDuration,
  exerciseCount,
}: {
  teacherName: string;
  totalDuration: number;
  exerciseCount: number;
}) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-secondary px-4 py-4">
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
        <GraduationCapIcon size={22} color="white" />
      </View>

      <View className="flex-1">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {t('enseignant')}
        </Text>
        <Text className="text-lg font-bold text-foreground">{teacherName}</Text>
      </View>

      <View className="items-end">
        <View className="flex-row items-center gap-1.5">
          <ClockIcon size={16} color="#bf6e1a" />
          <Text className="text-lg font-bold text-primary">{formatDuration(totalDuration)}</Text>
        </View>
        <Text className="text-xs text-muted-foreground">
          {t('exercisesCount', { count: exerciseCount })}
        </Text>
      </View>
    </View>
  );
}
