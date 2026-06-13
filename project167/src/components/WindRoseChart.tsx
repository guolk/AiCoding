import { useEffect, useRef } from 'react';
import type { WindRoseData } from '@/types';
import { WIND_DIRECTIONS } from '@/types';

interface WindRoseChartProps {
  data: WindRoseData;
  height?: number;
}

export default function WindRoseChart({ data, height = 400 }: WindRoseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;

    ctx.clearRect(0, 0, width, height);

    const maxFreq = Math.max(...data.directions.map((d) => d.frequency), 1);
    const rings = 5;

    for (let i = 1; i <= rings; i++) {
      const r = (maxRadius * i) / rings;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${((maxFreq * i) / rings).toFixed(0)}%`, centerX + r + 5, centerY);
    }

    WIND_DIRECTIONS.forEach((dir) => {
      const angle = (dir.angle * Math.PI) / 180 - Math.PI / 2;
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const labelR = maxRadius + 25;
      const labelX = centerX + labelR * Math.cos(angle);
      const labelY = centerY + labelR * Math.sin(angle);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 12px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dir.name, labelX, labelY);
    });

    const colors = [
      'rgba(16, 185, 129, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)',
    ];

    data.directions.forEach((dir, dirIdx) => {
      const angle = (dir.angle * Math.PI) / 180 - Math.PI / 2;
      let currentRadius = 0;

      dir.speedRanges.forEach((range, rangeIdx) => {
        if (range.frequency <= 0) return;

        const barWidth = (2 * Math.PI) / 16 - 0.15;
        const startAngle = angle - barWidth / 2;
        const endAngle = angle + barWidth / 2;
        const innerRadius = (currentRadius / maxFreq) * maxRadius;
        const outerRadius = ((currentRadius + range.frequency) / maxFreq) * maxRadius;

        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, startAngle, endAngle, false);
        ctx.arc(centerX, centerY, outerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[rangeIdx % colors.length];
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        currentRadius += range.frequency;
      });
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('静风', centerX, centerY);

    const legendY = height - 25;
    const legendStartX = 20;

    ctx.font = '11px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'left';

    let legendX = legendStartX;
    if (data.directions.length > 0 && data.directions[0].speedRanges) {
      data.directions[0].speedRanges.forEach((range, idx) => {
        ctx.fillStyle = colors[idx % colors.length];
        ctx.fillRect(legendX, legendY - 6, 12, 12);
        ctx.fillStyle = '#475569';
        ctx.fillText(`${range.range} m/s`, legendX + 18, legendY + 3);
        legendX += 90;
      });
    }
  }, [data, height]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
      />
      <div className="mt-4 text-center text-sm text-slate-500">
        <span className="mr-4">总观测次数: {data.totalObservations}</span>
        <span>静风频率: {data.calmFrequency.toFixed(1)}%</span>
      </div>
    </div>
  );
}
