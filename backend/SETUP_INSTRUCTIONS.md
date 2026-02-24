# 🛒 PURCHASE APPROVAL SYSTEM - SETUP INSTRUCTIONS

## ✅ What Has Been Created

### Frontend Components (React)
1. **Cart.jsx** - Updated with purchase approval system
   - User can click "Buy Products" button
   - Creates order with PENDING status
   - Waits for admin approval

2. **ApproveOrders.jsx** - Admin dashboard
   - View all PENDING, APPROVED, REJECTED orders
   - Approve or reject orders
   - Add rejection reason
   - See order details in modal

### Backend Files (Node/Express)
1. **backend/orders.js** - API routes for orders
   - POST /api/orders/create - User creates order
   - GET /api/orders/pending - Get pending orders (admin only)
   - GET /api/orders/approved - Get approved orders (admin only)
   - GET /api/orders/rejected - Get rejected orders (admin only)
   - PUT /api/orders/:orderId/approve - Admin approves order
   - PUT /api/orders/:orderId/reject - Admin rejects order

2. **backend/Order.js** - MongoDB Schema
   - Stores order details
   - Tracks status: PENDING, APPROVED, REJECTED, COMPLETED
   - Stores admin approval info

---

## 🚀 HOW TO IMPLEMENT

### Step 1: Update your App.jsx/Routes

Add new route for admin approval page:

```jsx
import ApproveOrders from "./components/ApproveOrders";

<Route path="/approve-orders" element={<ApproveOrders />} />
```

### Step 2: Add to your Navigation/Header

Add link to admin dashboard (only show for admins):

```jsx
{localStorage.getItem("role") === "admin" && (
  <Link to="/approve-orders">📋 Admin Orders</Link>
)}
```

### Step 3: Backend Setup (Node.js)

In your main server file (app.js or server.js):

```javascript
const orderRoutes = require("./backend/orders");
app.use("/api/orders", orderRoutes);
```

### Step 4: Update Login.jsx

Make sure to save user role to localStorage:

```jsx
const data = await response.json();
localStorage.setItem("token", data.token);
localStorage.setItem("role", data.user.role);
localStorage.setItem("userName", data.user.name);
localStorage.setItem("userEmail", data.user.email);
```

### Step 5: MongoDB Setup

Create Order collection in MongoDB:
- Use the schema from backend/Order.js
- Or let mongoose auto-create it when first order is made

---

## 🔄 HOW IT WORKS

### User Flow:
1. User adds products to cart
2. User clicks "✅ Buy Products" button
3. Order created with status = PENDING
4. Cart cleared, user redirected to /orders page
5. User sees message: "Order placed! Waiting for admin approval"

### Admin Flow:
1. Admin visits /approve-orders page
2. Sees filter tabs: Pending | Approved | Rejected
3. Clicks "View Details" on any order
4. Modal shows order details with all products
5. Admin can:
   - ✅ Click "Approve Order" → Status = APPROVED
   - ❌ Click "Reject Order" → Status = REJECTED (with reason)

### Order Status Flow:
```
PENDING → APPROVED → COMPLETED
   ↓
   REJECTED (with reason)
```

---

## 🔐 SECURITY NOTES

- Admin routes check if `req.user.role === "admin"`
- Only admins can view/approve/reject orders
- Orders are tied to specific user IDs
- JWT tokens required for all API calls

---

## 📝 DATABASE STRUCTURE

### Order Document:
```json
{
  "orderId": "ORD-1708097400000",
  "userId": "ObjectId",
  "userName": "Ravi Kumar",
  "userEmail": "ravi@example.com",
  "products": [
    {
      "productId": "prod123",
      "productName": "Laptop",
      "price": 50000,
      "quantity": 1
    }
  ],
  "totalAmount": 50000,
  "status": "PENDING",
  "createdAt": "2025-02-17",
  "approvedAt": null,
  "approvedBy": null,
  "rejectionReason": null
}
```

---

## ⚡ NEXT STEPS

1. Test the purchase flow with test account
2. Verify admin can see all pending orders
3. Test approve/reject functionality
4. Send confirmation emails to users when order approved/rejected
5. Add payment integration when order is approved

---

## 🆘 TROUBLESHOOTING

**Orders not showing in admin panel?**
- Check if logged-in user has role = "admin"
- Check MongoDB connection
- Check browser console for API errors

**Approve button not working?**
- Check if token is saved in localStorage
- Check if user role is "admin"
- Verify order ID is correct

**Cart not clearing after purchase?**
- Check if API response is OK (status 201)
- Check browser console for errors

---

**Created on: Feb 17, 2026**
**For: KL University Student**