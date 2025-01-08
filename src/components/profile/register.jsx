import axios from "axios";
import sha256 from "crypto-js/sha256";
import Cookie from "js-cookie";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import { GoogleLogin } from "react-google-login";
import env from "../../env.json";
import "./login.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      alert("All fields are required.");
      return;
    }

    try {
      const hashedPassword = sha256(password).toString();
      const data = { username: username, email: email, password: hashedPassword };
      const response = await axios.post(`${env.api}/auth/register`, data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.data.error) {
        alert(response.data.error);
      } else {
        Cookie.set("signed_in_user", JSON.stringify(response.data));
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error.response?.data?.error || "Registration failed.");
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const token = response.tokenId;
      const res = await axios.post(`${env.api}/auth/google`, { token });
      if (res.data) {
        Cookie.set("signed_in_user", JSON.stringify(res.data));
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      console.error("Google registration failed:", error);
      alert("Google registration failed.");
    }
  };

  const handleGoogleLoginFailure = () => {
    console.error("Google login failed.");
    alert("Google login failed.");
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h1>Register</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Register
          </button>
        </form>
        <div className="separator">Or register with Google</div>
        <div className="terms">
          By clicking Register, you agree to our <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.
        </div>
      </div>
    </div>
  );
}

export default Register;
