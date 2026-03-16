import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PostItem from '../components/PostItem';
import { API_BASE_URL } from '../config';

function PublicProfilePage() {
  const { username } = useParams(); // Extract username from URL
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      // 1. Fetch exact user details
      fetch(`${API_BASE_URL}/api/users/search/?q=${encodeURIComponent(username)}`).then(res => res.json()),
      // 2. Fetch all posts (we will filter by exact username below)
      fetch(`${API_BASE_URL}/api/posts/?search=${encodeURIComponent(username)}`).then(res => res.json()),
      // 3. Fetch categories for the sidebar
      fetch(API_BASE_URL + '/api/categories/').then(res => res.json())
    ])
    .then(([usersData, postsData, categoriesData]) => {
      // Find the exact matching user from the search results
      const exactUser = usersData.find(u => u.username.toLowerCase() === username.toLowerCase());
      setProfileUser(exactUser || null);

      // Filter posts strictly authored by this user
      const filteredPosts = postsData.filter(p => p.author_name.toLowerCase() === username.toLowerCase());
      setUserPosts(filteredPosts);
      
      setCategories(categoriesData);
      setIsLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch profile data:", err);
      setIsLoading(false);
    });
  }, [username]);

  const handleLike = (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to like this post.");
      navigate('/login');
      return;
    }
    fetch(`${API_BASE_URL}/api/posts/${postId}/like/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      setUserPosts(currentPosts => currentPosts.map(post => 
        post.id === postId ? { ...post, likes_count: data.likes_count } : post
      ));
    })
    .catch(err => console.error(err));
  };

  const displayedPosts = activeCategoryFilter
    ? userPosts.filter(post => post.category_name === activeCategoryFilter)
    : userPosts;

  if (isLoading) {
    return <div className="text-center py-5 mt-5 text-muted"><div className="spinner-border text-primary mb-3"></div><br/>Loading profile...</div>;
  }

  if (!profileUser) {
    return (
      <div className="container mt-5 text-center">
        <i className="bi bi-person-x text-muted mb-3 d-block" style={{ fontSize: '4rem' }}></i>
        <h3 className="fw-bold text-dark">User Not Found</h3>
        <p className="text-muted">The creator you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary rounded-pill px-4 mt-3">Back to Home</Link>
      </div>
    );
  }

  return (
    <>
      <div className="container mt-4 mb-5">
        
        {/* Dynamic Hero Section */}
        <div className="saas-card public-profile-hero mb-4 border-0 shadow-sm">
          <div className="author-avatar-hero">
            {profileUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-0">
              <h1 className="profile-hero-name d-flex align-items-center" style={{ fontSize: '1.2rem' }}>
                {profileUser.username} 
                <i className="bi bi-patch-check-fill text-primary ms-2" style={{ fontSize: '0.9rem' }} title="Verified Creator"></i>
              </h1>
            </div>

            <div className="profile-hero-handle text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
              @{profileUser.displayName ? profileUser.displayName : profileUser.username.toLowerCase()}
            </div>
            
            <p className="profile-hero-bio mb-1">
              {profileUser.bio || "This author hasn't written a bio yet, but their posts speak for themselves."}
            </p>

            <div className="profile-stats-container">
              <span className="profile-stat-item"><span className="profile-stat-number">{userPosts.length}</span> Published Posts</span>
            </div>
          </div>
        </div>

        <div className="row g-4 g-lg-5">
          
          {/* Reused Sidebar */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="nav-sidebar sticky-top" style={{ top: '80px' }}>
              
              <div className="nav-sidebar-title" style={{ marginTop: 0 }}>Discover</div>
              <div className="d-flex flex-column mb-4">
                <div 
                  className={`cat-nav-item ${activeCategoryFilter === null ? 'active' : ''}`}
                  onClick={() => setActiveCategoryFilter(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <span><i className="bi bi-collection me-2 opacity-50"></i> All Articles</span>
                  <span className="cat-badge">{userPosts.length}</span>
                </div>
              </div>

              <div className="nav-sidebar-title">Topics Written</div>
              <div className="d-flex flex-column">
                {categories.map(cat => {
                  // Only count posts BY THIS USER in this category
                  const postCount = userPosts.filter(p => p.category_name === cat.category_name).length;
                  if (postCount === 0) return null; 
                  
                  return (
                    <div 
                      key={cat.id}
                      className={`cat-nav-item ${activeCategoryFilter === cat.category_name ? 'active' : ''}`}
                      onClick={() => setActiveCategoryFilter(cat.category_name)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span><i className="bi bi-folder2 me-2 text-primary"></i> {cat.category_name}</span> 
                      <span className="cat-badge">{postCount}</span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          <div className="col-lg-9">
            
            <div className="d-flex justify-content-between align-items-center mb-3 px-1">
              <span className="text-dark fw-bold" style={{ fontSize: '1.1rem' }}>
                {activeCategoryFilter ? `${activeCategoryFilter} Articles` : 'Latest Articles'}
              </span>
              <span className="text-muted small">Showing {displayedPosts.length} results</span>
            </div>

            <div className="saas-card px-4 py-2 mb-4 border-0 shadow-sm">
              {displayedPosts.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-journal-x text-muted fs-1 mb-3 d-block opacity-50"></i>
                  This author hasn't published any articles in this category yet.
                </div>
              ) : (
                displayedPosts.map(post => (
                  <PostItem key={post.id} post={post} onLike={handleLike} />
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default PublicProfilePage;