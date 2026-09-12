import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    let frameId = 0;

    const update = () => {
      const scrollY = Math.max(window.scrollY, 0);
      const distanceToBottom = document.documentElement.scrollHeight - (scrollY + window.innerHeight);
      /** Ẩn khi có thanh CTA dính đáy (trang chi tiết) hoặc khi đã tới sát cuối trang. */
      const stickyVisible = Boolean(document.querySelector(".detail-sticky.is-visible"));
      setVisible(scrollY > 700 && distanceToBottom > 160 && !stickyVisible);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      frameId = window.requestAnimationFrame(update);
      ticking = true;
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const interval = window.setInterval(update, 1200);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearInterval(interval);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <button
      type="button"
      className={`scroll-top ${visible ? "is-visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Quay lại đầu trang"
    >
      <ArrowUp aria-hidden="true" />
    </button>
  );
}
