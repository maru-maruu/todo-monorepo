import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { apiFetch } from './api';
import type {
  CreateTaskInput,
  ExportData,
  Task,
  UpdateSettingsInput,
  UpdateTaskInput,
  UserSettings,
} from './types';
import { mapApiSettingsToDb, mapUserSettingsToApi } from './types';

/** React Query のクエリキー定義。 */
export const queryKeys = {
  tasks: ['tasks'] as const,
  settings: ['settings'] as const,
};

/** ログインユーザーの全タスクを取得する。 */
export function useTasks() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => apiFetch<Task[]>('/api/tasks'),
  });
}

/** 新しいタスクを作成する。 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      apiFetch<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}

/** 既存タスクを部分更新する。完了トグルは completedAt を送る。 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTaskInput & { id: string }) =>
      apiFetch<Task>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}

/** タスクを削除する。 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}

/** ユーザー設定を取得する。 */
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: async () => {
      const row = await apiFetch<UserSettings>('/api/settings');
      return mapUserSettingsToApi(row);
    },
  });
}

/** ユーザー設定を更新する。 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateSettingsInput) => {
      const row = await apiFetch<UserSettings>('/api/settings', {
        method: 'PATCH',
        body: JSON.stringify(mapApiSettingsToDb(input)),
      });
      return mapUserSettingsToApi(row);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.settings }),
  });
}

/** 完了済みタスクを一括削除する。 */
export function useClearCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<void>('/api/settings/clear-completed', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}

/** タスクと設定をエクスポートする。 */
export function useExportTasks() {
  return useMutation({
    mutationFn: () => apiFetch<ExportData>('/api/settings/export'),
  });
}
