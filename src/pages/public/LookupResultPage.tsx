import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Download, Loader2 } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { ResultBlocks } from "../../components/lookup/ResultBlocks";
import { ExpertContactBar } from "../../components/ui/ExpertCallout";
import type { LookupResultPayload } from "../../../shared/lookup-types";
import { ButtonLink } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Layout";
import { loadEbookDraft, saveEbookDraft } from "../../app/ebookDraft";

type StoredReport = { _id: string; type: string; title: string; createdAt: string; inputs?: { name?: string; birthDate?: string }; result: LookupResultPayload };

/** Trang xem lại kết quả đã lưu qua link chia sẻ có token. */
export function LookupResultPage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const query = useQuery({
    queryKey: ["lookup-result", id, token],
    enabled: Boolean(id),
    retry: 1,
    queryFn: () => api.get<{ report: StoredReport }>(`/api/lookups/${id}`, { query: { token } }),
  });

  useEffect(() => {
    document.title = "Kết quả tra cứu — SGEN Education";
  }, []);

  /**
   * "Tải PDF" chuyển sang trang ebook (đăng nhập bằng mã, chọn loại ebook, nhập số điện thoại khách hàng).
   * Hồ sơ đang xem được giữ lại; số điện thoại (không có trong link chia sẻ) lấy từ hồ sơ vừa tra cứu nếu cùng báo cáo.
   */
  const rememberProfile = () => {
    const report = query.data?.report;
    if (!report?.inputs?.name || !report.inputs.birthDate) return;
    const previous = loadEbookDraft();
    const samePerson = previous?.reportId === report._id || (previous?.name === report.inputs.name && previous?.birthDate === report.inputs.birthDate);
    saveEbookDraft({ name: report.inputs.name, birthDate: report.inputs.birthDate, phone: samePerson ? previous?.phone ?? "" : "", reportId: report._id });
  };

  return (
    <section className="page-dark-section" style={{ "--page-dark-bg": "url(/assets/backgrounds/cosmic-dark-clean.webp)" } as React.CSSProperties}>
      <div className="container">
        <Link className="article-back" to="/tra-cuu">
          <ArrowLeft aria-hidden="true" /> Về trang tra cứu
        </Link>

        {query.isLoading ? (
          <p className="state-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải kết quả…
          </p>
        ) : query.isError ? (
          <div className="result-preview__empty">
            <AlertTriangle aria-hidden="true" />
            <h2>Không mở được kết quả</h2>
            <p>{errorMessage(query.error)}</p>
            <ButtonLink variant="primary" to="/tra-cuu">
              Tra cứu lại
            </ButtonLink>
          </div>
        ) : query.data ? (
          <>
            <div className="lookup-workspace">
              {query.data.report.type === "numerology" ? (
                <ExpertContactBar title="Liên hệ Chuyên Gia để được Tư Vấn Chuyên Sâu" />
              ) : null}
              <ResultBlocks
                payload={query.data.report.result}
                actions={
                  query.data.report.type === "numerology" ? (
                    <ButtonLink variant="primary" to="/ebook" onClick={rememberProfile}>
                      <Download aria-hidden="true" /> Tải PDF
                    </ButtonLink>
                  ) : undefined
                }
              />
            </div>
            <Callout title="Link chia sẻ có thời hạn">
              Liên kết này chỉ mở được khi còn token hợp lệ. Bạn có thể tra cứu lại bất cứ lúc nào để tạo link mới.
            </Callout>
          </>
        ) : null}
      </div>
    </section>
  );
}
