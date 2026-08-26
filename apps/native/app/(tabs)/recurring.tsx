import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddTaskSheet, type TaskSheetInitialValue } from '@/components/AddTaskSheet';
import { DeleteModal } from '@/components/DeleteModal';
import { ErrorState } from '@/components/ErrorState';
import { Greeting } from '@/components/Greeting';
import { PillButton } from '@/components/PillButton';
import { SwipeableDeleteRow } from '@/components/SwipeableDeleteRow';
import { TaskCard } from '@/components/TaskCard';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '@/lib/hooks';
import { filterTasksForRecurring, getTodayDateString } from '@/lib/task-filters';
import type { CreateTaskInput, Task } from '@/lib/types';
import { colors, fonts } from '@/constants/theme';

function taskToSheetValue(task: Task): TaskSheetInitialValue {
  return {
    id: task.id,
    name: task.name,
    notes: task.notes,
    startDate: task.startDate,
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    repeatType: task.repeatType,
    repeatWeekdays: task.repeatWeekdays,
    icon: task.icon,
    accent: task.accent,
    completedAt: task.completedAt,
    lastModifiedAt: task.lastModifiedAt,
  };
}

const recurringCreateDefaults: TaskSheetInitialValue = {
  name: '',
  repeatType: 'weekly',
  repeatWeekdays: [0, 1, 2, 3, 4],
  startDate: getTodayDateString(),
};

/** Recurring タブ。繰り返しタスクの一覧と追加・編集・完了・削除を扱う。 */
export default function RecurringScreen() {
  const { data: allTasks, isLoading, error, refetch } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [showSheet, setShowSheet] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const recurringTasks = useMemo(
    () => filterTasksForRecurring(allTasks ?? []),
    [allTasks],
  );

  const sheetInitialValue: TaskSheetInitialValue | undefined = editingTask
    ? taskToSheetValue(editingTask)
    : recurringCreateDefaults;

  const isEditing = editingTask != null;
  const sheetHeading = isEditing ? 'Edit Task' : 'Add Recurring Task';
  const sheetSubmitLabel = isEditing ? 'Save Changes' : 'Add Task';
  const sheetLoading = isEditing ? updateTask.isPending : createTask.isPending;

  const openCreateSheet = () => {
    setEditingTask(null);
    setShowSheet(true);
  };

  const openEditSheet = (task: Task) => {
    setEditingTask(task);
    setShowSheet(true);
  };

  const closeSheet = () => {
    setShowSheet(false);
    setEditingTask(null);
  };

  const handleToggleComplete = (task: Task) => {
    const isComplete = task.completedAt != null;
    updateTask.mutate({
      id: task.id,
      completedAt: isComplete ? null : new Date(),
    });
  };

  const handleSheetSubmit = (data: CreateTaskInput) => {
    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, ...data },
        { onSuccess: () => closeSheet() },
      );
      return;
    }

    createTask.mutate(data, { onSuccess: () => closeSheet() });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteTask.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Greeting />
          <Text style={styles.title}>Recurring</Text>

          {isLoading ? (
            <ActivityIndicator color={colors.accentRose} style={styles.loader} />
          ) : error ? (
            <ErrorState message="Couldn't load tasks" onRetry={() => refetch()} />
          ) : recurringTasks.length > 0 ? (
            <>
              {recurringTasks.map((task) => (
                <SwipeableDeleteRow
                  key={task.id}
                  onDelete={() => setDeleteTarget(task)}
                >
                  <TaskCard
                    task={task}
                    onPress={() => openEditSheet(task)}
                    onToggleComplete={() => handleToggleComplete(task)}
                  />
                </SwipeableDeleteRow>
              ))}
              <Text style={styles.hint}>← Swipe left to delete</Text>
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No recurring tasks yet</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.fabContainer}>
          <PillButton
            label="Add Recurring Task"
            onPress={openCreateSheet}
            variant="recurring"
            icon="plus-circle"
          />
        </View>
      </View>

      <AddTaskSheet
        visible={showSheet}
        onClose={closeSheet}
        loading={sheetLoading}
        initialValue={sheetInitialValue}
        heading={sheetHeading}
        submitLabel={sheetSubmitLabel}
        onSubmit={handleSheetSubmit}
      />

      <DeleteModal
        visible={deleteTarget !== null}
        title={deleteTarget?.name ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteTask.isPending}
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
  title: {
    fontFamily: fonts.lora,
    fontSize: 28,
    color: colors.text,
    marginBottom: 20,
  },
  loader: {
    marginTop: 40,
  },
  hint: {
    fontFamily: fonts.inter,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
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
