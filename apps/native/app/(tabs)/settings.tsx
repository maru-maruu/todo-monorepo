import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  ChevronRight,
  Clock,
  Download,
  Eye,
  PenTool,
  Trash2,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { IOSSwitch } from '@/components/IOSSwitch';
import { useSession } from '@/lib/auth';
import {
  useClearCompleted,
  useExportTasks,
  useSettings,
  useUpdateSettings,
} from '@/lib/hooks';
import type { TaskAccent } from '@/lib/types';
import { colors, fonts, radius, taskAccentColors } from '@/constants/theme';
import { formatTimeDisplay } from '@/lib/utils';

const accentOptions: TaskAccent[] = ['pink', 'brown', 'green'];

export default function SettingsScreen() {
  const { data: session } = useSession();
  const { data: settings, isLoading, error, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const clearCompleted = useClearCompleted();
  const exportTasks = useExportTasks();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const user = session?.user;
  const initials = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  const parseReminderTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const handleTimeChange = (_: unknown, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (date && settings) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      updateSettings.mutate({ reminderTime: `${hours}:${minutes}` });
    }
  };

  const handleClearCompleted = () => {
    Alert.alert(
      'Clear completed tasks?',
      'This will permanently remove all completed tasks.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearCompleted.mutate(),
        },
      ],
    );
  };

  const handleExport = () => {
    exportTasks.mutate(undefined, {
      onSuccess: (data) => {
        Alert.alert('Export ready', 'Your tasks have been exported.');
        console.log('Export data:', data);
      },
      onError: () => {
        Alert.alert('Export failed', 'Could not export tasks.');
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Settings</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.accentRose} style={styles.loader} />
        ) : error ? (
          <ErrorState message="Couldn't load settings" onRetry={() => refetch()} />
        ) : settings ? (
          <>
            <Pressable style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name ?? 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} strokeWidth={1.8} />
            </Pressable>

            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconSquare}>
                  <Bell size={20} color={colors.text} strokeWidth={1.8} />
                </View>
                <Text style={styles.rowLabel}>Notifications</Text>
                <IOSSwitch
                  value={settings.notifications}
                  onValueChange={(v) => updateSettings.mutate({ notifications: v })}
                />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconSquare}>
                  <Clock size={20} color={colors.text} strokeWidth={1.8} />
                </View>
                <Text style={styles.rowLabel}>Reminder Time</Text>
                <Pressable
                  style={styles.timePill}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.timeText}>
                    {formatTimeDisplay(settings.reminderTime)}
                  </Text>
                </Pressable>
              </View>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={parseReminderTime(settings.reminderTime)}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}

            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconSquare}>
                  <Eye size={20} color={colors.text} strokeWidth={1.8} />
                </View>
                <Text style={styles.rowLabel}>Theme</Text>
                <Text style={styles.roseValue}>Light Cream</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconSquare}>
                  <PenTool size={20} color={colors.text} strokeWidth={1.8} />
                </View>
                <Text style={styles.rowLabel}>Accent Color</Text>
                <View style={styles.swatchRow}>
                  {accentOptions.map((accent) => (
                    <Pressable
                      key={accent}
                      style={[
                        styles.swatch,
                        { backgroundColor: taskAccentColors[accent] },
                        settings.accentColor === accent && styles.swatchSelected,
                      ]}
                      onPress={() => updateSettings.mutate({ accentColor: accent })}
                    />
                  ))}
                </View>
              </View>
            </View>

            <Pressable style={styles.card} onPress={handleExport}>
              <View style={styles.row}>
                <View style={styles.iconSquare}>
                  <Download size={20} color={colors.text} strokeWidth={1.8} />
                </View>
                <Text style={styles.rowLabel}>Export Tasks</Text>
                <ChevronRight size={20} color={colors.textMuted} strokeWidth={1.8} />
              </View>
            </Pressable>

            <Pressable style={styles.card} onPress={handleClearCompleted}>
              <View style={styles.row}>
                <View style={styles.iconSquare}>
                  <Trash2 size={20} color={colors.accentRose} strokeWidth={1.8} />
                </View>
                <Text style={styles.dangerLabel}>Clear Completed</Text>
                <ChevronRight size={20} color={colors.textMuted} strokeWidth={1.8} />
              </View>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  pageTitle: {
    fontFamily: fonts.lora,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  loader: {
    marginTop: 40,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentRose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.lora,
    fontSize: 20,
    color: colors.card,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: fonts.interMedium,
    fontSize: 16,
    color: colors.text,
  },
  profileEmail: {
    fontFamily: fonts.inter,
    fontSize: 13,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.iconSquare,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.inter,
    fontSize: 15,
    color: colors.text,
  },
  dangerLabel: {
    flex: 1,
    fontFamily: fonts.inter,
    fontSize: 15,
    color: colors.accentRose,
  },
  timePill: {
    backgroundColor: colors.beige,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  timeText: {
    fontFamily: fonts.interMedium,
    fontSize: 13,
    color: colors.text,
  },
  roseValue: {
    fontFamily: fonts.interMedium,
    fontSize: 14,
    color: colors.accentRose,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.text,
  },
});
