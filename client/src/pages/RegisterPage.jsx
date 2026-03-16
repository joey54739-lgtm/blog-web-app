import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Send the new user data to the Django registration endpoint
    fetch(API_BASE_URL + '/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
      .then(async response => {
        if (!response.ok) {
          const errData = await response.json();
          // Extract the first error message from the backend response
          const errorMsg = Object.values(errData)[0] || 'Registration failed';
          throw new Error(errorMsg);
        }
        return response.json();
      })
      .then(() => {
        setIsLoading(false);
        // Redirect to login page after successful registration
        navigate('/login');
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
            <h2 className="fw-bold text-dark">Join the Community</h2>
            <p className="text-muted">Create a new account to start posting</p>
          </div>

          <div className="saas-card p-4 p-md-5">
            {error && <div id="register-error" className="alert alert-danger text-sm py-2" role="alert">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="reg-username" className="form-label fw-medium text-dark text-sm">Username</label>
                <input 
                  id="reg-username"
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required 
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "register-error" : undefined}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="reg-email" className="form-label fw-medium text-dark text-sm">Email Address</label>
                <input 
                  id="reg-email"
                  type="email" 
                  className="form-control bg-light border-0 py-2" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "register-error" : undefined}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="reg-password" className="form-label fw-medium text-dark text-sm">Password</label>
                <input 
                  id="reg-password"
                  type="password" 
                  className="form-control bg-light border-0 py-2" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "register-error" : undefined}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 rounded-pill fw-bold py-2 mb-3 shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="text-center mt-3 text-sm text-muted">
              Already have an account? <Link to="/login" className="text-decoration-none fw-medium">Sign in</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RegisterPage;