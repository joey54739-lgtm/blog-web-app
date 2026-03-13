import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CreatePostPage() {
  const [postData, setPostData] = useState({ title: '', content: '', category: '' });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load categories for the dropdown menu
  useEffect(() => {
    fetch('https://blog-backend-wuzu.onrender.com/api/categories/')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');

    fetch('https://blog-backend-wuzu.onrender.com/api/posts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}` // This is critical for Django to know who you are
      },
      body: JSON.stringify({
        post_title: postData.title,
        post_content: postData.content,
        category: postData.category
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to create post');
      return res.json();
    })
    .then(() => {
      setIsLoading(false);
      navigate('/my-posts'); // Redirect to home after success
    })
    .catch(err => {
      alert(err.message);
      setIsLoading(false);
    });
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h2 className="fw-bold mb-4 text-dark">Create New Post</h2>
          <div className="saas-card p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold text-sm">Article Title</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  placeholder="Enter a catchy title..."
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
                  placeholder="Write your thoughts here..."
                  value={postData.content}
                  onChange={(e) => setPostData({...postData, content: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="d-flex gap-2 justify-content-end mt-4">
                <button type="button" onClick={() => navigate(-1)} className="btn btn-light rounded-pill px-4">Cancel</button>
                <button type="submit" disabled={isLoading} className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">
                  {isLoading ? 'Publishing...' : 'Publish now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;