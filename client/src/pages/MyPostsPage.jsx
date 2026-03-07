import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Used to redirect unauthorized users
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Security check: if no token is found, kick them to the login page
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch strictly the logged-in user's posts from our new endpoint
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

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          
          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark mb-0">My Posts</h2>
            <Link to="/create-post" className="btn btn-primary rounded-pill px-4 fw-medium shadow-sm">
              <i className="bi bi-plus-lg me-1"></i> Create New
            </Link>
          </div>

          {/* Main Content Card */}
          <div className="saas-card p-4">
            {isLoading ? (
              <p className="text-muted text-center py-5">Loading your amazing content...</p>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : posts.length === 0 ? (
              // Empty State UI
              <div className="text-center py-5">
                <i className="bi bi-journal-text fs-1 text-muted opacity-50 mb-3 d-block"></i>
                <h5 className="fw-bold text-dark">No posts yet</h5>
                <p className="text-muted">You haven't published any articles. Time to share your knowledge!</p>
              </div>
            ) : (
              // List of User's Posts
              <div className="list-group list-group-flush">
                {posts.map(post => (
                  <div key={post.id} className="list-group-item px-0 py-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    
                    <div>
                      <Link to={`/posts/${post.id}`} className="text-decoration-none">
                        <h5 className="fw-bold text-dark mb-1 post-title">{post.post_title}</h5>
                      </Link>
                      <div className="d-flex gap-3 text-muted text-sm mt-2">
                        <span>
                          <i className="bi bi-folder2 me-1"></i>
                          {post.category_name || "Uncategorized"}
                        </span>
                        <span>
                          <i className="bi bi-calendar3 me-1"></i>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons (Placeholders for upcoming Update & Delete features) */}
                    <div className="d-flex gap-2 flex-shrink-0">
                      <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium">Edit</button>
                      <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-medium">Delete</button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default MyPostsPage;