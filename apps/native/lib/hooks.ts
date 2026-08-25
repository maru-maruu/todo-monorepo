import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { apiFetch } from './api';
import type {
  CreateDailyTaskInput,
  CreateTaskInput,
  DailyTask,
  ExportData,
  Task,
  UpdateDailyTaskInput,
  UpdateSettingsInput,
  UpdateTaskInput,
  UserSettings,
} from './types';
import { mapApiSettingsToDb, mapUserSettingsToApi } from './types';

export const queryKeys = {
  tasks: ['tasks'] as const,
  dailyTasks: ['daily-tasks'] as const,
  settings: ['settings'] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => apiFetch<Task[]>('/api/tasks'),
  });
}

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

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}

export function useDailyTasks() {
  return useQuery({
    queryKey: queryKeys.dailyTasks,
    queryFn: () => apiFetch<DailyTask[]>('/api/daily-tasks'),
  });
}

export function useCreateDailyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDailyTaskInput) =>
      apiFetch<DailyTask>('/api/daily-tasks', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyTasks }),
  });
}

export function useUpdateDailyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateDailyTaskInput & { id: string }) =>
      apiFetch<DailyTask>(`/api/daily-tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyTasks }),
  });
}

export function useDeleteDailyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/daily-tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyTasks }),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: async () => {
      const row = await apiFetch<UserSettings>('/api/settings');
      return mapUserSettingsToApi(row);
    },
  });
}

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

export function useClearCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<void>('/api/settings/clear-completed', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  });
}

export function useExportTasks() {
  return useMutation({
    mutationFn: () => apiFetch<ExportData>('/api/settings/export'),
  });
}
