// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Send, Calendar, CheckCircle, Clock, AlertCircle, Play, Pause, BarChart } from 'lucide-react';

interface DistributionProps {
  selectedBrands?: string[];
}

const Distribution: React.FC<DistributionProps> = ({ selectedBrands = [] }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Map project names to brand IDs for filtering
  const projectToBrandMap: { [key: string]: string } = {
    'SweetNight': 'sweetnight',
    'Eufy': 'eufy',
    'Hisense': 'hisense'
  };

  const allScheduledPosts = [
    {
      id: 1,
      title: 'Best Cooling Mattress for Hot Sleepers 2025',
      platform: 'Medium',
      scheduledTime: '2025-01-12 10:00',
      status: 'scheduled',
      estimatedReach: 15000,
      project: 'SweetNight'
    },
    {
      id: 2,
      title: 'Eufy X10 Pro - Complete Setup Guide',
      platform: 'YouTube',
      scheduledTime: '2025-01-12 14:00',
      status: 'scheduled',
      estimatedReach: 25000,
      project: 'Eufy'
    },
    {
      id: 3,
      title: 'Hisense U8K Gaming Performance Review',
      platform: 'Reddit',
      scheduledTime: '2025-01-11 09:00',
      status: 'publishing',
      estimatedReach: 8000,
      project: 'Hisense'
    },
    {
      id: 4,
      title: 'Robot Vacuum Comparison: Eufy vs Roborock',
      platform: 'Quora',
      scheduledTime: '2025-01-10 16:30',
      status: 'published',
      actualReach: 12000,
      project: 'Eufy'
    },
    {
      id: 5,
      title: 'Memory Foam vs Gel Mattress Guide',
      platform: 'LinkedIn',
      scheduledTime: '2025-01-10 11:00',
      status: 'failed',
      error: 'Authentication expired',
      project: 'SweetNight'
    }
  ];

  // Filter scheduled posts based on selected brands
  const scheduledPosts = useMemo(() => {
    if (!selectedBrands || selectedBrands.length === 0) {
      return allScheduledPosts;
    }
    return allScheduledPosts.filter(post => {
      const brandId = projectToBrandMap[post.project];
      return selectedBrands.includes(brandId);
    });
  }, [selectedBrands, allScheduledPosts]);

  const platformStats = [
    { name: 'YouTube', scheduled: 12, published: 45, reach: 125000, icon: '📹' },
    { name: 'Medium', scheduled: 8, published: 32, reach: 89000, icon: '✍️' },
    { name: 'Reddit', scheduled: 15, published: 67, reach: 156000, icon: '💬' },
    { name: 'Quora', scheduled: 10, published: 52, reach: 78000, icon: '❓' },
    { name: 'LinkedIn', scheduled: 5, published: 28, reach: 45000, icon: '💼' },
    { name: 'Twitter', scheduled: 20, published: 134, reach: 210000, icon: '🐦' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700',
      publishing: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.scheduled;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      scheduled: <Clock className="w-4 h-4" />,
      publishing: <Play className="w-4 h-4" />,
      published: <CheckCircle className="w-4 h-4" />,
      failed: <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || icons.scheduled;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Distribution</h1>
          <p className="text-gray-600 mt-1">Schedule and manage content publishing across platforms</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar View
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Schedule New Post
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Scheduled</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">70</p>
          <p className="text-sm text-gray-500 mt-1">Next 7 days</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Published Today</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-500 mt-1">All platforms</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Total Reach</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">703K</p>
          <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Failed Posts</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">3</p>
          <p className="text-sm text-gray-500 mt-1">Require attention</p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          {platformStats.map((platform) => (
            <div key={platform.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{platform.icon}</span>
                <h3 className="font-semibold text-gray-900">{platform.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-500">Scheduled</div>
                  <div className="font-bold text-blue-600">{platform.scheduled}</div>
                </div>
                <div>
                  <div className="text-gray-500">Published</div>
                  <div className="font-bold text-green-600">{platform.published}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-500">Total Reach</div>
                  <div className="font-bold text-gray-900">{platform.reach.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Posts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Scheduled Posts</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Content</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scheduled Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reach</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {scheduledPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{post.title}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {post.platform}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">{post.project}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">{post.scheduledTime}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {post.estimatedReach?.toLocaleString() || post.actualReach?.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(post.status)}`}>
                    {getStatusIcon(post.status)}
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                  {post.error && (
                    <div className="text-xs text-red-600 mt-1">{post.error}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {post.status === 'scheduled' && (
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
                        Edit
                      </button>
                    )}
                    {post.status === 'failed' && (
                      <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">
                        Retry
                      </button>
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

export default Distribution;
