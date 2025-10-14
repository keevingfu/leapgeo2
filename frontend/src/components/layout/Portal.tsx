import React, { useState } from 'react';
import {
  Home, Brain, FileText, Award, Send, Target,
  Package, ShoppingCart, CreditCard, Truck, BarChart3,
  Users, Shield, Settings as SettingsIcon, Search, Bell, Menu, X, Activity, Zap, Globe
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
// import BrandFilter, { Brand } from '../common/BrandFilter';

// Import page components
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import KnowledgeGraph from '../pages/KnowledgeGraph';
import PromptManagement from '../pages/PromptManagement';
import ContentGenerator from '../pages/ContentGenerator';
import CitationTracking from '../pages/CitationTracking';
import Analytics from '../pages/Analytics';
import ContentReview from '../pages/ContentReview';
import Distribution from '../pages/Distribution';
import ContentPerformance from '../pages/ContentPerformance';
import ProductCatalog from '../pages/ProductCatalog';
import OfferManagement from '../pages/OfferManagement';
import Orders from '../pages/Orders';
import Payments from '../pages/Payments';
import Fulfillment from '../pages/Fulfillment';
import Team from '../pages/Team';
import Brands from '../pages/Brands';
import SettingsPage from '../pages/Settings';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const Portal: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Brand filtering state - TEMPORARILY DISABLED
  // const allBrands: Brand[] = [
  //   { id: 'sweetnight', name: 'SweetNight', logo: '🛏️', industry: 'Sleep Products' },
  //   { id: 'eufy', name: 'Eufy', logo: '🤖', industry: 'Smart Home' },
  //   { id: 'hisense', name: 'Hisense', logo: '📺', industry: 'Electronics' }
  // ];
  // const [selectedBrands, setSelectedBrands] = useState<string[]>(
  //   allBrands.map(b => b.id) // Default: all brands selected
  // );

  // Navigation structure
  const navigation: NavigationSection[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'analytics', label: 'Analytics Hub', icon: BarChart3 }
      ]
    },
    {
      title: 'GEO Optimization',
      items: [
        { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Brain },
        { id: 'prompts', label: 'Prompt Management', icon: FileText },
        { id: 'content-generator', label: 'Content Generator', icon: Zap },
        { id: 'content-review', label: 'Review Queue', icon: Award },
        { id: 'distribution', label: 'Distribution', icon: Send },
        { id: 'citations', label: 'AI Citations', icon: Target },
        { id: 'performance', label: 'Content Performance', icon: Activity }
      ]
    },
    {
      title: 'Commerce',
      items: [
        { id: 'catalog', label: 'Product Catalog', icon: Package },
        { id: 'offers', label: 'Offer Management', icon: Globe },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'fulfillment', label: 'Fulfillment', icon: Truck }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'projects', label: 'Projects', icon: Package },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'brands', label: 'Brands', icon: Shield },
        { id: 'settings', label: 'Settings', icon: SettingsIcon }
      ]
    }
  ];

  // Render current page component
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <Analytics />;
      case 'knowledge-graph':
        return <KnowledgeGraph />;
      case 'prompts':
        return <PromptManagement />;
      case 'content-generator':
        return <ContentGenerator />;
      case 'content-review':
        return <ContentReview />;
      case 'distribution':
        return <Distribution />;
      case 'citations':
        return <CitationTracking />;
      case 'performance':
        return <ContentPerformance />;
      case 'catalog':
        return <ProductCatalog />;
      case 'offers':
        return <OfferManagement />;
      case 'orders':
        return <Orders />;
      case 'payments':
        return <Payments />;
      case 'fulfillment':
        return <Fulfillment />;
      case 'projects':
        return <Projects />;
      case 'team':
        return <Team />;
      case 'brands':
        return <Brands />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col h-full`}>
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold">GEO Platform</h1>
                <p className="text-xs text-gray-400">Multi-Project Manager</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {navigation.map((section) => (
            <div key={section.title} className="mb-6">
              {sidebarOpen && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${
                      activePage === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Users size={20} />
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm flex-shrink-0">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Search className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search across projects..."
                className="w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              {/* Temporarily disabled BrandFilter for debugging */}
              {/* <BrandFilter
                allBrands={allBrands}
                selectedBrands={selectedBrands}
                onBrandsChange={setSelectedBrands}
              /> */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Upgrade Plan
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Portal;
