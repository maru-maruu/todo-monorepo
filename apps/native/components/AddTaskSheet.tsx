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
import { format, parseISO } from 'date-fns';
import {
  BookOpen,
  Coffee,
  Dumbbell,
  FileCode,
  Palmtree,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';

import { isTaskForToday } from '@todo/db/repeat';
import {
  colors,
  taskIconOptions,
  dayLabels,
  fonts,
  radius,
  taskAccentColors,
} from '@/constants/theme';
import type { TaskIconName } from '@/constants/theme';
import type { CreateTaskInput, RepeatType, TaskAccent } from '@/lib/types';
import { getTodayDateString } from '@/lib/task-filters';
import { useBottomSafeInset } from '@/lib/use-bottom-safe-inset';
import { formatTimestampDisplay } from '@/lib/utils';

const iconMap: Record<TaskIconName, LucideIcon> = {
  users: Users,
  palmtree: Palmtree,
  filecode: FileCode,
  coffee: Coffee,
  bookopen: BookOpen,
  dumbbell: Dumbbell,
};

const accentOptions: TaskAccent[] = ['pink', 'brown', 'green'];

const repeatOptions: { label: string; value: RepeatType | null }[] = [
  { label: 'Does not repeat', value: null },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export type TaskSheetInitialValue = CreateTaskInput & {
  id?: string;
  completedAt?: Date | null;
  lastModifiedAt?: Date | null;
};

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => void;
  loading?: boolean;
  initialValue?: TaskSheetInitialValue;
  heading: string;
  submitLabel: string;
}

type ActivePicker = 'start' | 'due' | 'time' | null;

function parseTimeToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function toTimeString(date: Date): string {
  return format(date, 'HH:mm');
}

function formatOptionalDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'None';
  return format(parseISO(dateStr), 'EEE, MMM d');
}

/** タスクの作成・編集フォームを表示する共有ボトムシート。 */
export function AddTaskSheet({
  visible,
  onClose,
  onSubmit,
  loading,
  initialValue,
  heading,
  submitLabel,
}: AddTaskSheetProps) {
  const bottomInset = useBottomSafeInset();
  const isEditing = Boolean(initialValue?.id);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [repeatType, setRepeatType] = useState<RepeatType | null>(null);
  const [repeatWeekdays, setRepeatWeekdays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [icon, setIcon] = useState('users');
  const [accent, setAccent] = useState<TaskAccent>('pink');
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    setName(initialValue?.name ?? '');
    setNotes(initialValue?.notes ?? '');
    setRepeatType(initialValue?.repeatType ?? null);
    setRepeatWeekdays(initialValue?.repeatWeekdays ?? []);
    setStartDate(initialValue?.startDate ?? null);
    setDueDate(initialValue?.dueDate ?? null);
    setDueTime(initialValue?.dueTime ?? null);
    setIcon(initialValue?.icon ?? 'users');
    setAccent(initialValue?.accent ?? 'pink');
    setActivePicker(null);
    setValidationError(null);
  }, [visible, initialValue]);

  const toggleWeekday = (day: number) => {
    setRepeatWeekdays((prev) =>
      prev.includes(day) ? prev.filter((value) => value !== day) : [...prev, day].sort(),
    );
  };

  const handleRepeatChange = (value: RepeatType | null) => {
    setRepeatType(value);
    if (value !== 'weekly') {
      setRepeatWeekdays([]);
    }
  };

  const openDatePicker = (target: 'start' | 'due') => {
    const currentValue = target === 'start' ? startDate : dueDate;
    const nextDate = currentValue ? parseISO(currentValue) : new Date();
    setPickerDate(nextDate);
    setActivePicker(target);
  };

  const openTimePicker = () => {
    const nextDate = dueTime ? parseTimeToDate(dueTime) : new Date();
    setPickerDate(nextDate);
    setActivePicker('time');
  };

  const handlePickerChange = (_: unknown, date?: Date) => {
    if (Platform.OS !== 'ios') {
      setActivePicker(null);
    }
    if (!date) return;

    setPickerDate(date);

    if (activePicker === 'start') {
      setStartDate(toDateString(date));
    }
    if (activePicker === 'due') {
      setDueDate(toDateString(date));
    }
    if (activePicker === 'time') {
      setDueTime(toTimeString(date));
    }
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    let effectiveRepeatType = repeatType;
    let effectiveRepeatWeekdays =
      repeatType === 'weekly' ? repeatWeekdays : null;

    if (repeatType === 'weekly' && repeatWeekdays.length === 0) {
      effectiveRepeatType = null;
      effectiveRepeatWeekdays = null;
    }

    const hasAnchor = Boolean(startDate || dueDate);
    if (effectiveRepeatType && !hasAnchor) {
      setValidationError('Recurring tasks need a Start Date or Due Date.');
      return;
    }

    setValidationError(null);
    onSubmit({
      name: trimmedName,
      notes: notes.trim() ? notes.trim() : null,
      startDate,
      dueDate,
      dueTime,
      repeatType: effectiveRepeatType,
      repeatWeekdays: effectiveRepeatWeekdays,
      icon,
      accent,
    });
  };

  const handleClose = () => {
    setActivePicker(null);
    setValidationError(null);
    onClose();
  };

  const isWeeklyWithoutDays = repeatType === 'weekly' && repeatWeekdays.length === 0;
  const showsRepeatHint = repeatType != null && !isWeeklyWithoutDays;

  let repeatHint: string | null = null;
  if (showsRepeatHint) {
    const todayStr = getTodayDateString();
    const showsOnToday = isTaskForToday(
      {
        startDate,
        dueDate,
        repeatType,
        completedAt: null,
      },
      todayStr,
    );
    repeatHint = showsOnToday
      ? 'Also shows under Recurring'
      : 'Moves to Recurring';
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable
            style={[styles.sheet, { paddingBottom: 40 + bottomInset }]}
            onPress={(event) => event.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.heading}>{heading}</Text>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.textMuted}
                autoFocus={!isEditing}
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional details"
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.label}>Repeat</Text>
              <View style={styles.repeatRow}>
                {repeatOptions.map((option) => {
                  const isSelected = repeatType === option.value;
                  return (
                    <Pressable
                      key={option.label}
                      style={[styles.repeatPill, isSelected && styles.repeatPillActive]}
                      onPress={() => handleRepeatChange(option.value)}
                    >
                      <Text
                        style={[styles.repeatText, isSelected && styles.repeatTextActive]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {repeatType === 'weekly' ? (
                <>
                  <View style={styles.shortcutRow}>
                    <Pressable
                      style={styles.shortcutButton}
                      onPress={() => setRepeatWeekdays([0, 1, 2, 3, 4])}
                    >
                      <Text style={styles.shortcutText}>Weekdays</Text>
                    </Pressable>
                    <Pressable
                      style={styles.shortcutButton}
                      onPress={() => setRepeatWeekdays([0, 1, 2, 3, 4, 5, 6])}
                    >
                      <Text style={styles.shortcutText}>Every day</Text>
                    </Pressable>
                    <Pressable
                      style={styles.shortcutButton}
                      onPress={() => setRepeatWeekdays([])}
                    >
                      <Text style={styles.shortcutText}>Clear</Text>
                    </Pressable>
                  </View>

                  <View style={styles.dayRow}>
                    {dayLabels.map((label, index) => {
                      const isActive = repeatWeekdays.includes(index);
                      return (
                        <Pressable
                          key={index}
                          style={[styles.dayPill, isActive && styles.dayPillActive]}
                          onPress={() => toggleWeekday(index)}
                        >
                          <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}

              {repeatHint ? (
                <Text style={styles.hintText}>{repeatHint}</Text>
              ) : null}

              <Text style={styles.label}>Start Date</Text>
              <View style={styles.dateRow}>
                <Pressable style={styles.dateButton} onPress={() => openDatePicker('start')}>
                  <Text style={styles.dateText}>{formatOptionalDate(startDate)}</Text>
                </Pressable>
                {startDate ? (
                  <Pressable style={styles.clearButton} onPress={() => setStartDate(null)}>
                    <Text style={styles.clearText}>Clear</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.label}>Due Date</Text>
              <View style={styles.dateRow}>
                <Pressable style={styles.dateButton} onPress={() => openDatePicker('due')}>
                  <Text style={styles.dateText}>{formatOptionalDate(dueDate)}</Text>
                </Pressable>
                {dueDate ? (
                  <Pressable style={styles.clearButton} onPress={() => setDueDate(null)}>
                    <Text style={styles.clearText}>Clear</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.label}>Due Time</Text>
              <View style={styles.dateRow}>
                <Pressable style={styles.dateButton} onPress={openTimePicker}>
                  <Text style={styles.dateText}>
                    {dueTime
                      ? format(parseTimeToDate(dueTime), 'h:mm a')
                      : 'None'}
                  </Text>
                </Pressable>
                {dueTime ? (
                  <Pressable style={styles.clearButton} onPress={() => setDueTime(null)}>
                    <Text style={styles.clearText}>Clear</Text>
                  </Pressable>
                ) : null}
              </View>

              {activePicker ? (
                <DateTimePicker
                  value={pickerDate}
                  mode={activePicker === 'time' ? 'time' : 'date'}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handlePickerChange}
                />
              ) : null}

              <Text style={styles.label}>Icon</Text>
              <View style={styles.iconRow}>
                {taskIconOptions.map((option) => {
                  const IconComponent = iconMap[option];
                  const isSelected = icon === option;
                  return (
                    <Pressable
                      key={option}
                      style={[styles.iconOption, isSelected && styles.iconSelected]}
                      onPress={() => setIcon(option)}
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

              <Text style={styles.label}>Accent</Text>
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

              {isEditing ? (
                <View style={styles.metaSection}>
                  <Text style={styles.metaLabel}>Last Modified</Text>
                  <Text style={styles.metaValue}>
                    {initialValue?.lastModifiedAt
                      ? formatTimestampDisplay(initialValue.lastModifiedAt)
                      : '—'}
                  </Text>
                </View>
              ) : null}

              {isEditing && initialValue?.completedAt ? (
                <View style={styles.metaSection}>
                  <Text style={styles.metaLabel}>Completed At</Text>
                  <Text style={styles.metaValue}>
                    {formatTimestampDisplay(initialValue.completedAt)}
                  </Text>
                </View>
              ) : null}

              {validationError ? (
                <Text style={styles.errorText}>{validationError}</Text>
              ) : null}

              <Pressable
                style={[styles.submitButton, loading && styles.disabled]}
                onPress={handleSubmit}
                disabled={loading || !name.trim()}
              >
                <Text style={styles.submitText}>{submitLabel}</Text>
              </Pressable>
            </ScrollView>
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
    maxHeight: '92%',
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
  notesInput: {
    minHeight: 88,
  },
  repeatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repeatPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.beigeLight,
  },
  repeatPillActive: {
    backgroundColor: colors.accentRose,
  },
  repeatText: {
    fontFamily: fonts.inter,
    fontSize: 13,
    color: colors.textMuted,
  },
  repeatTextActive: {
    color: colors.card,
    fontFamily: fonts.interMedium,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  shortcutButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.beigeLight,
  },
  shortcutText: {
    fontFamily: fonts.interMedium,
    fontSize: 12,
    color: colors.text,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
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
  hintText: {
    fontFamily: fonts.inter,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.beigeLight,
    borderRadius: radius.md,
    padding: 14,
  },
  dateText: {
    fontFamily: fonts.inter,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearText: {
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  metaSection: {
    marginTop: 12,
  },
  metaLabel: {
    fontFamily: fonts.interMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: fonts.inter,
    fontSize: 14,
    color: colors.text,
  },
  errorText: {
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: colors.danger,
    marginTop: 12,
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
