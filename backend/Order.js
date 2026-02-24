const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: String,
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  userEmail: String,
  products: [
    {
      productId: String,
      productName: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
    default: "PENDING"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  approvedBy: String, // Admin ID
  rejectionReason: String
});

module.exports = mongoose.model("Order", orderSchema);