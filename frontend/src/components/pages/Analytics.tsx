// @ts-nocheck
import React from 'react';
import { Activity, Download, TrendingUp } from 'lucide-react';

interface AnalyticsProps {
  selectedBrands?: string[];
}

const Analytics: React.FC<AnalyticsProps> = ({ selectedBrands = [] }) => {
  // Note: Brand filtering will be implemented when backend API supports brand-specific analytics
  // Mock data for citation trend (last 30 days)
  const citationData = [
    { day: 1, citations: 245 },
    { day: 5, citations: 268 },
    { day: 10, citations: 289 },
    { day: 15, citations: 312 },
    { day: 20, citations: 334 },
    { day: 25, citations: 356 },
    { day: 30, citations: 389 }
  ];

  // Calculate chart dimensions
  const maxCitations = Math.max(...citationData.map(d => d.citations));
  const minCitations = Math.min(...citationData.map(d => d.citations));
  const chartHeight = 200;
  const chartWidth = 500;
  const padding = 40;

  // Generate SVG path for line chart
  const points = citationData.map((d, i) => {
    const x = padding + (i / (citationData.length - 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - ((d.citations - minCitations) / (maxCitations - minCitations)) * (chartHeight - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Hub</h1>
          <p className="text-gray-600 mt-1">Comprehensive performance insights and attribution</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 3 Months</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">AI Citation Trend</h2>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">+15% this month</span>
            </div>
          </div>
          <div className="relative">
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = padding + (i * (chartHeight - 2 * padding) / 4);
                return (
                  <line
                    key={i}
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area under line */}
              <polygon
                points={`${padding},${chartHeight - padding} ${points} ${chartWidth - padding},${chartHeight - padding}`}
                fill="url(#gradient)"
                opacity="0.3"
              />

              {/* Line */}
              <polyline
                points={points}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {citationData.map((d, i) => {
                const x = padding + (i / (citationData.length - 1)) * (chartWidth - 2 * padding);
                const y = chartHeight - padding - ((d.citations - minCitations) / (maxCitations - minCitations)) * (chartHeight - 2 * padding);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="white" stroke="#3B82F6" strokeWidth="2" />
                    <circle cx={x} cy={y} r="2" fill="#3B82F6" />
                  </g>
                );
              })}

              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = padding + (i * (chartHeight - 2 * padding) / 4);
                const value = Math.round(maxCitations - (i * (maxCitations - minCitations) / 4));
                return (
                  <text
                    key={i}
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#6B7280"
                  >
                    {value}
                  </text>
                );
              })}

              {/* X-axis labels */}
              {citationData.map((d, i) => {
                const x = padding + (i / (citationData.length - 1)) * (chartWidth - 2 * padding);
                return (
                  <text
                    key={i}
                    x={x}
                    y={chartHeight - padding + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6B7280"
                  >
                    Day {d.day}
                  </text>
                );
              })}

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{citationData[0].citations}</p>
              <p className="text-xs text-gray-500">Start</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Math.round(citationData.reduce((sum, d) => sum + d.citations, 0) / citationData.length)}</p>
              <p className="text-xs text-gray-500">Average</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{citationData[citationData.length - 1].citations}</p>
              <p className="text-xs text-gray-500">Current</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Platform Performance</h2>
          <div className="space-y-4">
            {[
              { platform: 'YouTube', citations: 456, performance: 85, color: 'red' },
              { platform: 'Medium', citations: 312, performance: 72, color: 'green' },
              { platform: 'Reddit', citations: 289, performance: 68, color: 'orange' },
              { platform: 'Quora', citations: 234, performance: 64, color: 'blue' }
            ].map((item) => (
              <div key={item.platform}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{item.platform}</span>
                  <span className="text-gray-600">{item.citations} citations</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`bg-${item.color}-500 h-2 rounded-full`}
                    style={{ width: `${item.performance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Content ROI Analysis</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 text-sm font-medium text-gray-700">Content</th>
                <th className="text-center py-3 text-sm font-medium text-gray-700">Impressions</th>
                <th className="text-center py-3 text-sm font-medium text-gray-700">Clicks</th>
                <th className="text-center py-3 text-sm font-medium text-gray-700">Orders</th>
                <th className="text-center py-3 text-sm font-medium text-gray-700">Revenue</th>
                <th className="text-center py-3 text-sm font-medium text-gray-700">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { content: 'Best Cooling Mattress Review', impressions: 23456, clicks: 1234, orders: 45, revenue: '$13,473', roi: '670%' },
                { content: 'Summer Sleep Guide', impressions: 18902, clicks: 987, orders: 32, revenue: '$9,587', roi: '520%' },
                { content: 'Memory Foam Comparison', impressions: 15678, clicks: 856, orders: 28, revenue: '$8,392', roi: '485%' }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 text-sm">{row.content}</td>
                  <td className="text-center py-3 text-sm">{row.impressions.toLocaleString()}</td>
                  <td className="text-center py-3 text-sm">{row.clicks.toLocaleString()}</td>
                  <td className="text-center py-3 text-sm">{row.orders}</td>
                  <td className="text-center py-3 text-sm font-medium">{row.revenue}</td>
                  <td className="text-center py-3 text-sm font-bold text-green-600">{row.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
