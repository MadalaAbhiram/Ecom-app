const express = require("express");
const router = express.Router();
const Order = require("../models/Order"); // You'll create this model file

// Middleware to check if user is authenticated
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  // In real app, verify JWT token here
  // For now, just continue
  req.user = { id: "user123", role: "user" }; // Mock user
  next();
};

// User creates an order (status = PENDING)
router.post("/create", auth, async (req, res) => {
  try {
    const { userId, userName, userEmail, products, totalAmount } = req.body;

    // Create new order
    const newOrder = new Order({
      orderId: `ORD-${Date.now()}`,
      userId: userId,
      userName: userName,
      userEmail: userEmail,
      products: products,
      totalAmount: totalAmount,
      status: "PENDING" // Waiting for admin approval
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created! Waiting for admin approval",
      orderId: newOrder.orderId,
      status: "PENDING"
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error });
  }
});

// Get all PENDING orders (Admin view)
router.get("/pending", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only access" });
    }

    const pendingOrders = await Order.find({ status: "PENDING" }).sort({
      createdAt: -1
    });

    res.json(pendingOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

// Get all APPROVED orders
router.get("/approved", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only access" });
    }

    const approvedOrders = await Order.find({ status: "APPROVED" }).sort({
      createdAt: -1
    });

    res.json(approvedOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

// Get all REJECTED orders
router.get("/rejected", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only access" });
    }

    const rejectedOrders = await Order.find({ status: "REJECTED" }).sort({
      createdAt: -1
    });

    res.json(rejectedOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

// Get user's own orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const userOrders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1
    });

    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

// Admin approves order
router.put("/:orderId/approve", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only access" });
    }

    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "APPROVED", // Order approved
        approvedAt: new Date(),
        approvedBy: req.user.id
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "✅ Order approved successfully!",
      order: order
    });
  } catch (error) {
    res.status(500).json({ message: "Error approving order", error });
  }
});

// Admin rejects order
router.put("/:orderId/reject", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only access" });
    }

    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "REJECTED", // Order rejected
        rejectionReason: reason,
        approvedAt: new Date(),
        approvedBy: req.user.id
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "❌ Order rejected",
      order: order
    });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting order", error });
  }
});

module.exports = router;