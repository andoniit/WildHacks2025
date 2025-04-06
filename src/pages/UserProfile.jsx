import React, { useState, useEffect } from "react";
import "./UserProfile.css";
import Navbar from "../components/nav";
import banner from '../components/assets/1.jpg';
import Footer from "../components/Footer";
import { UserService, ContactService } from "../services/api.service";


const UserProfile = () => {
  const [viewMode, setViewMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    cycleLength: "",
    lovedOneName: "",
    lovedOnePhone: "",
    lovedOneRelation: ""
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Get user profile data
        const profileResponse = await UserService.getUserProfile();
        console.log("Full profile response:", profileResponse);
        
        // Different APIs might structure the response differently
        // Handle both common patterns: data directly or nested in a data.user or similar property
        const userData = profileResponse.data?.user || profileResponse.data || {};
        console.log("Extracted user data:", userData);
        
        // Get contacts data to populate loved ones
        const contactsResponse = await ContactService.getAllContacts();
        console.log("Full contacts response:", contactsResponse);
        
        // Extract contacts - handle different response structures 
        const contacts = contactsResponse.data?.contacts || 
                        contactsResponse.data?.data || 
                        contactsResponse.data || [];
        console.log("Extracted contacts data:", contacts);
        
        // Find primary contact (we're assuming the first contact is the primary loved one)
        const primaryContact = Array.isArray(contacts) && contacts.length > 0 ? contacts[0] : null;
        console.log("Primary contact:", primaryContact);
        
        // Default to hardcoded values if data is missing - helps with development
        setUser({
          name: userData.name || userData.userName || "",
          age: (userData.age || userData.userAge)?.toString() || "",
          email: userData.email || "",
          phone: userData.phone || userData.phoneNumber || "",
          cycleLength: (userData.avgCycleLength || userData.cycleLength || userData.cycle)?.toString() || "",
          lovedOneName: primaryContact?.name || "",
          lovedOnePhone: primaryContact?.phone || primaryContact?.phoneNumber || "",
          lovedOneRelation: primaryContact?.relation || primaryContact?.relationship || ""
        });
        
        console.log("Set user state to:", user);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load your profile. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const toggleMode = () => setViewMode(!viewMode);

  const saveChanges = async () => {
    try {
      setLoading(true);
      
      // Update user profile
      await UserService.updateUserProfile({
        name: user.name,
        age: parseInt(user.age) || undefined,
        phone: user.phone,
        cycleLength: parseInt(user.cycleLength) || undefined
      });
      
      // Get contact data to find if we need to update an existing contact or create a new one
      const contactsResponse = await ContactService.getAllContacts();
      const contacts = contactsResponse.data?.contacts || 
                      contactsResponse.data?.data || 
                      contactsResponse.data || [];
      
      // If we have contact info, update it
      if (user.lovedOneName || user.lovedOnePhone) {
        // Find existing contact or create a new one
        const existingContact = Array.isArray(contacts) && contacts.length > 0 ? contacts[0] : null;
        
        const contactData = {
          name: user.lovedOneName,
          phone: user.lovedOnePhone,
          relation: user.lovedOneRelation,
          notifyOnPeriod: true, // Default notification settings - adjust as needed
          notifyOnSymptoms: true,
          notifyOnMood: false
        };
        
        if (existingContact && existingContact._id) {
          // Update existing contact
          await ContactService.updateContact(existingContact._id, contactData);
        } else if (user.lovedOneName && user.lovedOnePhone) {
          // Create new contact if we have at least name and phone
          await ContactService.addContact(contactData);
        }
      }
      
      setLoading(false);
      setViewMode(true);
    } catch (err) {
      console.error("Error saving changes:", err);
      setError("Failed to save changes. Please try again later.");
      setLoading(false);
    }
  };

  if (loading && !user.name) {
    return (
      <>
        <Navbar />
        <div className="user-profile loading-state">
          <div className="loader">Loading your profile...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="user-profile">
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-image-wrapper">
        <img src={banner} alt="Profile Banner" className="profile-banner" />
      </div>

      <div className="profile-right">
        <div className="toolbar">
          <h2>Profile</h2>
          <div>
            {viewMode ? (
              <button onClick={toggleMode} disabled={loading}>Edit Profile</button>
            ) : (
              <button onClick={saveChanges} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>

        <div className="profile-section">
          <div className="input-group">
            <label>Name</label>
            {viewMode ? (
              <div className="value-display">{user.name}</div>
            ) : (
              <input
                name="name"
                value={user.name}
                onChange={handleChange}
              />
            )}
          </div>
          <div className="input-group">
            <label>Age</label>
            {viewMode ? (
              <div className="value-display">{user.age || ''}</div>
            ) : (
              <input
                name="age"
                type="number"
                value={user.age}
                onChange={handleChange}
              />
            )}
          </div>
          <div className="input-group">
            <label>Email</label>
            <div className="value-display">{user.email || ''}</div>
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            {viewMode ? (
              <div className="value-display">{user.phone || ''}</div>
            ) : (
              <input
                name="phone"
                value={user.phone}
                onChange={handleChange}
              />
            )}
          </div>
          <div className="input-group">
            <label>Average Cycle Length (days)</label>
            {viewMode ? (
              <div className="value-display">{user.cycleLength || ''}</div>
            ) : (
              <input
                name="cycleLength"
                type="number"
                value={user.cycleLength}
                onChange={handleChange}
              />
            )}
          </div>
        </div>

        <div className="loved-ones">
          <div className="section-title">Loved Ones</div>
          <div className="profile-section">
            <div className="input-group">
              <label>Name</label>
              {viewMode ? (
                <div className="value-display">{user.lovedOneName || ''}</div>
              ) : (
                <input
                  name="lovedOneName"
                  value={user.lovedOneName || ''}
                  onChange={handleChange}
                />
              )}
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              {viewMode ? (
                <div className="value-display">{user.lovedOnePhone || ''}</div>
              ) : (
                <input
                  name="lovedOnePhone"
                  value={user.lovedOnePhone || ''}
                  onChange={handleChange}
                />
              )}
            </div>
            <div className="input-group">
              <label>Relation</label>
              {viewMode ? (
                <div className="value-display">{user.lovedOneRelation || ''}</div>
              ) : (
                <input
                  name="lovedOneRelation"
                  value={user.lovedOneRelation || ''}
                  onChange={handleChange}
                />
              )}
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
