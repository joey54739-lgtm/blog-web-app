import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function EditPostPage() {
  const { id } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  
  const [postData, setPostData] = useState({ title: '', content: '', category: '' });
  const [categories, setCategories] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch both the specific post data AND the categories simultaneously
    Promise.all([
      fetch(`${API_BASE_URL}/api/posts/${id}/`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch post data');
        return res.json();
      }),
      fetch(API_BASE_URL + '/api/categories/').then(res => res.json())
    ])
    .then(([post, categoryData]) => {
      // Pre-fill the form with existing data
      setPostData({
        title: post.post_title,
        content: post.post_content,
        category: post.category || '' // Use the category ID
      });
      setCategories(categoryData);
      setIsInitialLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setIsInitialLoading(false);
    });
  }, [id, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');

    // Send a PUT request to update the existing resource
    fetch(`${API_BASE_URL}/api/posts/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({
        post_title: postData.title,
        post_content: postData.content,
        category: postData.category
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update post');
      return res.json();
    })
    .then(() => {
      setIsSaving(false);
      navigate('/my-posts'); // Redirect back to dashboard after success
    })
    .catch(err => {
      alert(err.message);
      setIsSaving(false);
    });
  };

  if (isInitialLoading) {
    return <div className="container mt-5 text-center text-muted py-5">Loading post data...</div>;
  }

  if (error) {
    return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h2 className="fw-bold mb-4 text-dark">Edit Post</h2>
          <div className="saas-card p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold text-sm">Article Title</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  value={postData.title}
                  onChange={(e) => setPostData({...postData, title: e.target.value})}
                  required 
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-bold text-sm">Category</label>
                <select 
                  className="form-select bg-light border-0 py-2"
                  value={postData.category}
                  onChange={(e) => setPostData({...postData, category: e.target.value})}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-sm">Content</label>
                <textarea 
                  className="form-control bg-light border-0 py-2" 
                  rows="10" 
                  value={postData.content}
                  onChange={(e) => setPostData({...postData, content: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="d-flex gap-2 justify-content-end mt-4">
                <button type="button" onClick={() => navigate('/my-posts')} className="btn btn-light rounded-pill px-4">Cancel</button>
                <button type="submit" disabled={isSaving} className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPostPage;