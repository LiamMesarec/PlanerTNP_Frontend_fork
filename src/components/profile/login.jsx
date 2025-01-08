import axios from "axios";
import sha256 from "crypto-js/sha256";
import Cookie from "js-cookie";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import { GoogleLogin } from "react-google-login"; 
import env from "../../env.json";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hashedPassword = sha256(password).toString();
    const data = {
      Email: email,
      Password: hashedPassword,
    };

    try {
      const response = await axios.post(`${env.api}/auth/login`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      Cookie.set("signed_in_user", JSON.stringify(response.data));
      navigate("/");
      window.location.reload();
    } catch (error) {
      alert("Invalid email or password");
      console.error(error);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    const token = response.tokenId;
    try {
      const res = await axios.post(
        `${env.api}/users/googleLogin`,
        { token },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data && res.status === 200) {
        Cookie.set("signed_in_user", res.data);
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const handleGoogleLoginFailure = () => {
    console.error("Google login failed.");
  };

  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  return (
    <div className="login-background">
      <div className="login-container">
        <h1>Login</h1>
        <div className="login-form">
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
          <button
            type="submit"
            className="login-button"
            onClick={handleSubmit}
          >
            Login
          </button>
          <div className="separator">Or continue with Google</div>

          <div className="terms">
            By clicking continue, you agree to our{" "}
            <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
