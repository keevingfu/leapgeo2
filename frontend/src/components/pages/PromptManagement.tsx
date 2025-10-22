import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import { promptsApi, projectsApi } from '../../services/api';

interface Prompt {
  id: number;
  text: string;
  project_id?: string;
  intent?: string;
  priority?: string;
  score?: number;
  citation_rate?: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface Project {
  id: string;
  name: string;
}

interface PromptManagementProps {
  selectedBrands?: string[];
}

const PromptManagement: React.FC<PromptManagementProps> = ({ selectedBrands = [] }) => {
  // State management
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selection state for batch operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    text: '',
    project_id: '',
    intent: 'High-Intent',
    priority: 'P1',
    score: 80,
    status: 'active',
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [promptsData, projectsData] = await Promise.all([
        promptsApi.getPrompts({ limit: 200 }),
        projectsApi.getProjects({ limit: 100 }),
      ]);
      setPrompts(promptsData);
      setProjects(projectsData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    // Search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (prompt) =>
          prompt.text.toLowerCase().includes(query) ||
          prompt.intent?.toLowerCase().includes(query)
      );
    }

    // Project filter
    if (filterProject !== 'all') {
      filtered = filtered.filter((prompt) => prompt.project_id === filterProject);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter((prompt) => prompt.priority === filterPriority);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((prompt) => prompt.status === filterStatus);
    }

    // Selected brands filter (from props)
    if (selectedBrands && selectedBrands.length > 0) {
      filtered = filtered.filter((prompt) =>
        prompt.project_id && selectedBrands.includes(prompt.project_id)
      );
    }

    return filtered;
  }, [prompts, searchTerm, filterProject, filterPriority, filterStatus, selectedBrands]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
  const paginatedPrompts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPrompts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPrompts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterProject, filterPriority, filterStatus]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedPrompts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedPrompts.map((p) => p.id)));
    }
  };

  const toggleSelectPrompt = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // CRUD operations
  const handleCreate = async () => {
    if (!formData.text.trim()) {
      alert('Prompt text is required');
      return;
    }

    try {
      setActionLoading(true);
      await promptsApi.createPrompt({
        text: formData.text,
        project_id: formData.project_id || null,
        intent: formData.intent,
        priority: formData.priority,
        score: formData.score,
        status: formData.status,
      });
      await loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Failed to create prompt:', err);
      alert(err.response?.data?.detail || 'Failed to create prompt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setFormData({
      text: prompt.text,
      project_id: prompt.project_id || '',
      intent: prompt.intent || 'High-Intent',
      priority: prompt.priority || 'P1',
      score: prompt.score || 80,
      status: prompt.status,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedPrompt || !formData.text.trim()) {
      alert('Prompt text is required');
      return;
    }

    try {
      setActionLoading(true);
      await promptsApi.updatePrompt(selectedPrompt.id, {
        text: formData.text,
        project_id: formData.project_id || null,
        intent: formData.intent,
        priority: formData.priority,
        score: formData.score,
        status: formData.status,
      });
      await loadData();
      setShowEditModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Failed to update prompt:', err);
      alert(err.response?.data?.detail || 'Failed to update prompt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPrompt) return;

    try {
      setActionLoading(true);
      await promptsApi.deletePrompt(selectedPrompt.id);
      await loadData();
      setShowDeleteModal(false);
      setSelectedPrompt(null);
    } catch (err: any) {
      console.error('Failed to delete prompt:', err);
      alert(err.response?.data?.detail || 'Failed to delete prompt');
    } finally {
      setActionLoading(false);
    }
  };

  // Batch operations
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      alert('No prompts selected');
      return;
    }

    if (!confirm(`Delete ${selectedIds.size} selected prompt(s)?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await Promise.all(
        Array.from(selectedIds).map((id) => promptsApi.deletePrompt(id))
      );
      await loadData();
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Failed to batch delete:', err);
      alert('Failed to delete some prompts');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchStatusUpdate = async (status: string) => {
    if (selectedIds.size === 0) {
      alert('No prompts selected');
      return;
    }

    try {
      setActionLoading(true);
      await Promise.all(
        Array.from(selectedIds).map((id) => {
          const prompt = prompts.find((p) => p.id === id);
          if (prompt) {
            return promptsApi.updatePrompt(id, { ...prompt, status });
          }
          return Promise.resolve();
        })
      );
      await loadData();
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Failed to batch update status:', err);
      alert('Failed to update some prompts');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      project_id: '',
      intent: 'High-Intent',
      priority: 'P1',
      score: 80,
      status: 'active',
    });
    setSelectedPrompt(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'P0':
        return 'bg-red-100 text-red-700';
      case 'P1':
        return 'bg-yellow-100 text-yellow-700';
      case 'P2':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Management</h1>
          <p className="text-gray-600 mt-1">Manage and optimize your search prompts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Prompt
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="P0">P0 - Critical</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Medium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Operations */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.size} prompt(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBatchStatusUpdate('active')}
              disabled={actionLoading}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBatchStatusUpdate('paused')}
              disabled={actionLoading}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm disabled:opacity-50"
            >
              Set Paused
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={actionLoading}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

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
            <p className="text-red-900 font-medium">Error loading prompts</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Prompts Table */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button onClick={toggleSelectAll} className="p-1">
                        {selectedIds.size === paginatedPrompts.length && paginatedPrompts.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Prompt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Intent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Citation Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedPrompts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                        No prompts found. {searchTerm || filterProject !== 'all' || filterPriority !== 'all' || filterStatus !== 'all'
                          ? 'Try adjusting your filters.'
                          : 'Create your first prompt to get started.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedPrompts.map((prompt) => {
                      const project = projects.find((p) => p.id === prompt.project_id);
                      return (
                        <tr key={prompt.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <button onClick={() => toggleSelectPrompt(prompt.id)} className="p-1">
                              {selectedIds.has(prompt.id) ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{prompt.text}</p>
                            {prompt.created_at && (
                              <p className="text-xs text-gray-500">
                                {new Date(prompt.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700">
                              {project?.name || prompt.project_id || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{prompt.intent || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                                prompt.priority
                              )}`}
                            >
                              {prompt.priority || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${prompt.score || 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{prompt.score || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                              {prompt.citation_rate ? (prompt.citation_rate * 100).toFixed(1) : '0.0'}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                prompt.status
                              )}`}
                            >
                              {prompt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(prompt)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(prompt)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Trash2 className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredPrompts.length)} of {filteredPrompts.length}{' '}
                prompts
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-1 text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create New Prompt</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="e.g., best mattress for hot sleepers 2025"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intent</label>
                  <input
                    type="text"
                    placeholder="e.g., High-Intent"
                    value={formData.intent}
                    onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                  Create Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Prompt</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intent</label>
                  <input
                    type="text"
                    value={formData.intent}
                    onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
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
                  Update Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Delete Prompt</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this prompt: <strong>{selectedPrompt.text}</strong>? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPrompt(null);
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
                Delete Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptManagement;
