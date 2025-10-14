// @ts-nocheck
import React, { useState } from 'react';
import { Zap, Youtube, FileText, MessageSquare, Twitter, RefreshCw, Brain } from 'lucide-react';

interface ContentGeneratorProps {
  selectedBrands?: string[];
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ selectedBrands = [] }) => {
  // Note: Content generation is a tool page, brand context is implicit in the product selector
  const [generating, setGenerating] = useState(false);

  const contentTypes = [
    { id: 'youtube', label: 'YouTube Script', icon: Youtube, duration: '30-60s' },
    { id: 'medium', label: 'Medium Article', icon: FileText, duration: '45-90s' },
    { id: 'quora', label: 'Quora Answer', icon: MessageSquare, duration: '20-30s' },
    { id: 'reddit', label: 'Reddit Post', icon: MessageSquare, duration: '20-30s' },
    { id: 'twitter', label: 'Twitter Thread', icon: Twitter, duration: '15-20s' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Generator</h1>
          <p className="text-gray-600 mt-1">AI-powered content creation for multiple platforms</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-6">Generate New Content</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Content Type</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {contentTypes.map((type) => (
                <button
                  key={type.id}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                >
                  <type.icon className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                  <p className="text-sm font-medium text-gray-900">{type.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{type.duration}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>Cool Mattress Queen</option>
                <option>Memory Foam Pillow</option>
                <option>Bamboo Sheets Set</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>Hot Sleepers</option>
                <option>Side Sleepers</option>
                <option>Back Pain Sufferers</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>Short</option>
                <option>Medium</option>
                <option>Long</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Casual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (optional)</label>
            <input
              type="text"
              placeholder="cooling, comfortable, breathable..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            onClick={() => setGenerating(!generating)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Content
              </>
            )}
          </button>
        </div>
      </div>

      {generating && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="animate-pulse bg-blue-100 p-3 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">AI is generating your content...</h3>
              <p className="text-sm text-gray-600">This may take 30-60 seconds</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
