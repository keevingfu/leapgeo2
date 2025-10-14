// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Plus, Search, MoreVertical, TrendingUp, Users } from 'lucide-react';

interface ProjectsProps {
  selectedBrands?: string[];
}

const Projects: React.FC<ProjectsProps> = ({ selectedBrands = [] }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const allProjects = [
    {
      id: 'sweetnight',
      name: 'SweetNight Mattress',
      industry: 'Consumer Electronics - Sleep Products',
      status: 'active',
      totalPrompts: 156,
      citationRate: 0.32,
      contentPublished: 289,
      color: 'blue'
    },
    {
      id: 'hisense',
      name: 'Hisense TV',
      industry: 'Consumer Electronics - Television',
      status: 'active',
      totalPrompts: 134,
      citationRate: 0.28,
      contentPublished: 245,
      color: 'purple'
    },
    {
      id: 'eufy',
      name: 'Eufy Robot Vacuum',
      industry: 'Consumer Electronics - Home Appliances',
      status: 'active',
      totalPrompts: 98,
      citationRate: 0.25,
      contentPublished: 178,
      color: 'green'
    }
  ];

  // Filter projects based on selected brands
  const filteredProjects = useMemo(() => {
    if (!selectedBrands || selectedBrands.length === 0) {
      return allProjects;
    }
    return allProjects.filter(project => selectedBrands.includes(project.id));
  }, [selectedBrands]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage all your GEO optimization projects</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500">No projects match the selected brands</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br from-${project.color}-500 to-${project.color}-600 rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                {project.name.charAt(0)}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{project.industry}</p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Citation Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{(project.citationRate * 100).toFixed(1)}%</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Prompts</span>
                <span className="text-sm font-semibold text-gray-900">{project.totalPrompts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Content Published</span>
                <span className="text-sm font-semibold text-gray-900">{project.contentPublished}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                View Dashboard
              </button>
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g., Cool Mattress Pro"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Consumer Electronics</option>
                  <option>Home & Garden</option>
                  <option>Health & Wellness</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
