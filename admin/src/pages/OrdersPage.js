import React, { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api, SOCKET_URL } from '../config';

const STATUS_FLOW = ['placed', 'preparing', 'ready', 'completed'];
const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
};
const STATUS_LABELS = { placed: '📋 Placed', preparing: '👨‍🍳 Preparing', ready: '🔔 Ready', completed: '✅ Done' };

export default function OrdersPage({ onOrdersViewed }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders?limit=100');
      setOrders(res.data);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    onOrdersViewed?.();
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket.emit('joinAdmin'));
    socket.on('newOrder', (order) => setOrders(prev => [order, ...prev.filter(o => o._id !== order._id)]));
    socket.on('orderStatusUpdated', ({ order }) => {
      if (order) setOrders(prev => prev.map(o => o._id === order._id ? order : o));
    });
    return () => socket.disconnect();
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try { await api.patch(`/orders/${orderId}/status`, { status: newStatus }); } catch (e) {}
    setUpdatingId(null);
  };

  const filteredOrders = orders.filter(o =>
    filter === 'active' ? ['placed', 'preparing', 'ready'].includes(o.status) : o.status === 'completed'
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl text-gray-900 tracking-wide">ORDERS</h2>
          <p className="text-gray-400 text-sm">{filteredOrders.length} {filter} orders</p>
        </div>
        <div className="flex gap-2">
          {['active', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${filter === f ? 'bg-[#FF6B2C] text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">No {filter} orders</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map(order => {
            const currentIdx = STATUS_FLOW.indexOf(order.status);
            const nextStatus = STATUS_FLOW[currentIdx + 1];
            return (
              <div key={order._id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 animate-slideIn">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">Table {order.tableNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.paymentMethod === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {order.paymentMethod === 'online' ? '📱 Online' : '💵 Cash'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">#{order._id?.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <span className="font-bold text-[#FF6B2C] text-lg">₹{order.totalAmount?.toFixed(2)}</span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.quantity}× {item.name}</span>
                      <span className="text-gray-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.customerNote && <p className="text-xs text-gray-400 italic pt-1 border-t border-gray-200 mt-1">Note: {order.customerNote}</p>}
                </div>

                {nextStatus && (
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => updateStatus(order._id, nextStatus)} disabled={updatingId === order._id}
                      className="flex-1 min-w-[120px] bg-[#FF6B2C] hover:bg-orange-400 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-all capitalize">
                      {updatingId === order._id ? 'Updating...' : `Mark as ${nextStatus}`}
                    </button>
                    {order.status !== 'placed' && (
                      <button onClick={() => updateStatus(order._id, 'completed')} disabled={updatingId === order._id}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-medium transition">
                        Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
