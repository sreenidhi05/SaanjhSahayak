// src/pages/ProfilePage.js
import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    bio: 'Software Developer',
    avatar: 'https://via.placeholder.com/150',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(user);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser({
      ...updatedUser,
      [name]: value,
    });
  };

  const handleSave = () => {
    setUser(updatedUser);
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img className="profile-avatar" src={user.avatar} alt="Profile Avatar" />
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <p>{user.bio}</p>
      </div>
      <button className="edit-button" onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? 'Cancel' : 'Edit Profile'}
      </button>
      {isEditing && (
        <div className="edit-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={updatedUser.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={updatedUser.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={updatedUser.bio}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Avatar URL</label>
            <input
              type="text"
              name="avatar"
              value={updatedUser.avatar}
              onChange={handleInputChange}
            />
          </div>
          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
