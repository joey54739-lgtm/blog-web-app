import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PostItem from '../components/PostItem';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/posts/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/categories/').then(res => res.json())
    ])
      .then(([postsData, categoriesData]) => {
        setPosts(postsData);
        setCategories(categoriesData);
        
        // Check if HomePage passed a specific category name via Router state
        const passedCategoryName = location.state?.categoryName;
        
        if (passedCategoryName) {
          // Find the exact category object from backend data that matches the name
          const targetCategory = categoriesData.find(c => c.category_name === passedCategoryName);
          setActiveCategory(targetCategory || null);
        } else {
          // Default to "All Posts"
          setActiveCategory(null);
        }
        
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch data:", error);
        setIsLoading(false);
      });
  }, [location.state]); // Re-run if location.state changes (e.g., clicking Navbar link while already on this page)

  const handleLike = (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to like this post.");
      navigate('/login');
      return;
    }
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
      setPosts(currentPosts => currentPosts.map(post => 
        post.id === postId ? { ...post, likes_count: data.likes_count } : post
      ));
    })
    .catch(err => console.error(err));
  };

  const displayedPosts = activeCategory 
    ? posts.filter(post => post.category_name === activeCategory.category_name)
    : posts;

  return (
    <>
      <div className="container mt-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ fontWeight: '500' }}>
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
            <li className="breadcrumb-item text-muted">Categories</li>
            <li className="breadcrumb-item active text-dark" aria-current="page">
              {activeCategory ? activeCategory.category_name : 'All Posts'}
            </li>
          </ol>
        </nav>
      </div>

      <div className="container pb-5 mt-3">
        
        <header className="category-hero">
          <div className="hero-icon-box shadow-sm">
            <i className="bi bi-folder2-open"></i>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">{activeCategory ? activeCategory.category_name : 'All Categories'}</h1>
            <p className="hero-desc text-truncate-1">
              Explore the latest insights, tutorials, and discussions in {activeCategory ? activeCategory.category_name : 'our community'}.
            </p>
          </div>
          <div className="hero-stats d-none d-md-block">
            <span className="badge bg-white text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
              {displayedPosts.length} ARTICLES
            </span>
          </div>
        </header>

        <div className="row g-lg-4"> 
          
          <div className="col-lg-3 d-none d-lg-block">
            <div className="nav-sidebar sticky-top" style={{ top: '80px' }}>
              <div className="nav-sidebar-title">All Categories</div>
              <div className="d-flex flex-column">
                
                <div 
                  className={`cat-nav-item ${activeCategory === null ? 'active' : ''}`}
                  onClick={() => setActiveCategory(null)}
                >
                  <span>All Posts</span> 
                  <span className="cat-badge">{posts.length}</span>
                </div>

                {categories.map(cat => {
                  const postCount = posts.filter(p => p.category_name === cat.category_name).length;
                  return (
                    <div 
                      key={cat.id}
                      className={`cat-nav-item ${activeCategory?.id === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      <span>{cat.category_name}</span> 
                      <span className="cat-badge">{postCount}</span>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-3 px-1">
              <span className="text-dark fw-bold" style={{ fontSize: '1.1rem' }}>Latest Articles</span>
              <span className="text-muted small">Showing {displayedPosts.length} results</span>
            </div>

            <div className="saas-card px-4 py-2 mb-4">
              {isLoading ? (
                <div className="text-center py-5 text-muted">Loading categories...</div>
              ) : displayedPosts.length === 0 ? (
                <div className="text-center py-5 text-muted">No articles found in this category.</div>
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

export default CategoriesPage;