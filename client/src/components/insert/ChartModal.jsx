import React, { useState, useRef, useEffect } from 'react';
import { X, BarChart3, Plus, Trash2 } from 'lucide-react';

const PALETTE = ['#4285f4', '#ea4335', '#fbbc05', '#34a853', '#9333ea', '#f97316', '#06b6d4', '#ec4899'];

const ChartModal = ({ isOpen, onClose, editor }) => {
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line' | 'pie'
  const [chartTitle, setChartTitle] = useState('Quarterly Growth');
  const [dataPoints, setDataPoints] = useState([
    { label: 'Q1', value: 25 },
    { label: 'Q2', value: 40 },
    { label: 'Q3', value: 35 },
    { label: 'Q4', value: 60 }
  ]);

  const canvasRef = useRef(null);

  // Redraw canvas on changes
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(chartTitle || 'Chart', width / 2, 32);

    const values = dataPoints.map((d) => Number(d.value) || 0);
    const maxVal = Math.max(...values, 10);
    const plotTop = 60;
    const plotBottom = height - 50;
    const plotHeight = plotBottom - plotTop;
    const plotLeft = 60;
    const plotRight = width - 40;
    const plotWidth = plotRight - plotLeft;

    if (chartType === 'bar') {
      // Y Axis Lines
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = plotBottom - (plotHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(plotLeft, y);
        ctx.lineTo(plotRight, y);
        ctx.stroke();

        ctx.fillStyle = '#9ca3af';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round((maxVal / 4) * i), plotLeft - 8, y + 4);
      }

      // Draw Bars
      const barCount = dataPoints.length;
      const barWidth = Math.min(48, (plotWidth / barCount) * 0.65);
      const step = plotWidth / barCount;

      dataPoints.forEach((d, idx) => {
        const val = Number(d.value) || 0;
        const barH = (val / maxVal) * plotHeight;
        const x = plotLeft + idx * step + (step - barWidth) / 2;
        const y = plotBottom - barH;

        ctx.fillStyle = PALETTE[idx % PALETTE.length];
        ctx.fillRect(x, y, barWidth, barH);

        // Value text
        ctx.fillStyle = '#4b5563';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barWidth / 2, y - 6);

        // Label text
        ctx.fillText(d.label, x + barWidth / 2, plotBottom + 20);
      });
    } else if (chartType === 'line') {
      // Grid lines
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = plotBottom - (plotHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(plotLeft, y);
        ctx.lineTo(plotRight, y);
        ctx.stroke();
      }

      // Draw Line
      const step = plotWidth / Math.max(1, dataPoints.length - 1);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.beginPath();

      dataPoints.forEach((d, idx) => {
        const val = Number(d.value) || 0;
        const x = plotLeft + idx * step;
        const y = plotBottom - (val / maxVal) * plotHeight;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw points
      dataPoints.forEach((d, idx) => {
        const val = Number(d.value) || 0;
        const x = plotLeft + idx * step;
        const y = plotBottom - (val / maxVal) * plotHeight;

        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val, x, y - 10);
        ctx.fillText(d.label, x, plotBottom + 20);
      });
    } else if (chartType === 'pie') {
      const total = values.reduce((a, b) => a + b, 0) || 1;
      const centerX = width / 2;
      const centerY = plotTop + plotHeight / 2;
      const radius = Math.min(plotHeight / 2, 100);

      let startAngle = -Math.PI / 2;

      dataPoints.forEach((d, idx) => {
        const val = Number(d.value) || 0;
        const sliceAngle = (val / total) * Math.PI * 2;

        ctx.fillStyle = PALETTE[idx % PALETTE.length];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        startAngle += sliceAngle;
      });

      // Legend
      const legendY = plotBottom + 18;
      const totalWidth = dataPoints.length * 80;
      let startX = Math.max(20, (width - totalWidth) / 2);

      dataPoints.forEach((d, idx) => {
        ctx.fillStyle = PALETTE[idx % PALETTE.length];
        ctx.fillRect(startX, legendY - 8, 10, 10);
        ctx.fillStyle = '#374151';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${d.label} (${d.value})`, startX + 14, legendY);
        startX += 80;
      });
    }
  }, [isOpen, chartType, chartTitle, dataPoints]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setDataPoints((prev) => [...prev, { label: `Item ${prev.length + 1}`, value: 10 }]);
  };

  const handleRemoveRow = (index) => {
    if (dataPoints.length <= 1) return;
    setDataPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index, key, val) => {
    setDataPoints((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [key]: val } : d))
    );
  };

  const handleInsertChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    if (editor) {
      editor.chain().focus().setImage({ src: dataUrl, alt: chartTitle || 'Chart' }).run();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chart-modal-title"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 id="chart-modal-title" className="text-base font-semibold text-gray-900">
              Insert chart
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Controls & Data Table */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Chart title</label>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1.5">Chart type</label>
              <div className="flex gap-2">
                {['bar', 'line', 'pie'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setChartType(t)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize transition cursor-pointer ${
                      chartType === t
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t} chart
                  </button>
                ))}
              </div>
            </div>

            {/* Data rows */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-600 font-medium">Data labels & values</label>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  <Plus className="w-3 h-3" /> Add item
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {dataPoints.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Label"
                      value={row.label}
                      onChange={(e) => handleUpdateRow(idx, 'label', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Value"
                      value={row.value}
                      onChange={(e) => handleUpdateRow(idx, 'value', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                    {dataPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Live Chart Preview
            </span>
            <canvas
              ref={canvasRef}
              width={300}
              height={220}
              className="w-full max-w-[300px] h-[220px] bg-white rounded-lg shadow-sm border border-gray-100"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-400">Renders as a crisp embedded image in the document</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200/60 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsertChart}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs"
            >
              Insert chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
