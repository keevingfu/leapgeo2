// @ts-nocheck
import React, { useState } from 'react';
import { Award, Check, X, Clock, Filter, Search, Eye, Edit, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ContentReviewProps {
  selectedBrands?: string[];
}

const ContentReview: React.FC<ContentReviewProps> = ({ selectedBrands = [] }) => {
  // Note: Brand filtering will be implemented when content items include brand/project IDs
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const reviewQueue = [
    {
      id: 1,
      title: 'Best Cooling Mattress for Hot Sleepers 2025',
      type: 'Blog Post',
      platform: 'Medium',
      author: 'AI Generator',
      createdAt: '2025-01-10 14:30',
      status: 'pending',
      priority: 'high',
      wordCount: 1850,
      geoScore: 87,
      targetPrompt: 'best cooling mattress for hot sleepers'
    },
    {
      id: 2,
      title: 'SweetNight CoolNest vs Purple Mattress Comparison',
      type: 'YouTube Script',
      platform: 'YouTube',
      author: 'AI Generator',
      createdAt: '2025-01-10 12:15',
      status: 'pending',
      priority: 'high',
      wordCount: 2200,
      geoScore: 92,
      targetPrompt: 'sweetnight vs purple mattress'
    },
    {
      id: 3,
      title: 'How to Choose the Right Mattress Firmness',
      type: 'Reddit Post',
      platform: 'Reddit',
      author: 'AI Generator',
      createdAt: '2025-01-10 10:45',
      status: 'approved',
      priority: 'medium',
      wordCount: 980,
      geoScore: 78,
      targetPrompt: 'mattress firmness guide'
    },
    {
      id: 4,
      title: 'Eufy X10 Pro Review - Pet Hair Cleaning Performance',
      type: 'Blog Post',
      platform: 'Medium',
      author: 'AI Generator',
      createdAt: '2025-01-09 16:20',
      status: 'rejected',
      priority: 'low',
      wordCount: 1500,
      geoScore: 65,
      targetPrompt: 'best robot vacuum for pet hair'
    },
    {
      id: 5,
      title: 'Hisense U8K Gaming TV Settings Guide',
      type: 'Quora Answer',
      platform: 'Quora',
      author: 'AI Generator',
      createdAt: '2025-01-09 14:00',
      status: 'pending',
      priority: 'medium',
      wordCount: 1200,
      geoScore: 81,
      targetPrompt: 'best tv for gaming 2025'
    }
  ];

  const filteredQueue = reviewQueue.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetPrompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: reviewQueue.length,
    pending: reviewQueue.filter(i => i.status === 'pending').length,
    approved: reviewQueue.filter(i => i.status === 'approved').length,
    rejected: reviewQueue.filter(i => i.status === 'rejected').length
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[priority] || colors.low;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Queue</h1>
          <p className="text-gray-600 mt-1">Review and approve AI-generated content before publishing</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Bulk Approve
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Pending Review</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Approved</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Rejected</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.rejected}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Avg GEO Score</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">80.6</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({statusCounts.pending})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({statusCounts.approved})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'rejected'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({statusCounts.rejected})
            </button>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-gray-700 w-64"
            />
          </div>
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Content</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">GEO Score</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredQueue.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Target: {item.targetPrompt} • {item.wordCount} words
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{item.createdAt}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">{item.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {item.platform}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(item.priority)}`}>
                    {item.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-gray-900">{item.geoScore}</div>
                    <div className="text-xs text-gray-500">/100</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    {item.status === 'pending' && (
                      <>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </>
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

export default ContentReview;
