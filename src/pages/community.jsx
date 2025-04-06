import React, { useState, useEffect } from "react";
import "./Community.css";
import groupData from "./groups.json";
import Navbar from "../components/nav";
import Footer from "../components/Footer";

const Community = () => {
  const [groups, setGroups] = useState(groupData);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (selectedGroup) {
      setChatMessages(groups.find((g) => g.name === selectedGroup).messages);
    }
  }, [selectedGroup, groups]);

  const handleCreateGroup = () => {
    if (newGroupName.trim() === "") return;
    const updatedGroups = [
      ...groups,
      { name: newGroupName, messages: [] },
    ];
    setGroups(updatedGroups);
    setNewGroupName("");
  };

  const handleJoinGroup = (groupName) => {
    setSelectedGroup(groupName);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    const updatedMessages = [...chatMessages, newMessage];
    const updatedGroups = groups.map((g) =>
      g.name === selectedGroup ? { ...g, messages: updatedMessages } : g
    );
    setGroups(updatedGroups);
    setChatMessages(updatedMessages);
    setNewMessage("");
  };

  return (
    <>
    <Navbar/>
    <div className="community-container">
      <div className="group-section">
        <h2>Groups</h2>
        <input
          type="text"
          placeholder="Create new group"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <button onClick={handleCreateGroup}>Create Group</button>
        <ul>
          {groups.map((group) => (
            <li key={group.name}>
              <button onClick={() => handleJoinGroup(group.name)}>
                {group.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-section">
        <h2>Chat {selectedGroup ? `in "${selectedGroup}"` : ""}</h2>
        {selectedGroup ? (
          <>
            <div className="chat-box">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="chat-msg">
                  {msg}
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Say something..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p>Select or create a group to begin chatting anonymously.</p>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Community;
