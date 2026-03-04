import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function MenuCard({ item }) {
  const { addToCart, cart, updateQty } = useCart();
  const cartItem = cart.find(i => i._id === item._id);
  const [added, setAdded] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isReset = item.lastResetDate !== today;
  const sold = isReset ? 0 : (item.dailySold || 0);
  const remaining = item.dailyLimit > 0 ? item.dailyLimit - sold : null;
  const isSoldOut = remaining !== null && remaining <= 0;

  const handleAdd = () => {
    if (isSoldOut) return;
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <div className={`bg-[#1a1a1a] rounded-2xl overflow-hidden border flex flex-col group transition-all duration-300 ${isSoldOut ? 'opacity-50 border-white/5' : 'border-white/5 hover:border-orange-500/30'}`}>
      <div className="relative h-28 sm:h-32 overflow-hidden bg-black/20">
        <img src={item.image || 'https://via.placeholder.com/400x300?text=Food'} alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=Food'; }} />
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">SOLD OUT</span>
          </div>
        )}
        {remaining !== null && !isSoldOut && remaining <= 5 && (
          <div className="absolute top-2 right-2">
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{remaining} left</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-1">{item.name}</h3>
        <p className="text-white/40 text-xs mt-0.5 line-clamp-2 flex-1">{item.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#FF6B2C] font-bold text-sm">₹{item.price.toFixed(2)}</span>
          {!isSoldOut && (
            cartItem ? (
              <div className="flex items-center gap-1 bg-[#FF6B2C]/10 rounded-full px-1">
                <button onClick={() => updateQty(item._id, cartItem.quantity - 1)} className="w-6 h-6 text-[#FF6B2C] font-bold text-base flex items-center justify-center hover:bg-white/10 rounded-full">−</button>
                <span className="text-white text-xs font-bold w-4 text-center">{cartItem.quantity}</span>
                <button onClick={() => updateQty(item._id, cartItem.quantity + 1)} className="w-6 h-6 text-[#FF6B2C] font-bold text-base flex items-center justify-center hover:bg-white/10 rounded-full">+</button>
              </div>
            ) : (
              <button onClick={handleAdd}
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${added ? 'bg-green-500 scale-90' : 'bg-[#FF6B2C] hover:bg-orange-400 active:scale-90'}`}>
                {added ? '✓' : '+'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
