import React, { useEffect, useState } from 'react';
import { api } from '../config';
import { useCart } from '../context/CartContext';
import MenuCard from '../components/MenuCard';
import CartBar from '../components/CartBar';
import MyOrdersDrawer from '../components/MyOrdersDrawer';
import { getCustomerId } from '../utils/customerId';

const CATEGORIES = ['All', 'Burgers', 'Chicken', 'Sides', 'Drinks'];

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showOrders, setShowOrders] = useState(false);
  const { totalItems } = useCart();

  const savedOrderCount = () => {
    try { return JSON.parse(localStorage.getItem('zoop_orders_' + getCustomerId()) || '[]').length; } catch { return 0; }
  };
  const [orderCount, setOrderCount] = useState(savedOrderCount);

  useEffect(() => {
    api.get('/menu').then(r => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // Refresh count when drawer closes
  const handleDrawerClose = () => {
    setShowOrders(false);
    setOrderCount(savedOrderCount());
  };

  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#FF6B2C] to-[#E63B1F] pt-8 pb-14 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-6xl sm:text-7xl text-white tracking-wider drop-shadow-lg">ZOOP</h1>
              <p className="text-orange-100 text-sm mt-1 font-medium">Fast. Fresh. Fired Up.</p>
            </div>
            {/* My Orders Button */}
            <button
              onClick={() => setShowOrders(true)}
              className="relative flex flex-col items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-2xl px-4 py-3 transition-all active:scale-95"
            >
              <span className="text-xl">🧾</span>
              <span className="text-xs font-semibold">My Orders</span>
              {orderCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#FF6B2C] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {orderCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] border-b border-white/5">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto max-w-2xl mx-auto" style={{scrollbarWidth:'none'}}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-[#FF6B2C] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-2xl mx-auto px-4 py-5 pb-32">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white/5 rounded-2xl h-52 animate-pulse" />)}
          </div>
        ) : (
          <>
            <p className="text-white/30 text-xs mb-3">{filtered.length} items</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((item, i) => (
                <div key={item._id} className="animate-slideUp" style={{ animationDelay: `${i * 0.04}s` }}>
                  <MenuCard item={item} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {totalItems > 0 && <CartBar />}

      {/* My Orders Drawer */}
      <MyOrdersDrawer
        open={showOrders}
        onClose={handleDrawerClose}
      />
    </div>
  );
}
