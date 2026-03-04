import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { SOCKET_URL } from '../config';
import OrdersPage from './OrdersPage';
import MenuPage from './MenuManagementPage';
import SalesPage from './SalesPage';

export default function DashboardLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket.emit('joinAdmin'));
    socket.on('newOrder', (order) => {
      setNewOrderCount(c => c + 1);
      setNotification({ message: `New order from Table ${order.tableNumber}!`, id: Date.now() });
      setTimeout(() => setNotification(null), 4000);
    });
    return () => socket.disconnect();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/', label: 'Orders', icon: '📋', exact: true },
    { to: '/menu', label: 'Menu', icon: '🍔' },
    { to: '/sales', label: 'Sales', icon: '📊' },
  ];

  const NavLinks = () => (
    <>
      {navItems.map(item => (
        <NavLink key={item.to} to={item.to} end={item.exact}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-[#FF6B2C] text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
          <span>{item.icon}</span>
          <span>{item.label}</span>
          {item.label === 'Orders' && newOrderCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{newOrderCount}</span>
          )}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar - desktop always visible, mobile slide-in */}
      <aside className={`w-56 bg-[#0d0d0d] flex flex-col fixed h-full z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="font-display text-4xl text-[#FF6B2C] tracking-widest">ZOOP</h1>
          <p className="text-white/30 text-xs mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1"><NavLinks /></nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-white/40 text-xs mb-2 truncate">{admin?.email}</p>
          <button onClick={handleLogout} className="text-white/40 hover:text-white text-xs transition">Sign out →</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-56">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border-b border-white/10 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-white text-xl p-1">☰</button>
          <h1 className="font-display text-2xl text-[#FF6B2C] tracking-widest">ZOOP</h1>
          {newOrderCount > 0 && <span className="bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">{newOrderCount}</span>}
          {newOrderCount === 0 && <div className="w-8" />}
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Notification */}
          {notification && (
            <div className="fixed top-4 right-4 bg-[#FF6B2C] text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-slideIn">
              <span>🔔</span>
              <span className="font-medium text-sm">{notification.message}</span>
            </div>
          )}
          <Routes>
            <Route path="/" element={<OrdersPage onOrdersViewed={() => setNewOrderCount(0)} />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/sales" element={<SalesPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
