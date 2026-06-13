import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';

type Variant = 'primary' | 'secondary';

/** Chunky rounded CTA used across the video screens (Practice, Start, etc.). */
export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  iconLeft,
  iconRight,
  disabled,
  className,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3',
        isPrimary ? 'bg-primary' : 'bg-secondary',
        disabled && 'opacity-50',
        className
      )}>
      {iconLeft}
      <Text
        className={cn(
          'text-base font-bold',
          isPrimary ? 'text-primary-foreground' : 'text-secondary-foreground'
        )}>
        {label}
      </Text>
      {iconRight}
    </TouchableOpacity>
  );
}
