import { Text } from '@/components/ui/text';
import { InfoIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { PLAYER } from './playerTheme';

/** Title and attribution above the scrub bar. */
export function PlayerTitleBlock({
  title,
  teacher,
  language,
  onInfo,
}: {
  title: string;
  teacher: string;
  language?: string;
  onInfo: () => void;
}) {
  return (
    <View className="flex-row items-end px-6">
      <View className="flex-1 pr-3">
        <Text
          className="font-heading"
          numberOfLines={1}
          style={{ color: PLAYER.text, fontSize: 27, lineHeight: 30 }}>
          {title}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-2">
          <Text
            className="font-body"
            numberOfLines={1}
            style={{ color: PLAYER.textMuted, fontSize: 14 }}>
            {teacher}
          </Text>
          {language ? (
            <>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#a19786' }} />
              <Text className="font-body" style={{ color: PLAYER.textMuted, fontSize: 14 }}>
                {language}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        onPress={onInfo}
        activeOpacity={0.7}
        className="items-center justify-center"
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: PLAYER.chip }}>
        <InfoIcon size={19} color={PLAYER.text} />
      </TouchableOpacity>
    </View>
  );
}
