import React, { useEffect, useState } from 'react';
import {
  Target, FileText, ShoppingCart, TrendingUp, Activity,
  CheckCircle, Calendar, Download, ArrowUpRight
} from 'lucide-react';
import { statsApi, citationsApi } from '../../services/api';

interface DashboardProps {
  selectedBrands?: string[];
}

interface Stats {
  total_projects: number;
  total_prompts: number;
  total_citations: number;
  avg_citation_rate: number;
  active_projects: number;
}

interface Citation {
  platform: string;
  prompt: string;
  source: string;
  position: number;
}

const Dashboard: React.FC<DashboardProps> = () => {
  // Brand filtering temporarily disabled
  // const { selectedBrands = [] } = props;
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCitations, setRecentCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Brand filtering temporarily disabled - API doesn't support it yet
        const [statsData, citationsData] = await Promise.all([
          statsApi.getOverview(),
          citationsApi.getRecentCitations(5)
        ]);
        setStats(statsData);
        setRecentCitations(citationsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load dashboard data</div>
      </div>
    );
  }

  const metrics = [
    { label: 'Total Projects', value: stats.total_projects, change: '+15%', trend: 'up', icon: Target, color: 'blue' },
    { label: 'Total Prompts', value: stats.total_prompts, change: '+23%', trend: 'up', icon: FileText, color: 'green' },
    { label: 'Total Citations', value: stats.total_citations, change: '+32%', trend: 'up', icon: ShoppingCart, color: 'purple' },
    { label: 'Avg Citation Rate', value: `${(stats.avg_citation_rate * 100).toFixed(1)}%`, change: '+2.1%', trend: 'up', icon: TrendingUp, color: 'emerald' },
    { label: 'Active Projects', value: stats.active_projects, change: '+2.1%', trend: 'up', icon: Activity, color: 'orange' },
    { label: 'Success Rate', value: `${((stats.total_citations / stats.total_prompts) * 100).toFixed(1)}%`, change: '-0.3%', trend: 'down', icon: CheckCircle, color: 'indigo' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your platform overview</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold mt-2">{metric.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className={`w-4 h-4 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change}
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className={`p-3 bg-${metric.color}-50 rounded-lg`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Conversion Funnel</h2>
          <div className="space-y-4">
            {[
              { stage: 'AI Citations', value: 1234, percentage: 100, color: 'blue' },
              { stage: 'Offer Displayed', value: 890, percentage: 72, color: 'indigo' },
              { stage: 'Clicked', value: 623, percentage: 50, color: 'purple' },
              { stage: 'Orders Created', value: 456, percentage: 37, color: 'pink' },
              { stage: 'Completed', value: 439, percentage: 36, color: 'green' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{item.stage}</span>
                  <span className="text-gray-900 font-semibold">{item.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Citations</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {recentCitations.map((citation, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {citation.platform}: {citation.prompt}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Source: {citation.source}</p>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  Position #{citation.position}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
