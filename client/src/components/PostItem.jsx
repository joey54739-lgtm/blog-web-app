import React from 'react';
import { Link } from 'react-router-dom';

function PostItem({ post, onLike }) {
  return (
    <article className="post-item d-flex gap-3 align-items-center">
      <div className="flex-grow-1">
        
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge bg-light text-primary border px-2 py-1" style={{ fontSize: '0.7rem' }}>
            {post.category_name || "Uncategorized"}
          </span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <Link to={`/posts/${post.id}`} className="d-block text-decoration-none mb-1">
          <h3 className="post-title fw-bold text-dark h6 mb-0">
            {post.post_title}
          </h3>
        </Link>
        
        <p className="text-muted text-truncate-2 mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
          {post.post_content}
        </p>
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div 
              className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold me-2" 
              style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}
            >
              {post.author_name ? post.author_name.charAt(0).toUpperCase() : "U"}
            </div>
            <Link to={`/profile/${post.author_name}`} className="text-dark fw-medium text-decoration-none" style={{ fontSize: '0.8rem' }}>
              {post.author_name}
            </Link>
          </div>
          
          <div className="compact-stats">
            <span 
              className="like-btn" 
              onClick={() => onLike(post.id)}
              role="button"
              aria-label="Like this post"
              tabIndex="0"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLike(post.id); }}
            >
              <i className="bi bi-heart-fill"></i> {post.likes_count} Likes
            </span>
            <Link to={`/posts/${post.id}`} className="text-decoration-none text-muted chat-btn">
              <i className="bi bi-chat-dots"></i> {post.comments_count} Comments
            </Link>
          </div>
        </div>

      </div>
      
      <div className="d-none d-sm-block flex-shrink-0">
        <div className="post-thumbnail d-flex align-items-center justify-content-center text-muted">
          <i className="bi bi-journal-text fs-4 opacity-50"></i>
        </div>
      </div>
    </article>
  );
}

export default PostItem;