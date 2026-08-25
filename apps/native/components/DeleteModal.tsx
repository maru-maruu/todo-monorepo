import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

import { colors, fonts, radius } from '@/constants/theme';

interface DeleteModalProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteModal({
  visible,
  title,
  onCancel,
  onConfirm,
  loading,
}: DeleteModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <AlertTriangle size={28} color={colors.accentPink} strokeWidth={1.8} />
          </View>
          <Text style={styles.heading}>Delete task?</Text>
          <Text style={styles.quotedTitle}>"{title}"</Text>
          <Text style={styles.subtext}>This action cannot be undone.</Text>
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.deleteButton, loading && styles.disabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FCE8E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    fontFamily: fonts.lora,
    fontSize: 22,
    color: colors.text,
    marginBottom: 8,
  },
  quotedTitle: {
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
  subtext: {
    fontFamily: fonts.inter,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.beige,
    paddingVertical: 14,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.text,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.accentRose,
    paddingVertical: 14,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  deleteText: {
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.card,
  },
  disabled: {
    opacity: 0.6,
  },
});
