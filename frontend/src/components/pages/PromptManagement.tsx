// @ts-nocheck
import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';

interface PromptManagementProps {
  selectedBrands?: string[];
}

const PromptManagement: React.FC<PromptManagementProps> = ({ selectedBrands = [] }) => {
  // Note: Brand filtering will be implemented when backend API supports brand-specific prompts
  const [searchTerm, setSearchTerm] = useState('');

  const prompts = [
    { id: 1, text: 'best mattress for hot sleepers 2025', intent: 'High-Intent', priority: 'P0', score: 92, citationRate: 0.35, status: 'active', createdDate: '2024-12-15' },
    { id: 2, text: 'cooling mattress reviews', intent: 'High-Intent', priority: 'P0', score: 88, citationRate: 0.32, status: 'active', createdDate: '2024-12-14' },
    { id: 3, text: 'how to choose memory foam mattress', intent: 'Educational', priority: 'P1', score: 85, citationRate: 0.28, status: 'active', createdDate: '2024-12-13' },
    { id: 4, text: 'summer sleeping tips', intent: 'Informational', priority: 'P2', score: 78, citationRate: 0.22, status: 'active', createdDate: '2024-12-12' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-700';
      case 'P1': return 'bg-yellow-100 text-yellow-700';
      case 'P2': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Management</h1>
          <p className="text-gray-600 mt-1">Manage and optimize your search prompts</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Prompt
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prompt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citation Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prompts.map((prompt) => (
                <tr key={prompt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{prompt.text}</p>
                    <p className="text-xs text-gray-500">{prompt.createdDate}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{prompt.intent}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(prompt.priority)}`}>
                      {prompt.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${prompt.score}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{prompt.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{(prompt.citationRate * 100).toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {prompt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromptManagement;
