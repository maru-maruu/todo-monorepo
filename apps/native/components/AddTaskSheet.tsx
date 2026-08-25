import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';

import { colors, fonts, radius, taskAccentColors } from '@/constants/theme';
import type { TaskAccent } from '@/lib/types';

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; dueDate: string; accent: TaskAccent }) => void;
  loading?: boolean;
}

const accentOptions: TaskAccent[] = ['pink', 'brown', 'green'];

export function AddTaskSheet({
  visible,
  onClose,
  onSubmit,
  loading,
}: AddTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [accent, setAccent] = useState<TaskAccent>('pink');
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      dueDate: dueDate.toISOString().split('T')[0],
      accent,
    });
    setTitle('');
    setDueDate(new Date());
    setAccent('pink');
  };

  const handleClose = () => {
    setTitle('');
    setDueDate(new Date());
    setAccent('pink');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.heading}>Add New Task</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />

            <Text style={styles.label}>Due Date</Text>
            <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
              <Text style={styles.dateText}>
                {dueDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </Pressable>
            {showPicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowPicker(Platform.OS === 'ios');
                  if (date) setDueDate(date);
                }}
              />
            )}

            <Text style={styles.label}>Accent Color</Text>
            <View style={styles.accentRow}>
              {accentOptions.map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.accentSwatch,
                    { backgroundColor: taskAccentColors[option] },
                    accent === option && styles.accentSelected,
                  ]}
                  onPress={() => setAccent(option)}
                />
              ))}
            </View>

            <Pressable
              style={[styles.submitButton, loading && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading || !title.trim()}
            >
              <Text style={styles.submitText}>Add Task</Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 24,
    paddingBottom: 40,
  },
  heading: {
    fontFamily: fonts.lora,
    fontSize: 22,
    color: colors.text,
    marginBottom: 20,
  },
  label: {
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    fontFamily: fonts.inter,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.beigeLight,
    borderRadius: radius.md,
    padding: 14,
  },
  dateButton: {
    backgroundColor: colors.beigeLight,
    borderRadius: radius.md,
    padding: 14,
  },
  dateText: {
    fontFamily: fonts.inter,
    fontSize: 16,
    color: colors.text,
  },
  accentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  accentSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  accentSelected: {
    borderColor: colors.text,
  },
  submitButton: {
    backgroundColor: colors.fabTasks,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.card,
  },
  disabled: {
    opacity: 0.6,
  },
});
