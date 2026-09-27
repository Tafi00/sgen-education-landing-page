import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { ToastProvider } from "./components/ui/Toast";
import "./styles/global.css";
import "./styles/content.css";
import "./styles/final.css";
import "./styles/hero.css";
import "./styles/tools-numbers.css";
import "./styles/fengshui-tools.css";
import "./styles/pages.css";
import "./styles/nav.css";
import "./styles/forms.css";
import "./styles/admin.css";
import "./styles/responsive.css";
import "./styles/ux-home.css";
import "./styles/ux-tools.css";
import "./styles/ux-content.css";
import "./styles/ux-admin.css";
import "./styles/ux-reference.css";
import "./styles/ux-cms.css";
import "./styles/ux-cms-media.css";
import "./styles/ux-cms-forms.css";
import "./styles/ux-services.css";
import "./styles/ux-catalog.css";
import "./styles/ux-polish.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const container = document.getElementById("root");
if (!container) throw new Error("Không tìm thấy phần tử #root để mount ứng dụng.");

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
