// @ts-nocheck
import React from 'react';
import { CreditCard, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';

interface PaymentsProps {
  selectedBrands?: string[];
}

const Payments: React.FC<PaymentsProps> = ({ selectedBrands = [] }) => {
  // Note: Payment metrics will be filtered by brand when backend API supports brand-specific payment data
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Track and manage payment transactions</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Today\'s Revenue', value: '$12.4K', icon: DollarSign, color: 'green' },
          { label: 'Pending Payments', value: '$8.2K', icon: CreditCard, color: 'yellow' },
          { label: 'Completed', value: '234', icon: CheckCircle, color: 'blue' },
          { label: 'Success Rate', value: '98.5%', icon: TrendingUp, color: 'purple' }
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
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { id: 'TXN-20250110-001', customer: 'John Smith', amount: 899.99, method: 'Visa •••• 4242', status: 'Completed', date: '2025-01-10 14:30' },
              { id: 'TXN-20250110-002', customer: 'Sarah Johnson', amount: 799.99, method: 'Mastercard •••• 8888', status: 'Pending', date: '2025-01-10 13:15' },
              { id: 'TXN-20250110-003', customer: 'Mike Davis', amount: 1299.99, method: 'PayPal', status: 'Completed', date: '2025-01-10 11:45' }
            ].map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-blue-600">{txn.id}</td>
                <td className="px-6 py-4 text-gray-900">{txn.customer}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">${txn.amount}</td>
                <td className="px-6 py-4 text-gray-700">{txn.method}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    txn.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {txn.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{txn.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
