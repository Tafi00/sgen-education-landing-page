import "../../styles/sim-phong-thuy.css";
import type { SimLucHaoData } from "../../../shared/sim/sim-phong-thuy-engine";

/** Tên giai đoạn Trường Sinh / Quý Thần viết tắt cho vừa bảng trên điện thoại (chú giải ở dưới bảng). */
const STAGE_SHORT: Record<string, string> = {
  "Trường Sinh": "T.Sinh",
  "Mộc Dục": "M.Dục",
  "Quan Đới": "Q.Đới",
  "Lâm Quan": "L.Quan",
  "Đế Vượng": "Đ.Vượng",
  "Quý Nhân": "Q.Nhân",
};
const shortStage = (value: string) => (!value || value === "—" ? "-" : STAGE_SHORT[value] ?? value);

/** Vạch hào nhỏ trong bảng: dương một vạch liền, âm hai vạch; hào động màu son. */
function HaoMark({ position, isYang, moving }: { position: number; isYang: boolean; moving?: boolean }) {
  return (
    <span
      className={`skd-lh-mini-hao ${isYang ? "is-yang" : "is-yin"}${moving ? " is-moving" : ""}`}
      role="img"
      aria-label={`Hào ${position} ${isYang ? "dương" : "âm"}${moving ? ", động" : ""}`}
      title={`Hào ${position}`}
    >
      <i />
      <i />
    </span>
  );
}

/**
 * Lá quẻ Lục Hào dùng chung cho Luận sim và Gieo quẻ: quẻ chủ → quẻ biến, Lục Thân, Can Chi, Lục Thú,
 * Thế/Ứng, Vượng Suy, Quý Thần, Trường Sinh. Hào 1 ở dưới cùng, hào 6 trên cùng (đọc từ dưới lên).
 */
export function LucHaoSheet({ data, movingLine, subject = "dãy sim" }: { data: SimLucHaoData; movingLine: number | number[]; subject?: string }) {
  const movingLabel = Array.isArray(movingLine) ? movingLine.join(", ") || "tĩnh" : String(movingLine);
  const rows = data.primary.lines.map((pLine, index) => ({ pLine, cLine: data.changed.lines[index] })).reverse();
  return (
    <>
          <div className="skd-lh-oracle-stage">
            <header className="skd-lh-heading">
              <div>
                <div className="skd-lh-kicker">Hồ sơ Kinh Dịch · Lục Hào</div>
                <h3>Bản đọc tương tác</h3>
                <p>Đối chiếu quẻ chủ, hào động và quẻ biến của {subject}.</p>
              </div>
              <div className="skd-lh-line-legend" aria-label="Chú giải màu hào">
                <span><i /> Hào tĩnh</span>
                <span><i className="is-moving" /> Hào động</span>
              </div>
            </header>

            {/* HEXAGRAM GRAPHICS & LABELS */}
            <div className="skd-lh-hex-header">
              {/* QUẺ CHỦ */}
              <article className="skd-lh-hex-col is-primary">
                <div className="skd-lh-hex-eyebrow">Quẻ chủ</div>
                <div className="skd-lh-hex-name">{data.primary.name}</div>
                <div className="skd-lh-hex-bars" aria-label={`Sáu hào của quẻ ${data.primary.name}`}>
                  {[...data.primary.lines].reverse().map((l) => (
                    <div
                      key={l.position}
                      className="skd-lh-bar-row"
                      aria-label={`Hào ${l.position}${l.isMoving ? ", hào động" : ""}`}
                    >
                      <span className="skd-lh-bar-order">{l.position}</span>
                      <span className="skd-lh-bar-graphic">
                        {l.isYang ? (
                          <span className={`skd-lh-bar-yang ${l.isMoving ? "is-moving" : ""}`} />
                        ) : (
                          <span className={`skd-lh-bar-yin ${l.isMoving ? "is-moving" : ""}`}>
                            <span />
                            <span />
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="skd-lh-hex-palace">{data.primary.palaceLabel}</div>
              </article>

              {/* BIẾN ARROW */}
              <div className="skd-lh-hex-center" aria-label={`Hào ${movingLabel} biến`}>
                <span className="skd-lh-moving-label">Hào {movingLabel}</span>
                <span className="skd-lh-arrow" aria-hidden="true">→</span>
                <span>Biến quẻ</span>
              </div>

              {/* QUẺ BIẾN */}
              <article className="skd-lh-hex-col is-changed">
                <div className="skd-lh-hex-eyebrow">Quẻ biến</div>
                <div className="skd-lh-hex-name">{data.changed.name}</div>
                <div className="skd-lh-hex-bars" aria-label={`Sáu hào của quẻ ${data.changed.name}`}>
                  {[...data.changed.lines].reverse().map((cl) => (
                    <div
                      key={cl.position}
                      className="skd-lh-bar-row"
                      aria-label={`Hào ${cl.position}${cl.isTransformed ? ", được biến đổi" : ""}`}
                    >
                      <span className="skd-lh-bar-order">{cl.position}</span>
                      <span className="skd-lh-bar-graphic">
                        {cl.isYang ? (
                          <span className={`skd-lh-bar-yang ${cl.isTransformed ? "is-moving" : ""}`} />
                        ) : (
                          <span className={`skd-lh-bar-yin ${cl.isTransformed ? "is-moving" : ""}`}>
                            <span />
                            <span />
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="skd-lh-hex-palace">{data.changed.palaceLabel}</div>
              </article>
            </div>
          </div>

          {/* META INFO — như dòng đầu lá quẻ của simkinhdich.com (khách khoanh đỏ 17/11/2026) */}
          <div className="skd-lh-meta-box">
            <div className="skd-lh-meta-item">
              <span>Thời điểm lập quẻ</span>
              <strong>{data.meta.solarDateTime}</strong>
            </div>
            <div className="skd-lh-meta-item">
              <span>Theo âm lịch</span>
              <strong>{data.meta.lunarDateTime}</strong>
            </div>
            <div className="skd-lh-meta-item is-wide">
              <span>Can Chi</span>
              <strong>{data.meta.fourPillarsText}</strong>
            </div>
            <div className="skd-lh-meta-item">
              <span>Tiết khí</span>
              <strong>{data.meta.solarTerm}</strong>
            </div>
            <div className="skd-lh-meta-item">
              <span>Nhật thần</span>
              <strong>{data.meta.nhatThan}</strong>
            </div>
            <div className="skd-lh-meta-item">
              <span>Nguyệt lệnh</span>
              <strong>{data.meta.nguyetLenh}</strong>
            </div>
          </div>

          {/* TRIỆU / TƯỢNG QUẺ BANNER */}
          <div className="skd-lh-trieu-banner">
            <span>Tượng quẻ</span>
            <strong>{data.primary.trieu}</strong>
          </div>

          {/* TABLE 1: THÂN HÀO & CAN CHI — vừa bề ngang màn hình, không phải vuốt (như lá quẻ simkinhdich.com) */}
          <div className="skd-lh-table-section">
            <div className="skd-lh-table-heading">
              <div>
                <span>Chi tiết Lục Hào</span>
                <strong>Lục Thân · Can Chi · Lục Thú</strong>
              </div>
              <small>Hào 6 ở trên, hào 1 ở dưới</small>
            </div>
            <div className="skd-lh-table-wrap is-fit">
              <table className="skd-lh-table is-fit is-dense">
                <caption className="skd-visually-hidden">Bảng Lục Thân, Can Chi và Lục Thú của quẻ chủ và quẻ biến</caption>
                <colgroup>
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6.5%" }} />
                  <col style={{ width: "12.5%" }} />
                  <col style={{ width: "12.5%" }} />
                  <col style={{ width: "9.5%" }} />
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "12.5%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14.5%" }} />
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "6%" }} />
                </colgroup>
                <thead>
                  <tr className="skd-lh-table-group-row">
                    <th colSpan={6}>Quẻ chủ · {data.primary.name}</th>
                    <th colSpan={5}>Quẻ biến · {data.changed.name}</th>
                  </tr>
                  <tr>
                    <th>Hào</th>
                    <th>T/Ư</th>
                    <th>Lục Thân</th>
                    <th>Can Chi</th>
                    <th title="Phục Thần">P.Thần</th>
                    <th title="Tuần Không">T.K</th>
                    <th className="skd-lh-split">Lục Thân</th>
                    <th>Can Chi</th>
                    <th>Lục Thú</th>
                    <th title="Tuần Không">T.K</th>
                    <th>Hào</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ pLine, cLine }) => (
                    <tr key={pLine.position} className={pLine.isMoving ? "skd-lh-row-moving" : ""}>
                      <td><HaoMark position={pLine.position} isYang={pLine.isYang} moving={pLine.isMoving} /></td>
                      <td>
                        {pLine.theUng === "Thế" ? (
                          <span className="skd-lh-the-tag">Thế</span>
                        ) : pLine.theUng === "Ứng" ? (
                          <span className="skd-lh-ung-tag">Ứng</span>
                        ) : null}
                      </td>
                      <td>{pLine.lucThan}</td>
                      <td>{pLine.chi}-{pLine.element}</td>
                      <td>{pLine.phucThan || "-"}</td>
                      <td>{pLine.tuanKhong || "-"}</td>
                      <td className="skd-lh-split">{cLine.lucThan}</td>
                      <td>{cLine.chi}-{cLine.element}</td>
                      <td>{cLine.lucThu}</td>
                      <td>{cLine.tuanKhong || "-"}</td>
                      <td><HaoMark position={cLine.position} isYang={cLine.isYang} moving={cLine.isTransformed} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 2: VƯỢNG SUY · QUÝ THẦN · TRƯỜNG SINH (khách khoanh đỏ) */}
          <div className="skd-lh-table-section">
            <div className="skd-lh-table-heading">
              <div>
                <span>Chu kỳ sinh vượng</span>
                <strong>Vượng Suy · Quý Thần · Trường Sinh</strong>
              </div>
              <small>Hào động được đánh dấu màu son</small>
            </div>
            <div className="skd-lh-table-wrap is-fit">
              <table className="skd-lh-table is-fit">
                <caption className="skd-visually-hidden">Bảng Vượng Suy, Quý Thần và Trường Sinh theo ngày, tháng của quẻ chủ và quẻ biến</caption>
                <colgroup>
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "8.5%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12.5%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "8.5%" }} />
                  <col style={{ width: "11.5%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead>
                  <tr className="skd-lh-table-group-row">
                    <th colSpan={5}>Quẻ chủ · {data.primary.name}</th>
                    <th colSpan={4}>Quẻ biến · {data.changed.name}</th>
                  </tr>
                  <tr>
                    <th>Hào</th>
                    <th title="Vượng Suy">V-S</th>
                    <th title="Quý Thần">Q.Thần</th>
                    <th title="Trường Sinh theo ngày">T.S.Ngày</th>
                    <th title="Trường Sinh theo tháng">T.S.Tháng</th>
                    <th className="skd-lh-split">Hào</th>
                    <th title="Vượng Suy">V-S</th>
                    <th title="Trường Sinh theo ngày">T.S.Ngày</th>
                    <th title="Trường Sinh theo tháng">T.S.Tháng</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ pLine, cLine }) => (
                    <tr key={pLine.position} className={pLine.isMoving ? "skd-lh-row-moving" : ""}>
                      <td>{pLine.can} {pLine.chi}</td>
                      <td>{pLine.vuongTuong}</td>
                      <td>{shortStage(pLine.quyThan)}</td>
                      <td title={pLine.tsNgay}>{shortStage(pLine.tsNgay)}</td>
                      <td title={pLine.tsThang}>{shortStage(pLine.tsThang)}</td>
                      <td className="skd-lh-split">{cLine.can} {cLine.chi}</td>
                      <td>{cLine.vuongTuong}</td>
                      <td title={cLine.tsNgay}>{shortStage(cLine.tsNgay)}</td>
                      <td title={cLine.tsThang}>{shortStage(cLine.tsThang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="skd-lh-table-legend">
              T.Sinh: Trường Sinh · M.Dục: Mộc Dục · Q.Đới: Quan Đới · L.Quan: Lâm Quan · Đ.Vượng: Đế Vượng · Q.Nhân: Quý Nhân ·
              P.Thần: Phục Thần · T.K: Tuần Không (K)
            </p>
          </div>
    </>
  );
}
