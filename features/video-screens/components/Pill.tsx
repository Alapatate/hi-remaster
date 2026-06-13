import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

type PillProps = {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  textClassName?: string;
};

/** A rounded chip with an optional leading icon (teacher / duration / flag chips). */
export function Pill({ label, icon, className, textClassName }: PillProps) {
  return (
    <View
      className={cn('flex-row items-center gap-1.5 rounded-full bg-card px-3.5 py-2', className)}>
      {icon}
      <Text className={cn('text-sm font-semibold text-foreground', textClassName)}>{label}</Text>
    </View>
  );
}
