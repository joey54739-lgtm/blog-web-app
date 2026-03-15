import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function ProfileSettings({ username, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    username: username || '',
    displayName: username || '',
    bio: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch(API_BASE_URL + '/api/profile/me/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      setFormData({
        username: data.username || username || '',
        displayName: data.displayName || username || '',
        bio: data.bio || ''
      });
      setIsLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch profile", err);
      setIsLoading(false);
    });
  }, [username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    const token = localStorage.getItem('token');

    fetch(API_BASE_URL + '/api/profile/update/', {
      method: 'PUT',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      return data;
    })
    .then(data => {
      setIsSaving(false);
      setSaveMessage('Profile updated successfully!');
      
      if (data.username) {
        localStorage.setItem('username', data.username);
        
        if (onProfileUpdate) {
          onProfileUpdate(data.username);
        }
        window.dispatchEvent(new CustomEvent('profileUpdated')); 
      }

      setTimeout(() => setSaveMessage(''), 3000);
    })
    .catch(err => {
      setIsSaving(false);
      alert(err.message);
    });
  };

  if (isLoading) {
    return (
      <div className="saas-card p-5 text-center text-muted border-0 shadow-sm mb-4">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        Loading profile data...
      </div>
    );
  }

  return (
    <div className="saas-card p-4 border-0 shadow-sm mb-4">
      <h5 className="settings-header border-bottom pb-2 mb-3">Public Profile</h5>

      <div className="avatar-upload-box pb-3 border-bottom mb-3">
        <div className="avatar-md">
          {formData.username ? formData.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <button type="button" className="btn-outline-upload">Upload New</button>
          <div className="upload-hint">Max 2MB (JPEG or PNG).</div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="saas-form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text-pro">blog.com/@</span>
              <input 
                type="text" 
                className="saas-form-control form-control-pro" 
                name="username"
                value={formData.username} 
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-6">
            <label className="saas-form-label">Display Name</label>
            <input 
              type="text" 
              className="saas-form-control" 
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="saas-form-label">Bio</label>
          <textarea 
            className="saas-form-control" 
            rows="3" 
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Brief description for your profile..."
          ></textarea>
          <div className="saas-form-text">Markdown is supported. Max 160 chars.</div>
        </div>

        <div className="d-flex justify-content-end align-items-center pt-2 mt-3 border-top gap-3">
          {saveMessage && <span className="text-success fw-medium" style={{ fontSize: '0.85rem' }}><i className="bi bi-check-circle-fill me-1"></i>{saveMessage}</span>}
          <button type="submit" className="btn-save" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileSettings;