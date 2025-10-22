import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, MoreVertical, TrendingUp, Users, Edit, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { projectsApi } from '../../services/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  status: string;
  citation_rate?: number;
  total_prompts?: number;
  content_published?: number;
  created_at?: string;
  updated_at?: string;
}

interface ProjectsProps {
  selectedBrands?: string[];
}

const Projects: React.FC<ProjectsProps> = ({ selectedBrands = [] }) => {
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    status: 'active',
  });

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getProjects({ limit: 100 });
      setProjects(data);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      setError(err.response?.data?.detail || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search and selected brands
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.industry?.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query)
      );
    }

    // Filter by selected brands
    if (selectedBrands && selectedBrands.length > 0) {
      filtered = filtered.filter((project) => selectedBrands.includes(project.id));
    }

    return filtered;
  }, [projects, searchQuery, selectedBrands]);

  // Handle create project
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }

    try {
      setActionLoading(true);
      await projectsApi.createProject({
        id: formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name,
        description: formData.description || null,
        industry: formData.industry || null,
        status: formData.status,
      });
      await loadProjects();
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Failed to create project:', err);
      alert(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit project
  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      industry: project.industry || '',
      status: project.status,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedProject || !formData.name.trim()) {
      alert('Project name is required');
      return;
    }

    try {
      setActionLoading(true);
      await projectsApi.updateProject(selectedProject.id, {
        name: formData.name,
        description: formData.description || null,
        industry: formData.industry || null,
        status: formData.status,
      });
      await loadProjects();
      setShowEditModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Failed to update project:', err);
      alert(err.response?.data?.detail || 'Failed to update project');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete project
  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;

    try {
      setActionLoading(true);
      await projectsApi.deleteProject(selectedProject.id);
      await loadProjects();
      setShowDeleteModal(false);
      setSelectedProject(null);
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      alert(err.response?.data?.detail || 'Failed to delete project');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      industry: '',
      status: 'active',
    });
    setSelectedProject(null);
  };

  // Get project color based on citation rate
  const getProjectColor = (citationRate?: number) => {
    if (!citationRate) return 'gray';
    if (citationRate >= 0.35) return 'green';
    if (citationRate >= 0.28) return 'blue';
    if (citationRate >= 0.20) return 'yellow';
    return 'red';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage all your GEO optimization projects</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-900 font-medium">Error loading projects</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={loadProjects}
            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">
                {searchQuery || (selectedBrands && selectedBrands.length > 0)
                  ? 'No projects match your filters'
                  : 'No projects found. Create your first project to get started.'}
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const color = getProjectColor(project.citation_rate);
              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center text-white font-bold text-lg`}
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="relative group">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => handleEdit(project)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Project
                        </button>
                        <button
                          onClick={() => handleDelete(project)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Project
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{project.industry || 'No industry specified'}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Citation Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {project.citation_rate ? (project.citation_rate * 100).toFixed(1) : '0.0'}%
                        </span>
                        {project.citation_rate && project.citation_rate > 0.28 && (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Prompts</span>
                      <span className="text-sm font-semibold text-gray-900">{project.total_prompts || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Content Published</span>
                      <span className="text-sm font-semibold text-gray-900">{project.content_published || 0}</span>
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
              );
            })
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cool Mattress Pro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  placeholder="e.g., Consumer Electronics"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Brief description of the project"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Delete Project</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{selectedProject.name}</strong>? This action cannot be undone and
              will delete all associated prompts and data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProject(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
