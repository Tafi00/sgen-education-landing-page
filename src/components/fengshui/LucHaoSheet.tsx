import "../../styles/sim-phong-thuy.css";
import type { SimLucHaoData } from "../../../shared/sim/sim-phong-thuy-engine";

/**
 * Lá quẻ Lục Hào dùng chung cho Bói sim và Gieo quẻ: quẻ chủ → quẻ biến, Lục Thân, Can Chi, Lục Thú,
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

          {/* META INFO */}
          <div className="skd-lh-meta-box">
            <div className="skd-lh-meta-item">
              <span>Dương lịch</span>
              <strong>{data.meta.solarDateTime}</strong>
            </div>
            <div className="skd-lh-meta-item">
              <span>Âm lịch</span>
              <strong>{data.meta.lunarDateTime}</strong>
            </div>
            <div className="skd-lh-meta-item is-wide">
              <span>Tứ trụ Can Chi</span>
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

          {/* TABLE 1: THÂN HÀO & CAN CHI */}
          <div className="skd-lh-table-section">
            <div className="skd-lh-table-heading">
              <div>
                <span>Chi tiết Lục Hào</span>
                <strong>Lục Thân · Can Chi · Lục Thú</strong>
              </div>
              <small>Vuốt ngang để xem đầy đủ</small>
            </div>
            <div
              className="skd-lh-table-wrap"
              role="region"
              aria-label="Bảng chi tiết Lục Thân, Can Chi và Lục Thú"
              tabIndex={0}
            >
              <table className="skd-lh-table">
                <caption className="skd-visually-hidden">Bảng Lục Thân, Can Chi và Lục Thú của quẻ chủ và quẻ biến</caption>
                <thead>
                  <tr className="skd-lh-table-group-row">
                    <th colSpan={6}>Quẻ chủ · {data.primary.name}</th>
                    <th colSpan={5}>Quẻ biến · {data.changed.name}</th>
                  </tr>
                  <tr>
                  <th style={{ width: "45px" }}>Hào</th>
                  <th style={{ width: "50px" }}>T/Ư</th>
                  <th>Lục Thân</th>
                  <th>Can Chi</th>
                  <th style={{ width: "55px" }}>P.Thần</th>
                  <th style={{ width: "45px" }}>T.K</th>
                  <th>Lục Thân</th>
                  <th>Can Chi</th>
                  <th>Lục Thú</th>
                  <th style={{ width: "45px" }}>T.K</th>
                  <th style={{ width: "45px" }}>Hào</th>
                  </tr>
                </thead>
                <tbody>
                {rows.map(({ pLine, cLine }) => {
                  const isMoving = pLine.isMoving;

                  return (
                    <tr key={pLine.position} className={isMoving ? "skd-lh-row-moving" : ""}>
                      {/* Quẻ Chủ: Hào */}
                      <td style={{ fontWeight: "700" }}>{pLine.position} {pLine.symbol}</td>
                      {/* Quẻ Chủ: T/Ư */}
                      <td>
                        {pLine.theUng === "Thế" ? (
                          <span className="skd-lh-the-tag">Thế</span>
                        ) : pLine.theUng === "Ứng" ? (
                          <span className="skd-lh-ung-tag">Ứng</span>
                        ) : (
                          ""
                        )}
                      </td>
                      {/* Quẻ Chủ: Lục Thân */}
                      <td style={{ fontWeight: isMoving ? "700" : "500" }}>{pLine.lucThan}</td>
                      {/* Quẻ Chủ: Can Chi */}
                      <td style={{ fontWeight: isMoving ? "700" : "500" }}>{pLine.canChi}</td>
                      {/* Quẻ Chủ: P.Thần */}
                      <td>{pLine.phucThan}</td>
                      {/* Quẻ Chủ: T.K */}
                      <td>{pLine.tuanKhong}</td>

                      {/* Quẻ Biến: Lục Thân */}
                      <td style={{ fontWeight: isMoving ? "700" : "500" }}>{cLine.lucThan}</td>
                      {/* Quẻ Biến: Can Chi */}
                      <td style={{ fontWeight: isMoving ? "700" : "500" }}>{cLine.canChi}</td>
                      {/* Quẻ Biến: Lục Thú */}
                      <td>{cLine.lucThu}</td>
                      {/* Quẻ Biến: T.K */}
                      <td>{cLine.tuanKhong}</td>
                      {/* Quẻ Biến: Hào */}
                      <td style={{ fontWeight: "700" }}>{cLine.symbol} {cLine.position}</td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 2: VƯỢNG TƯỚNG & TRƯỜNG SINH */}
          <div className="skd-lh-table-section">
            <div className="skd-lh-table-heading">
              <div>
                <span>Chu kỳ sinh vượng</span>
                <strong>Vượng Suy · Quý Thần · Trường Sinh</strong>
              </div>
              <small>Hào động được đánh dấu màu son</small>
            </div>
            <div
              className="skd-lh-table-wrap"
              role="region"
              aria-label="Bảng Vượng Suy, Quý Thần và Trường Sinh"
              tabIndex={0}
            >
              <table className="skd-lh-table">
                <caption className="skd-visually-hidden">Bảng Vượng Suy, Quý Thần và Trường Sinh của quẻ chủ và quẻ biến</caption>
                <thead>
                  <tr className="skd-lh-table-group-row">
                    <th colSpan={5}>Quẻ chủ · {data.primary.name}</th>
                    <th colSpan={4}>Quẻ biến · {data.changed.name}</th>
                  </tr>
                  <tr>
                  <th>Hào</th>
                  <th>V-S</th>
                  <th>Q.Thần</th>
                  <th>T.S-Ngày</th>
                  <th>T.S-Tháng</th>
                  <th>Hào</th>
                  <th>V-S</th>
                  <th>T.S-Ngày</th>
                  <th>T.S-Tháng</th>
                  </tr>
                </thead>
                <tbody>
                {rows.map(({ pLine, cLine }) => {
                  const isMoving = pLine.isMoving;

                  return (
                    <tr key={pLine.position} className={isMoving ? "skd-lh-row-moving" : ""}>
                      {/* Quẻ Chủ: Hào */}
                      <td style={{ fontWeight: isMoving ? "700" : "600" }}>{pLine.canChiFull}</td>
                      {/* Quẻ Chủ: V-S */}
                      <td>{pLine.vuongTuong}</td>
                      {/* Quẻ Chủ: Q.Thần */}
                      <td>{pLine.quyThan}</td>
                      {/* Quẻ Chủ: T.S Ngày */}
                      <td>{pLine.tsNgay}</td>
                      {/* Quẻ Chủ: T.S Tháng */}
                      <td>{pLine.tsThang}</td>

                      {/* Quẻ Biến: Hào */}
                      <td style={{ fontWeight: isMoving ? "700" : "600" }}>{cLine.canChiFull}</td>
                      {/* Quẻ Biến: V-S */}
                      <td>{cLine.vuongTuong}</td>
                      {/* Quẻ Biến: T.S Ngày */}
                      <td>{cLine.tsNgay}</td>
                      {/* Quẻ Biến: T.S Tháng */}
                      <td>{cLine.tsThang}</td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
    </>
  );
}
