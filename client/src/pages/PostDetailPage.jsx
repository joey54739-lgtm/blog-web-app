import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function PostDetailPage() {
  // Extract the post ID from the URL (e.g., /posts/1 -> id is 1)
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the specific post by its ID
    fetch(`http://127.0.0.1:8000/api/posts/${id}/`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Post not found');
        }
        return response.json();
      })
      .then(data => {
        setPost(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch post:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  // Loading and Error states
  if (isLoading) return <div className="container mt-5"><div className="alert alert-info">Loading article...</div></div>;
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  if (!post) return null;

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Article</li>
            </ol>
          </nav>

          {/* Main Article Card */}
          <div className="saas-card p-4 p-md-5 mb-5">
            <div className="mb-4 text-center">
              <span className="badge bg-light text-primary border px-3 py-2 mb-3">
                {post.category_name || "Uncategorized"}
              </span>
              <h1 className="fw-bold text-dark mb-3">{post.post_title}</h1>
              
              <div className="d-flex justify-content-center align-items-center gap-3 text-muted">
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold me-2 avatar-sm">
                    {post.author_name ? post.author_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="fw-medium text-dark">{post.author_name}</span>
                </div>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <hr className="mb-4 text-muted opacity-25" />

            {/* Article Content using our new CSS class */}
            <div className="article-content text-dark">
              {post.post_content}
            </div>
          </div>

          {/* Comments Section Placeholder (To be implemented later) */}
          <h4 className="fw-bold mb-4">Comments</h4>
          <div className="saas-card p-4 text-center text-muted">
            <i className="bi bi-chat-dots fs-1 mb-3 d-block opacity-50"></i>
            <p>Comments will be displayed here.</p>
            <button className="btn btn-outline-primary rounded-pill mt-2">Log in to comment</button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default PostDetailPage;