import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

type InputProps = TextInputProps & { className?: string };

function Input({ className, ...props }: InputProps) {
  const { colorScheme } = useColorScheme();
  const placeholderColor = colorScheme === 'dark' ? '#A3A3A3' : '#737373';

  return (
    <TextInput
      className={cn(
        'h-12 w-full rounded-md border border-input bg-background px-4 text-base text-foreground',
        className
      )}
      placeholderTextColor={placeholderColor}
      {...props}
    />
  );
}

export { Input };
