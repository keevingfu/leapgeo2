import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  TrendingUp,
  Filter,
  Download,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Play,
} from 'lucide-react';
import { citationsApi, projectsApi } from '../../services/api';

// TypeScript interfaces
interface Citation {
  id: number;
  platform: string;
  prompt: string | null;
  source: string | null;
  position: number | null;
  snippet: string | null;
  project_id: string;
  detected_at: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  citation_rate?: number;
}

interface ScanResult {
  message: string;
  prompt: string;
  project_id: string;
  total_citations: number;
  citations_saved: number;
  platforms_scanned: number;
  results_by_platform: Record<string, any>;
  timestamp: string;
}

interface CitationTrackingProps {
  selectedBrands?: string[];
}

const CitationTracking: React.FC<CitationTrackingProps> = ({ selectedBrands = [] }) => {
  // State management
  const [citations, setCitations] = useState<Citation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Scan modal
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanPrompt, setScanPrompt] = useState('');
  const [scanProjectId, setScanProjectId] = useState('');
  const [scanPlatforms, setScanPlatforms] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Available platforms for scanning
  const availablePlatforms = [
    { id: 'chatgpt', name: 'ChatGPT', color: 'green' },
    { id: 'claude', name: 'Claude', color: 'purple' },
    { id: 'perplexity', name: 'Perplexity', color: 'blue' },
    { id: 'gemini', name: 'Google Gemini', color: 'orange' },
    { id: 'copilot', name: 'Microsoft Copilot', color: 'cyan' },
    { id: 'you', name: 'You.com', color: 'indigo' },
    { id: 'phind', name: 'Phind', color: 'pink' },
    { id: 'meta_ai', name: 'Meta AI', color: 'teal' },
  ];

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [citationsData, projectsData] = await Promise.all([
        citationsApi.getRecentCitations(100),
        projectsApi.getProjects({ limit: 100 }),
      ]);

      setCitations(citationsData);
      setProjects(projectsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load citation data');
    } finally {
      setLoading(false);
    }
  };

  // Filter citations
  const filteredCitations = useMemo(() => {
    let filtered = citations;

    // Project filter
    if (selectedProject !== 'all') {
      filtered = filtered.filter((c) => c.project_id === selectedProject);
    }

    // Search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.platform.toLowerCase().includes(query) ||
          c.prompt?.toLowerCase().includes(query) ||
          c.source?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [citations, selectedProject, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const projectCitations = selectedProject === 'all'
      ? citations
      : citations.filter((c) => c.project_id === selectedProject);

    const platformCounts = projectCitations.reduce((acc, c) => {
      acc[c.platform] = (acc[c.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPositionCount = projectCitations.filter((c) => c.position === 1).length;

    const avgCitationRate = selectedProject === 'all'
      ? projects.reduce((sum, p) => sum + (p.citation_rate || 0), 0) / (projects.length || 1)
      : projects.find((p) => p.id === selectedProject)?.citation_rate || 0;

    return {
      totalCitations: projectCitations.length,
      avgCitationRate,
      topPositionCount,
      activePlatforms: Object.keys(platformCounts).length,
      platformCounts,
    };
  }, [citations, projects, selectedProject]);

  // Handle scan submission
  const handleScan = async () => {
    if (!scanPrompt.trim() || !scanProjectId) {
      setScanError('Please enter a prompt and select a project');
      return;
    }

    try {
      setScanning(true);
      setScanError(null);
      setScanResult(null);

      const result = await citationsApi.scanCitations({
        prompt: scanPrompt,
        project_id: scanProjectId,
        platforms: scanPlatforms.length > 0 ? scanPlatforms : undefined,
      });

      setScanResult(result);

      // Reload citations after successful scan
      setTimeout(() => {
        loadData();
      }, 1000);
    } catch (err: any) {
      setScanError(err.response?.data?.detail || 'Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const resetScanModal = () => {
    setShowScanModal(false);
    setScanPrompt('');
    setScanProjectId('');
    setScanPlatforms([]);
    setScanResult(null);
    setScanError(null);
  };

  const togglePlatform = (platformId: string) => {
    setScanPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900">Error Loading Citations</h2>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="citation-tracking-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">AI Citation Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor your brand mentions across AI platforms</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowScanModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            data-testid="scan-citations-button"
            data-action="open-scan-modal"
          >
            <Play className="w-4 h-4" />
            Scan Citations
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            data-testid="refresh-button"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4" data-testid="filters-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="project-filter"
              name="project_filter"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Citations
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by platform, prompt, or source..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="search-input"
                name="search_citations"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="statistics-section">
        <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="stat-total-citations">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Total Citations</h3>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold" data-metric="total-citations">{stats.totalCitations}</p>
          <p className="text-sm text-gray-500 mt-1">Tracked citations</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="stat-citation-rate">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Avg Citation Rate</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold" data-metric="avg-citation-rate">{(stats.avgCitationRate * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">Citation performance</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Position</h3>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">{stats.topPositionCount}</p>
          <p className="text-sm text-gray-500 mt-1">Position #1 citations</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Active Platforms</h3>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">{stats.activePlatforms}</p>
          <p className="text-sm text-gray-500 mt-1">Platforms with citations</p>
        </div>
      </div>

      {/* Platform Performance */}
      {Object.keys(stats.platformCounts).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Platform Performance</h2>
          <div className="space-y-4">
            {Object.entries(stats.platformCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([platform, count]) => {
                const percentage = (count / stats.totalCitations) * 100;
                return (
                  <div key={platform} className="flex items-center gap-4">
                    <div className="w-32">
                      <p className="text-sm font-medium text-gray-900">{platform}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <p className="text-sm text-gray-600">{count} citations</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Citations Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Recent Citations ({filteredCitations.length})
          </h2>
        </div>

        {filteredCitations.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No citations found</p>
            <p className="text-gray-400 mt-2">
              {selectedProject !== 'all' || searchTerm
                ? 'Try adjusting your filters'
                : 'Start scanning to track citations'}
            </p>
            <button
              onClick={() => setShowScanModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Scan Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCitations.slice(0, 50).map((citation) => (
              <div key={citation.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {citation.platform}
                      </span>
                      {citation.position && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            citation.position === 1
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Position #{citation.position}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(citation.detected_at)}
                      </span>
                    </div>
                    {citation.prompt && (
                      <p className="font-medium text-gray-900 mb-1">{citation.prompt}</p>
                    )}
                    {citation.source && (
                      <p className="text-sm text-gray-600 mb-2">{citation.source}</p>
                    )}
                    {citation.snippet && (
                      <p className="text-sm text-gray-500 italic">"{citation.snippet}"</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Scan AI Platforms for Citations</h2>
              <p className="text-gray-600 mt-1">
                Enter a prompt to search for citations across selected platforms
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Project selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={scanProjectId}
                  onChange={(e) => setScanProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={scanning}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prompt input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={scanPrompt}
                  onChange={(e) => setScanPrompt(e.target.value)}
                  placeholder="E.g., best cooling mattress for hot sleepers"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={scanning}
                  data-testid="scan-prompt-input"
                  name="scan_prompt"
                />
              </div>

              {/* Platform selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platforms (leave empty to scan all)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePlatforms.map((platform) => (
                    <label
                      key={platform.id}
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={scanPlatforms.includes(platform.id)}
                        onChange={() => togglePlatform(platform.id)}
                        className="w-4 h-4 text-blue-600"
                        disabled={scanning}
                      />
                      <span className="text-sm">{platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Scan result */}
              {scanResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Scan Completed</h3>
                  </div>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>
                      <strong>Citations Found:</strong> {scanResult.total_citations}
                    </p>
                    <p>
                      <strong>Citations Saved:</strong> {scanResult.citations_saved}
                    </p>
                    <p>
                      <strong>Platforms Scanned:</strong> {scanResult.platforms_scanned}
                    </p>
                  </div>
                </div>
              )}

              {/* Scan error */}
              {scanError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Scan Failed</h3>
                  </div>
                  <p className="text-sm text-red-700">{scanError}</p>
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={resetScanModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={scanning}
              >
                {scanResult ? 'Close' : 'Cancel'}
              </button>
              {!scanResult && (
                <button
                  onClick={handleScan}
                  disabled={scanning || !scanPrompt.trim() || !scanProjectId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  data-testid="start-scan-button"
                  data-action="start-scan"
                  data-status={scanning ? 'scanning' : 'idle'}
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Scan
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitationTracking;
