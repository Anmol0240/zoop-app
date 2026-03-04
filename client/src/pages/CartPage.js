import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../config';
import { getCustomerId } from '../utils/customerId';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart, totalPrice, tableNumber, setTableNumber } = useCart();
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const placeOrder = async () => {
    if (!tableNumber.trim()) return setError('Please enter your table number');
    if (cart.length === 0) return setError('Your cart is empty');
    setLoading(true);
    setError('');
    try {
      const orderData = {
        tableNumber: tableNumber.trim(),
        items: cart.map(i => ({ menuItem: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        totalAmount: totalPrice,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
        customerNote: note
      };
      const res = await api.post('/orders', orderData);
      // Save to localStorage for order history
      try {
        const saved = JSON.parse(localStorage.getItem('zoop_orders_' + getCustomerId()) || '[]');
        saved.unshift({ id: res.data._id, createdAt: res.data.createdAt });
        localStorage.setItem('zoop_orders_' + getCustomerId(), JSON.stringify(saved.slice(0, 20)));
      } catch (e) {}
      clearCart();
      navigate(`/track/${res.data._id}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-white font-display text-3xl mb-2">CART IS EMPTY</h2>
        <p className="text-white/40 text-sm mb-6">Go add some delicious items!</p>
        <button onClick={() => navigate('/')} className="bg-[#FF6B2C] text-white px-8 py-3 rounded-full font-semibold">Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 p-4 pt-8">
          <button onClick={() => navigate('/')} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition">←</button>
          <h1 className="font-display text-3xl text-white tracking-wide">YOUR ORDER</h1>
        </div>

        <div className="px-4 pb-48 space-y-3 mt-2">
          {/* Items */}
          {cart.map(item => (
            <div key={item._id} className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center gap-3 border border-white/5">
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" onError={e => e.target.src = 'https://via.placeholder.com/60'} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                <p className="text-[#FF6B2C] font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => updateQty(item._id, item.quantity - 1)} className="w-7 h-7 bg-white/10 rounded-full text-white font-bold flex items-center justify-center hover:bg-white/20">−</button>
                <span className="text-white text-sm w-4 text-center font-bold">{item.quantity}</span>
                <button onClick={() => updateQty(item._id, item.quantity + 1)} className="w-7 h-7 bg-[#FF6B2C] rounded-full text-white font-bold flex items-center justify-center hover:bg-orange-400">+</button>
              </div>
            </div>
          ))}

          {/* Table Number */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2 block">Table Number *</label>
            <input type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)}
              placeholder="e.g. Table 5"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6B2C] text-sm transition" />
          </div>

          {/* Payment Method */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3 block">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPaymentMethod('cash')}
                className={`py-3 px-4 rounded-xl border-2 transition-all text-sm font-semibold flex items-center justify-center gap-2 ${paymentMethod === 'cash' ? 'border-[#FF6B2C] bg-[#FF6B2C]/10 text-[#FF6B2C]' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
                💵 Cash
              </button>
              <button onClick={() => setPaymentMethod('online')}
                className={`py-3 px-4 rounded-xl border-2 transition-all text-sm font-semibold flex items-center justify-center gap-2 ${paymentMethod === 'online' ? 'border-[#FF6B2C] bg-[#FF6B2C]/10 text-[#FF6B2C]' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
                📱 UPI / Online
              </button>
            </div>
            {paymentMethod === 'online' && (
              <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <p className="text-yellow-400 text-xs text-center">🔔 Online payment coming soon. Please pay via cash or ask staff for QR code.</p>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2 block">Special Instructions (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Allergies, no onions, extra sauce..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#FF6B2C] text-sm resize-none transition" />
          </div>

          {/* Total */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
            <div className="flex justify-between text-white/40 text-sm mb-1">
              <span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2 mt-2">
              <span>Total</span><span className="text-[#FF6B2C]">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl p-3">{error}</p>}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d0d0d] to-transparent">
          <div className="max-w-lg mx-auto">
            <button onClick={placeOrder} disabled={loading}
              className="w-full bg-[#FF6B2C] hover:bg-orange-400 disabled:opacity-60 text-white rounded-2xl py-4 font-bold text-base shadow-2xl shadow-orange-900/50 transition-all active:scale-98">
              {loading ? 'Placing Order...' : `Place Order · ₹${totalPrice.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
