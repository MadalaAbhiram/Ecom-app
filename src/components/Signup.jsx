import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    if (!username || !email || !password) {
      alert("Enter vaild Details");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.find(u => u.username === username);
    if (userExists) {
      alert("User already exists!");
      return;
    }

    users.push({
      id: `user-${Date.now()}`,
      username,
      email,
      password,
      role: "user"
    });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! Please login.");
    navigate("/login");
  };

  return (
    <>
      <Header />

      <div
        style={{
          textAlign: "center",
          padding: "120px",
          minHeight: "100vh"
        }}
      >
        <div
          style={{
            width: "320px",
            margin: "0 auto",
            padding: "60px 40px",
            border: "1px solid #ccc",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}
        >
          <h2 style={{ marginBottom: "25px" }}>Signup</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />

          <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
          </p>

          <button
            onClick={handleSignup}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#121612",
              color: "white",
              cursor: "pointer"
            }}
          >
            Signup
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Signup;
