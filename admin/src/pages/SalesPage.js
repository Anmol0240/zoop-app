import React, { useEffect, useState } from 'react';
import { api } from '../config';

export default function SalesPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Today's Orders", value: stats.todayOrders, icon: '📦', color: 'bg-blue-50 border-blue-100', text: 'text-blue-600' },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toFixed(2)}`, icon: '💰', color: 'bg-green-50 border-green-100', text: 'text-green-600' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'bg-yellow-50 border-yellow-100', text: 'text-yellow-600' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📊', color: 'bg-purple-50 border-purple-100', text: 'text-purple-600' },
    { label: 'Completed', value: stats.completedOrders, icon: '✅', color: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: '💎', color: 'bg-orange-50 border-orange-100', text: 'text-orange-600' },
  ] : [];

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-3xl sm:text-4xl text-gray-900 tracking-wide">SALES</h2>
        <p className="text-gray-400 text-sm">Restaurant performance overview</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {cards.map((card, i) => (
            <div key={i} className={`rounded-2xl p-4 sm:p-5 border ${card.color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider leading-tight">{card.label}</p>
                  <p className={`font-display text-2xl sm:text-3xl mt-1 ${card.text}`}>{card.value}</p>
                </div>
                <span className="text-xl sm:text-2xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 bg-white rounded-2xl p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-3">Quick Tips</h3>
        <div className="space-y-2.5 text-sm text-gray-500">
          <p>📱 Share your customer app URL or generate a QR code pointing to <strong>localhost:3000</strong></p>
          <p>🔄 Revenue updates when you refresh this page</p>
          <p>⏰ Daily item limits reset automatically at midnight</p>
          <p>💳 Online payment integration available — contact support to enable Razorpay</p>
        </div>
      </div>
    </div>
  );
}
