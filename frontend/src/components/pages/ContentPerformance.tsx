// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Activity, TrendingUp, Eye, Heart, MessageCircle, Share2, Target, Award } from 'lucide-react';

interface ContentPerformanceProps {
  selectedBrands?: string[];
}

const ContentPerformance: React.FC<ContentPerformanceProps> = ({ selectedBrands = [] }) => {
  const [timeRange, setTimeRange] = useState('7d');

  // Map project names to brand IDs for filtering
  const projectToBrandMap: { [key: string]: string } = {
    'SweetNight': 'sweetnight',
    'Eufy': 'eufy',
    'Hisense': 'hisense'
  };

  const allPerformingContent = [
    {
      id: 1,
      title: 'Best Cooling Mattress for Hot Sleepers 2025',
      platform: 'Medium',
      published: '2025-01-05',
      views: 45200,
      engagements: 3240,
      shares: 892,
      citationRate: 0.38,
      project: 'SweetNight'
    },
    {
      id: 2,
      title: 'Eufy X10 Pro vs Roborock S8 Pro Ultra',
      platform: 'YouTube',
      published: '2025-01-03',
      views: 82100,
      engagements: 6540,
      shares: 1520,
      citationRate: 0.42,
      project: 'Eufy'
    },
    {
      id: 3,
      title: 'Hisense U8K Gaming TV - Complete Review',
      platform: 'Reddit',
      published: '2025-01-02',
      views: 28400,
      engagements: 2180,
      shares: 450,
      citationRate: 0.29,
      project: 'Hisense'
    },
    {
      id: 4,
      title: 'Robot Vacuum Maintenance Guide',
      platform: 'Quora',
      published: '2024-12-30',
      views: 19600,
      engagements: 1420,
      shares: 320,
      citationRate: 0.25,
      project: 'Eufy'
    },
    {
      id: 5,
      title: 'Memory Foam vs Spring Mattress Comparison',
      platform: 'LinkedIn',
      published: '2024-12-28',
      views: 15800,
      engagements: 980,
      shares: 210,
      citationRate: 0.22,
      project: 'SweetNight'
    }
  ];

  // Filter and sort performing content based on selected brands
  const topPerformingContent = useMemo(() => {
    let filtered = allPerformingContent;

    if (selectedBrands && selectedBrands.length > 0) {
      filtered = allPerformingContent.filter(content => {
        const brandId = projectToBrandMap[content.project];
        return selectedBrands.includes(brandId);
      });
    }

    // Sort by citation rate (descending)
    return filtered.sort((a, b) => b.citationRate - a.citationRate);
  }, [selectedBrands, allPerformingContent]);

  const performanceMetrics = [
    { label: 'Total Views', value: '1.2M', change: '+15.3%', icon: Eye, color: 'blue' },
    { label: 'Engagements', value: '89.4K', change: '+22.1%', icon: Heart, color: 'red' },
    { label: 'Shares', value: '12.8K', change: '+18.7%', icon: Share2, color: 'green' },
    { label: 'Avg Citation Rate', value: '31.2%', change: '+4.2%', icon: Target, color: 'purple' }
  ];

  const platformPerformance = [
    { platform: 'YouTube', views: 425000, engagement: 8.2, citationRate: 0.34 },
    { platform: 'Medium', views: 318000, engagement: 7.1, citationRate: 0.32 },
    { platform: 'Reddit', views: 289000, engagement: 7.8, citationRate: 0.28 },
    { platform: 'Quora', views: 156000, engagement: 7.3, citationRate: 0.30 },
    { platform: 'LinkedIn', views: 89000, engagement: 6.2, citationRate: 0.27 }
  ];

  const getMetricColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      red: 'bg-red-100 text-red-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Performance</h1>
          <p className="text-gray-600 mt-1">Analyze engagement and citation metrics across platforms</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${getMetricColor(metric.color)}`}>
                <metric.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {metric.change}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.label}</h3>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Performance Comparison */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Performance Comparison</h2>
        <div className="space-y-4">
          {platformPerformance.map((platform) => (
            <div key={platform.platform} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{platform.platform}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  platform.citationRate >= 0.30 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {(platform.citationRate * 100).toFixed(1)}% Citation Rate
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Views</div>
                  <div className="text-lg font-bold text-gray-900">{platform.views.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Engagement Rate</div>
                  <div className="text-lg font-bold text-gray-900">{platform.engagement}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Performance Score</div>
                  <div className="text-lg font-bold text-blue-600">{Math.round(platform.engagement * 10 + platform.citationRate * 100)}</div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${platform.citationRate * 250}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Top Performing Content</h2>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600">Ranked by Citation Rate</span>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Content</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Engagements</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shares</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Citation Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {topPerformingContent.map((content, index) => (
              <tr key={content.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                    {index + 1}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{content.title}</div>
                    <div className="text-sm text-gray-500">{content.project} • {content.published}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {content.platform}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{content.views.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{content.engagements.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{content.shares}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-gray-900">{(content.citationRate * 100).toFixed(1)}%</div>
                    {content.citationRate >= 0.35 && (
                      <Award className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentPerformance;
