import axios from 'axios';
import Cookie from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import env from "../../env.json";
import './profile.css';

function Profile() {
  const navigate = useNavigate();
  // Mock user data
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    country: '',
    phoneNumber: '',
    location: '',
    birthday: {
      day: '',
      month: '',
    },
  });

  // Load mock data when the component mounts
  useEffect(() => {
    const user = JSON.parse(Cookie.get('signed_in_user'));

    axios.get(`${env.api}/user-data/${user.username}`).then((response) => {
      setUserData(response.data);
    }).catch((error) => {
      console.log('Error:', error);
    });

    /*    const mockData = {
          firstName: 'Name',
          lastName: 'Surname',
          username: 'username',
          email: 'name123@example.com',
          country: 'Slovenija',
          phoneNumber: '+1 123 123 123 ',
          location: 'Maribor',
          birthday: {
            day: '1',
            month: 'January',
          },
        };
        setUserData(mockData);*/
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'day' || name === 'month') {
      setUserData((prevData) => ({
        ...prevData,
        birthday: {
          ...prevData.birthday,
          [name]: value,
        },
      }));
    } else {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSaveChanges = () => {
    const user = JSON.parse(Cookie.get('signed_in_user'));
    axios.put(`${env.api}/update-user-account/${user.username}`, userData).then(() => {
      alert('Changes saved!');
    }).catch((error) => {
      console.log('Error:', error);
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const user = JSON.parse(Cookie.get('signed_in_user'));
      axios.delete(`${env.api}/delete-user-account/${user.username}`).then(() => {
        Cookie.remove("signed_in_user");
        alert('Account deleted.');
        navigate("/");
        window.location.reload();
      }).catch((error) => {
        console.log('Error:', error);
      });
    }
  };

  return (
    <div className="page-background">
      <div className="profile-container">
        <h1>My Profile</h1>
        <form className="profile-form">
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
              placeholder="First Name"
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
            />
          </div>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              placeholder="Username"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>
          <div className="form-group">
            <label>Country:</label>
            <input
              type="text"
              name="country"
              value={userData.country}
              onChange={handleChange}
              placeholder="Country"
            />
          </div>
          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="text"
              name="phoneNumber"
              value={userData.phoneNumber}
              onChange={handleChange}
              placeholder="+00 000 000 000"
            />
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={userData.location}
              onChange={handleChange}
              placeholder="Enter your location"
            />
          </div>
          <div className="form-group birthday-group">
            <label>Birthday:</label>
            <input
              type="text"
              name="day"
              value={userData.birthday.day}
              onChange={handleChange}
              placeholder="Day"
            />
            <input
              type="text"
              name="month"
              value={userData.birthday.month}
              onChange={handleChange}
              placeholder="Month"
            />
          </div>
          <button type="button" className="save-button" onClick={handleSaveChanges}>
            Save Changes
          </button>
        </form>
        <div className="delete-account-section">
          <h2>Delete Account</h2>
          <p>
            After deleting your account, you will lose all related information including tasks, events,
            projects, notes, etc. You will not be able to recover it later, so think twice before doing
            this.
          </p>
          <button type="button" className="delete-button" onClick={handleDeleteAccount}>
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
