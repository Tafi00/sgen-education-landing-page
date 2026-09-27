import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  label?: string;
};

/** Phân trang chuẩn: Trước · 1 … n-1 n n+1 … N · Sau. */
export function Pagination({ page, totalPages, onChange, label = "Phân trang" }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (number) => number === 1 || number === totalPages || Math.abs(number - page) <= 1,
  );
  return (
    <nav className="pagination" aria-label={label}>
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft aria-hidden="true" /> Trước
      </Button>
      {pages.map((number, index) => (
        <span className="pagination__item" key={number}>
          {index > 0 && number - pages[index - 1] > 1 ? <span className="pagination__gap" aria-hidden="true">…</span> : null}
          <Button
            variant="secondary"
            size="icon"
            aria-current={number === page ? "page" : undefined}
            aria-label={`Trang ${number}`}
            onClick={() => onChange(number)}
          >
            {number}
          </Button>
        </span>
      ))}
      <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Sau <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
