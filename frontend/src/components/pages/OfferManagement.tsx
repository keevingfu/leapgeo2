// @ts-nocheck
import React from 'react';
import { Globe, Plus, TrendingUp } from 'lucide-react';

interface OfferManagementProps {
  selectedBrands?: string[];
}

const OfferManagement: React.FC<OfferManagementProps> = ({ selectedBrands = [] }) => {
  // Note: Offer management will support brand-specific offers in future updates
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offer Management</h1>
          <p className="text-gray-600 mt-1">Create and manage promotional offers</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Offer
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Active Offers</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Redemptions</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">2,341</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Revenue Impact</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">$45.2K</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Offers</h2>
        <div className="space-y-4">
          {[
            { name: '20% Off SweetNight Mattresses', code: 'SWEET20', used: 234, limit: 1000, expires: '2025-02-15' },
            { name: 'Buy Eufy X10 Get Free Station', code: 'EUFYFREE', used: 56, limit: 200, expires: '2025-01-31' },
            { name: '$200 Off Hisense U8K TVs', code: 'HISENSE200', used: 89, limit: 500, expires: '2025-03-01' }
          ].map((offer) => (
            <div key={offer.code} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                  <p className="text-sm text-gray-500">Code: {offer.code} • Expires: {offer.expires}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Used: {offer.used} / {offer.limit}</div>
                  <div className="text-xs text-gray-500">{Math.round((offer.used / offer.limit) * 100)}% redeemed</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfferManagement;
