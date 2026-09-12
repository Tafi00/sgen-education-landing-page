import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { ResultBlocks } from "../../components/lookup/ResultBlocks";
import { StatusBadge } from "../../components/admin/ResourceList";
import type { LookupResultPayload, LookupType, ResultBlock } from "../../../shared/lookup-types";
import { LOOKUP_LABELS } from "../../../shared/lookup-types";
import { useToast } from "../../components/ui/Toast";

type LookupItem = {
  _id: string;
  type: LookupType;
  title: string;
  source?: string;
  inputs?: Record<string, unknown>;
  /** Payload luận giải được lưu cùng báo cáo. */
  result: LookupResultPayload;
  memberId?: string | null;
  leadId?: string | null;
  shareToken?: string;
  createdAt: string;
};

/** Chi tiết một báo cáo tra cứu: hiển thị đúng khối kết quả như trang công khai. */
export function LookupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const query = useQuery({
    queryKey: ["admin-lookup", id],
    enabled: Boolean(id),
    queryFn: () => api.get<{ item: LookupItem }>(`/api/admin/lookups/${id}`),
  });

  const payload = useMemo<LookupResultPayload | null>(() => {
    const item = query.data?.item;
    if (!item?.result) return null;
    return { ...item.result, blocks: (item.result.blocks ?? []) as ResultBlock[] };
  }, [query.data]);

  const item = query.data?.item;

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <Link className="admin-back" to="/admin/tra-cuu">
            <ArrowLeft aria-hidden="true" /> Về danh sách báo cáo
          </Link>
          <h1>{item?.title || "Báo cáo tra cứu"}</h1>
          <div className="admin-page__meta">
            {item ? <StatusBadge status={item.type} /> : null}
            <span>{item ? LOOKUP_LABELS[item.type] ?? item.type : ""}</span>
            {item?.createdAt ? <span>Thực hiện {new Date(item.createdAt).toLocaleString("vi-VN")}</span> : null}
            {item?.source ? <span>Nguồn: {item.source}</span> : null}
            {item?.memberId ? (
              <Link to={`/admin/thanh-vien/${item.memberId}`}>Thành viên liên quan</Link>
            ) : (
              <span>Khách vãng lai</span>
            )}
            {item?.leadId ? <Link to={`/admin/leads/${item.leadId}`}>Lead liên quan</Link> : null}
          </div>
        </div>
        <div className="admin-page__actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={async () => {
              if (!item) return;
              try {
                await navigator.clipboard.writeText(`${window.location.origin}/tra-cuu/ket-qua/${item._id}?token=${item.shareToken ?? ""}`);
                toast.success("Đã sao chép liên kết", "Liên kết công khai có token, hết hạn sau 30 ngày.");
              } catch (error) {
                toast.error("Không sao chép được", errorMessage(error));
              }
            }}
            disabled={!item?.shareToken}
          >
            Sao chép liên kết chia sẻ
          </button>
        </div>
      </header>

      {query.isLoading ? (
        <p className="admin-loading">
          <Loader2 className="spin" aria-hidden="true" /> Đang tải báo cáo…
        </p>
      ) : query.isError ? (
        <p className="admin-error">{errorMessage(query.error)}</p>
      ) : payload ? (
        <>
          {item?.inputs && Object.keys(item.inputs).length ? (
            <div className="admin-card">
              <strong>Dữ liệu đầu vào</strong>
              <div className="data-table__scroll">
                <table className="data-table">
                  <tbody>
                    {Object.entries(item.inputs).map(([key, value]) => (
                      <tr key={key}>
                        <td style={{ width: 220 }}>{key}</td>
                        <td>{typeof value === "object" ? JSON.stringify(value) : String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="admin-panel">
            <ResultBlocks payload={payload} />
          </div>

          <div className="admin-banner">
            <ShieldCheck aria-hidden="true" /> Báo cáo chỉ hiển thị trong CMS. Liên kết chia sẻ công khai cần token hợp lệ và sẽ hết hạn sau 30 ngày.
          </div>
        </>
      ) : (
        <p className="empty-state">Không tìm thấy báo cáo này.</p>
      )}
    </section>
  );
}
