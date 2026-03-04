const router = require('express').Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const { getIO } = require('../socket');

// Helper: reset daily sold if new day
async function checkAndResetDaily(item) {
  const today = new Date().toISOString().split('T')[0];
  if (item.lastResetDate !== today) {
    item.dailySold = 0;
    item.lastResetDate = today;
    await item.save();
  }
}

// Public: place order
router.post('/', async (req, res) => {
  try {
    const { items } = req.body;

    // Check daily limits
    for (const orderItem of items) {
      if (orderItem.menuItem) {
        const menuItem = await MenuItem.findById(orderItem.menuItem);
        if (menuItem) {
          await checkAndResetDaily(menuItem);
          if (menuItem.dailyLimit > 0) {
            const remaining = menuItem.dailyLimit - menuItem.dailySold;
            if (orderItem.quantity > remaining) {
              return res.status(400).json({
                message: `Sorry! Only ${remaining} "${menuItem.name}" left for today.`
              });
            }
          }
        }
      }
    }

    const order = await Order.create(req.body);

    // Update daily sold counts
    for (const orderItem of items) {
      if (orderItem.menuItem) {
        await MenuItem.findByIdAndUpdate(orderItem.menuItem, {
          $inc: { dailySold: orderItem.quantity }
        });
      }
    }

    await order.populate('items.menuItem');

    try { getIO().to('admin').emit('newOrder', order); } catch (e) {}

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Public: get single order (for tracking)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get all orders
router.get('/', auth, async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('items.menuItem');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate('items.menuItem');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    try {
      getIO().to(`order_${order._id}`).emit('orderStatusUpdated', { orderId: order._id, status: order.status, order });
      getIO().to('admin').emit('orderStatusUpdated', { orderId: order._id, status: order.status, order });
    } catch (e) {}

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
