import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CommentSection from '../components/CommentSection';

function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`https://blog-backend-wuzu.onrender.com/api/posts/${id}/`)
      .then(response => {
        if (!response.ok) throw new Error('Post not found');
        return response.json();
      })
      .then(data => {
        setPost(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  if (!post) return null;

  return (
    <div className="container mt-4 mb-5">
      <div className="article-container">
        
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item active">Article</li>
          </ol>
        </nav>

        <header className="article-hero-header">
          <span className="badge category-badge text-uppercase rounded-pill px-3 py-2">
            {post.category_name || "Uncategorized"}
          </span>
          <h1 className="article-hero-title mt-3">{post.post_title}</h1>
          
          <div className="author-meta">
            <div className="avatar-circle bg-primary">
              {post.author_name ? post.author_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <span className="fw-bold text-dark d-block text-start" style={{ fontSize: '0.9rem' }}>{post.author_name}</span>
              <span className="text-muted d-block text-start" style={{ fontSize: '0.75rem' }}>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </header>

        <article className="article-body">
          {post.post_content}
        </article>

        <hr className="my-5 opacity-25" />

        <CommentSection postId={post.id} />
        
      </div>
    </div>
  );
}

export default PostDetailPage;