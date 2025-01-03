import axios from 'axios';
import sha256 from 'crypto-js/sha256';
import Cookie from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { GoogleLogin } from 'react-google-login';
import { useNavigate } from 'react-router-dom';
import env from '../../env.json';
import './login.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Disable scrolling when on the register page
    document.body.classList.add('no-scroll');

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
  const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    alert("Password must be at least 8 characters long and contain at least one uppercase letter.");
    return;
  }
    const hashedPassword = sha256(password).toString();
    const data = {
      Username: username,
      Email: email,
      Password: hashedPassword
    };

    axios.post(`${env.api}/auth/register`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      Cookie.set("signed_in_user", JSON.stringify(response.data));
      navigate("/");
      window.location.reload();
    }).catch((error) => {
      console.log('Error:', error);
      alert(error);
    });
  };

  const handleGoogleLogin = async (googleData) => {
    const { tokenObj } = googleData;
    try {
      const response = await axios.post(`${env.api}/users/googleRegister`, {
        token: tokenObj.id_token
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.data && response.status === 200) {
        Cookie.set("signed_in_user", response.data);
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      console.log('Error:', error);
    }
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
          <button type="submit" className="login-button">Register</button>
        </form>

        <div className="separator">Or register with <strong>Google</strong></div>
        <GoogleLogin
          clientId="YOUR_GOOGLE_CLIENT_ID"
          buttonText="Register with Google"
          onSuccess={handleGoogleLogin}
          onFailure={handleGoogleLogin}
          cookiePolicy={'single_host_origin'}
        />

        <div className="terms">
          By clicking Register, you agree to our <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.
        </div>
      </div>
    </div>
  );
}

export default Register;
