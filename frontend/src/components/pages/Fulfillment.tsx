// @ts-nocheck
import React from 'react';
import { Truck, Package, MapPin, Clock } from 'lucide-react';

interface FulfillmentProps {
  selectedBrands?: string[];
}

const Fulfillment: React.FC<FulfillmentProps> = ({ selectedBrands = [] }) => {
  // Note: Fulfillment tracking will be filtered by brand when backend API supports brand-specific shipment data
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fulfillment</h1>
        <p className="text-gray-600 mt-1">Track shipments and delivery status</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Ready to Ship', value: '24', icon: Package, color: 'blue' },
          { label: 'In Transit', value: '156', icon: Truck, color: 'purple' },
          { label: 'Out for Delivery', value: '34', icon: MapPin, color: 'yellow' },
          { label: 'Avg Delivery Time', value: '2.3 days', icon: Clock, color: 'green' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <h3 className="font-semibold text-gray-700">{stat.label}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Active Shipments</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tracking #</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Carrier</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { tracking: 'TRK-1234567890', order: '#ORD-2024-1234', carrier: 'FedEx', destination: 'New York, NY', status: 'In Transit', eta: '2025-01-12' },
              { tracking: 'TRK-0987654321', order: '#ORD-2024-1233', carrier: 'UPS', destination: 'Los Angeles, CA', status: 'Out for Delivery', eta: '2025-01-11' },
              { tracking: 'TRK-5555555555', order: '#ORD-2024-1232', carrier: 'USPS', destination: 'Chicago, IL', status: 'In Transit', eta: '2025-01-13' }
            ].map((shipment) => (
              <tr key={shipment.tracking} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-blue-600">{shipment.tracking}</td>
                <td className="px-6 py-4 text-gray-900">{shipment.order}</td>
                <td className="px-6 py-4 text-gray-700">{shipment.carrier}</td>
                <td className="px-6 py-4 text-gray-700">{shipment.destination}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    shipment.status === 'Out for Delivery' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{shipment.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fulfillment;
