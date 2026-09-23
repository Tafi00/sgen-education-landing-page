import { Link } from "react-router-dom";
import { Brain, Hash, UsersRound } from "lucide-react";

export function LookupNavTabs({ activeKey }: { activeKey?: "numerology" | "disc" | "mbti" }) {
  return (
    <nav className="lookup-nav-tabs-wrap" aria-label="Các công cụ tra cứu & trắc nghiệm">
      <div className="lookup-nav-tabs">
        <Link
          to="/tra-cuu"
          className={`lookup-nav-tab ${activeKey === "numerology" ? "is-active" : ""}`}
        >
          <Hash aria-hidden="true" size={18} />
          <span>Tra cứu Thần số học</span>
        </Link>

        <Link
          to="/tra-cuu/disc"
          className={`lookup-nav-tab ${activeKey === "disc" ? "is-active" : ""}`}
        >
          <UsersRound aria-hidden="true" size={18} />
          <span>Tra cứu DISC</span>
        </Link>

        <Link
          to="/tra-cuu/mbti"
          className={`lookup-nav-tab ${activeKey === "mbti" ? "is-active" : ""}`}
        >
          <Brain aria-hidden="true" size={18} />
          <span>Tra cứu MBTI</span>
        </Link>
      </div>
    </nav>
  );
}
