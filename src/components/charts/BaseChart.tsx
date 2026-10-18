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

function enhanceSeriesPopups(opt: EChartsOption): EChartsOption {
  if (!opt || !opt.series) return opt;
  const seriesRaw = Array.isArray(opt.series) ? opt.series : [opt.series];

  const enhancedSeries = seriesRaw.map((s: any) => {
    if (!s || typeof s !== "object") return s;
    const type = s.type || "line";
    const existingEmphasis = s.emphasis || {};

    if (type === "line") {
      return {
        ...s,
        showSymbol: true,
        symbol: s.symbol || "circle",
        symbolSize: s.symbolSize || 7,
        emphasis: {
          focus: "series",
          scale: 2.6,
          itemStyle: {
            shadowBlur: 22,
            shadowColor: "rgba(0, 0, 0, 0.5)",
            borderWidth: 3.5,
            borderColor: "#FFFFFF",
            ...(existingEmphasis.itemStyle || {})
          },
          lineStyle: {
            width: (s.lineStyle?.width || 2.5) + 1.2,
            shadowBlur: 14,
            shadowColor: "rgba(0, 0, 0, 0.25)",
            ...(existingEmphasis.lineStyle || {})
          },
          ...existingEmphasis
        }
      };
    }

    if (type === "bar") {
      return {
        ...s,
        emphasis: {
          focus: "series",
          itemStyle: {
            shadowBlur: 26,
            shadowOffsetY: -7,
            shadowColor: "rgba(0, 0, 0, 0.38)",
            borderRadius: Array.isArray(s.itemStyle?.borderRadius) ? s.itemStyle.borderRadius : [6, 6, 0, 0],
            ...(existingEmphasis.itemStyle || {})
          },
          ...existingEmphasis
        }
      };
    }

    if (type === "pie") {
      return {
        ...s,
        emphasis: {
          scale: true,
          scaleSize: 14,
          itemStyle: {
            shadowBlur: 28,
            shadowColor: "rgba(0, 0, 0, 0.45)",
            ...(existingEmphasis.itemStyle || {})
          },
          ...existingEmphasis
        }
      };
    }

    return {
      ...s,
      emphasis: {
        focus: "series",
        itemStyle: {
          shadowBlur: 20,
          shadowColor: "rgba(0, 0, 0, 0.3)",
          ...(existingEmphasis.itemStyle || {})
        },
        ...existingEmphasis
      }
    };
  });

  return {
    ...opt,
    series: enhancedSeries
  };
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
    const enhancedOption = enhanceSeriesPopups(option);
    instance.setOption(enhancedOption, true);

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
