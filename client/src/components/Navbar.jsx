import { Link } from 'react-router-dom';

function Navbar() {
  return (
    // The 'navbar' class triggers the glassmorphism effect defined in index.css
    <nav className="navbar navbar-expand-lg sticky-top py-2 shadow-sm">
      <div className="container">
        
        {/* Logo Section */}
        <Link className="navbar-brand fw-bold text-primary fs-5 me-4" to="/">
          <i className="bi bi-hexagon-fill me-2"></i>IT Blog
        </Link>
        
        {/* Mobile Toggle Button for responsive design */}
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
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/my-posts">My Posts</Link>
            </li>
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
          
          {/* Authentication Buttons */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            <Link to="/login" className="text-decoration-none text-muted fw-medium fs-6">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-4 fw-medium shadow-sm py-2">Get Started</Link>
          </div>
          
        </div>
      </div>
    </nav>
  );
}

export default Navbar;