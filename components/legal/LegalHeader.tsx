import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { ArrowLeftIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

/**
 * Back button and title for the legal screens. They can be the first screen of
 * the stack (opened from a link before sign-in), so back falls back to the
 * app's entry point instead of doing nothing.
 */
export function LegalHeader({ title }: { title: string }) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <TouchableOpacity
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        activeOpacity={0.7}
        hitSlop={10}
        className="h-10 w-10 items-center justify-center rounded-full bg-card">
        <ArrowLeftIcon size={20} className="text-foreground" />
      </TouchableOpacity>
      <Text className="flex-1 font-heading" style={{ fontSize: 20 }} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}
