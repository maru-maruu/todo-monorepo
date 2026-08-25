import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Calendar,
  CheckSquare,
  Settings,
  SquareCheck,
} from 'lucide-react-native';

import { colors, fonts } from '@/constants/theme';

type TabName = 'tasks' | 'daily' | 'settings';

interface BottomTabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const tabs: { key: TabName; label: string; Icon: typeof Calendar }[] = [
  { key: 'tasks', label: 'Tasks', Icon: SquareCheck },
  { key: 'daily', label: 'Daily', Icon: Calendar },
  { key: 'settings', label: 'Settings', Icon: Settings },
];

export function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map(({ key, label, Icon }) => {
        const isActive = activeTab === key;
        const color = isActive ? colors.accentRose : colors.textMuted;
        const IconToShow =
          key === 'tasks' && isActive ? CheckSquare : Icon;

        return (
          <Pressable
            key={key}
            style={styles.tab}
            onPress={() => onTabPress(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <IconToShow size={24} color={color} strokeWidth={1.8} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.beige,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  label: {
    fontFamily: fonts.inter,
    fontSize: 11,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.accentRose,
    fontFamily: fonts.interMedium,
  },
});
