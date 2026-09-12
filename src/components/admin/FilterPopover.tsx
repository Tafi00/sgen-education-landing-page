import { useEffect, useMemo, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Filter, X } from "lucide-react";
import { api } from "../../api/client";
import type { FieldOption, FilterConfig } from "../../admin/types";

export type FilterValues = Record<string, string>;

export function FilterPopover({
  filters,
  values,
  onApply,
}: {
  filters: FilterConfig[];
  values: FilterValues;
  onApply: (values: FilterValues) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(values);
  const rootRef = useRef<HTMLDivElement>(null);

  const relationFilters = filters.filter((filter) => filter.relation);
  const relationQueries = useQueries({
    queries: relationFilters.map((filter) => ({
      queryKey: ["filter-options", filter.relation?.endpoint, filter.key],
      queryFn: () => api.get<{ items: Record<string, unknown>[] }>(filter.relation!.endpoint, { query: { pageSize: 100 } }),
      staleTime: 5 * 60 * 1000,
      enabled: open,
    })),
  });

  const dynamicOptions = useMemo(() => {
    const map: Record<string, FieldOption[]> = {};
    relationFilters.forEach((filter, index) => {
      const items = relationQueries[index]?.data?.items ?? [];
      map[filter.key] = items.map((item) => {
        const primary = String(item[filter.relation!.labelKey] ?? "(không tên)");
        const secondary = filter.relation!.secondaryKey ? String(item[filter.relation!.secondaryKey] ?? "") : "";
        return { value: String(item._id ?? ""), label: secondary ? `${primary} — ${secondary}` : primary };
      });
    });
    return map;
  }, [relationFilters, relationQueries]);

  const optionsFor = (filter: FilterConfig) => filter.options ?? dynamicOptions[filter.key] ?? [];

  useEffect(() => {
    setDraft(values);
  }, [values]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const activeCount = Object.values(values).filter((value) => value && value !== "all").length;
  const chips = filters
    .filter((filter) => values[filter.key] && values[filter.key] !== "all")
    .map((filter) => {
      const option = optionsFor(filter).find((item) => item.value === values[filter.key]);
      return { key: filter.key, label: `${filter.label}: ${option?.label ?? values[filter.key]}` };
    });

  return (
    <div className="filter-popover" ref={rootRef}>
      <button type="button" className={`filter-popover__trigger ${activeCount ? "is-active" : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <Filter aria-hidden="true" />
        Bộ lọc
        {activeCount ? <span className="filter-popover__count">{activeCount}</span> : null}
      </button>

      {chips.length ? (
        <div className="filter-popover__chips">
          {chips.map((chip) => (
            <button key={chip.key} type="button" onClick={() => onApply({ ...values, [chip.key]: "" })}>
              {chip.label}
              <X aria-hidden="true" />
            </button>
          ))}
          <button type="button" className="filter-popover__clear" onClick={() => onApply({})}>
            Xoá tất cả
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="filter-popover__panel" role="dialog" aria-label="Bộ lọc">
          <header>
            <strong>Lọc dữ liệu</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng bộ lọc">
              <X aria-hidden="true" />
            </button>
          </header>
          <div className="filter-popover__fields">
            {filters.map((filter) =>
              filter.kind === "date" || filter.kind === "text" || filter.kind === "number" ? (
                <label key={filter.key}>
                  <span>{filter.label}</span>
                  <input
                    type={filter.kind === "date" ? "date" : filter.kind === "number" ? "number" : "text"}
                    value={draft[filter.key] ?? ""}
                    onChange={(event) => setDraft((current) => ({ ...current, [filter.key]: event.target.value }))}
                  />
                </label>
              ) : (
                <label key={filter.key}>
                  <span>{filter.label}</span>
                  <select value={draft[filter.key] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [filter.key]: event.target.value }))}>
                    <option value="">Tất cả</option>
                    {optionsFor(filter).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ),
            )}
          </div>
          <footer>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setDraft({});
                onApply({});
              }}
            >
              Đặt lại
            </button>
            <button type="button" className="button button--ghost" onClick={() => setOpen(false)}>
              Đóng
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
            >
              Áp dụng
            </button>
          </footer>
        </div>
      ) : null}
    </div>
  );
}
