import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { GraduationCap, KeyRound, Loader2, Lock, LogOut, X } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { useSiteSettings } from "../../api/hooks";
import { formatHotline } from "./ExpertCallout";
import { useToast } from "./Toast";
import "../../styles/student-access.css";

/**
 * Mã học viên (Quản trị → Mã ebook, gói "Mã học viên", tiền tố HV): chỉ học viên được SGEN cấp mã mới xem chi tiết quẻ
 * Sim, Bát Cực Linh Số, gieo quẻ và các mục chọn ngày (khách yêu cầu 27/10/2026). Nhập mã một lần, phiên trình duyệt
 * nhớ; đường dẫn `?mahv=MÃ` tự nhập mã.
 */

export type StudentInfo = { display: string; expiresAt: string | null };

const STUDENT_QUERY_KEY = ["student-access"] as const;

export function useStudentAccess() {
  const query = useQuery({
    queryKey: STUDENT_QUERY_KEY,
    queryFn: () => api.get<{ student: StudentInfo | null }>("/api/hoc-vien/me"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const student = query.data?.student ?? null;
  return { student, unlocked: Boolean(student), checking: query.isLoading };
}

type StudentAccessContextValue = { requestUnlock: () => void };

const StudentAccessContext = createContext<StudentAccessContextValue>({ requestUnlock: () => undefined });

/** Hộp nhập mã dùng chung cho cả trang; mọi khung khoá gọi `requestUnlock` để mở. */
export function StudentAccessProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const requestUnlock = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const queryClient = useQueryClient();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const linkCode = params.get("mahv");
  // Effect có thể chạy hai lần cho cùng một đường dẫn (StrictMode): chỉ nhập mã một lần.
  const redeemedLink = useRef<string | null>(null);

  useEffect(() => {
    if (!linkCode || redeemedLink.current === linkCode) return;
    redeemedLink.current = linkCode;
    const next = new URLSearchParams(params);
    next.delete("mahv");
    setParams(next, { replace: true });
    api
      .post<{ student: StudentInfo }>("/api/hoc-vien/redeem", { code: linkCode })
      .then((result) => {
        queryClient.setQueryData(STUDENT_QUERY_KEY, result);
        toast.success("Đã mở khoá học viên", `Mã ${result.student.display} đang được dùng trên trình duyệt này.`);
      })
      .catch((error) => toast.error("Không mở khoá được", errorMessage(error)));
    // Chỉ chạy khi đường dẫn có mã (params/setParams đổi theo mỗi lần điều hướng nên không đưa vào danh sách phụ thuộc).
  }, [linkCode]);

  return (
    <StudentAccessContext.Provider value={{ requestUnlock }}>
      {children}
      {open ? <StudentCodeDialog onClose={close} /> : null}
    </StudentAccessContext.Provider>
  );
}

export function useStudentUnlock() {
  return useContext(StudentAccessContext).requestUnlock;
}

function StudentCodeDialog({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { settings } = useSiteSettings();
  const phones = [settings.contact.phone || settings.brand.hotline, settings.contact.phoneAlt].map((value) => value.trim()).filter(Boolean);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim()) {
      setError("Vui lòng nhập mã học viên.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await api.post<{ student: StudentInfo }>("/api/hoc-vien/redeem", { code: code.trim() });
      queryClient.setQueryData(STUDENT_QUERY_KEY, result);
      toast.success("Đã mở khoá học viên", `Mã ${result.student.display} đang được dùng trên trình duyệt này.`);
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="student-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="student-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onSubmit={submit} noValidate>
        <button type="button" className="student-dialog__close" onClick={onClose} aria-label="Đóng">
          <X aria-hidden="true" />
        </button>
        <span className="student-dialog__icon" aria-hidden="true">
          <GraduationCap />
        </span>
        <h2 id={titleId}>Nhập mã học viên</h2>
        <p>Chi tiết quẻ, Bát Cực Linh Số, Gieo quẻ và các mục chọn ngày dành cho học viên được SGEN cấp mã.</p>
        <label className="student-dialog__field">
          <span>Mã học viên</span>
          <input
            ref={inputRef}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              if (error) setError("");
            }}
            placeholder="Ví dụ: HV-7KQ2-M9XP"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={60}
            aria-invalid={Boolean(error)}
          />
        </label>
        {error ? (
          <p className="student-dialog__error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="student-dialog__submit" disabled={submitting}>
          {submitting ? <Loader2 className="spin" aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
          {submitting ? "Đang kiểm tra…" : "Mở khoá"}
        </button>
        {phones.length ? (
          <p className="student-dialog__contact">
            Chưa có mã? Liên hệ{" "}
            {phones.map((phone, index) => (
              <span key={phone}>
                {index ? " – " : ""}
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{formatHotline(phone)}</a>
              </span>
            ))}{" "}
            để được cấp mã học viên.
          </p>
        ) : null}
      </form>
    </div>,
    document.body,
  );
}

/** Khung thay cho nội dung khoá: lời nhắn + nút mở hộp nhập mã. `compact` cho ô nhỏ (Kiết tinh, Hung tinh…). */
export function StudentLock({
  title = "Dành cho học viên được cấp mã",
  children,
  compact = false,
  className = "",
}: {
  title?: string;
  children?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  const requestUnlock = useStudentUnlock();
  const { checking } = useStudentAccess();
  return (
    <div className={`student-lock ${compact ? "student-lock--compact" : ""} ${className}`.trim()} aria-busy={checking || undefined}>
      <span className="student-lock__icon" aria-hidden="true">
        <Lock />
      </span>
      <div className="student-lock__copy">
        <strong>{title}</strong>
        {children ? <p>{children}</p> : null}
      </div>
      <button type="button" className="student-lock__btn" onClick={requestUnlock} disabled={checking}>
        <KeyRound aria-hidden="true" />
        {checking ? "Đang kiểm tra…" : "Nhập mã học viên"}
      </button>
    </div>
  );
}

/** Hiện nội dung khi đã nhập mã học viên, chưa thì hiện khung khoá. */
export function StudentGate({ children, lock }: { children: ReactNode; lock: ReactNode }) {
  const { unlocked } = useStudentAccess();
  return <>{unlocked ? children : lock}</>;
}

/** Dải nhỏ cho biết đang dùng mã học viên nào, kèm nút thoát (máy dùng chung). */
export function StudentStatus({ className = "" }: { className?: string }) {
  const { student } = useStudentAccess();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [leaving, setLeaving] = useState(false);
  if (!student) return null;
  const logout = async () => {
    setLeaving(true);
    try {
      await api.post("/api/hoc-vien/logout", {});
      queryClient.setQueryData(STUDENT_QUERY_KEY, { student: null });
      toast.success("Đã thoát mã học viên");
    } catch (error) {
      toast.error("Không thoát được", errorMessage(error));
    } finally {
      setLeaving(false);
    }
  };
  return (
    <div className={`student-status ${className}`.trim()}>
      <GraduationCap aria-hidden="true" />
      <span>
        Học viên · <b>{student.display}</b>
      </span>
      <button type="button" onClick={() => void logout()} disabled={leaving}>
        <LogOut aria-hidden="true" /> Thoát
      </button>
    </div>
  );
}
