import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";

type ToastItem = { id: number; tone: ToastTone; title: string; description?: string };

type ToastContextValue = {
  push: (toast: { tone?: ToastTone; title: string; description?: string }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback<ToastContextValue["push"]>(
    ({ tone = "info", title, description }) => {
      toastId += 1;
      const id = toastId;
      setItems((current) => [...current, { id, tone, title, description }]);
      window.setTimeout(() => remove(id), tone === "error" ? 7000 : 4200);
    },
    [remove],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, description) => push({ tone: "success", title, description }),
      error: (title, description) => push({ tone: "error", title, description }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {items.map((item) => (
          <article className={`toast toast--${item.tone}`} key={item.id}>
            {item.tone === "success" ? <CheckCircle2 aria-hidden="true" /> : item.tone === "error" ? <AlertTriangle aria-hidden="true" /> : <Info aria-hidden="true" />}
            <div>
              <strong>{item.title}</strong>
              {item.description ? <p>{item.description}</p> : null}
            </div>
            <button type="button" onClick={() => remove(item.id)} aria-label="Đóng thông báo">
              <X aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast cần được dùng bên trong ToastProvider.");
  return context;
}
