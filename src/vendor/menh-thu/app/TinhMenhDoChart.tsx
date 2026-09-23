// @ts-nocheck
"use client";

import React, { useSyncExternalStore } from "react";
import { Ns as TinhMenhDoZiweiSvg, xs as TinhMenhDoBaziSvg } from "../lib/tinhmenhdo/AppLaSo.Bez_E1-7.js";
import BaziGraphPanel from "../lib/tinhmenhdo/BaziGraphPanel.C9qXcAKx.js";
import TinhMenhDoAiAndGuide from "./TinhMenhDoAiAndGuide";
import { isHoroMapReadyForSvg, stabilizeHoroMapForSvg, type SvgHoroData } from "./horo-svg-guard";


const emptySubscribe = () => () => {};

export type HoroData = SvgHoroData;

interface TinhMenhDoChartProps {
  horoMap?: unknown;
  isFourPillarsMode?: boolean;
}

interface ChartRenderBoundaryProps {
  children: React.ReactNode;
  fallbackClassName: string;
  resetKey: unknown;
}

class ChartRenderBoundary extends React.Component<ChartRenderBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("Không thể vẽ lá số SVG:", error);
  }

  componentDidUpdate(previousProps: ChartRenderBoundaryProps) {
    if (this.state.failed && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className={`${this.props.fallbackClassName} bazi-chart-fallback`} role="alert">
          <strong>Chưa thể vẽ lá số</strong>
          <span>Dữ liệu vừa thay đổi chưa hoàn chỉnh. Hãy bấm “Xem lá số” để thử lại.</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TinhMenhDoChart({ horoMap, isFourPillarsMode = false }: TinhMenhDoChartProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [selectedBaziTab, setSelectedBaziTab] = React.useState<string | number>("BASE");
  const raw = horoMap as HoroData | null | undefined;
  const stableHoroMap = React.useMemo(() => raw ? stabilizeHoroMapForSvg(raw) : raw, [raw]);

  if (!isClient || !isHoroMapReadyForSvg(stableHoroMap)) return null;

  if (isFourPillarsMode) {
    const padZone = 27;
    const colW = 960 / 4;
    const borderOutWith = 1;
    const borderInnerWith = 1;
    const contentStartY = 1 + padZone / 2;
    const xBox = 1 + padZone / 2;
    const xBox14 = xBox + colW;
    const xBox12 = xBox + borderInnerWith + 2 * colW;
    const xBox34 = xBox + 2 * borderInnerWith + 3 * colW;
    const xBox4 = xBox + 3 * borderInnerWith + 4 * colW;

    const baziHoroMap = stableHoroMap.cfg[1] === 9 ? stableHoroMap : {
      ...stableHoroMap,
      cfg: Object.assign([...stableHoroMap.cfg], { 1: 9 }),
    };

    return (
      <div className="bazi-reference-board bazi-full-view-container w-full">
        <div id="tutru-svg-container" className="bazi-reference-board">
          <ChartRenderBoundary fallbackClassName="bazi-reference-board" resetKey={stableHoroMap}>
            <TinhMenhDoBaziSvg
              ls={baziHoroMap}
              wSquare={colW}
              padZone={padZone}
              borderOutWith={borderOutWith}
              borderInnerWith={borderInnerWith}
              contentStartY={contentStartY}
              xBox={xBox}
              xBox14={xBox14}
              xBox12={xBox12}
              xBox34={xBox34}
              xBox4={xBox4}
              color={["", "", "#051d52ff", "#067b11", "#8b8380", "#e39e25", "#cf233b"]}
              fontFamilySet="Roboto Slab"
              fontCenter={16}
              fontDV={15}
              padContent={8}
              cfgLs={baziHoroMap.cfg}
              selectedTab={selectedBaziTab}
            />
          </ChartRenderBoundary>
        </div>
        <div className="bazi-panel-below mt-6 w-full">
          <ChartRenderBoundary fallbackClassName="bazi-graph-fallback" resetKey={baziHoroMap}>
            <BaziGraphPanel
              lsObj={baziHoroMap}
              selectedTab={selectedBaziTab}
              setSelectedTab={setSelectedBaziTab}
            />
          </ChartRenderBoundary>
          <TinhMenhDoAiAndGuide horoMap={baziHoroMap} />
        </div>
      </div>
    );
  }

  const typeLs = stableHoroMap.cfg[1] ?? 0;
  const extraH = 75 * Math.max(0, (stableHoroMap.css ?? 11) - 11);
  const lsWidth = 742;
  const lsHeight = 960 + extraH;
  const padContent = ([4, 5].includes(typeLs)) ? 8 : 5;

  const configHoro = {
    fontDV: 15,
    fontPhuTinh: 15,
    fontChinhTinh: 16,
    fontCenter: 16,
    fontFamilySet: "Roboto Slab",
    colorHoa: ["rgb(3 140 0)", "rgb(110 8 136)", "rgb(14 124 202)", "rgb(217 4 4)"],
    colorHoaFill: ["rgba(114,250,112,0.9)", "rgba(227,100,255,0.9)", "rgba(77,182,255,0.9)", "rgba(246,66,66,0.9)"],
    colorHoaStart: ["rgb(3 140 0 / 75%)", "rgb(110 8 136 / 75%)", "rgb(14 124 202 / 75%)", "rgb(217 4 4 / 75%)"],
    colorHoaFill60: ["rgba(114,250,112,0.5)", "rgba(227,100,255,0.5)", "rgba(77,182,255,0.5)", "rgba(246,66,66,0.5)"],
    bColor: ["", "", "#051d52ff", "#04973c", "#919191", "#e39e25", "#e73827"],
    color: ["", "", "#051d52ff", "#067b11", "#8b8380", "#e39e25", "#cf233b"],
    version: "2026.08.17",
  };

  return (
    <div id="tutru-svg-container" className="ziwei-reference-board">
      <ChartRenderBoundary fallbackClassName="ziwei-reference-board" resetKey={stableHoroMap}>
        <TinhMenhDoZiweiSvg
          typeLs={typeLs}
          ls={stableHoroMap}
          lsWidth={lsWidth}
          lsHeight={lsHeight}
          configHoro={configHoro}
          padContent={padContent}
        />
      </ChartRenderBoundary>
    </div>
  );
}
