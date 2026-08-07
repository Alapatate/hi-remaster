import { Text } from '@/components/ui/text';
import { BellIcon, MoonIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Switch, TouchableOpacity, View } from 'react-native';
import type { ReminderId } from '../lib/types';

const ACTIVE_ICON = '#bf6e1a';
const IDLE_ICON = '#8a8178';

export function ReminderRow({
  id,
  title,
  subtitle,
  enabled,
  busy,
  onToggle,
  onPress,
}: {
  id: ReminderId;
  title: string;
  subtitle: string;
  enabled: boolean;
  busy: boolean;
  onToggle: (value: boolean) => void;
  onPress: () => void;
}) {
  const Icon = id === 'dailySit' ? BellIcon : MoonIcon;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3.5 px-4 py-4">
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${
          enabled ? 'bg-primary/15' : 'bg-secondary'
        }`}>
        <Icon size={18} color={enabled ? ACTIVE_ICON : IDLE_ICON} />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="font-body-semibold text-[15px]">{title}</Text>
        <Text className="font-body text-[13px] text-muted-foreground">{subtitle}</Text>
      </View>

      {busy ? <ActivityIndicator size="small" /> : null}
      <Switch
        value={enabled}
        onValueChange={onToggle}
        disabled={busy}
        trackColor={{ false: '#d4d4d4', true: '#bf6e1a' }}
        thumbColor="white"
      />
    </TouchableOpacity>
  );
}
