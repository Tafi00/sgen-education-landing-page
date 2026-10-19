/**
 * Trang xuất ebook bằng mã (`/ebook`).
 *
 * Cộng tác viên / học viên nhập mã được cấp (hoặc mở đường dẫn dạng `/ebook?ma=MÃ` để tự đăng nhập),
 * nhập họ tên và ngày sinh rồi tải file PDF. Mỗi lần tải trừ 1 lượt của mã.
 */
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, CalendarDays, CheckCircle2, Download, KeyRound, Loader2, LogOut, ShieldCheck, Tag, UserRound } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { TextField } from "../../components/form/Field";
import { Button } from "../../components/ui/Button";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { useToast } from "../../components/ui/Toast";

const DARK_STYLE = { "--page-dark-bg": "url(/assets/backgrounds/cosmic-dark-clean.webp)" } as CSSProperties;

type CodeInfo = {
  display: string;
  planLabel: string;
  editionLabel: string;
  quota: number;
  used: number;
  remaining: number;
  state: "active" | "exhausted" | "expired" | "disabled";
  expiresAt?: string | null;
};

type MeResponse = { code: CodeInfo | null };

async function downloadEbook(body: { name: string; birthDate: string; commonName?: string }) {
  const response = await fetch("/api/ebook/export", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/pdf,application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const fieldMessage = Array.isArray(payload?.error?.fields) ? payload.error.fields[0]?.message : "";
    const message = fieldMessage || payload?.error?.message || `Không xuất được file (${response.status}).`;
    throw new Error(message);
  }
  const blob = await response.blob();
  const remaining = Number(response.headers.get("X-Ebook-Remaining"));
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const filename = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? "ebook-than-so-hoc.pdf";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return { remaining: Number.isFinite(remaining) ? remaining : null, filename };
}

export function EbookPage() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [codeInput, setCodeInput] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [codeError, setCodeError] = useState("");

  const [name, setName] = useState("");
  const [commonName, setCommonName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [lastFile, setLastFile] = useState("");

  const meQuery = useQuery({
    queryKey: ["ebook-me"],
    queryFn: () => api.get<MeResponse>("/api/ebook/me"),
    retry: 0,
    staleTime: 0,
  });
  const info = meQuery.data?.code ?? null;

  const redeem = async (raw: string) => {
    setRedeeming(true);
    setCodeError("");
    try {
      const result = await api.post<MeResponse>("/api/ebook/redeem", { code: raw });
      queryClient.setQueryData<MeResponse>(["ebook-me"], result);
      setCodeInput("");
    } catch (error) {
      setCodeError(errorMessage(error));
    } finally {
      setRedeeming(false);
    }
  };

  // Mở đường dẫn có mã (?ma=...) → tự đăng nhập, rồi bỏ mã khỏi thanh địa chỉ.
  const linkCode = params.get("ma");
  useEffect(() => {
    if (!linkCode) return;
    void redeem(linkCode).finally(() => {
      const next = new URLSearchParams(params);
      next.delete("ma");
      setParams(next, { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkCode]);

  const submitCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!codeInput.trim()) {
      setCodeError("Vui lòng nhập mã của bạn.");
      return;
    }
    void redeem(codeInput);
  };

  const submitExport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (exporting) return;
    if (name.trim().length < 2) return setExportError("Vui lòng nhập họ tên (ít nhất 2 ký tự).");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return setExportError("Vui lòng chọn ngày sinh dương lịch.");
    setExporting(true);
    setExportError("");
    try {
      const result = await downloadEbook({ name: name.trim(), birthDate, commonName: commonName.trim() || undefined });
      setLastFile(name.trim());
      toast.success("Đã xuất ebook", "File PDF đang được tải về máy của bạn.");
      queryClient.setQueryData<MeResponse>(["ebook-me"], (current) => {
        if (!current?.code) return current;
        const remaining = result.remaining ?? Math.max(0, current.code.remaining - 1);
        return { code: { ...current.code, remaining, used: current.code.quota - remaining, state: remaining <= 0 ? "exhausted" : current.code.state } };
      });
      setName("");
      setCommonName("");
      setBirthDate("");
    } catch (error) {
      setExportError(errorMessage(error));
      await queryClient.invalidateQueries({ queryKey: ["ebook-me"] });
    } finally {
      setExporting(false);
    }
  };

  const leave = async () => {
    try {
      await api.post("/api/ebook/logout");
    } finally {
      setLastFile("");
      setExportError("");
      queryClient.setQueryData<MeResponse>(["ebook-me"], { code: null });
    }
  };

  const loggedIn = Boolean(info);
  const usable = info?.state === "active" && info.remaining > 0;
  const percent = info ? Math.round((info.used / Math.max(1, info.quota)) * 100) : 0;

  return (
    <section className="login-stage ux-member" style={DARK_STYLE}>
      <div className="container login-grid">
        <div className="login-welcome">
          <Eyebrow variant="pill" icon={BookOpen}>Ebook Thần số học</Eyebrow>
          <h1>Xuất ebook bằng mã</h1>
          <p>
            Nhập mã SGEN cấp cho bạn, điền họ tên và ngày sinh để nhận file ebook Thần số học dạng PDF. Mỗi lần tải file sẽ trừ một lượt của mã.
          </p>
          <div>
            <span>
              <KeyRound aria-hidden="true" /> Nhập mã một lần, trình duyệt tự nhớ cho lần sau
            </span>
            <span>
              <Download aria-hidden="true" /> Tải file PDF ngay, không cần tạo tài khoản
            </span>
            <span>
              <ShieldCheck aria-hidden="true" /> Hết lượt hoặc cần thêm lượt: liên hệ SGEN để được cấp mã mới
            </span>
          </div>
        </div>

        {meQuery.isLoading || redeeming ? (
          <div className="login-card" aria-busy="true">
            <header>
              <small>Mã ebook</small>
              <h2>{redeeming ? "Đang kiểm tra mã…" : "Đang tải…"}</h2>
            </header>
            <p className="muted">
              <Loader2 className="spin" aria-hidden="true" /> Vui lòng chờ trong giây lát.
            </p>
          </div>
        ) : !loggedIn ? (
          <form className="login-card" onSubmit={submitCode} noValidate>
            <header>
              <small>Mã ebook</small>
              <h2>Nhập mã của bạn</h2>
              <p>Mã gồm chữ và số, ví dụ DEMO-7KQ2-M9XP. Không phân biệt chữ hoa, chữ thường.</p>
            </header>
            <div className="form-stack">
              <div className="form-grid">
                <TextField
                  label="Mã ebook"
                  required
                  wide
                  value={codeInput}
                  error={codeError || undefined}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="off"
                  icon={<KeyRound aria-hidden="true" />}
                  onChange={(event) => {
                    setCodeInput(event.target.value);
                    if (codeError) setCodeError("");
                  }}
                  placeholder="DEMO-XXXX-XXXX"
                />
              </div>
              <Button variant="primary" type="submit" disabled={redeeming}>
                <KeyRound aria-hidden="true" /> Xác nhận mã
              </Button>
            </div>
          </form>
        ) : (
          <form className="login-card" onSubmit={submitExport} noValidate>
            <header>
              <small>{info?.editionLabel}</small>
              <h2>{info?.planLabel}</h2>
              <p>
                Mã <strong>{info?.display}</strong> · còn <strong>{info?.remaining}</strong>/{info?.quota} lượt
              </p>
            </header>

            <div className="ebook-meter" role="img" aria-label={`Đã dùng ${info?.used} trên ${info?.quota} lượt`}>
              <span style={{ width: `${percent}%` }} />
            </div>

            {usable ? (
              <div className="form-stack">
                <div className="form-grid">
                  <TextField
                    label="Họ tên khai sinh"
                    required
                    wide
                    value={name}
                    autoComplete="off"
                    icon={<UserRound aria-hidden="true" />}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (exportError) setExportError("");
                    }}
                    placeholder="Ví dụ: NGUYỄN VĂN A"
                  />
                  <TextField
                    label="Tên thường dùng (nếu có)"
                    wide
                    value={commonName}
                    autoComplete="off"
                    icon={<Tag aria-hidden="true" />}
                    onChange={(event) => setCommonName(event.target.value)}
                    placeholder="Ví dụ: Minh Anh"
                  />
                  <TextField
                    label="Ngày sinh dương lịch"
                    type="date"
                    required
                    wide
                    value={birthDate}
                    icon={<CalendarDays aria-hidden="true" />}
                    onChange={(event) => {
                      setBirthDate(event.target.value);
                      if (exportError) setExportError("");
                    }}
                  />
                </div>

                {exportError ? (
                  <p className="form-error">
                    <AlertTriangle aria-hidden="true" /> {exportError}
                  </p>
                ) : null}

                <Button variant="primary" type="submit" disabled={exporting}>
                  {exporting ? <Loader2 className="spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
                  {exporting ? "Đang tạo file…" : "Xuất ebook PDF"}
                </Button>
                {lastFile ? (
                  <p className="muted">
                    <CheckCircle2 aria-hidden="true" /> Đã xuất file cho {lastFile}. Bạn có thể nhập người tiếp theo.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="form-error" role="alert">
                <AlertTriangle aria-hidden="true" />{" "}
                {info?.state === "expired"
                  ? "Mã đã hết hạn. Vui lòng liên hệ SGEN để được cấp mã mới."
                  : info?.state === "disabled"
                    ? "Mã đã bị khoá. Vui lòng liên hệ SGEN để được hỗ trợ."
                    : "Mã đã dùng hết lượt. Vui lòng liên hệ SGEN để được cấp mã mới."}
              </p>
            )}

            <footer>
              <button type="button" className="ebook-leave" onClick={() => void leave()}>
                <LogOut aria-hidden="true" /> Dùng mã khác
              </button>
            </footer>
          </form>
        )}
      </div>
    </section>
  );
}
