"use client";

import React from "react";

interface ProgressBarProps {
  value: number;
  color?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ value, color, showLabel = false }: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  let barColor = color;
  if (!barColor) {
    if (clampedValue >= 90 && clampedValue <= 110) {
      barColor = "bg-green-500";
    } else if (clampedValue > 110) {
      barColor = "bg-red-500";
    } else if (clampedValue >= 60) {
      barColor = "bg-yellow-500";
    } else {
      barColor = "bg-blue-500";
    }
  }

  return (
    <div className="w-full">
      <div className="h-2 rounded-full progress-bar-bg overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-slate-400 mt-1">{clampedValue.toFixed(0)}%</div>
      )}
    </div>
  );
}
