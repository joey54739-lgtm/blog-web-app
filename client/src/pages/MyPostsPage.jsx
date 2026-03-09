import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostItem from '../components/PostItem';

function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);

  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      fetch('http://127.0.0.1:8000/api/posts/mine/', {
        headers: { 'Authorization': `Token ${token}` }
      }).then(res => {
        if (!res.ok) throw new Error('Failed to fetch your posts');
        return res.json();
      }),
      fetch('http://127.0.0.1:8000/api/categories/').then(res => res.json())
    ])
      .then(([postsData, categoriesData]) => {
        setPosts(postsData);
        setCategories(categoriesData);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [navigate]);

  const confirmDelete = (postId) => {
    setPostToDelete(postId);
  };

  const cancelDelete = () => {
    setPostToDelete(null);
  };

  const executeDelete = () => {
    if (!postToDelete) return;

    const token = localStorage.getItem('token');
    fetch(`http://127.0.0.1:8000/api/posts/${postToDelete}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` }
    })
      .then(res => {
        if (res.ok) {
          setPosts(posts.filter(post => post.id !== postToDelete));
          setPostToDelete(null);
        } else {
          throw new Error('Failed to delete post');
        }
      })
      .catch(err => alert(err.message));
  };

  const handleLike = (postId) => {
    const token = localStorage.getItem('token');
    fetch(`http://127.0.0.1:8000/api/posts/${postId}/like/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      setPosts(currentPosts => currentPosts.map(post => 
        post.id === postId ? { ...post, likes_count: data.likes_count } : post
      ));
    })
    .catch(err => console.error(err));
  };

  return (
    <>
      <div className="container mt-4 mb-5">
        
        <div className="saas-card dashboard-header">
          <div className="d-flex align-items-center gap-3">
            <div className="header-avatar">
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="header-title">{username}'s Workspace</h1>
              <p className="header-subtitle">Manage your {posts.length} published articles.</p>
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <Link to="/create-post" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" style={{ fontSize: '0.9rem' }}>
              <i className="bi bi-pen me-1"></i> Write
            </Link>
          </div>
        </div>

        <div className="row g-4">
          
          {/* Reused Left Sidebar Structure */}
          <div className="col-lg-3">
            <div className="sticky-top" style={{ top: '80px' }}>
              <div className="nav-sidebar">
                
                <div className="nav-sidebar-title" style={{ marginTop: 0 }}>Overview</div>
                <div className="d-flex flex-column mb-4">
                  <div className="cat-nav-item active">
                    <span><i className="bi bi-collection me-2 opacity-50"></i> All Posts</span>
                    <span className="cat-badge">{posts.length}</span>
                  </div>
                </div>

                <div className="nav-sidebar-title">My Folders</div>
                <div className="d-flex flex-column">
                  {categories.map(cat => {
                    const postCount = posts.filter(p => p.category_name === cat.category_name).length;
                    if (postCount === 0) return null; 
                    
                    return (
                      <div key={cat.id} className="cat-nav-item">
                        <span><i className="bi bi-folder2 me-2 text-primary"></i> {cat.category_name}</span>
                        <span className="cat-badge">{postCount}</span>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-lg-9">
            <div className="saas-card px-4 py-2 mb-4">
              {isLoading && <div className="text-center py-5 text-muted">Loading your workspace...</div>}
              {error && <div className="alert alert-danger m-4">{error}</div>}
              {!isLoading && !error && posts.length === 0 && (
                <div className="text-center py-5 text-muted">
                  You haven't published any articles yet.
                </div>
              )}
              
              {/* Reusing PostItem and adding action buttons next to it */}
              {!isLoading && !error && posts.map(post => (
                <div key={post.id} className="d-flex align-items-center" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <div className="flex-grow-1" style={{ borderBottom: 'none' }}>
                    {/* The PostItem container handles padding, so we nest it directly */}
                    <div style={{ borderBottom: 'none' }}>
                       <PostItem post={post} onLike={handleLike} />
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 d-flex flex-column gap-2 ms-4">
                    <Link to={`/edit-post/${post.id}`} className="btn btn-edit rounded-pill px-3 py-1 text-center text-decoration-none">
                      Edit
                    </Link>
                    <button onClick={() => confirmDelete(post.id)} className="btn btn-delete rounded-pill px-3 py-1">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-4 mb-2">
              <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: '500' }}>End of your workspace.</span>
            </div>

          </div>
        </div>
      </div>

      {postToDelete && (
        <div className="saas-modal-overlay">
          <div className="saas-modal-content">
            <div className="saas-modal-header">
              <div className="icon-box">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <h4 className="fw-bold mb-1">Delete Post?</h4>
            </div>
            <div className="saas-modal-body text-muted">
              Are you sure you want to delete this article? This action cannot be undone.
            </div>
            <div className="saas-modal-footer">
              <button className="btn-saas-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="btn-saas-danger" onClick={executeDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyPostsPage;