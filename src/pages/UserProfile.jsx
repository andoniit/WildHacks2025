import React, { useState } from "react";
import "./UserProfile.css";
import Navbar from "../components/nav";
import banner from '../components/assets/1.jpg';
import Footer from "../components/Footer";


const UserProfile = () => {
  const [viewMode, setViewMode] = useState(true);
  const [user, setUser] = useState({
    name: "Deepa Devangmath",
    age: "25",
    email: "mi@xpaytech.co",
    phone: "+20-01274318900",
    cycleLength: "26",
    lovedOneName: "Anirudha",
    lovedOnePhone: "3126622927",
    lovedOneRelation: "Partner"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const toggleMode = () => setViewMode(!viewMode);

  const saveChanges = () => {
    console.log("Changes saved:", user);
    setViewMode(true);
  };

  return (
    <>
    <Navbar/>
    <div className="user-profile">
      <div className="profile-image-wrapper">
        <img src={banner} alt="Profile Banner" className="profile-banner" />
      </div>

      <div className="profile-right">
        <div className="toolbar">
          <h2>Profile</h2>
          <div>
            {viewMode ? (
              <button onClick={toggleMode}>Edit Profile</button>
            ) : (
              <button onClick={saveChanges}>Save Changes</button>
            )}
          </div>
        </div>

        <div className="profile-section">
          <div className="input-group">
            <label>Name</label>
            <div className="value-display">{user.name}</div>
          </div>
          <div className="input-group">
            <label>Age</label>
            <div className="value-display">{user.age || ''}</div>
          </div>
          <div className="input-group">
            <label>Email</label>
            <div className="value-display">{user.email || ''}</div>
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <div className="value-display">{user.phone || ''}</div>
          </div>
          <div className="input-group">
            <label>Average Cycle Length (days)</label>
            <input
              name="cycleLength"
              value={user.cycleLength || ''}
              onChange={handleChange}
              disabled={viewMode}
            />
          </div>
        </div>

        <div className="loved-ones">
          <div className="section-title">Loved Ones</div>
          <div className="profile-section">
            <div className="input-group">
              <label>Name</label>
              <div className="value-display">{user.lovedOneName || ''}</div>
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <div className="value-display">{user.lovedOnePhone || ''}</div>
            </div>
            <div className="input-group">
              <label>Relation</label>
              <div className="value-display">{user.lovedOneRelation || ''}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default UserProfile;
