import Header from "./Header";
import Footer from "./Footer";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function ApproveOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    category: "",
    thumbnail: ""
  });
  const detailsRef = useRef(null);
  
  const loadOrdersAndProducts = () => {
    const allOrders = (JSON.parse(localStorage.getItem("orders")) || []).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    const catalog = JSON.parse(localStorage.getItem("catalogProducts")) || [];
    setOrders(allOrders);
    setProducts(catalog);
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    loadOrdersAndProducts();

    const handleStorageChange = (event) => {
      if (event.key === "orders" || event.key === "catalogProducts") {
        loadOrdersAndProducts();
      }
    };

    const refreshTimer = setInterval(loadOrdersAndProducts, 1500);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(refreshTimer);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  const persistOrders = (updatedOrders) => {
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const openOrderDetails = (orderId) => {
    const latestOrder = orders.find((order) => order._id === orderId);
    setSelectedOrder(latestOrder || null);
  };

  useEffect(() => {
    if (selectedOrder && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedOrder]);

  const approveOrder = (orderId) => {
    const updatedOrders = orders.map((order) =>
      order._id === orderId
        ? { ...order, status: "APPROVED", approvedAt: new Date().toISOString(), rejectionReason: "" }
        : order
    );
    persistOrders(updatedOrders);
    setSelectedOrder(null);
    alert("Order approved");
  };

  const rejectOrder = (orderId) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    const updatedOrders = orders.map((order) =>
      order._id === orderId
        ? { ...order, status: "REJECTED", approvedAt: new Date().toISOString(), rejectionReason: rejectReason.trim() }
        : order
    );
    persistOrders(updatedOrders);
    setRejectReason("");
    setSelectedOrder(null);
    alert("Order rejected");
  };

  const removeOrderProduct = (orderId, productIndex) => {
    const updatedOrders = orders.map((order) => {
      if (order._id !== orderId) {
        return order;
      }

      const updatedProducts = order.products.filter((_, index) => index !== productIndex);
      const recalculatedTotal = updatedProducts.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
      );

      return {
        ...order,
        products: updatedProducts,
        totalAmount: recalculatedTotal
      };
    });

    persistOrders(updatedOrders);
    const refreshedOrder = updatedOrders.find((order) => order._id === orderId);
    setSelectedOrder(refreshedOrder || null);
  };

  const handleNewProductChange = (event) => {
    const { name, value } = event.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const addProductAsAdmin = () => {
    if (!newProduct.title || !newProduct.price || !newProduct.category || !newProduct.thumbnail) {
      alert("Fill all product fields");
      return;
    }

    const createdProduct = {
      id: Date.now(),
      title: newProduct.title.trim(),
      price: Number(newProduct.price),
      category: newProduct.category.trim(),
      thumbnail: newProduct.thumbnail.trim()
    };

    const updatedProducts = [createdProduct, ...products];
    setProducts(updatedProducts);
    localStorage.setItem("catalogProducts", JSON.stringify(updatedProducts));

    setNewProduct({ title: "", price: "", category: "", thumbnail: "" });
    alert("Product added");
  };

  const deleteCatalogProduct = (productId) => {
    const updatedProducts = products.filter((product) => product.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem("catalogProducts", JSON.stringify(updatedProducts));
    alert("Product deleted");
  };

  const filteredOrders = filter === "ALL"
    ? orders
    : orders.filter((order) => order.status === filter);

  return (
    <>
      <Header />
      <div style={{ padding: "110px 20px 90px", maxWidth: "1000px", margin: "0 auto" }}>
        <h1>Admin Order Permission Panel</h1>

        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          <button onClick={() => setFilter("ALL")}>All ({orders.length})</button>
          <button onClick={() => setFilter("PENDING")}>Pending ({orders.filter((o) => o.status === "PENDING").length})</button>
          <button onClick={() => setFilter("APPROVED")}>Approved ({orders.filter((o) => o.status === "APPROVED").length})</button>
          <button onClick={() => setFilter("REJECTED")}>Rejected ({orders.filter((o) => o.status === "REJECTED").length})</button>
          <button onClick={loadOrdersAndProducts}>Refresh</button>
        </div>

        {filteredOrders.length === 0 ? (
          <p>{filter === "ALL" ? "No orders found" : `No ${filter.toLowerCase()} orders`}</p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "8px", marginBottom: "12px" }}>
              <p><strong>{order.orderId}</strong></p>
              <p>User: {order.userName} ({order.userEmail})</p>
              <p>Total: Rs.{order.totalAmount}</p>
              <p>Status: {order.status}</p>
              <button onClick={() => openOrderDetails(order._id)}>View Details</button>
            </div>
          ))
        )}

        {selectedOrder && (
          <div ref={detailsRef} style={{ marginTop: "20px", border: "1px solid #333", borderRadius: "8px", padding: "15px" }}>
            <h2>{selectedOrder.orderId}</h2>
            <p><strong>Customer:</strong> {selectedOrder.userName}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>

            {(Array.isArray(selectedOrder.products) ? selectedOrder.products : []).map((product, index) => (
              <div key={`${product.productId}-${index}`} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
                <p>{product.productName} | Qty: {product.quantity} | Price: Rs.{product.price}</p>
                {selectedOrder.status === "PENDING" && (
                  <button
                    onClick={() => removeOrderProduct(selectedOrder._id, index)}
                    style={{ backgroundColor: "#d9534f", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Delete This User Product
                  </button>
                )}
              </div>
            ))}

            {!Array.isArray(selectedOrder.products) || selectedOrder.products.length === 0 ? (
              <p>No products found in this order.</p>
            ) : null}

            <p style={{ marginTop: "10px" }}><strong>Total:</strong> Rs.{selectedOrder.totalAmount}</p>

            {selectedOrder.status === "PENDING" && (
              <>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason"
                  style={{ width: "100%", minHeight: "80px", marginTop: "10px" }}
                />
                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                  <button onClick={() => rejectOrder(selectedOrder._id)} style={{ backgroundColor: "#d9534f", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px" }}>
                    Reject Order
                  </button>
                  <button onClick={() => approveOrder(selectedOrder._id)} style={{ backgroundColor: "#5cb85c", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px" }}>
                    Approve Order
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <hr style={{ margin: "30px 0" }} />
        <h2>Admin Product Management</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginBottom: "15px" }}>
          <input name="title" value={newProduct.title} onChange={handleNewProductChange} placeholder="Product title" />
          <input name="price" type="number" value={newProduct.price} onChange={handleNewProductChange} placeholder="Price" />
          <input name="category" value={newProduct.category} onChange={handleNewProductChange} placeholder="Category" />
          <input name="thumbnail" value={newProduct.thumbnail} onChange={handleNewProductChange} placeholder="Image URL" />
        </div>
        <button onClick={addProductAsAdmin} style={{ marginBottom: "15px" }}>Add Product</button>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "12px",
                backgroundColor: "white"
              }}
            >
              <img
                src={product.thumbnail}
                alt={product.title}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  backgroundColor: "#f7f7f7"
                }}
              />
              <p style={{ margin: "0 0 6px", fontWeight: "bold" }}>{product.title}</p>
              <p style={{ margin: "0 0 10px" }}>
                Rs.{product.price} ({product.category})
              </p>
              <button
                onClick={() => deleteCatalogProduct(product.id)}
                style={{ backgroundColor: "#d9534f", color: "white", border: "none", borderRadius: "4px", padding: "6px 10px" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ApproveOrders;
