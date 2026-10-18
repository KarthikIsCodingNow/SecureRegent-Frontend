import React, { useEffect, useRef } from "react";
import echarts, { EChartsOption } from "./echartsConfig";

export interface ChartClickParams {
  name: string;
  seriesName?: string;
  dataIndex?: number;
  value?: unknown;
}

export interface BaseChartProps {
  option: EChartsOption;
  height?: number | string;
  className?: string;
  ariaLabel: string;
  tableSummary?: { headers: string[]; rows: (string | number)[][] };
  onChartClick?: (params: ChartClickParams) => void;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  option,
  height = 320,
  className = "",
  ariaLabel,
  tableSummary,
  onChartClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(containerRef.current, undefined, {
        renderer: "canvas"
      });

      if (onChartClick) {
        chartInstanceRef.current.on("click", (params: { name?: string; seriesName?: string; dataIndex?: number; value?: unknown }) => {
          onChartClick({
            name: params.name || "",
            seriesName: params.seriesName,
            dataIndex: params.dataIndex,
            value: params.value
          });
        });
      }
    }

    const instance = chartInstanceRef.current;
    instance.setOption(option, true);

    const resizeObserver = new ResizeObserver(() => {
      instance.resize();
    });

    resizeObserver.observe(containerRef.current);

    // Call resize across animation frames to guarantee full dimensions inside animated modals/drawers
    const t1 = setTimeout(() => instance.resize(), 50);
    const t2 = setTimeout(() => instance.resize(), 200);
    const t3 = setTimeout(() => instance.resize(), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
    };
  }, [option, onChartClick]);

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={containerRef}
        style={{ height, width: "100%" }}
        role="img"
        aria-label={ariaLabel}
      />
      {tableSummary && (
        <table className="sr-only">
          <caption>{ariaLabel}</caption>
          <thead>
            <tr>
              {tableSummary.headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableSummary.rows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
