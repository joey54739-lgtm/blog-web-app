import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function PostDetailPage() {
  const { id } = useParams();
  
  // States for Post and Comments
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  
  // States for UI logic
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // 1. Fetch the specific post
    fetch(`http://127.0.0.1:8000/api/posts/${id}/`)
      .then(response => {
        if (!response.ok) throw new Error('Post not found');
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

    // 2. Fetch the comments belonging strictly to this post
    fetch(`http://127.0.0.1:8000/api/comments/?post=${id}`)
      .then(response => response.json())
      .then(data => setComments(data))
      .catch(err => console.error("Failed to fetch comments:", err));
      
  }, [id]);

  // Handle new comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    fetch('http://127.0.0.1:8000/api/comments/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({
        post: id,
        comment_content: newComment
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to post comment');
        return res.json();
      })
      .then(data => {
        // Add the new comment to the UI instantly without refreshing
        setComments([...comments, data]);
        setNewComment(''); // Clear the input box
      })
      .catch(err => alert(err.message))
      .finally(() => setIsSubmitting(false));
  };

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

            <div className="article-content text-dark">
              {post.post_content}
            </div>
          </div>

          {/* ================= COMMENTS SECTION ================= */}
          <h4 className="fw-bold mb-4">Comments ({comments.length})</h4>
          
          <div className="saas-card p-4 p-md-5">
            
            {/* 1. Comment Input Form OR Log in Prompt */}
            {isLoggedIn ? (
              <form onSubmit={handleCommentSubmit} className="mb-5">
                <div className="d-flex gap-3">
                  <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold flex-shrink-0 avatar-sm">
                    {localStorage.getItem('username')?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-grow-1">
                    <textarea 
                      className="form-control bg-light border-0 py-3 px-4 rounded-4" 
                      rows="3" 
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    ></textarea>
                    <div className="d-flex justify-content-end mt-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary rounded-pill px-4 fw-medium shadow-sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              /* Original elegant placeholder retained for non-logged-in users */
              <div className="text-center text-muted mb-5 py-3 border-bottom border-light">
                <i className="bi bi-chat-dots fs-1 mb-3 d-block opacity-50"></i>
                <p>Please log in to share your thoughts.</p>
                <Link to="/login" className="btn btn-outline-primary rounded-pill px-4 mt-2 fw-medium">
                  Log in to comment
                </Link>
              </div>
            )}

            {/* 2. List of Existing Comments */}
            <div className="d-flex flex-column gap-4">
              {comments.length === 0 && isLoggedIn ? (
                <div className="text-center text-muted py-4">
                  Be the first to comment on this article!
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="d-flex gap-3">
                    <div className="bg-light text-primary rounded-circle d-flex justify-content-center align-items-center fw-bold flex-shrink-0 avatar-sm">
                      {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="flex-grow-1 bg-light p-3 rounded-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark text-sm">{comment.author_name}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mb-0 text-dark" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {comment.comment_content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}

export default PostDetailPage;