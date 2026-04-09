import { create } from 'zustand';
import type { ModalType } from '@/features/board/types';

interface DeleteConfirmData {
  type: 'task' | 'board' | 'column';
  id: string;
  title: string;
}

interface UIStore {
  // State
  sidebarOpen: boolean;
  activeModal: ModalType | null;
  activeTaskId: string | null;
  editingBoardId: string | null;
  deleteConfirmData: DeleteConfirmData | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modal: ModalType, taskId?: string) => void;
  closeModal: () => void;
  setEditingBoard: (boardId: string | null) => void;
  openDeleteConfirm: (type: DeleteConfirmData['type'], id: string, title: string) => void;
  closeDeleteConfirm: () => void;

  // Getters
  isModalOpen: (modal: ModalType) => boolean;
  hasActiveModal: () => boolean;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  sidebarOpen: true,
  activeModal: null,
  activeTaskId: null,
  editingBoardId: null,
  deleteConfirmData: null,

  // Toggle sidebar open/closed
  toggleSidebar: (): void => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  // Set sidebar state explicitly
  setSidebarOpen: (open: boolean): void => {
    set({ sidebarOpen: open });
  },

  // Open a modal, optionally with a task context
  openModal: (modal: ModalType, taskId?: string): void => {
    set({ activeModal: modal, activeTaskId: taskId ?? null });
  },

  // Close the active modal and clear related state
  closeModal: (): void => {
    set({ activeModal: null, activeTaskId: null });
  },

  // Set the board currently being edited
  setEditingBoard: (boardId: string | null): void => {
    set({ editingBoardId: boardId });
  },

  // Open delete confirmation dialog
  openDeleteConfirm: (type: DeleteConfirmData['type'], id: string, title: string): void => {
    set({
      activeModal: 'delete-confirm',
      deleteConfirmData: { type, id, title },
    });
  },

  // Close delete confirmation and clear data
  closeDeleteConfirm: (): void => {
    set({ activeModal: null, deleteConfirmData: null });
  },

  // Check if a specific modal is currently open
  isModalOpen: (modal: ModalType): boolean => {
    return get().activeModal === modal;
  },

  // Check if any modal is currently open
  hasActiveModal: (): boolean => {
    return get().activeModal !== null;
  },
}));
