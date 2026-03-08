import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HotTopics from '../components/HotTopics';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/posts/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/categories/').then(res => res.json())
    ])
      .then(([postsData, categoriesData]) => {
        setPosts(postsData);
        setCategories(categoriesData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch data:", error);
        setIsLoading(false);
      });
  }, []);

  // Handle post like toggle
  const handleLike = (postId) => {
    const token = localStorage.getItem('token');
    
    // Redirect to login if unauthenticated
    if (!token) {
      alert("Please log in to like this post.");
      navigate('/login');
      return;
    }

    // Send POST request to backend like endpoint
    fetch(`http://127.0.0.1:8000/api/posts/${postId}/like/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to toggle like');
      return res.json();
    })
    .then(data => {
      // Instantly update the likes_count in React State for a seamless UI experience
      setPosts(currentPosts => currentPosts.map(post => 
        post.id === postId ? { ...post, likes_count: data.likes_count } : post
      ));
    })
    .catch(err => console.error(err));
  };

  return (
    <>
      {/* main title and subtitle on top of homepage */}
      <div className="container mt-4 mb-4">
        <div className="p-4 p-md-5 rounded-4 text-center border" style={{ background: 'linear-gradient(to right, #ffffff, #f8f9fa)' }}>
          <h2 className="fw-bold text-dark mb-2">Explore Ideas & Technology</h2>
          <p className="text-muted mb-0">Insights, tutorials, and stories from our IT community.</p>
        </div>
      </div>

      {/* Main content area: posts and categories */}
      <div className="container pb-5">
        <div className="row g-4 g-lg-5"> 
          
          {/* Left column */}
          <div className="col-lg-8">
            {/* Hot Topics Header */}
            <div className="d-flex justify-content-between align-items-end mb-3">
              <h5 className="fw-bold text-dark mb-0"><i className="bi bi-grid-fill text-primary me-2"></i>Hot Topics</h5>
              <Link to="/categories" className="text-decoration-none small fw-bold text-muted">View All <i className="bi bi-arrow-right"></i></Link>
            </div>
            
            {/* HotTopics Component */}
            <HotTopics categories={categories} />

            <h5 className="fw-bold text-dark mb-3">Latest Feed</h5>
            
            {/* Posts Card */}
            <div className="saas-card px-4 py-2 mb-4">
              {isLoading ? (
                <div className="text-center py-5 text-muted">Loading feed...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-5 text-muted">No articles published yet.</div>
              ) : (
                posts.map(post => (
                  <article key={post.id} className="post-item d-flex gap-3 align-items-center">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-light text-primary border px-2 py-1" style={{ fontSize: '0.7rem' }}>
                          {post.category_name || "Uncategorized"}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <Link to={`/posts/${post.id}`} className="text-decoration-none">
                        <h3 className="post-title fw-bold text-dark h6 mb-1">{post.post_title}</h3>
                      </Link>
                      
                      <p className="text-muted text-truncate-2 mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                        {post.post_content}
                      </p>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold me-2" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                            {post.author_name ? post.author_name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span className="text-dark fw-medium" style={{ fontSize: '0.8rem' }}>{post.author_name}</span>
                        </div>
                        
                        {/* Social interaction stats */}
                        <div className="compact-stats">
                          <span className="like-btn" onClick={() => handleLike(post.id)}>
                            <i className="bi bi-heart-fill"></i> {post.likes_count} Likes
                          </span>
                          <Link to={`/posts/${post.id}`} className="chat-btn">
                            <i className="bi bi-chat-dots"></i> {post.comments_count} Comments
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Post thumbnail / icon */}
                    <div className="d-none d-sm-block flex-shrink-0">
                      <div className="post-thumbnail d-flex align-items-center justify-content-center text-muted">
                        <i className="bi bi-journal-text fs-4 opacity-50"></i>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Pagination */}
            <nav aria-label="Post navigation">
                <ul className="pagination justify-content-center mb-0">
                    <li className="page-item disabled"><a className="page-link" href="#"><i className="bi bi-chevron-left"></i></a></li>
                    <li className="page-item active"><a className="page-link" href="#">1</a></li>
                    <li className="page-item"><a className="page-link" href="#">2</a></li>
                    <li className="page-item"><a className="page-link" href="#"><i className="bi bi-chevron-right"></i></a></li>
                </ul>
            </nav>

          </div>

          {/* Right column: Categories list */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: '80px' }}>
              <h5 className="fw-bold text-dark mb-3">Explore Topics</h5>
              <div className="saas-card p-3 mb-4">
                <div className="d-flex flex-column gap-1">
                  {categories.length === 0 ? (
                    <span className="text-muted small p-2">No categories found.</span>
                  ) : (
                    categories.map((cat, index) => (
                      <Link key={cat.id} to={`/categories`} className={`text-decoration-none d-flex justify-content-between align-items-center p-2 rounded ${index === 0 ? 'text-dark bg-light' : 'text-muted'}`} style={{ fontSize: '0.95rem' }}>
                        <span className="fw-medium"><i className="bi bi-folder2 me-2 text-primary"></i> {cat.category_name}</span>
                        <i className="bi bi-chevron-right" style={{ fontSize: '0.75rem' }}></i>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default HomePage;