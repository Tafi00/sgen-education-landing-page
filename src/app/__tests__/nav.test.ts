import { describe, expect, it } from "vitest";
import { PRIMARY_NAV, withServiceLinks } from "../nav";

describe("menu Dịch vụ theo CMS", () => {
  const services = [
    { slug: "dinh-huong-nghe-nghiep", name: "Định hướng nghề nghiệp sinh trắc vân tay", tagline: "Sở hữu trọn đời Bộ giải mã. Câu thứ hai.", order: 3 },
    { slug: "vip-than-so-hoc", name: "Mua Vip Bộ Thần số học đầy đủ ", tagline: "Sở hữu trọn đời bộ Thần số học đầy đủ của SGEN, được cấp mã. Và được đăng ký tham dự lớp.", order: 1 },
  ];

  it("dùng tên, thứ tự và câu đầu tagline của dịch vụ đã sửa trong quản trị", () => {
    const dichVu = withServiceLinks(PRIMARY_NAV, services).find((item) => item.href === "/dich-vu");
    expect(dichVu?.children).toEqual([
      { label: "Mua Vip Bộ Thần số học đầy đủ", href: "/dich-vu/vip-than-so-hoc", description: "Sở hữu trọn đời bộ Thần số học đầy đủ của SGEN, được cấp mã." },
      { label: "Định hướng nghề nghiệp sinh trắc vân tay", href: "/dich-vu/dinh-huong-nghe-nghiep", description: "Sở hữu trọn đời Bộ giải mã." },
    ]);
  });

  it("chưa có dữ liệu dịch vụ thì giữ menu mặc định, các mục khác không đổi", () => {
    expect(withServiceLinks(PRIMARY_NAV, [])).toBe(PRIMARY_NAV);
    const next = withServiceLinks(PRIMARY_NAV, services);
    expect(next.filter((item) => item.href !== "/dich-vu")).toEqual(PRIMARY_NAV.filter((item) => item.href !== "/dich-vu"));
  });
});
