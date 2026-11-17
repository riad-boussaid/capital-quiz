import { Pressable, Text, View } from 'react-native';

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row gap-0.5 rounded-[13px] bg-element p-0.5">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-[10px] py-2.5 ${
              selected ? 'bg-primary' : 'active:opacity-70'
            }`}>
            <Text
              className={`text-xs font-bold ${
                selected ? 'text-primaryText' : 'text-muted'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
