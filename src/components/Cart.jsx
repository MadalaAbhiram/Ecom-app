import Header from "./Header";
import Footer from "./Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [userRole, setUserRole] = useState("user");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
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

    if (cartItems.length === 0) {
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
    const newOrder = {
      _id: `order-${Date.now()}`,
      orderId: `ORD-${Date.now()}`,
      userId,
      userName,
      userEmail,
      products: cartItems.map((item) => ({
        productId: String(item.id),
        productName: item.title,
        price: item.price,
        quantity: item.quantity || 1
      })),
      totalAmount: totalPrice,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));
    setUserOrders(getOrdersForUser(orders, userId, userEmail));

    setCartItems([]);
    localStorage.removeItem("cart");
    setLoading(false);
    alert("Order sent to admin for approval");
    navigate("/Products1");
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
                  </div>
                ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Cart;
