import React from 'react';

function ProfileSettings({ username }) {
  return (
    <div className="saas-card p-4 border-0 shadow-sm mb-4">
      <h5 className="settings-header border-bottom pb-2 mb-3">Public Profile</h5>

      <div className="avatar-upload-box pb-3 border-bottom mb-3">
        <div className="avatar-md">
          {username ? username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <button type="button" className="btn-outline-upload">Upload New</button>
          <div className="upload-hint">Max 2MB (JPEG or PNG).</div>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="saas-form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text-pro">blog.com/@</span>
              <input type="text" className="saas-form-control form-control-pro" defaultValue={username} />
            </div>
          </div>
          <div className="col-md-6">
            <label className="saas-form-label">Display Name</label>
            <input type="text" className="saas-form-control" defaultValue={username} />
          </div>
        </div>

        <div className="mb-3">
          <label className="saas-form-label">Bio</label>
          <textarea className="saas-form-control" rows="3" placeholder="Brief description for your profile..."></textarea>
          <div className="saas-form-text">Markdown is supported. Max 160 chars.</div>
        </div>

        <div className="d-flex justify-content-end pt-2 mt-3 border-top">
          <button type="submit" className="btn-save">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

export default ProfileSettings;