// @ts-nocheck
import React from 'react';
import { Target, TrendingUp, Filter, Download } from 'lucide-react';

interface CitationTrackingProps {
  selectedBrands?: string[];
}

const CitationTracking: React.FC<CitationTrackingProps> = ({ selectedBrands = [] }) => {
  // Note: Brand filtering will be implemented when backend API supports brand-specific citation data
  const platforms = [
    { name: 'ChatGPT', citations: 456, rate: 0.38, trend: 'up', color: 'green' },
    { name: 'Claude', citations: 389, rate: 0.35, trend: 'up', color: 'purple' },
    { name: 'Perplexity', citations: 312, rate: 0.32, trend: 'up', color: 'blue' },
    { name: 'Gemini', citations: 267, rate: 0.28, trend: 'down', color: 'orange' },
    { name: 'Copilot', citations: 234, rate: 0.25, trend: 'up', color: 'cyan' },
    { name: 'You.com', citations: 189, rate: 0.22, trend: 'up', color: 'indigo' },
    { name: 'Phind', citations: 145, rate: 0.19, trend: 'down', color: 'pink' },
    { name: 'Anthropic', citations: 123, rate: 0.17, trend: 'up', color: 'teal' }
  ];

  const recentCitations = [
    {
      platform: 'Perplexity',
      prompt: 'best cooling mattress for hot sleepers',
      source: 'SweetNight CoolNest Review - YouTube',
      position: 1,
      time: '2 hours ago',
      snippet: 'CoolNest technology provides superior temperature regulation...'
    },
    {
      platform: 'ChatGPT',
      prompt: 'how to choose memory foam mattress',
      source: 'Complete Mattress Guide - Medium',
      position: 2,
      time: '4 hours ago',
      snippet: 'Memory foam density and firmness are key factors...'
    },
    {
      platform: 'Claude',
      prompt: 'summer sleeping tips',
      source: 'Sleep Better in Summer - Quora',
      position: 1,
      time: '6 hours ago',
      snippet: 'Cooling bedding materials can significantly improve...'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Citation Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor your brand mentions across AI platforms</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Total Citations</h3>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">2,115</p>
          <p className="text-sm text-gray-500 mt-1">+156 this week</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Avg Citation Rate</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">32.4%</p>
          <p className="text-sm text-green-600 mt-1">+2.3% vs last month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Position</h3>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">342</p>
          <p className="text-sm text-gray-500 mt-1">Position #1 citations</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Active Platforms</h3>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">8</p>
          <p className="text-sm text-gray-500 mt-1">All platforms active</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Platform Performance</h2>
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div key={platform.name} className="flex items-center gap-4">
              <div className="w-32">
                <p className="text-sm font-medium text-gray-900">{platform.name}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${platform.color}-500 h-2 rounded-full`}
                      style={{ width: `${platform.rate * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12">{(platform.rate * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="w-20 text-right">
                <p className="text-sm text-gray-600">{platform.citations} citations</p>
              </div>
              <div className="w-16 text-right">
                <TrendingUp className={`w-4 h-4 ${platform.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Citations</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentCitations.map((citation, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {citation.platform}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Position #{citation.position}
                    </span>
                    <span className="text-xs text-gray-500">{citation.time}</span>
                  </div>
                  <p className="font-medium text-gray-900 mb-1">{citation.prompt}</p>
                  <p className="text-sm text-gray-600 mb-2">{citation.source}</p>
                  <p className="text-sm text-gray-500 italic">"{citation.snippet}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitationTracking;
