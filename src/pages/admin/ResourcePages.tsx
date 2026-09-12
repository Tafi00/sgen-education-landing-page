import type { ReactNode } from "react";
import { ResourceForm } from "../../components/admin/ResourceForm";
import { ResourceList, StatusBadge, formatCellValue } from "../../components/admin/ResourceList";
import { RESOURCES } from "../../admin/resources";
import type { ColumnKind, ResourceConfig } from "../../admin/types";

type Row = Record<string, unknown>;
type CellRenderer = (row: Row, key: string) => ReactNode;

/**
 * Ô bảng dùng chung cho mọi danh sách: badge trạng thái, ảnh thu nhỏ và các
 * định dạng còn lại (ngày, số, tiền tệ, boolean). Cột lồng như
 * `notification.telegram` được đọc theo đường dẫn có dấu chấm.
 */
function createCellRenderer(config: ResourceConfig): CellRenderer {
  const kinds: Record<string, ColumnKind | undefined> = {};
  for (const column of config.columns) kinds[column.key] = column.kind;

  return (row, key) => {
    const value = key.split(".").reduce<unknown>((current, part) => (current && typeof current === "object" ? (current as Row)[part] : undefined), row);
    const kind = kinds[key];
    if (kind === "badge") return <StatusBadge status={String(value ?? "")} />;
    if (kind === "image") return value ? <img className="data-table__thumb" src={String(value)} alt="" loading="lazy" /> : "—";
    return formatCellValue(value, kind);
  };
}

const CELL_RENDERERS: Record<keyof typeof RESOURCES, CellRenderer> = Object.fromEntries(
  Object.entries(RESOURCES).map(([key, config]) => [key, createCellRenderer(config)]),
) as Record<keyof typeof RESOURCES, CellRenderer>;

/* ------------------------------- Nội dung ------------------------------- */

export function CoursesListPage() {
  return <ResourceList config={RESOURCES.courses} renderCell={CELL_RENDERERS.courses} />;
}

export function CoursesFormPage() {
  return <ResourceForm config={RESOURCES.courses} />;
}

export function CourseCategoriesListPage() {
  return <ResourceList config={RESOURCES["course-categories"]} renderCell={CELL_RENDERERS["course-categories"]} />;
}

export function CourseCategoriesFormPage() {
  return <ResourceForm config={RESOURCES["course-categories"]} />;
}

export function PostsListPage() {
  return <ResourceList config={RESOURCES.posts} renderCell={CELL_RENDERERS.posts} />;
}

export function PostsFormPage() {
  return <ResourceForm config={RESOURCES.posts} />;
}

export function PostCategoriesListPage() {
  return <ResourceList config={RESOURCES["post-categories"]} renderCell={CELL_RENDERERS["post-categories"]} />;
}

export function PostCategoriesFormPage() {
  return <ResourceForm config={RESOURCES["post-categories"]} />;
}

export function PagesListPage() {
  return <ResourceList config={RESOURCES.pages} renderCell={CELL_RENDERERS.pages} />;
}

export function PagesFormPage() {
  return <ResourceForm config={RESOURCES.pages} />;
}

export function SectionsListPage() {
  return <ResourceList config={RESOURCES.sections} renderCell={CELL_RENDERERS.sections} />;
}

export function SectionsFormPage() {
  return <ResourceForm config={RESOURCES.sections} />;
}

export function ServicesListPage() {
  return <ResourceList config={RESOURCES.services} renderCell={CELL_RENDERERS.services} />;
}

export function ServicesFormPage() {
  return <ResourceForm config={RESOURCES.services} />;
}

/* ------------------------------ Khách hàng ------------------------------ */

export function MembersListPage() {
  return <ResourceList config={RESOURCES.members} renderCell={CELL_RENDERERS.members} />;
}

export function MembersFormPage() {
  return <ResourceForm config={RESOURCES.members} />;
}

export function EntitlementsListPage() {
  return <ResourceList config={RESOURCES.entitlements} renderCell={CELL_RENDERERS.entitlements} />;
}

export function EntitlementsFormPage() {
  return <ResourceForm config={RESOURCES.entitlements} />;
}

/* ------------------------------ Trắc nghiệm ----------------------------- */

export function QuizSetsListPage() {
  return <ResourceList config={RESOURCES["quiz-sets"]} renderCell={CELL_RENDERERS["quiz-sets"]} />;
}

export function QuizSetsFormPage() {
  return <ResourceForm config={RESOURCES["quiz-sets"]} />;
}

export function QuizItemsListPage() {
  return <ResourceList config={RESOURCES["quiz-items"]} renderCell={CELL_RENDERERS["quiz-items"]} />;
}

export function QuizItemsFormPage() {
  return <ResourceForm config={RESOURCES["quiz-items"]} />;
}

export function QuizResultsListPage() {
  return <ResourceList config={RESOURCES["quiz-results"]} renderCell={CELL_RENDERERS["quiz-results"]} />;
}

export function QuizResultsFormPage() {
  return <ResourceForm config={RESOURCES["quiz-results"]} />;
}

/* -------------------------------- Hệ thống ------------------------------- */

export function NotificationsListPage() {
  return <ResourceList config={RESOURCES.notifications} renderCell={CELL_RENDERERS.notifications} />;
}

/** Danh sách báo cáo tra cứu (chi tiết nằm ở src/pages/admin/LookupDetailPage.tsx). */
export function LookupsListPage() {
  return <ResourceList config={RESOURCES.lookups} renderCell={createCellRenderer(RESOURCES.lookups)} />;
}
