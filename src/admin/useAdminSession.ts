import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
  mustChangePassword?: boolean;
};

/**
 * Đọc phiên admin hiện tại. Lời gọi này cũng phát cookie CSRF cho các thao tác ghi,
 * nên luôn được gọi trước khi admin thực hiện thay đổi.
 */
export function useAdminSession() {
  const query = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => api.get<{ admin: AdminUser | null }>("/api/admin/auth/me"),
    staleTime: 60 * 1000,
    retry: 1,
  });
  return { admin: query.data?.admin ?? null, isLoading: query.isLoading, refetch: query.refetch };
}
