import { Model, type Doc } from "../db/model.js";

export const Lead = new Model<LeadDoc>({
  table: "leads",
  fields: {
    name: { kind: "text" },
    phone: { kind: "text" },
    email: { kind: "text" },
    birthDate: { kind: "text" },
    message: { kind: "text" },
    source: { kind: "text" },
    sourceLabel: { kind: "text" },
    payload: { kind: "json" },
    status: { kind: "text" },
    assignedTo: { kind: "uuid" },
    note: { kind: "text" },
    notification: { kind: "json" },
  },
});

export const Order = new Model<OrderDoc>({
  table: "orders",
  fields: {
    code: { kind: "text" },
    viewToken: { kind: "text" },
    memberId: { kind: "uuid" },
    customerName: { kind: "text" },
    customerPhone: { kind: "text" },
    customerEmail: { kind: "text" },
    serviceSlug: { kind: "text" },
    serviceName: { kind: "text" },
    amount: { kind: "int" },
    method: { kind: "text" },
    status: { kind: "text" },
    proofImage: { kind: "text" },
    paidAt: { kind: "date" },
    adminNote: { kind: "text" },
    entitlementGrantedAt: { kind: "date" },
  },
});

export const Entitlement = new Model<EntitlementDoc>({
  table: "entitlements",
  fields: {
    memberId: { kind: "uuid" },
    type: { kind: "text" },
    orderId: { kind: "uuid" },
    grantedAt: { kind: "date" },
    expiresAt: { kind: "date" },
    active: { kind: "bool" },
    grantedBy: { kind: "uuid" },
    note: { kind: "text" },
  },
});

export const MediaAsset = new Model<MediaAssetDoc>({
  table: "media_assets",
  fields: {
    filename: { kind: "text" },
    url: { kind: "text" },
    mime: { kind: "text" },
    size: { kind: "int" },
    width: { kind: "int" },
    height: { kind: "int" },
    alt: { kind: "text" },
    folder: { kind: "text" },
    variants: { kind: "json" },
    refCount: { kind: "int" },
    uploadedBy: { kind: "uuid" },
  },
});

export const NotificationLog = new Model({
  table: "notification_logs",
  fields: {
    channel: { kind: "text" },
    target: { kind: "text" },
    subject: { kind: "text" },
    payload: { kind: "json" },
    status: { kind: "text" },
    error: { kind: "text" },
    relatedLeadId: { kind: "uuid" },
    relatedOrderId: { kind: "uuid" },
  },
});

export const EbookCode = new Model<EbookCodeDoc>({
  table: "ebook_codes",
  fields: {
    code: { kind: "text" },
    plan: { kind: "text" },
    edition: { kind: "text" },
    quota: { kind: "int" },
    used: { kind: "int" },
    status: { kind: "text" },
    holderName: { kind: "text" },
    holderContact: { kind: "text" },
    note: { kind: "text" },
    batchId: { kind: "text" },
    expiresAt: { kind: "date" },
    lastUsedAt: { kind: "date" },
    createdBy: { kind: "uuid" },
  },
});

export const EbookExport = new Model<EbookExportDoc>({
  table: "ebook_exports",
  fields: {
    codeId: { kind: "uuid" },
    edition: { kind: "text" },
    customerName: { kind: "text" },
    birthDate: { kind: "text" },
    ip: { kind: "text" },
  },
});

export const AuditLog = new Model<AuditLogDoc>({
  table: "audit_logs",
  fields: {
    actorId: { kind: "uuid" },
    actorEmail: { kind: "text" },
    action: { kind: "text" },
    collectionName: { kind: "text" },
    documentId: { kind: "text" },
    diff: { kind: "json" },
  },
});

export type NotificationState = {
  resend: "pending" | "sent" | "failed" | "skipped";
  telegram: "pending" | "sent" | "failed" | "skipped";
  attempts: number;
  lastError: string;
  lastAttemptAt: Date | null;
};

export type LeadDoc = Doc & {
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  message: string;
  source: string;
  sourceLabel: string;
  payload: Record<string, unknown>;
  status: "new" | "contacted" | "won" | "lost";
  assignedTo: string | null;
  note: string;
  notification: Partial<NotificationState>;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderDoc = Doc & {
  code: string;
  viewToken: string;
  memberId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceSlug: string;
  serviceName: string;
  amount: number;
  method: "bank_transfer" | "vietqr";
  status: "pending" | "paid" | "cancelled" | "expired";
  proofImage: string;
  paidAt: Date | null;
  adminNote: string;
  entitlementGrantedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EntitlementDoc = Doc & {
  memberId: string;
  type: "vip-numerology" | "lifetime";
  orderId: string | null;
  grantedAt: Date | null;
  expiresAt: Date | null;
  active: boolean;
  grantedBy: string | null;
  note: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MediaAssetDoc = Doc & {
  filename: string;
  url: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  alt: string;
  folder: string;
  variants: { label?: string; url?: string; width?: number }[];
  refCount: number;
  uploadedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuditLogDoc = Doc & {
  actorId: string | null;
  actorEmail: string;
  action: string;
  collectionName: string;
  documentId: string;
  diff: Record<string, unknown>;
  createdAt: Date;
};

export type EbookCodeDoc = Doc & {
  code: string;
  plan: string;
  edition: "demo" | "full";
  quota: number;
  used: number;
  status: "active" | "disabled";
  holderName: string;
  holderContact: string;
  note: string;
  batchId: string;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EbookExportDoc = Doc & {
  codeId: string;
  edition: "demo" | "full";
  customerName: string;
  birthDate: string;
  ip: string;
  createdAt: Date;
};
