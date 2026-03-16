import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
    const updateAuthStatus = () => {
      const token = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('username');
      
      if (token) {
        setIsLoggedIn(true);
        setUsername(storedUsername || 'User');
      } else {
        setIsLoggedIn(false);
        setUsername('');
      }
    };

    updateAuthStatus();

    window.addEventListener('profileUpdated', updateAuthStatus);

    return () => {
      window.removeEventListener('profileUpdated', updateAuthStatus);
    };
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top py-2 shadow-sm">
      <div className="container">
        
        <Link className="navbar-brand fw-bold text-primary fs-5 me-4" to="/">
          <i className="bi bi-hexagon-fill me-2"></i>IT Blog
        </Link>
        
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="mainNav">
          
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-2 fs-6">
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/categories">Categories</Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link fw-medium" 
                to={isLoggedIn ? "/my-posts" : "/login"}
              >
                My Workspace
              </Link>
            </li>
          </ul>
          
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

          <div className="d-flex align-items-center mt-3 mt-lg-0">
            {isLoggedIn ? (
              <>
                <Link to="/create-post" className="nav-icon-btn me-3" title="Write a post">
                  <i className="bi bi-pencil-square"></i>
                </Link>
                
                <div className="nav-icon-btn position-relative" title="Notifications">
                  <i className="bi bi-bell"></i>
                  <span 
                    className="position-absolute top-0 start-100 translate-middle bg-danger border border-white rounded-circle" 
                    style={{ width: '8px', height: '8px', marginTop: '6px', marginLeft: '-6px' }}
                  ></span>
                </div>

                <div className="nav-divider"></div>

                <div className="position-relative" ref={dropdownRef}>
                  <div 
                    className="user-dropdown-toggle" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div 
                      className="text-white rounded-circle d-flex justify-content-center align-items-center fw-bold shadow-sm" 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        fontSize: '0.85rem',
                        backgroundColor: '#3459e6'
                      }}
                    >
                      {username ? username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span>{username}</span>
                    <i className="bi bi-chevron-down text-muted" style={{ fontSize: '0.75rem' }}></i>
                  </div>

                  {isDropdownOpen && (
                    <div className="saas-dropdown-menu position-absolute end-0 bg-white mt-3">
                      <Link to="/my-posts" state={{ activeView: 'profile' }} className="saas-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        <i className="bi bi-person fs-5 opacity-75"></i> My Profile
                      </Link>
                      <div className="saas-dropdown-divider"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="saas-dropdown-item text-danger border-0 bg-transparent w-100 text-start"
                      >
                        <i className="bi bi-box-arrow-right fs-5"></i> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-decoration-none text-muted fw-medium fs-6 me-3">Log In</Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-4 fw-medium shadow-sm py-2">Sign up</Link>
              </>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}

export default Navbar;