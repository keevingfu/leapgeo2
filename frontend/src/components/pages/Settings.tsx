// @ts-nocheck
import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Globe, Palette, Database } from 'lucide-react';

interface SettingsProps {
  selectedBrands?: string[];
}

const Settings: React.FC<SettingsProps> = ({ selectedBrands = [] }) => {
  // Note: Settings page is global, no brand filtering needed
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Database }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your platform settings and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-xl border border-gray-200 p-4">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                    <input
                      type="text"
                      defaultValue="GEO Platform"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>English</option>
                      <option>Chinese</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC+0 (London)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { id: 'citations', label: 'New AI Citations', desc: 'Get notified when new citations are detected' },
                  { id: 'content', label: 'Content Review', desc: 'Alerts when content needs review' },
                  { id: 'performance', label: 'Performance Alerts', desc: 'Notify on significant metric changes' },
                  { id: 'team', label: 'Team Activity', desc: 'Updates on team member actions' }
                ].map((setting) => (
                  <div key={setting.id} className="flex items-start justify-between border-b border-gray-200 pb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{setting.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{setting.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="mt-1 w-5 h-5 text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change Password</label>
                  <input
                    type="password"
                    placeholder="Current password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Update Password
                  </button>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account</p>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Integrations</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'YouTube', status: 'Connected', logo: '📹' },
                  { name: 'Medium', status: 'Connected', logo: '✍️' },
                  { name: 'Reddit', status: 'Not Connected', logo: '💬' },
                  { name: 'Quora', status: 'Connected', logo: '❓' }
                ].map((platform) => (
                  <div key={platform.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{platform.logo}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                        <span className={`text-xs ${platform.status === 'Connected' ? 'text-green-600' : 'text-gray-500'}`}>
                          {platform.status}
                        </span>
                      </div>
                    </div>
                    <button className={`w-full px-3 py-2 rounded-lg text-sm ${
                      platform.status === 'Connected'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      {platform.status === 'Connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Appearance</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-blue-600 rounded-lg p-4 cursor-pointer bg-white">
                    <div className="text-center">
                      <div className="text-4xl mb-2">☀️</div>
                      <span className="font-medium">Light Mode</span>
                    </div>
                  </div>
                  <div className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🌙</div>
                      <span className="font-medium">Dark Mode</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Data & Privacy</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Export Data</h3>
                  <p className="text-sm text-gray-500 mb-3">Download all your platform data</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Export Data
                  </button>
                </div>
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-600 mb-3">Permanently delete your account and all data</p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
