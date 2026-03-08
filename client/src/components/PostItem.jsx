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
        
        <Link to={`/posts/${post.id}`} className="text-decoration-none">
          <h3 className="post-title fw-bold text-dark h6 mb-1">
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
            <span className="text-dark fw-medium" style={{ fontSize: '0.8rem' }}>
              {post.author_name}
            </span>
          </div>
          
          <div className="compact-stats">
            <span className="like-btn" onClick={() => onLike(post.id)}>
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