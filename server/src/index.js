require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { initSocket } = require('./socket');

const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');

const app = express();
const server = http.createServer(app);

// Init socket
initSocket(server);

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
    // Replit support
    /\.replit\.dev$/,
    /\.repl\.co$/
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();
    await seedMenu();
  })
  .catch(err => console.error('❌ MongoDB error:', err));

// Seed admin
async function seedAdmin() {
  const Admin = require('./models/Admin');
  const bcrypt = require('bcryptjs');
  const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@zoop.com' });
  if (!existing) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await Admin.create({ email: process.env.ADMIN_EMAIL || 'admin@zoop.com', password: hash, name: 'Admin' });
    console.log('✅ Admin seeded:', process.env.ADMIN_EMAIL || 'admin@zoop.com');
  }
}

// Seed sample menu
async function seedMenu() {
  const MenuItem = require('./models/MenuItem');
  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany([
      { name: 'Classic Burger', description: 'Juicy beef patty with lettuce, tomato & special sauce', price: 8.99, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', available: true },
      { name: 'Double Smash', description: 'Double patty smashed to perfection, loaded with cheese', price: 11.99, category: 'Burgers', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', available: true },
      { name: 'Crispy Chicken', description: 'Crunchy golden chicken fillet with coleslaw', price: 9.49, category: 'Chicken', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80', available: true },
      { name: 'Spicy Wings (6pc)', description: 'Fire-glazed wings with blue cheese dip', price: 7.99, category: 'Chicken', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80', available: true },
      { name: 'Loaded Fries', description: 'Crispy fries with cheese sauce, bacon & jalapeños', price: 5.99, category: 'Sides', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80', available: true },
      { name: 'Onion Rings', description: 'Beer-battered golden rings', price: 4.49, category: 'Sides', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80', available: true },
      { name: 'Zoop Shake', description: 'Thick vanilla or chocolate shake', price: 4.99, category: 'Drinks', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', available: true },
      { name: 'Lemonade', description: 'Fresh squeezed with mint', price: 2.99, category: 'Drinks', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80', available: true },
    ]);
    console.log('✅ Menu seeded');
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
