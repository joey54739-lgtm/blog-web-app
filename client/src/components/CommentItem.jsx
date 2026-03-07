import React, { useState } from 'react';

const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMins = Math.round((now - past) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

const getAvatarColor = (name) => {
  const colors = ['#3b71ca', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

function CommentItem({ comment, allComments, onReply }) {
  const [showReplies, setShowReplies] = useState(false);
  
  const replies = allComments.filter(c => c.parent === comment.id);
  const initial = comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="comment-item">
      <div 
        className="comment-avatar" 
        style={{ backgroundColor: getAvatarColor(comment.author_name), color: 'white' }}
      >
        {initial}
      </div>
      
      <div className="comment-content">
        <div>
          <span className="comment-user-name">{comment.author_name}</span>
          <span className="comment-time">{timeAgo(comment.created_at)}</span>
        </div>
        
        <p className="comment-text">{comment.comment_content}</p>
        
        <div className="comment-actions">
          <span className="action-item"><i className="bi bi-heart me-1"></i> Like</span>
          <span className="action-item" onClick={() => onReply(comment.id, comment.author_name)}>
            <i className="bi bi-reply me-1"></i> Reply
          </span>
        </div>

        {replies.length > 0 && (
          <div className="mt-1">
            {!showReplies ? (
              <div className="view-more-replies" onClick={() => setShowReplies(true)}>
                View {replies.length} {replies.length === 1 ? 'reply' : 'more replies'}
              </div>
            ) : (
              <div className="replies-wrapper">
                {replies.map(reply => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    allComments={allComments} 
                    onReply={onReply} 
                  />
                ))}
                <div className="view-more-replies mt-2" onClick={() => setShowReplies(false)} style={{ color: '#94a3b8' }}>
                  Hide replies
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentItem;