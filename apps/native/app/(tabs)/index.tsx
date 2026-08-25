import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddTaskSheet } from '@/components/AddTaskSheet';
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
import type { Task } from '@/lib/types';
import { colors, fonts } from '@/constants/theme';

export default function TasksScreen() {
  const { data: tasks, isLoading, error, refetch } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const handleToggleComplete = (task: Task) => {
    updateTask.mutate({ id: task.id, completed: !task.completed });
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
          <Text style={styles.title}>Today's Tasks</Text>

          {isLoading ? (
            <ActivityIndicator color={colors.accentRose} style={styles.loader} />
          ) : error ? (
            <ErrorState message="Couldn't load tasks" onRetry={() => refetch()} />
          ) : tasks && tasks.length > 0 ? (
            <>
              {tasks.map((task) => (
                <SwipeableDeleteRow
                  key={task.id}
                  onDelete={() => setDeleteTarget(task)}
                >
                  <TaskCard
                    title={task.title}
                    dueDate={task.dueDate ?? new Date().toISOString().split('T')[0]}
                    accent={task.accent}
                    completed={task.completed}
                    onToggleComplete={() => handleToggleComplete(task)}
                  />
                </SwipeableDeleteRow>
              ))}
              <Text style={styles.hint}>← Swipe left to delete</Text>
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No tasks yet. Add one below!</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.fabContainer}>
          <PillButton
            label="Add New Task"
            onPress={() => setShowAddSheet(true)}
            variant="tasks"
          />
        </View>
      </View>

      <AddTaskSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        loading={createTask.isPending}
        onSubmit={(data) => {
          createTask.mutate(data, {
            onSuccess: () => setShowAddSheet(false),
          });
        }}
      />

      <DeleteModal
        visible={deleteTarget !== null}
        title={deleteTarget?.title ?? ''}
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
