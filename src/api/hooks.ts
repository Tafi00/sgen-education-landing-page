import { useQuery } from "@tanstack/react-query";
import { ApiError, api } from "./client";
import { defaultCourses, defaultPages, defaultPosts, defaultSections, defaultServices } from "../data/defaults";
import type { DefaultCourse, DefaultPage, DefaultPost, DefaultSection, DefaultService } from "../data/defaults/types";

export type PublicSettings = {
  brand: { name: string; tagline: string; logoDark: string; logoLight: string; hotline: string };
  contact: {
    company: string;
    phone: string;
    phoneAlt: string;
    email: string;
    address: string;
    officeAddress: string;
    workingHours: string;
    mapEmbed: string;
  };
  socials: { facebook: string; youtube: string; tiktok: string; zalo: string };
  seo: { defaultTitle: string; defaultDescription: string; ogImage: string; keywords: string[] };
  featureFlags: { memberLogin: boolean; vipPurchase: boolean; simTool: boolean; quizTools: boolean };
  legal: { disclaimer: string; refundPolicy: string };
};

export const FALLBACK_SETTINGS: PublicSettings = {
  brand: { name: "SGEN Education", tagline: "Kiến thức chuẩn — Công nghệ mạnh — Tương lai vững chắc.", logoDark: "/assets/brand/sgen-logo-dark-v2.webp", logoLight: "/assets/brand/sgen-logo-light-footer-v2.webp", hotline: "0903.891.839" },
  contact: {
    company: "Công ty TNHH SGEN Education",
    phone: "0903891839",
    phoneAlt: "0902931839",
    email: "sgen.vn@gmail.com",
    address: "400/6 Mã Lò, Phường Bình Hưng Hòa, Thành Phố Hồ Chí Minh",
    officeAddress: "",
    workingHours: "08:00 – 20:00 (Thứ 2 – Chủ nhật)",
    mapEmbed: "",
  },
  socials: { facebook: "", youtube: "", tiktok: "", zalo: "" },
  seo: {
    defaultTitle: "SGEN Education — Thần số học ứng dụng",
    defaultDescription: "SGEN Education — Thần số học Pythagoras, DISC, MBTI và phong thủy ứng dụng.",
    ogImage: "",
    keywords: [],
  },
  featureFlags: { memberLogin: true, vipPurchase: true, simTool: true, quizTools: true },
  legal: {
    disclaimer: "Nội dung mang tính tham khảo, không thay thế tư vấn y tế, pháp lý hoặc tài chính.",
    refundPolicy: "",
  },
};

/**
 * API trả 404 nghĩa là bản ghi đã bị ẩn/xoá trong CMS. Khi đó **không** dùng bản nội dung
 * mặc định trong repo: nếu fallback, nội dung khách vừa ẩn vẫn hiện công khai (P1-3 trong
 * `docs/audit-toan-dien.md`). Chỉ fallback khi API lỗi mạng/5xx để trang không trắng.
 */
function apiSaidMissing(error: unknown) {
  return error instanceof ApiError && (error.status === 404 || error.status === 410);
}

const STALE_MS = 5 * 60 * 1000;

/**
 * Mọi hook nội dung công khai đều trả dữ liệu từ API khi có, và tự động rơi về
 * bộ nội dung mặc định trong repo khi API/CSDL chưa sẵn sàng.
 */
export function useSiteSettings() {
  const query = useQuery({
    queryKey: ["settings"],
    staleTime: STALE_MS,
    retry: 1,
    queryFn: () => api.get<{ settings: PublicSettings }>("/api/settings"),
  });
  return { settings: query.data?.settings ?? FALLBACK_SETTINGS, isFallback: !query.data, isLoading: query.isLoading };
}

export type CourseListItem = DefaultCourse & { _id?: string; status?: string };

export function useCourses(params: { category?: string; level?: string; q?: string; sort?: string; dir?: string; page?: number; pageSize?: number } = {}) {
  const query = useQuery({
    queryKey: ["courses", params],
    staleTime: STALE_MS,
    retry: 1,
    queryFn: () => api.get<{ items: CourseListItem[]; total: number; page: number; pageSize: number; totalPages: number }>("/api/courses", { query: params }),
  });
  const fallback = defaultCourses.filter((course) => {
    if (params.category && course.categorySlug !== params.category) return false;
    if (params.level && course.level !== params.level) return false;
    if (params.q && !course.title.toLowerCase().includes(params.q.toLowerCase())) return false;
    return true;
  });
  return {
    courses: query.data?.items ?? fallback,
    total: query.data?.total ?? fallback.length,
    page: query.data?.page ?? 1,
    pageSize: query.data?.pageSize ?? fallback.length,
    totalPages: query.data?.totalPages ?? 1,
    isFallback: !query.data,
    isLoading: query.isLoading,
  };
}

export function useCourse(slug: string) {
  const query = useQuery({
    queryKey: ["course", slug],
    staleTime: STALE_MS,
    retry: 1,
    enabled: Boolean(slug),
    queryFn: () => api.get<{ course: DefaultCourse }>(`/api/courses/${slug}`),
  });
  const missing = apiSaidMissing(query.error);
  const fallback = missing ? undefined : defaultCourses.find((course) => course.slug === slug);
  return {
    course: query.data?.course ?? fallback,
    isFallback: !query.data && !missing,
    isLoading: query.isLoading,
    notFound: !query.isLoading && !query.data && (!fallback || missing),
  };
}

export function usePosts(params: { category?: string; q?: string; page?: number; pageSize?: number } = {}) {
  const query = useQuery({
    queryKey: ["posts", params],
    staleTime: STALE_MS,
    retry: 1,
    queryFn: () => api.get<{ items: DefaultPost[]; total: number; page: number; pageSize: number; totalPages: number }>("/api/posts", { query: params }),
  });
  const fallback = defaultPosts.filter((post) => {
    if (params.category && post.categorySlug !== params.category) return false;
    if (params.q && !`${post.title} ${post.excerpt}`.toLowerCase().includes(params.q.toLowerCase())) return false;
    return true;
  });
  return {
    posts: query.data?.items ?? fallback,
    total: query.data?.total ?? fallback.length,
    totalPages: query.data?.totalPages ?? 1,
    isFallback: !query.data,
    isLoading: query.isLoading,
  };
}

export function usePost(slug: string) {
  const query = useQuery({
    queryKey: ["post", slug],
    staleTime: STALE_MS,
    retry: 1,
    enabled: Boolean(slug),
    queryFn: () => api.get<{ post: DefaultPost; related: DefaultPost[] }>(`/api/posts/${slug}`),
  });
  const missing = apiSaidMissing(query.error);
  const fallback = missing ? undefined : defaultPosts.find((post) => post.slug === slug);
  const relatedFallback = missing
    ? []
    : defaultPosts.filter((post) => post.slug !== slug && post.categorySlug === fallback?.categorySlug).slice(0, 3);
  return {
    post: query.data?.post ?? fallback,
    related: query.data?.related ?? relatedFallback,
    isFallback: !query.data && !missing,
    isLoading: query.isLoading,
    notFound: !query.isLoading && !query.data && (!fallback || missing),
  };
}

export function usePage(slug: string) {
  const query = useQuery({
    queryKey: ["page", slug],
    staleTime: STALE_MS,
    retry: 1,
    enabled: Boolean(slug),
    queryFn: () => api.get<{ page: DefaultPage }>(`/api/pages/${slug}`),
  });
  const missing = apiSaidMissing(query.error);
  const fallback = missing ? undefined : defaultPages.find((page) => page.slug === slug);
  return { page: query.data?.page ?? fallback, isFallback: !query.data && !missing, isLoading: query.isLoading, notFound: missing };
}

export function useSections() {
  const query = useQuery({
    queryKey: ["sections"],
    staleTime: STALE_MS,
    retry: 1,
    queryFn: () => api.get<{ sections: DefaultSection[] }>("/api/sections"),
  });
  return { sections: query.data?.sections ?? defaultSections, isFallback: !query.data };
}

export function useServices() {
  const query = useQuery({
    queryKey: ["services"],
    staleTime: STALE_MS,
    retry: 1,
    queryFn: () => api.get<{ items: DefaultService[] }>("/api/services"),
  });
  return { services: query.data?.items ?? defaultServices, isFallback: !query.data, isLoading: query.isLoading };
}

export function useService(slug: string) {
  const query = useQuery({
    queryKey: ["service", slug],
    staleTime: STALE_MS,
    retry: 1,
    enabled: Boolean(slug),
    queryFn: () => api.get<{ service: DefaultService }>(`/api/services/${slug}`),
  });
  const missing = apiSaidMissing(query.error);
  const fallback = missing ? undefined : defaultServices.find((service) => service.slug === slug);
  return {
    service: query.data?.service ?? fallback,
    isFallback: !query.data && !missing,
    isLoading: query.isLoading,
    notFound: !query.isLoading && !query.data && (!fallback || missing),
  };
}
