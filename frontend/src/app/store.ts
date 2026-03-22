// src/app/store.ts
import { create } from "zustand";

interface UIState {
  // Task modal
  isCreateTaskOpen: boolean;
  isEditTaskOpen: boolean;
  selectedTaskId: number | null;
  // Workspace modal
  isCreateWorkspaceOpen: boolean;
  // Project modal
  isCreateProjectOpen: boolean;

  // Actions
  openCreateTask: () => void;
  openEditTask: (id: number) => void;
  closeTaskModals: () => void;
  openCreateWorkspace: () => void;
  closeCreateWorkspace: () => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateTaskOpen: false,
  isEditTaskOpen: false,
  selectedTaskId: null,
  isCreateWorkspaceOpen: false,
  isCreateProjectOpen: false,

  openCreateTask: () => set({ isCreateTaskOpen: true }),
  openEditTask: (id) => set({ isEditTaskOpen: true, selectedTaskId: id }),
  closeTaskModals: () =>
    set({
      isCreateTaskOpen: false,
      isEditTaskOpen: false,
      selectedTaskId: null,
    }),
  openCreateWorkspace: () => set({ isCreateWorkspaceOpen: true }),
  closeCreateWorkspace: () => set({ isCreateWorkspaceOpen: false }),
  openCreateProject: () => set({ isCreateProjectOpen: true }),
  closeCreateProject: () => set({ isCreateProjectOpen: false }),
}));
