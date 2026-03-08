import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // This effect runs every time the route (URL) changes.
  // It checks if a token exists in local storage to update the UI instantly.
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUsername || 'User');
    } else {
      setIsLoggedIn(false);
      setUsername('');
    }
  }, [location]); // Dependency array includes location to trigger on navigation

  // Handle the logout process
  const handleLogout = () => {
    // 1. Remove the token and username from the browser
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    // 2. Update the local state
    setIsLoggedIn(false);
    
    // 3. Redirect the user back to the public home page
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top py-2 shadow-sm">
      <div className="container">
        
        {/* Logo Section */}
        <Link className="navbar-brand fw-bold text-primary fs-5 me-4" to="/">
          <i className="bi bi-hexagon-fill me-2"></i>IT Blog
        </Link>
        
        {/* Mobile Toggle Button */}
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="mainNav">
          
          {/* Main Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-2 fs-6">
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/categories">Categories</Link>
            </li>
            {/* Only show 'My Posts' if the user is logged in */}
            {isLoggedIn && (
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/my-posts">My Posts</Link>
              </li>
            )}
          </ul>
          
          {/* Search Bar */}
          <form className="d-none d-lg-flex position-relative me-3" style={{ width: '250px' }} onSubmit={handleSearch}>
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '0.9rem' }}></i>
            <input 
              className="form-control form-control-sm bg-light border-0 rounded-pill ps-5 py-2" 
              type="search" 
              placeholder="Search posts..." 
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Create Post Button - Only visible if logged in */}
          {isLoggedIn && (
            <Link to="/create-post" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm me-3 d-flex align-items-center">
                <i className="bi bi-plus-lg me-1"></i> Publish
            </Link>
        )}
          
          {/* Dynamic Authentication Section */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {isLoggedIn ? (
              // What to show when the user IS logged in
              <>
                <span className="text-muted fw-medium fs-6 d-flex align-items-center">
                  <i className="bi bi-person-circle fs-5 me-2 text-primary"></i>
                  Hi, {username}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline-danger btn-sm rounded-pill px-4 fw-medium shadow-sm py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              // What to show when the user is NOT logged in
              <>
                <Link to="/login" className="text-decoration-none text-muted fw-medium fs-6">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-4 fw-medium shadow-sm py-2">Get Started</Link>
              </>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}

export default Navbar;