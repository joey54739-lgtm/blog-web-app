import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

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
          <form className="d-flex me-4 align-items-center">
            <div className="input-group input-group-sm shadow-sm">
              <input type="text" className="form-control rounded-start-pill bg-light border-0 py-2 ps-3" placeholder="Search posts..." />
              <button className="btn btn-light rounded-end-pill border-0 bg-light pe-3 text-primary" type="button">
                <i className="bi bi-search"></i>
              </button>
            </div>
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