import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import PostItem from '../components/PostItem';

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(query);
  
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    // Fetch posts using Django's SearchFilter parameter "?search="
    fetch(`http://127.0.0.1:8000/api/posts/?search=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch search results:", err);
        setIsLoading(false);
      });
  }, [query]);

  // Handle a new search initiated from this page
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  // Reuse the like handler
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
    .then(res => res.json())
    .then(data => {
      setPosts(currentPosts => currentPosts.map(post => 
        post.id === postId ? { ...post, likes_count: data.likes_count } : post
      ));
    })
    .catch(err => console.error(err));
  };

  // Extract unique users from search results to populate the "People" section
  const matchedUsers = Array.from(new Set(posts.map(post => post.author_name)))
                            .filter(Boolean).slice(0, 4); // Show up to 4 users

  return (
    <>
      {/* Breadcrumb Navigation */}
      <div className="container mt-3 mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
            <li className="breadcrumb-item active text-dark" aria-current="page">Search Results</li>
          </ol>
        </nav>
      </div>

      <div className="container pb-5">
        <div className="row g-4 g-lg-5"> 
          
          {/* Left Sidebar (Reusing styles from Categories page) */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="nav-sidebar sticky-top" style={{ top: '80px' }}>
              <div className="nav-sidebar-title" style={{ marginTop: 0 }}>Filter</div>
              <div className="saas-card p-2 mb-4">
                <div className="d-flex flex-column">
                  <div className="cat-nav-item active">
                    <span><i className="bi bi-file-text me-2 opacity-50"></i> Articles</span>
                    <span className="cat-badge">{posts.length}</span>
                  </div>
                  <div className="cat-nav-item" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                    <span><i className="bi bi-people me-2 opacity-50"></i> Authors</span>
                    <span className="cat-badge">{matchedUsers.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="search-utility-bar mb-4">
              <i className="bi bi-search text-muted ms-2"></i>
              <input 
                type="text" 
                className="search-utility-input" 
                value={localQuery} 
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search articles, categories, or authors..." 
              />
              <button type="submit" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold">Search</button>
            </form>

            {/* Dynamic People Section */}
            {matchedUsers.length > 0 && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                  <span className="text-dark fw-bold" style={{ fontSize: '1.1rem' }}>People</span>
                </div>
                <div className="user-grid">
                  {matchedUsers.map(username => (
                    <div key={username} className="user-match-card">
                      <div className="user-avatar-lg bg-primary">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <h6 className="fw-bold text-dark mb-0 text-truncate">{username}</h6>
                        <div className="text-muted small text-truncate" style={{ fontSize: '0.8rem' }}>
                          Author in search results
                        </div>
                      </div>
                      <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-primary" style={{ fontSize: '0.75rem' }}>View</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3 px-1">
              <span className="text-dark fw-bold" style={{ fontSize: '1.1rem' }}>Articles ({posts.length})</span>
              {query && <span className="text-muted small">Showing results for "<span className="hl-keyword">{query}</span>"</span>}
            </div>

            {/* Articles List reusing PostItem */}
            <div className="saas-card px-4 py-2 mb-4">
              {isLoading ? (
                <div className="text-center py-5 text-muted">Searching...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-search text-muted fs-1 mb-3 d-block opacity-50"></i>
                  No results found for "{query}". Try a different keyword.
                </div>
              ) : (
                posts.map(post => (
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

export default SearchResultsPage;