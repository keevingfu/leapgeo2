import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Projects', value: '3', icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Prompts', value: '290', icon: Users, color: 'bg-green-500' },
    { label: 'Avg Citation Rate', value: '31.7%', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Total Citations', value: '847', icon: BarChart3, color: 'bg-orange-500' },
  ];

  const projects = [
    { id: 'eufy', name: 'Eufy Robot Vacuum', citationRate: 0.35, prompts: 89 },
    { id: 'sweetnight', name: 'SweetNight Mattress', citationRate: 0.32, prompts: 156 },
    { id: 'hisense', name: 'Hisense TV', citationRate: 0.28, prompts: 45 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GEO Platform Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome to your Generative Engine Optimization platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="flex items-center space-x-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Projects List */}
        <Card title="Active Projects">
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.prompts} prompts</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {(project.citationRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">Citation Rate</p>
                  </div>
                  <Button size="sm" variant="secondary">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="primary" className="w-full">
              Create New Project
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
