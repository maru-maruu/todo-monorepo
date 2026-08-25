import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'lucide-react-native';

import { AddDailyTaskSheet } from '@/components/AddDailyTaskSheet';
import { DailyTaskCard } from '@/components/DailyTaskCard';
import { ErrorState } from '@/components/ErrorState';
import { Greeting } from '@/components/Greeting';
import { PillButton } from '@/components/PillButton';
import {
  useCreateDailyTask,
  useDailyTasks,
  useUpdateDailyTask,
} from '@/lib/hooks';
import type { DailyTask } from '@/lib/types';
import { colors, fonts } from '@/constants/theme';

export default function DailyScreen() {
  const { data: dailyTasks, isLoading, error, refetch } = useDailyTasks();
  const createDailyTask = useCreateDailyTask();
  const updateDailyTask = useUpdateDailyTask();
  const [showAddSheet, setShowAddSheet] = useState(false);

  const handleToggleEnabled = (task: DailyTask, enabled: boolean) => {
    updateDailyTask.mutate({ id: task.id, enabled });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Greeting />
              <Text style={styles.title}>Daily Tasks</Text>
            </View>
            <Pressable style={styles.calendarButton}>
              <Calendar size={22} color={colors.text} strokeWidth={1.8} />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.accentRose} style={styles.loader} />
          ) : error ? (
            <ErrorState message="Couldn't load daily tasks" onRetry={() => refetch()} />
          ) : dailyTasks && dailyTasks.length > 0 ? (
            dailyTasks.map((task) => (
              <DailyTaskCard
                key={task.id}
                title={task.title}
                icon={task.icon}
                time={task.time}
                days={task.days}
                enabled={task.enabled}
                onToggleEnabled={(enabled) => handleToggleEnabled(task, enabled)}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No daily routines yet. Add one below!
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.fabContainer}>
          <PillButton
            label="Add Daily Task"
            onPress={() => setShowAddSheet(true)}
            variant="daily"
            icon="plus-circle"
          />
        </View>
      </View>

      <AddDailyTaskSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        loading={createDailyTask.isPending}
        onSubmit={(data) => {
          createDailyTask.mutate(data, {
            onSuccess: () => setShowAddSheet(false),
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: 28,
    color: colors.text,
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.iconSquare,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.inter,
    fontSize: 14,
    color: colors.textMuted,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
