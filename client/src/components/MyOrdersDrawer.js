import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config';
import { getCustomerId } from '../utils/customerId.js';

const STATUS_COLORS = {
  placed: 'bg-blue-500',
  preparing: 'bg-yellow-500',
  ready: 'bg-green-500',
  completed: 'bg-gray-400',
};

const STATUS_LABELS = {
  placed: '📋 Placed',
  preparing: '👨‍🍳 Preparing',
  ready: '🔔 Ready!',
  completed: '✅ Done',
};

export default function MyOrdersDrawer({ open, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getStorageKey = () => 'zoop_orders_' + getCustomerId();

  const getSavedOrders = () => {
    try {
      return JSON.parse(localStorage.getItem(getStorageKey()) || '[]');
    } catch { return []; }
  };

  useEffect(() => {
    if (!open) return;
    const saved = getSavedOrders();
    if (saved.length === 0) { setOrders([]); return; }
    setLoading(true);

    // Fetch latest status for all saved orders
    Promise.all(
      saved.map(o => api.get(`/orders/${o.id}`).then(r => r.data).catch(() => null))
    ).then(results => {
      const updated = results
        .filter(Boolean)
        .map(o => ({
          id: o._id,
          tableNumber: o.tableNumber,
          status: o.status,
          totalAmount: o.totalAmount,
          items: o.items,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt,
        }));

      // Save updated statuses back
      localStorage.setItem(getStorageKey(), JSON.stringify(
        updated.map(o => ({ id: o.id, createdAt: o.createdAt }))
      ));

      setOrders(updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    });
  }, [open]);

  const clearAll = () => {
    localStorage.removeItem(getStorageKey());
    setOrders([]);
  };

  const goToOrder = (id) => {
    onClose();
    navigate(`/track/${id}`);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-slideUp">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h2 className="font-display text-2xl text-white tracking-wide">MY ORDERS</h2>
          <div className="flex items-center gap-3">
            {orders.length > 0 && (
              <button onClick={clearAll} className="text-white/30 hover:text-white/60 text-xs transition">Clear all</button>
            )}
            <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition text-lg">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#FF6B2C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-white/40 font-medium">No orders yet</p>
              <p className="text-white/20 text-sm mt-1">Your orders will appear here</p>
            </div>
          ) : (
            orders.map(order => (
              <button key={order.id} onClick={() => goToOrder(order.id)}
                className="w-full bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 hover:border-orange-500/30 transition-all text-left group">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">Table {order.tableNumber}</p>
                    <p className="text-white/30 text-xs mt-0.5">
                      #{order.id?.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs text-white px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-white/20 group-hover:text-white/60 transition text-sm">→</span>
                  </div>
                </div>

                <div className="text-white/40 text-xs mb-2 line-clamp-1">
                  {order.items?.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs capitalize">{order.paymentMethod === 'online' ? '📱 Online' : '💵 Cash'}</span>
                  <span className="text-[#FF6B2C] font-bold text-sm">₹{order.totalAmount?.toFixed(2)}</span>
                </div>

                {/* Mini progress */}
                <div className="mt-3 flex gap-1">
                  {['placed', 'preparing', 'ready', 'completed'].map((s, i) => {
                    const steps = ['placed', 'preparing', 'ready', 'completed'];
                    const current = steps.indexOf(order.status);
                    return (
                      <div key={s} className={`h-1 flex-1 rounded-full transition-all ${i <= current ? 'bg-[#FF6B2C]' : 'bg-white/10'}`} />
                    );
                  })}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
