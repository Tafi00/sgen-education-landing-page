import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Download, Loader2, ShieldCheck } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { ResultBlocks } from "../../components/lookup/ResultBlocks";
import type { LookupResultPayload } from "../../../shared/lookup-types";

type StoredReport = { _id: string; type: string; title: string; createdAt: string; result: LookupResultPayload };

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

  return (
    <section className="page-dark-section" style={{ "--page-dark-bg": "url(/assets/backgrounds/cosmic-dark-clean.webp)" } as React.CSSProperties}>
      <div className="container">
        <Link className="article-back" to="/tra-cuu">
          <ArrowLeft aria-hidden="true" /> Về trang tra cứu
        </Link>

        {query.isLoading ? (
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải kết quả…
          </p>
        ) : query.isError ? (
          <div className="result-preview__empty">
            <AlertTriangle aria-hidden="true" />
            <h2>Không mở được kết quả</h2>
            <p>{errorMessage(query.error)}</p>
            <Link className="page-primary" to="/tra-cuu">
              Tra cứu lại
            </Link>
          </div>
        ) : query.data ? (
          <>
            <div className="lookup-workspace">
              <ResultBlocks payload={query.data.report.result} />
              {query.data.report.type === "numerology" ? (
                <a
                  className="page-primary report-download"
                  href={`/api/lookups/${id}/pdf?token=${encodeURIComponent(token)}`}
                  download
                >
                  <Download aria-hidden="true" /> Tải báo cáo PDF
                </a>
              ) : null}
            </div>
            <div className="privacy-banner">
              <ShieldCheck aria-hidden="true" />
              <div>
                <strong>Link chia sẻ có thời hạn</strong>
                <span>Liên kết này chỉ mở được khi còn token hợp lệ. Bạn có thể tra cứu lại bất cứ lúc nào để tạo link mới.</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
