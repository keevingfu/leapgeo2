// @ts-nocheck
import React, { useMemo } from 'react';
import { Shield, Plus, TrendingUp, Target } from 'lucide-react';

interface BrandsProps {
  selectedBrands?: string[];
}

const Brands: React.FC<BrandsProps> = ({ selectedBrands = [] }) => {
  const allBrands = [
    { id: 'sweetnight', name: 'SweetNight', industry: 'Sleep Products', logo: '🛏️', projects: 1, citationRate: 0.32, contentPublished: 289 },
    { id: 'eufy', name: 'Eufy', industry: 'Smart Home', logo: '🤖', projects: 1, citationRate: 0.25, contentPublished: 178 },
    { id: 'hisense', name: 'Hisense', industry: 'Electronics', logo: '📺', projects: 1, citationRate: 0.28, contentPublished: 245 }
  ];

  // Filter brands based on selected brands
  const filteredBrands = useMemo(() => {
    if (!selectedBrands || selectedBrands.length === 0) {
      return allBrands;
    }
    return allBrands.filter(brand => selectedBrands.includes(brand.id));
  }, [selectedBrands]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600 mt-1">Manage brand profiles and performance</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Total Brands</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{filteredBrands.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Avg Citation Rate</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {filteredBrands.length > 0
              ? ((filteredBrands.reduce((sum, b) => sum + b.citationRate, 0) / filteredBrands.length) * 100).toFixed(1)
              : '0.0'}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Total Content</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {filteredBrands.reduce((sum, b) => sum + b.contentPublished, 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {filteredBrands.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500">No brands match the selected filters</p>
          </div>
        ) : (
          filteredBrands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">{brand.logo}</div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Active
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-xl mb-1">{brand.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{brand.industry}</p>
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Projects</span>
                <span className="font-semibold text-gray-900">{brand.projects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Citation Rate</span>
                <span className={`font-semibold ${brand.citationRate >= 0.30 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {(brand.citationRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Content Published</span>
                <span className="font-semibold text-gray-900">{brand.contentPublished}</span>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              View Dashboard
            </button>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Brands;
