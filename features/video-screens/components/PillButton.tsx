import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { AnimatedDuration } from './AnimatedDuration';

type Variant = 'primary' | 'outline';

/**
 * Full-radius CTA used by the stepper footers. Sizes are explicit rather than
 * utility classes — arbitrary bracket values are not applied in this setup.
 */
export function PillButton({
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
        'flex-row items-center justify-center gap-2',
        isPrimary ? 'bg-primary' : 'border border-border',
        disabled && 'opacity-40',
        className
      )}
      style={{ height: isPrimary ? 56 : 52, borderRadius: 999 }}>
      {iconLeft}
      <Text
        className={cn('font-heading', isPrimary ? 'text-primary-foreground' : 'text-foreground')}
        style={{ fontSize: isPrimary ? 17 : 16 }}>
        {label}
      </Text>
      {iconRight}
    </TouchableOpacity>
  );
}

/**
 * Left-hand summary block in the step 2 footer: "3 chosen" over the running
 * total. A minimum width keeps the adjacent button from shifting as the total
 * counts between values of different digit widths.
 */
export function FooterTally({ caption, seconds }: { caption: string; seconds: number }) {
  return (
    <View style={{ flexShrink: 0, minWidth: 86 }}>
      <Text
        className="font-body-semibold uppercase tracking-widest text-muted-foreground"
        style={{ fontSize: 11 }}>
        {caption}
      </Text>
      <AnimatedDuration
        className="font-heading"
        seconds={seconds}
        style={{ fontSize: 22, lineHeight: 25 }}
      />
    </View>
  );
}
