import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api, SOCKET_URL } from '../config';

const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📋', desc: 'We got your order!' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', desc: 'Kitchen is cooking...' },
  { key: 'ready', label: 'Ready', icon: '🔔', desc: 'Your food is ready!' },
  { key: 'completed', label: 'Completed', icon: '✅', desc: 'Enjoy your meal!' },
];

const STATUS_INDEX = { placed: 0, preparing: 1, ready: 2, completed: 3 };

export default function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/orders/${orderId}`).then(r => { setOrder(r.data); setLoading(false); }).catch(() => setLoading(false));
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket.emit('joinOrder', orderId));
    socket.on('orderStatusUpdated', ({ orderId: oid, status }) => {
      if (oid === orderId) setOrder(prev => prev ? { ...prev, status } : prev);
    });
    return () => socket.disconnect();
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#FF6B2C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-6 text-center">
      <p className="text-4xl mb-4">😕</p>
      <h2 className="text-white font-display text-3xl mb-2">ORDER NOT FOUND</h2>
      <button onClick={() => navigate('/')} className="mt-4 bg-[#FF6B2C] text-white px-6 py-3 rounded-full">Back to Menu</button>
    </div>
  );

  const currentStep = STATUS_INDEX[order.status] ?? 0;
  const progressPct = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-16">
        <div className="text-center mb-6">
          <h1 className="font-display text-5xl text-white tracking-widest">ZOOP</h1>
          <p className="text-white/40 text-xs mt-1">Real-time Order Tracking</p>
        </div>

        {/* Order ID card */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 mb-5">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Order ID</p>
              <p className="text-white font-mono text-sm">#{order._id?.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-wider">Table</p>
              <p className="text-white font-bold text-sm">{order.tableNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-wider">Payment</p>
              <p className={`text-sm font-bold capitalize ${order.paymentMethod === 'online' ? 'text-blue-400' : 'text-green-400'}`}>
                {order.paymentMethod === 'online' ? '📱 Online' : '💵 Cash'}
              </p>
            </div>
          </div>
        </div>

        {/* Status banner */}
        <div className={`rounded-2xl p-5 mb-6 text-center transition-all duration-700 ${
          order.status === 'completed' ? 'bg-green-500/20 border border-green-500/30' :
          order.status === 'ready' ? 'bg-yellow-500/20 border border-yellow-500/30' :
          'bg-[#FF6B2C]/20 border border-[#FF6B2C]/30'}`}>
          <div className="text-4xl mb-2">{STEPS[currentStep]?.icon}</div>
          <h2 className="text-white font-display text-2xl tracking-wide">{STEPS[currentStep]?.label?.toUpperCase()}</h2>
          <p className="text-white/60 text-sm mt-1">{STEPS[currentStep]?.desc}</p>
          {order.status === 'ready' && <p className="text-yellow-400 font-semibold text-sm mt-2 animate-pulse">🔔 Please collect your order!</p>}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FF6B2C] to-orange-400 rounded-full progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between mt-4">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex flex-col items-center" style={{ width: '25%' }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500 ${i <= currentStep ? 'bg-[#FF6B2C] border-[#FF6B2C] shadow-lg shadow-orange-900/50' : 'bg-[#1a1a1a] border-white/10'}`}>
                  {i < currentStep ? '✓' : step.icon}
                </div>
                <p className={`text-xs mt-2 text-center font-medium transition-colors duration-500 leading-tight ${i <= currentStep ? 'text-[#FF6B2C]' : 'text-white/30'}`}>{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order items */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 mb-4">
          <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Your Items</h3>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-white">{item.quantity}× {item.name}</span>
                <span className="text-white/60">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3 mt-3 flex justify-between font-bold">
            <span className="text-white">Total</span>
            <span className="text-[#FF6B2C]">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Order again button - always visible */}
        <button onClick={() => navigate('/')}
          className={`w-full rounded-2xl py-4 font-bold transition text-white ${order.status === 'completed' ? 'bg-[#FF6B2C] hover:bg-orange-400' : 'bg-white/5 hover:bg-white/10'}`}>
          {order.status === 'completed' ? '🍔 Order Again' : '← Back to Menu & Order More'}
        </button>

        <p className="text-center text-white/20 text-xs mt-5">Updates automatically · no refresh needed</p>
      </div>
    </div>
  );
}
