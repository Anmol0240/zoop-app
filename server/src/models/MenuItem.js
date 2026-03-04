const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  available: { type: Boolean, default: true },
  dailyLimit: { type: Number, default: 0 }, // 0 = unlimited
  dailySold: { type: Number, default: 0 },
  lastResetDate: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
