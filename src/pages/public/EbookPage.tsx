/**
 * Trang xuất ebook (`/ebook`) — đích của nút "TẢI PDF" ở trang kết quả tra cứu.
 *
 * Luồng: người dùng nhập mã SGEN cấp (hoặc mở đường dẫn `/ebook?ma=MÃ` để tự đăng nhập), chọn loại ebook
 * ("Demo 3 chỉ số" hoặc "đầy đủ"), kiểm tra hồ sơ khách hàng (họ tên, ngày sinh, số điện thoại — bắt buộc) rồi tải PDF.
 * Hồ sơ vừa tra cứu được giữ lại qua bước chuyển trang và đăng nhập (xem `app/ebookDraft.ts`).
 * Mỗi lần tải file trừ một lượt của mã.
 */
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, CalendarDays, CheckCircle2, Download, KeyRound, Loader2, LogOut, Phone, ShieldCheck, UserRound } from "lucide-react";
import { api, ApiError, errorMessage } from "../../api/client";
import { clearEbookDraft, loadEbookDraft } from "../../app/ebookDraft";
import { TextField } from "../../components/form/Field";
import { Button } from "../../components/ui/Button";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { useToast } from "../../components/ui/Toast";
import { EBOOK_EDITION_CHOICES, ebookAllowsEdition, type EbookEdition } from "../../../shared/ebook";
import { normalizePhone } from "../../../shared/phone";

const DARK_STYLE = { "--page-dark-bg": "url(/assets/backgrounds/cosmic-dark-clean.webp)" } as CSSProperties;

type CodeInfo = {
  display: string;
  planLabel: string;
  edition: EbookEdition;
  editionLabel: string;
  quota: number;
  used: number;
  remaining: number;
  state: "active" | "exhausted" | "expired" | "disabled";
  expiresAt?: string | null;
};

type MeResponse = { code: CodeInfo | null };

type ExportBody = { name: string; birthDate: string; phone: string; edition: EbookEdition; reportId?: string };
type FieldKey = "name" | "birthDate" | "phone" | "edition";
type FieldErrors = Partial<Record<FieldKey, string>>;

async function downloadEbook(body: ExportBody) {
  const response = await fetch("/api/ebook/export", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/pdf,application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const error = payload?.error;
    const fields = Array.isArray(error?.fields) ? error.fields : [];
    throw new ApiError(response.status, String(error?.code ?? "request_failed"), error?.message || `Không xuất được file (${response.status}).`, fields);
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

/** Lỗi theo trường từ máy chủ (zod): `phone`, `name`, `birthDate`, `edition`. */
function fieldErrorsFrom(error: unknown): FieldErrors {
  const result: FieldErrors = {};
  if (!(error instanceof ApiError)) return result;
  for (const field of error.fields) {
    const key = field.path.split(".").pop() as FieldKey;
    if ((key === "name" || key === "birthDate" || key === "phone" || key === "edition") && !result[key]) result[key] = field.message;
  }
  return result;
}

export function EbookPage() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [codeInput, setCodeInput] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [codeError, setCodeError] = useState("");

  // Hồ sơ vừa tra cứu (nếu có) được điền sẵn để khách kiểm tra lại, kể cả sau khi đăng nhập bằng mã.
  const [draft] = useState(loadEbookDraft);
  const [name, setName] = useState(draft?.name ?? "");
  const [birthDate, setBirthDate] = useState(draft?.birthDate ?? "");
  const [phone, setPhone] = useState(draft?.phone ?? "");
  const [edition, setEdition] = useState<EbookEdition | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [lastFile, setLastFile] = useState("");
  const [usedDraft, setUsedDraft] = useState(Boolean(draft));

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

  /** Loại ebook đang chọn: mặc định bản đầy đủ nếu mã cho phép, mã demo chỉ có bản Demo. */
  const allowed = (value: EbookEdition) => (info ? ebookAllowsEdition(info.edition, value) : false);
  const chosen: EbookEdition = edition && allowed(edition) ? edition : info && allowed("full") ? "full" : "demo";

  const clearFieldError = (key: FieldKey) => {
    if (fieldErrors[key]) setFieldErrors((current) => ({ ...current, [key]: undefined }));
    if (exportError) setExportError("");
  };

  const submitExport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (exporting) return;

    // Kiểm tra ngay tại từng ô; máy chủ kiểm tra lại độc lập trước khi tạo file.
    const errors: FieldErrors = {};
    if (name.trim().length < 2) errors.name = "Vui lòng nhập họ tên (ít nhất 2 ký tự).";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) errors.birthDate = "Vui lòng chọn ngày sinh dương lịch.";
    const phoneResult = normalizePhone(phone);
    if (!phoneResult.ok) errors.phone = phoneResult.message;
    setFieldErrors(errors);
    if (Object.keys(errors).length || !phoneResult.ok) {
      setExportError("");
      return;
    }

    setExporting(true);
    setExportError("");
    try {
      const sameProfile = draft?.reportId && draft.name === name.trim() && draft.birthDate === birthDate;
      const result = await downloadEbook({
        name: name.trim(),
        birthDate,
        phone: phoneResult.value,
        edition: chosen,
        reportId: sameProfile ? draft?.reportId : undefined,
      });
      setLastFile(name.trim());
      toast.success("Đã xuất ebook", "File PDF đang được tải về máy của bạn.");
      queryClient.setQueryData<MeResponse>(["ebook-me"], (current) => {
        if (!current?.code) return current;
        const remaining = result.remaining ?? Math.max(0, current.code.remaining - 1);
        return { code: { ...current.code, remaining, used: current.code.quota - remaining, state: remaining <= 0 ? "exhausted" : current.code.state } };
      });
      clearEbookDraft();
      setUsedDraft(false);
      setName("");
      setBirthDate("");
      setPhone("");
      setFieldErrors({});
    } catch (error) {
      const serverFields = fieldErrorsFrom(error);
      if (Object.keys(serverFields).length) setFieldErrors(serverFields);
      else setExportError(errorMessage(error));
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
  const pendingProfile = name.trim() && birthDate ? `${name.trim()} · ${birthDate.split("-").reverse().join("/")}` : "";

  return (
    <section className="login-stage ux-member" style={DARK_STYLE}>
      <div className="container login-grid">
        <div className="login-welcome">
          <Eyebrow variant="pill" icon={BookOpen}>Ebook Thần số học</Eyebrow>
          <h1>Xuất ebook bằng mã</h1>
          <p>
            Nhập mã SGEN cấp cho bạn, chọn bản ebook, kiểm tra thông tin khách hàng (bắt buộc có số điện thoại) để nhận file PDF Thần số học. Mỗi lần tải file sẽ trừ một lượt của mã.
          </p>
          <div>
            <span>
              <KeyRound aria-hidden="true" /> Nhập mã một lần, trình duyệt tự nhớ cho lần sau
            </span>
            <span>
              <Download aria-hidden="true" /> Hồ sơ vừa tra cứu được giữ lại, không phải nhập lại
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
              <small>Đăng nhập bằng mã ebook</small>
              <h2>Nhập mã của bạn</h2>
              <p>Mã gồm chữ và số, ví dụ DEMO-7KQ2-M9XP hoặc FULL03-7KQ2-M9XP. Không phân biệt chữ hoa, chữ thường.</p>
            </header>
            {usedDraft && pendingProfile ? (
              <p className="ebook-profile-note">
                <CheckCircle2 aria-hidden="true" />
                <span>
                  Hồ sơ đang tra cứu: <strong>{pendingProfile}</strong>. Hồ sơ được giữ lại sau khi bạn nhập mã.
                </span>
              </p>
            ) : null}
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
              <ul className="ebook-code-guide" aria-label="Loại ebook theo mã">
                <li>
                  <strong>DEMO…</strong> — {EBOOK_EDITION_CHOICES.demo.title}
                </li>
                <li>
                  <strong>FULL…</strong> — {EBOOK_EDITION_CHOICES.full.title} (dùng được cả bản Demo)
                </li>
              </ul>
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
                <fieldset className="ebook-edition" aria-describedby={fieldErrors.edition ? "ebook-edition-error" : undefined}>
                  <legend>Loại ebook</legend>
                  <div className="ebook-edition__options">
                    {(["demo", "full"] as const).map((value) => {
                      const disabled = !allowed(value);
                      return (
                        <label key={value} className={`ebook-edition__option ${chosen === value ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`}>
                          <input
                            type="radio"
                            name="edition"
                            value={value}
                            checked={chosen === value}
                            disabled={disabled}
                            onChange={() => {
                              setEdition(value);
                              clearFieldError("edition");
                            }}
                          />
                          <span>
                            <strong>{EBOOK_EDITION_CHOICES[value].title}</strong>
                            <small>{disabled ? "Cần mã ebook đầy đủ để xuất bản này." : EBOOK_EDITION_CHOICES[value].description}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {fieldErrors.edition ? (
                    <p className="field__error" id="ebook-edition-error">
                      {fieldErrors.edition}
                    </p>
                  ) : null}
                </fieldset>

                <div className="form-grid">
                  <TextField
                    label="Họ tên khai sinh"
                    required
                    wide
                    value={name}
                    error={fieldErrors.name}
                    autoComplete="off"
                    icon={<UserRound aria-hidden="true" />}
                    onChange={(event) => {
                      setName(event.target.value);
                      clearFieldError("name");
                    }}
                    placeholder="Ví dụ: NGUYỄN VĂN A"
                  />
                  <TextField
                    label="Ngày sinh dương lịch"
                    type="date"
                    required
                    wide
                    value={birthDate}
                    error={fieldErrors.birthDate}
                    icon={<CalendarDays aria-hidden="true" />}
                    onChange={(event) => {
                      setBirthDate(event.target.value);
                      clearFieldError("birthDate");
                    }}
                  />
                  <TextField
                    label="Số điện thoại khách hàng"
                    type="tel"
                    inputMode="tel"
                    autoComplete="off"
                    required
                    wide
                    value={phone}
                    error={fieldErrors.phone}
                    hint="Số của khách hàng, sẽ in vào ebook và lưu vào hồ sơ khách hàng."
                    icon={<Phone aria-hidden="true" />}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      clearFieldError("phone");
                    }}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                {exportError ? (
                  <p className="form-error" role="alert">
                    <AlertTriangle aria-hidden="true" /> {exportError}
                  </p>
                ) : null}

                <Button variant="primary" type="submit" disabled={exporting}>
                  {exporting ? <Loader2 className="spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
                  {exporting ? "Đang tạo file…" : "Xuất ebook PDF"}
                </Button>
                {lastFile ? (
                  <p className="muted">
                    <CheckCircle2 aria-hidden="true" /> Đã xuất file cho {lastFile}. Bạn có thể nhập khách hàng tiếp theo.
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
