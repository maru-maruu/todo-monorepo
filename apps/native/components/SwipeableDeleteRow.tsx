import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { type ReactNode } from 'react';

import { colors, fonts } from '@/constants/theme';

interface SwipeableDeleteRowProps {
  children: ReactNode;
  onDelete: () => void;
}

export function SwipeableDeleteRow({ children, onDelete }: SwipeableDeleteRowProps) {
  const renderRightActions = () => (
    <Pressable style={styles.deleteAction} onPress={onDelete}>
      <Trash2 size={20} color={colors.card} strokeWidth={1.8} />
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    backgroundColor: colors.accentRose,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 20,
    marginBottom: 12,
    gap: 4,
  },
  deleteText: {
    fontFamily: fonts.inter,
    fontSize: 11,
    color: colors.card,
  },
});
