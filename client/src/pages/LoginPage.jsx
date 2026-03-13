import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // useNavigate is used to redirect the user after a successful login
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Send the username and password to the Django backend
    fetch('https://blog-backend-wuzu.onrender.com/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Invalid username or password');
        }
        return response.json();
      })
      .then(data => {
        // SUCCESS: Save the token in the browser's local storage
        localStorage.setItem('token', data.token);
        // Save the username so we can display it later in the Navbar
        localStorage.setItem('username', credentials.username);
        
        setIsLoading(false);
        // Redirect to the home page
        navigate('/');
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark">Welcome Back</h2>
            <p className="text-muted">Sign in to continue to your IT Blog</p>
          </div>

          <div className="saas-card p-4 p-md-5">
            {error && <div className="alert alert-danger text-sm py-2">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-medium text-dark text-sm">Username</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-medium text-dark text-sm">Password</label>
                <input 
                  type="password" 
                  className="form-control bg-light border-0 py-2" 
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 rounded-pill fw-bold py-2 mb-3 shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-3 text-sm text-muted">
              Do not have an account? <Link to="/register" className="text-decoration-none fw-medium">Create one</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;