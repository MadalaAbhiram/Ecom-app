import Header from "./Header";
import Footer from "./Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PAYMENT_OPTIONS = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash on Delivery"];

const makeUniqueId = (prefix) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [userRole, setUserRole] = useState("user");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [orderForPayment, setOrderForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_OPTIONS[0]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getOrdersForUser = (allOrders, id, email) =>
    allOrders.filter((order) => {
      if (id && order.userId) {
        return order.userId === id;
      }
      return order.userEmail === email;
    });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const role = localStorage.getItem("role") || "user";
    const id = localStorage.getItem("userId") || "";
    const name = localStorage.getItem("userName") || localStorage.getItem("username") || "User";
    const email = localStorage.getItem("userEmail") || `${name}@shop.local`;
    const allOrders = JSON.parse(localStorage.getItem("orders")) || [];

    setCartItems(cart);
    setUserRole(role);
    setUserId(id);
    setUserName(name);
    setUserEmail(email);
    setUserOrders(getOrdersForUser(allOrders, id, email));
  }, []);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const totalItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const increaseQty = (index) => {
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = (updatedCart[index].quantity || 1) + 1;
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const decreaseQty = (index) => {
    const updatedCart = [...cartItems];
    if ((updatedCart[index].quantity || 1) > 1) {
      updatedCart[index].quantity -= 1;
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  const removeItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleBuyProducts = async () => {
    if (userRole === "admin") {
      alert("Admin cannot place orders. Admin role is only for approving/rejecting user orders and managing products.");
      navigate("/admin/approve-orders");
      return;
    }

    const liveCart = JSON.parse(localStorage.getItem("cart")) || [];

    if (liveCart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first!");
      navigate("/login");
      return;
    }

    setLoading(true);

    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const orderUniqueId = makeUniqueId("order");
    const orderDisplayId = makeUniqueId("ORD").toUpperCase();
    const liveTotal = liveCart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    const newOrder = {
      _id: orderUniqueId,
      orderId: orderDisplayId,
      userId,
      userName,
      userEmail,
      products: liveCart.map((item) => ({
        productId: String(item.id),
        productName: item.title,
        price: item.price,
        quantity: item.quantity || 1
      })),
      totalAmount: liveTotal,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));
    setUserOrders(getOrdersForUser(orders, userId, userEmail));

    setCartItems([]);
    localStorage.removeItem("cart");
    setLoading(false);
    alert(`Order ${orderDisplayId} sent to admin for approval`);
    navigate("/cart");
  };

  const openPaymentOptions = (order) => {
    if (order.status !== "APPROVED") {
      alert("This order is not approved by admin yet.");
      return;
    }

    if (order.paymentStatus === "SUCCESS") {
      alert("Payment already completed for this order.");
      return;
    }

    setOrderForPayment(order);
    setPaymentMethod(PAYMENT_OPTIONS[0]);
  };

  const closePaymentOptions = () => {
    if (paymentLoading) {
      return;
    }
    setOrderForPayment(null);
  };

  const handlePaymentSuccess = () => {
    if (!orderForPayment) {
      return;
    }

    setPaymentLoading(true);

    setTimeout(() => {
      const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
      const updatedOrders = allOrders.map((order) =>
        order._id === orderForPayment._id
          ? {
              ...order,
              paymentStatus: "SUCCESS",
              paymentMethod,
              paymentAt: new Date().toISOString()
            }
          : order
      );

      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      setUserOrders(getOrdersForUser(updatedOrders, userId, userEmail));
      setOrderForPayment(null);
      setPaymentLoading(false);
      alert("Payment successful! Your order is confirmed.");
    }, 1200);
  };

  const deleteProductAsAdmin = (productId) => {
    const catalog = JSON.parse(localStorage.getItem("catalogProducts")) || [];
    const updatedCatalog = catalog.filter((item) => item.id !== productId);
    localStorage.setItem("catalogProducts", JSON.stringify(updatedCatalog));

    const filteredCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(filteredCart);
    localStorage.setItem("cart", JSON.stringify(filteredCart));

    alert("Product deleted by admin");
  };

  return (
    <>
      <Header />
      <div
        className="cart-container"
        style={{ padding: "110px 20px 90px", maxWidth: "800px", margin: "0 auto", minHeight: "100vh" }}
      >
        <h1>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <p style={{ fontSize: "18px", color: "#666" }}>Your cart is empty</p>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="cart-item"
                  style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    marginBottom: "15px",
                    borderRadius: "8px"
                  }}
                >
                  <h3>{item.title}</h3>
                  <p>Price: Rs.{item.price}</p>

                  <div style={{ marginBottom: "10px" }}>
                    <button onClick={() => decreaseQty(index)}>-</button>
                    <span style={{ margin: "0 15px", fontWeight: "bold" }}>
                      Qty: {item.quantity || 1}
                    </span>
                    <button onClick={() => increaseQty(index)}>+</button>
                  </div>

                  <button
                    onClick={() => removeItem(index)}
                    style={{
                      marginRight: "10px",
                      padding: "8px 12px",
                      backgroundColor: "#f0ad4e",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px"
                    }}
                  >
                    Remove from Cart
                  </button>

                  {userRole === "admin" && (
                    <button
                      onClick={() => deleteProductAsAdmin(item.id)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#d9534f",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "4px"
                      }}
                    >
                      Delete Product
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                border: "2px solid #333",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                marginTop: "20px"
              }}
            >
              <h2>Order Summary</h2>
              <p><strong>Total Items:</strong> {totalItems}</p>
              <p><strong>Total Amount:</strong> Rs.{totalPrice.toFixed(2)}</p>
              <p><strong>Status:</strong> Needs admin approval</p>
            </div>

            {userRole !== "admin" ? (
              <button
                onClick={handleBuyProducts}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  marginTop: "20px",
                  backgroundColor: loading ? "#999" : "#5cb85c",
                  color: "white",
                  border: "none",
                  fontSize: "18px",
                  cursor: loading ? "not-allowed" : "pointer",
                  borderRadius: "5px",
                  fontWeight: "bold"
                }}
              >
                {loading ? "Processing..." : "Buy Products (Needs Admin Approval)"}
              </button>
            ) : (
              <p style={{ marginTop: "20px", fontWeight: "bold", color: "#555" }}>
                Admin cannot buy products. Admin can only approve/reject user orders and manage products.
              </p>
            )}

          </>
        )}

        {userRole !== "admin" && (
          <div style={{ marginTop: "30px" }}>
            <h2>My Order Status</h2>
            {userOrders.length === 0 ? (
              <p style={{ color: "#666" }}>No orders placed yet.</p>
            ) : (
              userOrders
                .slice()
                .reverse()
                .map((order) => (
                  <div
                    key={order._id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "12px",
                      marginBottom: "12px",
                      background: "#fff"
                    }}
                  >
                    <p><strong>{order.orderId}</strong></p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {order.status === "REJECTED" ? "Not Approved" : order.status}
                    </p>
                    <p>
                      <strong>Payment:</strong>{" "}
                      {order.paymentStatus === "SUCCESS"
                        ? `Success (${order.paymentMethod || "Method not saved"})`
                        : order.status === "APPROVED"
                          ? "Pending - ready to pay"
                          : "Not available"}
                    </p>
                    {order.status === "REJECTED" && order.rejectionReason && (
                      <p><strong>Reason:</strong> {order.rejectionReason}</p>
                    )}

                    {(Array.isArray(order.products) ? order.products : []).map((product, index) => (
                      <div key={`${order._id}-${product.productId}-${index}`} style={{ marginBottom: "8px" }}>
                        <p style={{ margin: 0 }}>
                          {product.productName} | Qty: {product.quantity} | Rs.{product.price}
                        </p>
                      </div>
                    ))}

                    {order.status === "APPROVED" && order.paymentStatus !== "SUCCESS" && (
                      <button
                        onClick={() => openPaymentOptions(order)}
                        style={{
                          padding: "10px 14px",
                          backgroundColor: "#ff9900",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          marginTop: "6px"
                        }}
                      >
                        Buy Product / Pay Now
                      </button>
                    )}

                    {order.paymentStatus === "SUCCESS" && (
                      <p style={{ color: "#228b22", fontWeight: "bold", marginTop: "6px" }}>
                        Payment success. Order purchased.
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>
        )}

        {orderForPayment && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "14px"
            }}
          >
            <div
              style={{
                width: "min(460px, 100%)",
                borderRadius: "10px",
                background: "#fff",
                padding: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
              }}
            >
              <h2 style={{ marginTop: 0 }}>Choose Payment Option</h2>
              <p style={{ marginBottom: "8px" }}>
                <strong>Order:</strong> {orderForPayment.orderId}
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong>Name:</strong> {orderForPayment.userName || userName}
              </p>
              <p style={{ marginTop: 0 }}>
                <strong>Amount:</strong> Rs.{Number(orderForPayment.totalAmount || 0).toFixed(2)}
              </p>

              <label htmlFor="paymentMethod"><strong>Payment Method</strong></label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc"
                }}
              >
                {PAYMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <p style={{ color: "#555", fontSize: "14px", marginTop: "12px" }}>
                Demo payment only. No real money will be charged.
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                <button
                  onClick={closePaymentOptions}
                  disabled={paymentLoading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #aaa",
                    background: "#fff",
                    cursor: paymentLoading ? "not-allowed" : "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSuccess}
                  disabled={paymentLoading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    border: "none",
                    background: paymentLoading ? "#999" : "#008296",
                    color: "white",
                    fontWeight: "bold",
                    cursor: paymentLoading ? "not-allowed" : "pointer"
                  }}
                >
                  {paymentLoading ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Cart;
