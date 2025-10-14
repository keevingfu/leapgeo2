// @ts-nocheck
import React from 'react';
import { ShoppingCart, Package, Truck, CheckCircle } from 'lucide-react';

interface OrdersProps {
  selectedBrands?: string[];
}

const Orders: React.FC<OrdersProps> = ({ selectedBrands = [] }) => {
  // Note: Orders will be filtered by brand when backend API supports brand-specific order data
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer orders and fulfillment</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'New Orders', value: '24', icon: ShoppingCart, color: 'blue' },
          { label: 'Processing', value: '18', icon: Package, color: 'yellow' },
          { label: 'Shipped', value: '156', icon: Truck, color: 'purple' },
          { label: 'Delivered', value: '892', icon: CheckCircle, color: 'green' }
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
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { id: '#ORD-2024-1234', customer: 'John Smith', product: 'SweetNight CoolNest Queen', amount: 899.99, status: 'Shipped', date: '2025-01-10' },
              { id: '#ORD-2024-1233', customer: 'Sarah Johnson', product: 'Eufy X10 Pro', amount: 799.99, status: 'Processing', date: '2025-01-10' },
              { id: '#ORD-2024-1232', customer: 'Mike Davis', product: 'Hisense U8K 65"', amount: 1299.99, status: 'Delivered', date: '2025-01-09' }
            ].map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-blue-600">{order.id}</td>
                <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                <td className="px-6 py-4 text-gray-700">{order.product}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">${order.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
