import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import mobile from "../images/mobile.png";
import "./Styles.css"; 

const DEFAULT_PRODUCTS = [
  { id: 101, title: "Samsung Galaxy S24 FE", price: 39000, thumbnail: mobile, category: "Electronics" },
  { id: 102, title: "Samsung Galaxy S25 Ultra", price: 79000, thumbnail: "https://images.samsung.com/ch_fr/smartphones/galaxy-s25-ultra/buy/02_Gallery/02-2_KV_With-Exclusive-Color/02_Online-Exclusive-Single-KV_Titanium_Jetblack_PC.jpg?imbypass=true", category: "Electronics" },
  { id: 103, title: "Samsung Galaxy Z TriFold", price: 261000, thumbnail: "https://th.bing.com/th/id/OIP.PS-fW9tJj5Oyfb93_1dCvAHaEK?w=295&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3", category: "Electronics" },
  { id: 104, title: "New Balance classic brount", price: 49999, thumbnail: "https://tse1.mm.bing.net/th/id/OIP.too2O0yo9Jqzl9QNL76M9AHaJT?rs=1&pid=ImgDetMain&o=7&rm=3", category: "Footwear" },
  { id: 105, title: "New Balance green mounts", price: 38999, thumbnail: "https://sneakernews.com/wp-content/uploads/2023/04/New-Balance-Fresh-Foam-More-Trail-V3-Covert-Green-MTMORNGN-2.jpg", category: "Footwear" },
  { id: 106, title: "Rolex Submariner", price: 1713902, thumbnail: "https://www.watchclub.com/upload/watches/originali/watch-club-rolex-submariner-date-116613lb-rolexwarrantyto2024-ref-116613lb-year-2019-14676-wb.pngwb.png9.jpg", category: "Watches" },
  { id: 107, title: "New Balance blue clicks limited Edition", price: 45999, thumbnail: "https://www.newbalance.com.au/dw/image/v2/AASX_PRD/on/demandware.static/-/Library-Sites-NBAU-NBNZ/default/dw900453dd/test-comp-images/2024_Comp_Assets/740-blue-mega-nav.jpg", category: "Footwear" },
  { id: 108, title: "New Balance art works exp", price: 18999, thumbnail: "https://tse3.mm.bing.net/th/id/OIP.x6658gplZxlS37a8UbJ6UAHaLn?rs=1&pid=ImgDetMain&o=7&rm=3", category: "Footwear" },
  { id: 109, title: "New Balance new grade fuel cell", price: 14999, thumbnail: "https://th.bing.com/th/id/OIP.zx3s4iG0-kXxSYppwidZFwHaE7?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", category: "Footwear" },
  { id: 110, title: "Nike Air Max", price: 13995, thumbnail: "https://tse2.mm.bing.net/th/id/OIP.tAZtpLwas9yqBLsTpL9-5QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3", category: "Footwear" }
];

function Products1() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const userRole = localStorage.getItem("role") || "user";

  useEffect(() => {
    const catalog = JSON.parse(localStorage.getItem("catalogProducts"));
    if (catalog?.length) {
      setProducts(catalog);
      return;
    }

    localStorage.setItem("catalogProducts", JSON.stringify(DEFAULT_PRODUCTS));
    setProducts(DEFAULT_PRODUCTS);
  }, []);

  const handleAddToCart = (product) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role") || "user";

    if (isLoggedIn === "true") {
      if (role === "admin") {
        alert("Admin cannot add products to cart. Use Admin panel to manage products and approvals.");
        navigate("/admin/approve-orders");
        return;
      }

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingProduct = cart.find((item) => item.id === product.id);

      if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(cart)); 
      alert("Product added to cart");
    } else {
      alert("Please login first!");
      navigate("/login");
    }
  };

  const deleteProductAsAdmin = (productId) => {
    if (userRole !== "admin") {
      return;
    }

    const updatedProducts = products.filter((item) => item.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem("catalogProducts", JSON.stringify(updatedProducts));
    alert("Product deleted by admin");
  };

  return (
    <>
      <Header />

      <section className="products">   {/* must match CSS */}
        {products.map((p) => (
          <div className="product" key={p.id}>  {/* must match CSS */}
            <img src={p.thumbnail} alt={p.title} />
            <h3>{p.title}</h3>
            <p>Category: {p.category}</p>
            <p>Rs. {p.price}</p>
            <button onClick={() => handleAddToCart(p)}>
              Add to Cart
            </button>
            {userRole === "admin" && (
              <button onClick={() => deleteProductAsAdmin(p.id)} style={{ marginTop: "8px", backgroundColor: "#d9534f" }}>
                Delete Product
              </button>
            )}
          </div>
        ))}
      </section>

      <Footer />
    </>
  );
}

export default Products1;
