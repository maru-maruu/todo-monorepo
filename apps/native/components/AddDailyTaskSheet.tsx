import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  BookOpen,
  Coffee,
  Dumbbell,
  FileCode,
  Palmtree,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';

import { colors, dailyIconOptions, dayLabels, fonts, radius } from '@/constants/theme';
import type { DailyIconName } from '@/constants/theme';

const iconMap: Record<DailyIconName, LucideIcon> = {
  users: Users,
  palmtree: Palmtree,
  filecode: FileCode,
  coffee: Coffee,
  bookopen: BookOpen,
  dumbbell: Dumbbell,
};

interface AddDailyTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    icon: string;
    time: string;
    days: number[];
    enabled: boolean;
  }) => void;
  loading?: boolean;
}

export function AddDailyTaskSheet({
  visible,
  onClose,
  onSubmit,
  loading,
}: AddDailyTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(new Date());
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [icon, setIcon] = useState<DailyIconName>('users');
  const [showPicker, setShowPicker] = useState(false);

  const toggleDay = (day: number) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  const handleSubmit = () => {
    if (!title.trim() || days.length === 0) return;
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    onSubmit({
      title: title.trim(),
      icon,
      time: `${hours}:${minutes}`,
      days,
      enabled: true,
    });
    setTitle('');
    setTime(new Date());
    setDays([0, 1, 2, 3, 4]);
    setIcon('users');
  };

  const handleClose = () => {
    setTitle('');
    setTime(new Date());
    setDays([0, 1, 2, 3, 4]);
    setIcon('users');
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
            <Text style={styles.heading}>Add Daily Task</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Daily routine name"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />

            <Text style={styles.label}>Time</Text>
            <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
              <Text style={styles.dateText}>
                {time.toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </Pressable>
            {showPicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowPicker(Platform.OS === 'ios');
                  if (date) setTime(date);
                }}
              />
            )}

            <Text style={styles.label}>Days</Text>
            <View style={styles.dayRow}>
              {dayLabels.map((label, index) => {
                const isActive = days.includes(index);
                return (
                  <Pressable
                    key={index}
                    style={[styles.dayPill, isActive && styles.dayPillActive]}
                    onPress={() => toggleDay(index)}
                  >
                    <Text
                      style={[styles.dayText, isActive && styles.dayTextActive]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconRow}>
              {dailyIconOptions.map((name) => {
                const IconComponent = iconMap[name];
                const isSelected = icon === name;
                return (
                  <Pressable
                    key={name}
                    style={[styles.iconOption, isSelected && styles.iconSelected]}
                    onPress={() => setIcon(name)}
                  >
                    <IconComponent
                      size={22}
                      color={isSelected ? colors.accentRose : colors.text}
                      strokeWidth={1.8}
                    />
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[styles.submitButton, loading && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading || !title.trim() || days.length === 0}
            >
              <Text style={styles.submitText}>Add Daily Task</Text>
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
  dayRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.beigeLight,
  },
  dayPillActive: {
    backgroundColor: colors.accentRose,
  },
  dayText: {
    fontFamily: fonts.inter,
    fontSize: 12,
    color: colors.textMuted,
  },
  dayTextActive: {
    color: colors.card,
    fontFamily: fonts.interMedium,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.beigeLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconSelected: {
    borderColor: colors.accentRose,
    backgroundColor: colors.iconSquare,
  },
  submitButton: {
    backgroundColor: colors.fabDaily,
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
