// 极简Portal - 逐步添加功能来定位问题
import React from 'react';
import { Home } from 'lucide-react';

const PortalDebug: React.FC = () => {
  return (
    <div className="h-screen bg-gray-100 flex">
      <div className="w-64 bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold">Debug Portal</h1>
        <button className="w-full flex items-center gap-2 px-3 py-2 mt-4 rounded-lg bg-blue-600">
          <Home size={18} />
          <span>Dashboard</span>
        </button>
      </div>
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold">Portal Debug - Step 1</h1>
        <p className="mt-4">If you see this, basic structure works!</p>
      </div>
    </div>
  );
};

export default PortalDebug;
