import { useState, type ReactNode } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "../ui/Button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  tone = "danger",
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={() => !busy && onCancel()}>
      <article className={`confirm-dialog confirm-dialog--${tone}`} onClick={(event) => event.stopPropagation()}>
        <header>
          <AlertTriangle aria-hidden="true" />
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" onClick={onCancel} aria-label="Đóng" disabled={busy}>
            <X aria-hidden="true" />
          </button>
        </header>
        {children ? <div className="confirm-dialog__body">{children}</div> : null}
        <footer>
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            size="sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? <Loader2 className="spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </Button>
        </footer>
      </article>
    </div>
  );
}
