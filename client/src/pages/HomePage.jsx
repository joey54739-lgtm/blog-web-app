import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HotTopics from '../components/HotTopics';
import FilterBar from '../components/FilterBar';
import PostItem from '../components/PostItem';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

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

  const handleToggleFilterBar = () => setShowFilterBar(!showFilterBar);
  
  const handleSelectCategory = (categoryName) => {
    setActiveFilter(categoryName);
    setShowFilterBar(true); 
  };
  
  const handleClearFilter = () => setActiveFilter(null);

  const displayedPosts = activeFilter 
    ? posts.filter(post => post.category_name === activeFilter)
    : posts;

  return (
    <>
      <div className="container mt-4 mb-4">
        <div className="p-5 rounded-4 text-center saas-card" style={{ boxShadow: 'none' }}>
          <h2 className="fw-bolder text-dark mb-2" style={{ letterSpacing: '-0.02em' }}>Explore Ideas & Technology</h2>
          <p className="text-muted mb-0">Insights, tutorials, and stories from our IT community.</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4 g-lg-5"> 
          
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-end mb-3">
              <h6 className="fw-bolder text-dark mb-0 fs-5"><i className="bi bi-grid-fill text-primary me-2"></i>Hot Topics</h6>
              <span 
                className="text-decoration-none small fw-bold text-muted" 
                style={{ cursor: 'pointer' }}
                onClick={handleToggleFilterBar}
              >
                {showFilterBar ? (
                  <>Hide Categories <i className="bi bi-chevron-up"></i></>
                ) : (
                  <>View All <i className="bi bi-arrow-right"></i></>
                )}
              </span>
            </div>
            
            <HotTopics 
              categories={categories} 
              activeFilter={activeFilter} 
              onSelectCategory={handleSelectCategory} 
            />

            {showFilterBar && (
              <FilterBar 
                categories={categories} 
                activeFilter={activeFilter} 
                onSelectCategory={handleSelectCategory}
                onClearFilter={handleClearFilter}
              />
            )}

            <h6 className="fw-bolder text-dark mb-3 fs-5">
              {activeFilter ? `Latest in ${activeFilter}` : 'Latest Feed'}
            </h6>
            
            <div className="saas-card px-4 py-2 mb-4">
              {isLoading ? (
                <div className="text-center py-5 text-muted">Loading feed...</div>
              ) : displayedPosts.length === 0 ? (
                <div className="text-center py-5 text-muted">No articles found in this category.</div>
              ) : (
                displayedPosts.map(post => (
                  <PostItem key={post.id} post={post} onLike={handleLike} />
                ))
              )}
            </div>

            <div className="text-center mt-4 mb-5">
              <Link 
                to="/categories" 
                state={{ categoryName: activeFilter }} 
                className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold shadow-sm" 
                style={{ transition: 'all 0.3s', fontSize: '0.9rem' }}
              >
                {activeFilter ? `Explore all ${activeFilter} articles` : `Explore more articles`} <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: '80px' }}>
              <h6 className="fw-bolder text-dark mb-3 fs-5">Explore Topics</h6>
              <div className="saas-card p-2 mb-4">
                <div className="d-flex flex-column">
                  {categories.length === 0 ? (
                    <span className="text-muted small p-2">No categories found.</span>
                  ) : (
                    categories.map((cat, index) => (
                      <Link 
                        key={cat.id} 
                        to={`/categories`} 
                        className={`text-decoration-none d-flex justify-content-between align-items-center p-3 rounded ${index === 0 ? 'text-dark' : 'text-muted'} hover-bg-light`} 
                        style={{ fontSize: '0.9rem', fontWeight: '500', backgroundColor: index === 0 ? '#f8fafc' : 'transparent' }}
                      >
                        <span><i className="bi bi-folder2 text-primary me-2"></i> {cat.category_name}</span>
                        <i className="bi bi-chevron-right text-muted opacity-50" style={{ fontSize: '0.75rem' }}></i>
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