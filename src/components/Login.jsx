import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";

// Admin accounts are managed in code only.
// Add more admin users here when needed.
const ADMIN_ACCOUNTS = [
  {
    id: "admin-1",
    username: "admin",
    password: "admin123",
    email: "admin@shop.local"
  }
];

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const adminUser = ADMIN_ACCOUNTS.find(
      (u) => u.username === username && u.password === password
    );

    if (adminUser) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", adminUser.username);
      localStorage.setItem("role", "admin");
      localStorage.setItem("userId", adminUser.id);
      localStorage.setItem("userName", adminUser.username);
      localStorage.setItem("userEmail", adminUser.email);
      localStorage.setItem("token", `token-${adminUser.id}`);
      navigate("/admin/approve-orders");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const validUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (validUser) {
      const userId = validUser.id || `user-${validUser.username}`;

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);
      localStorage.setItem("role", "user");
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", validUser.username);
      localStorage.setItem(
        "userEmail",
        validUser.email || `${validUser.username}@shop.local`
      );
      localStorage.setItem("token", `token-${userId}`);
      navigate("/Products1");
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <>
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: "20px",
            border: "1px solid black",
            width: "320px",
            minHeight: "450px",
            padding: "80px 40px 40px 40px",
            borderRadius: "10px"
          }}
        >
          <h2>Login</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <br /><br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <br /><br />

          <button onClick={handleLogin}>Login</button>
          <p style={{ fontSize: "14px", marginTop: "15px" }}>
            New user? <Link to="/signup">Signup here</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
