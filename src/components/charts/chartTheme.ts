import { formatCurrency, formatNumber } from "../../utils/formatters";

export interface ChartThemeConfig {
  isDark: boolean;
  colors: string[];
  gridLines: boolean;
  currencySymbol: string;
}

export function createTooltipFormatter(currency = false, currencySymbol = "₹") {
  return function (params: unknown): string {
    const items = Array.isArray(params) ? params : [params];
    if (items.length === 0) return "";

    const first = items[0] as { name?: string; axisValueLabel?: string };
    const title = first.axisValueLabel || first.name || "";

    let html = `<div style="padding: 10px 14px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; min-width: 140px;">`;
    if (title) {
      html += `<div style="font-size: 12px; font-weight: 500; color: #8E9196; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;">${title}</div>`;
    }

    for (const item of items) {
      const data = item as {
        color?: string;
        seriesName?: string;
        value?: number | [string, number];
        data?: { name?: string; value?: number };
      };
      const seriesName = data.seriesName || (data.data && data.data.name) || "";
      const rawVal = Array.isArray(data.value) ? data.value[1] : (data.value ?? (data.data && data.data.value) ?? 0);
      const valStr = currency
        ? formatCurrency(Number(rawVal), false, currencySymbol)
        : formatNumber(Number(rawVal));

      html += `<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 4px; font-size: 13px;">
        <span style="display: flex; align-items: center; gap: 6px; color: inherit;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${data.color || "#3E6AE1"};"></span>
          <span>${seriesName}</span>
        </span>
        <span style="font-variant-numeric: tabular-nums; font-weight: 500;">${valStr}</span>
      </div>`;
    }

    html += `</div>`;
    return html;
  };
}

export function getBaseEChartsOption(theme: ChartThemeConfig) {
  const textColor = theme.isDark ? "#A0A5AB" : "#5C5E62";
  const lineColor = theme.isDark ? "#262A30" : "#EDEDED";
  const bgCard = theme.isDark ? "#181B1F" : "#FFFFFF";

  return {
    color: theme.colors,
    textStyle: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: 11,
      color: textColor
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: bgCard,
      borderColor: lineColor,
      borderWidth: 1,
      borderRadius: 12,
      padding: 0,
      axisPointer: {
        type: "line",
        lineStyle: {
          color: theme.isDark ? "rgba(255, 255, 255, 0.22)" : "rgba(0, 0, 0, 0.14)",
          width: 1.5,
          type: "dashed"
        },
        shadowStyle: {
          color: theme.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)"
        }
      },
      extraCssText: theme.isDark
        ? "box-shadow: 0 14px 32px rgba(0,0,0,0.5); color: #F4F5F6;"
        : "box-shadow: 0 10px 28px rgba(16,24,40,0.12); color: #171A20;"
    },
    grid: {
      left: 12,
      right: 12,
      top: 36,
      bottom: 24,
      containLabel: true
    },
    xAxis: {
      type: "category",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: textColor,
        fontSize: 11,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: theme.gridLines,
        lineStyle: {
          color: lineColor,
          type: "solid"
        }
      },
      axisLabel: {
        color: textColor,
        fontSize: 11,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }
    }
  };
}
