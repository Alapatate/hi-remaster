import { cn } from '@/lib/utils';
import * as React from 'react';
import { TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

type RoundIconButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
};

/** A circular, tappable (or static) icon container used across the video screens. */
export function RoundIconButton({
  children,
  onPress,
  size = 40,
  disabled,
  className,
  style,
  hitSlop = 8,
}: RoundIconButtonProps) {
  const content = (
    <View
      style={[{ width: size, height: size }, style]}
      className={cn('items-center justify-center rounded-full', className)}>
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}>
      {content}
    </TouchableOpacity>
  );
}
