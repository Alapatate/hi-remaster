import { Text } from '@/components/ui/text';
import { InfoIcon } from 'lucide-react-native';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import { teacherFlag, teacherFullName, teacherPhotoSource } from '../lib/data';
import type { Teacher } from '../lib/types';

/** Large featured-teacher card: photo, name banner, info button, country flag. */
export function TeacherHeroCard({
  teacher,
  onInfo,
}: {
  teacher: Teacher;
  onInfo?: () => void;
}) {
  const flag = teacherFlag(teacher);

  return (
    <View className="overflow-hidden rounded-3xl bg-card" style={{ elevation: 3 }}>
      <ImageBackground
        source={teacherPhotoSource(teacher)}
        style={{ width: '100%', aspectRatio: 0.82 }}
        resizeMode="cover">
        {/* Name banner */}
        <View className="absolute left-4 right-4 top-4 items-center rounded-2xl bg-primary py-3">
          <Text className="text-base font-bold uppercase tracking-wide text-primary-foreground">
            {teacherFullName(teacher)}
          </Text>
        </View>

        {/* Info button */}
        <TouchableOpacity
          onPress={onInfo}
          activeOpacity={0.8}
          className="absolute bottom-4 left-4 h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(247,241,227,0.92)' }}>
          <InfoIcon size={20} color="#bf6e1a" />
        </TouchableOpacity>

        {/* Country flag */}
        {flag ? (
          <View
            className="absolute bottom-4 right-4 h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(247,241,227,0.92)' }}>
            <Text style={{ fontSize: 24 }}>{flag}</Text>
          </View>
        ) : null}
      </ImageBackground>
    </View>
  );
}
