"use client";

import { memo, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BurnoutChartProps {
  data: Array<{ date: string; mood: number }>;
  burnoutScore: number;
}

export const BurnoutChart = memo(function BurnoutChart({ data, burnoutScore }: BurnoutChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: d.date,
        mood: d.mood,
        burnout: burnoutScore,
      })),
    [data, burnoutScore],
  );

  return (
    <div
      role="img"
      aria-label={`Area chart showing mood trend over ${data.length} days. Current burnout score ${burnoutScore}.`}
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 91%, 65%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(217, 91%, 65%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
          <XAxis dataKey="date" stroke="hsl(215, 20%, 65%)" fontSize={12} />
          <YAxis domain={[1, 5]} stroke="hsl(215, 20%, 65%)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(222, 47%, 9%)",
              border: "1px solid hsl(217, 33%, 18%)",
              borderRadius: "8px",
            }}
          />
          <Area
            type="monotone"
            dataKey="mood"
            name="Mood"
            stroke="hsl(217, 91%, 65%)"
            fill="url(#moodGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

BurnoutChart.displayName = "BurnoutChart";
