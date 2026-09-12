import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteFooter } from "../components/layout/SiteFooter";
import { SiteHeader } from "../components/layout/SiteHeader";
import { ScrollToTop } from "../components/ui/ScrollToTop";
import { safeQuerySelector } from "../app/dom";

export function PublicLayout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = safeQuerySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [hash, pathname]);

  return (
    <main className="app-shell">
      <SiteHeader />
      <Suspense fallback={<RouteFallback />}>
        <div className="page-body">
          <Outlet />
        </div>
      </Suspense>
      <SiteFooter />
      <ScrollToTop />
    </main>
  );
}

function RouteFallback() {
  return (
    <div className="route-fallback">
      <span>Đang tải…</span>
    </div>
  );
}
