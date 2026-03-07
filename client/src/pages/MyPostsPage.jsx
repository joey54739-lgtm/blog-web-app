import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

   const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://127.0.0.1:8000/api/posts/mine/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch your personal posts');
        return res.json();
      })
      .then(data => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [navigate]);

  // Function to handle post deletion
  // Triggered when clicking the small "Delete" button on the list
  const openDeleteModal = (postId) => {
    setPostToDelete(postId);
    setShowModal(true);
  };

  // Triggered when clicking "Keep Post" or outside the modal
  const closeDeleteModal = () => {
    setShowModal(false);
    setPostToDelete(null);
  };

  // Triggered when clicking "Yes, Delete" inside the modal
  const executeDelete = () => {
    setIsDeleting(true);
    const token = localStorage.getItem('token');

    fetch(`http://127.0.0.1:8000/api/posts/${postToDelete}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`
      }
    })
    .then(res => {
      if (res.ok || res.status === 204) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete));
        closeDeleteModal(); // Close modal on success
      } else {
        throw new Error('Failed to delete the post.');
      }
    })
    .catch(err => alert(err.message))
    .finally(() => setIsDeleting(false));
  };
  return (
    <>
      <div className="container mt-5 mb-5">
        
        {/* Top Header Card */}
        <div className="saas-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center bg-white mb-4">
          <div className="mb-3 mb-md-0">
            <h2 className="fw-bold text-dark mb-1">My Dashboard</h2>
            <p className="text-muted mb-0">Manage and refine your tech insights.</p>
          </div>
          <Link to="/create-post" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
            <i className="bi bi-plus-lg me-1"></i> Create New Post
          </Link>
        </div>

        {/* List Card */}
        <div className="saas-card overflow-hidden">
          {isLoading ? (
            <p className="text-muted text-center py-5">Loading your dashboard...</p>
          ) : error ? (
            <div className="alert alert-danger m-4">{error}</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-text fs-1 text-muted opacity-50 mb-3 d-block"></i>
              <h5 className="fw-bold text-dark">No posts yet</h5>
              <p className="text-muted">You haven't published any articles. Time to share your knowledge!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="dashboard-item d-flex align-items-center gap-4">
                
                <div className="flex-shrink-0 d-none d-md-block">
                  <div className="post-thumb-preview d-flex align-items-center justify-content-center text-muted">
                    <i className="bi bi-image opacity-50 fs-4"></i>
                  </div>
                </div>
                
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge badge-soft rounded-pill px-2 py-1 small">
                      {post.category_name || "Uncategorized"}
                    </span>
                    <small className="text-muted">
                      {new Date(post.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  
                  <Link to={`/posts/${post.id}`} className="text-decoration-none">
                    <h5 className="fw-bold mb-1 text-dark">{post.post_title}</h5>
                  </Link>
                  
                  <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '600px' }}>
                    {post.post_content.substring(0, 100)}...
                  </p>
                </div>
                
                <div className="flex-shrink-0 d-flex gap-2">
                  <Link to={`/edit-post/${post.id}`} className="btn btn-edit btn-sm rounded-pill px-3 fw-medium text-decoration-none d-flex align-items-center justify-content-center">
                    Edit
                  </Link>
                  {/* Changed from direct delete to opening the modal */}
                  <button 
                    onClick={() => openDeleteModal(post.id)} 
                    className="btn btn-delete btn-sm rounded-pill px-3 fw-medium"
                  >
                    Delete
                  </button>
                </div>
                
              </div>
            ))
          )}
        </div>
      </div>

      {/* Only renders if showModal state is true */}
      {showModal && (
        <div className="saas-modal-overlay" onClick={closeDeleteModal}>
          {/* Prevent clicks inside the modal from closing it */}
          <div className="saas-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="saas-modal-header">
              <div className="icon-box">
                <i className="bi bi-trash3-fill"></i>
              </div>
              <h4 className="fw-bold text-dark mb-0">Permanently delete?</h4>
            </div>
            
            <div className="saas-modal-body">
              <p className="text-secondary mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                This will remove your article from the blog. <br />
                <strong className="text-danger">This action cannot be undone.</strong>
              </p>
            </div>
            
            <div className="saas-modal-footer">
              <button 
                type="button" 
                className="btn-saas-secondary" 
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Keep Post
              </button>
              <button 
                type="button" 
                className="btn-saas-danger d-flex justify-content-center align-items-center" 
                onClick={executeDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyPostsPage;