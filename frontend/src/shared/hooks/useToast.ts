import { create } from "zustand";

export type ToastVariant = "default" | "success" | "error";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastState {
  toasts: ToastItem[];
  toast: (input: ToastInput) => void;
  dismiss: (id: number) => void;
}

let nextToastId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  toast: ({ durationMs = 4000, variant = "default", ...input }) => {
    const id = nextToastId++;

    set((state) => ({
      toasts: [...state.toasts, { id, variant, ...input }],
    }));

    window.setTimeout(() => {
      get().dismiss(id);
    }, durationMs);
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export const useToast = () => {
  const toast = useToastStore((state) => state.toast);
  return { toast };
};
