import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore } from "@/shared/hooks/useToast";
import { cn } from "@/shared/lib/utils";

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  const getToastIcon = (variant: "default" | "success" | "error") => {
    if (variant === "success") {
      return CheckCircle2;
    }

    if (variant === "error") {
      return AlertTriangle;
    }

    return Info;
  };

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = getToastIcon(toast.variant);

        return (
          <div
            className={cn(
              "pointer-events-auto overflow-hidden rounded-[1.5rem] border p-4 shadow-panel backdrop-blur",
              toast.variant === "error"
                ? "border-rose-200 bg-rose-50/98"
                : toast.variant === "success"
                  ? "border-emerald-200 bg-emerald-50/98"
                  : "border-slate-200 bg-white/98",
            )}
            key={toast.id}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
                  toast.variant === "error"
                    ? "bg-rose-100 text-rose-700"
                    : toast.variant === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-sky-100 text-sky-700",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">
                    {toast.title}
                  </p>
                  <button
                    className="rounded-full p-1 text-slate-500 transition hover:bg-black/5 hover:text-slate-900"
                    onClick={() => dismiss(toast.id)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {toast.description ? (
                  <p className="text-sm leading-5 text-slate-600">
                    {toast.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
