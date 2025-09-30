"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { ChartSpec } from "@/types/ai";

const COLORS = [
  "#2563eb",
  "#f97316",
  "#10b981",
  "#ec4899",
  "#8b5cf6",
];

export interface InlineChartProps {
  spec: ChartSpec;
}

const InlineChart: React.FC<InlineChartProps> = ({ spec }) => {
  const { type, data, xKey, yKeys, title, config } = spec;

  if (!data?.length) {
    return null;
  }

  const renderLineSeries = (keys: string[]) =>
    keys.map((key, index) => (
      <Line
        key={key}
        type="monotone"
        dataKey={key}
        stroke={COLORS[index % COLORS.length]}
        strokeWidth={2}
        dot={false}
      />
    ));

  const renderBarSeries = (keys: string[]) =>
    keys.map((key, index) => (
      <Bar
        key={key}
        dataKey={key}
        fill={COLORS[index % COLORS.length]}
        radius={4}
      />
    ));

  const renderContent = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {renderLineSeries(yKeys)}
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {renderBarSeries(yKeys)}
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <defs>
              {yKeys.map((key, index) => (
                <linearGradient
                  key={key}
                  id={`color-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={COLORS[index % COLORS.length]}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS[index % COLORS.length]}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {yKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                fill={`url(#color-${key})`}
                fillOpacity={1}
              />
            ))}
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={data}
              dataKey={yKeys[0]}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={70}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${entry[xKey]}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return (
          <pre className="inline-chart__fallback">
            {JSON.stringify({ type, data, xKey, yKeys, config }, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="inline-chart">
      {title && <h4 className="inline-chart__title">{title}</h4>}
      <div className="inline-chart__canvas">
        <ResponsiveContainer width="100%" height={240}>
          {renderContent()}
        </ResponsiveContainer>
      </div>
      {config?.note && (
        <p className="inline-chart__note">{config.note}</p>
      )}
    </div>
  );
};

export default InlineChart;
