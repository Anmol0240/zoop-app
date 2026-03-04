import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartBar() {
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50">
      <button
        onClick={() => navigate('/cart')}
        className="w-full bg-[#FF6B2C] hover:bg-orange-400 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-2xl shadow-orange-900/50 transition-all active:scale-98 animate-pulse-glow"
      >
        <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">{totalItems}</span>
        <span className="font-semibold text-sm">View Cart</span>
        <span className="font-bold">${totalPrice.toFixed(2)}</span>
      </button>
    </div>
  );
}
