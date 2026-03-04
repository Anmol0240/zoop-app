import React, { useEffect, useState } from 'react';
import { api } from '../config';

const EMPTY_FORM = { name: '', description: '', price: '', category: 'Burgers', image: '', available: true, dailyLimit: 0 };
const CATEGORIES = ['Burgers', 'Chicken', 'Sides', 'Drinks', 'Specials'];

export default function MenuManagementPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try { const res = await api.get('/menu/all'); setItems(res.data); } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const data = { ...form, price: parseFloat(form.price), dailyLimit: parseInt(form.dailyLimit) || 0 };
      if (editId) await api.put(`/menu/${editId}`, data);
      else await api.post('/menu', data);
      await fetchItems();
      setForm(EMPTY_FORM); setEditId(null); setShowForm(false);
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    setSaving(false);
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, description: item.description || '', price: item.price, category: item.category, image: item.image || '', available: item.available, dailyLimit: item.dailyLimit || 0 });
    setEditId(item._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await api.delete(`/menu/${id}`); fetchItems();
  };

  const toggleAvailable = async (item) => {
    await api.put(`/menu/${item._id}`, { ...item, available: !item.available }); fetchItems();
  };

  const resetDailyCount = async (item) => {
    await api.put(`/menu/${item._id}`, { ...item, dailySold: 0, lastResetDate: '' }); fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl text-gray-900 tracking-wide">MENU</h2>
          <p className="text-gray-400 text-sm">{items.length} items</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
          className="bg-[#FF6B2C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-400 transition">
          + Add Item
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-2xl text-gray-900 mb-5">{editId ? 'EDIT ITEM' : 'NEW ITEM'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[['name', 'Name *', 'text', true], ['description', 'Description', 'text', false], ['price', 'Price (₹) *', 'number', true], ['image', 'Image URL', 'text', false]].map(([field, label, type, req]) => (
                <div key={field}>
                  <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">{label}</label>
                  <input type={type} step={field === 'price' ? '0.01' : undefined}
                    value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    required={req}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
                </div>
              ))}
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Daily Limit (0 = unlimited)</label>
                <input type="number" min="0" value={form.dailyLimit} onChange={e => setForm(f => ({ ...f, dailyLimit: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
                <p className="text-gray-400 text-xs mt-1">Set max qty customers can order per day. Resets at midnight.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-gray-600">Available</span>
              </label>
              {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#FF6B2C] text-white rounded-xl py-3 font-semibold hover:bg-orange-400 disabled:opacity-60 transition">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-3 font-semibold hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(item => {
            const today = new Date().toISOString().split('T')[0];
            const isReset = item.lastResetDate !== today;
            const sold = isReset ? 0 : (item.dailySold || 0);
            const hasLimit = item.dailyLimit > 0;
            const remaining = hasLimit ? item.dailyLimit - sold : null;

            return (
              <div key={item._id} className={`bg-white rounded-2xl overflow-hidden border shadow-sm transition ${item.available ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
                <div className="relative">
                  <img src={item.image || 'https://via.placeholder.com/300?text=Food'} alt={item.name}
                    className="w-full h-24 sm:h-28 object-cover" onError={e => e.target.src = 'https://via.placeholder.com/300?text=Food'} />
                  {hasLimit && (
                    <div className={`absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${remaining <= 0 ? 'bg-red-500 text-white' : remaining <= 5 ? 'bg-orange-500 text-white' : 'bg-white/90 text-gray-700'}`}>
                      {remaining <= 0 ? 'SOLD OUT' : `${remaining}/${item.dailyLimit}`}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-[#FF6B2C] font-bold text-sm">₹{item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                    {hasLimit && <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Limit: {item.dailyLimit}</span>}
                  </div>
                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    <button onClick={() => handleEdit(item)} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg py-1.5 font-medium transition min-w-[50px]">Edit</button>
                    <button onClick={() => toggleAvailable(item)} className={`flex-1 text-xs rounded-lg py-1.5 font-medium transition min-w-[50px] ${item.available ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}>
                      {item.available ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 rounded-lg px-2 py-1.5 transition">🗑</button>
                  </div>
                  {hasLimit && sold > 0 && (
                    <button onClick={() => resetDailyCount(item)} className="w-full mt-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg py-1.5 transition">↺ Reset Count</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
