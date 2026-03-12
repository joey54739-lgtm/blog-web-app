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

function CommentItem({ comment, allComments, onSubmitReply, onDelete, currentUser }) {
  const [showReplies, setShowReplies] = useState(false);
  
  // NEW STATES FOR INLINE REPLY
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const replies = allComments.filter(c => c.parent === comment.id);
  const initial = comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'U';
  const isAuthor = currentUser === comment.author_name;

  // HANDLE INLINE REPLY SUBMISSION
  const handleReplySubmit = async () => {
    if (!replyText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    // We await the parent's generic submit function
    await onSubmitReply(comment.id, replyText);
    
    setIsSubmitting(false);
    setIsReplying(false);
    setReplyText('');
    setShowReplies(true); // Auto-open replies to show the newly posted one
  };

  return (
    <div className="comment-item">
      <div className="comment-avatar avatar-circle-comment">
        {initial}
      </div>
      
      <div className="flex-grow-1">
        <div className="comment-author">
          {comment.author_name}
          <span className="comment-time ms-2">{timeAgo(comment.created_at)}</span>
        </div>
        
        <div className="comment-text">{comment.comment_content}</div>
        
        <div className="comment-actions">
          <div className="action-btn"><i className="bi bi-heart"></i> Like</div>
          
          {/* TOGGLE REPLY BOX */}
          <div 
            className={`action-btn ${isReplying ? 'active-reply' : ''}`}
            onClick={() => {
              setIsReplying(!isReplying);
              if (!isReplying) setReplyText('');
            }}
          >
            <i className="bi bi-reply-fill"></i> Reply
          </div>
          
          {/* DEFAULT DELETE BUTTON */}
          {isAuthor && !isConfirmingDelete && (
            <div 
              className="action-btn action-delete ms-2" 
              onClick={() => setIsConfirmingDelete(true)}
            >
              <i className="bi bi-trash3"></i> Delete
            </div>
          )}

          {/* INLINE CONFIRMATION BOX */}
          {isAuthor && isConfirmingDelete && (
            <div className="inline-confirm-box ms-2">
              <span className="confirm-msg">Delete this?</span>
              <span 
                className="btn-confirm-yes" 
                onClick={() => onDelete(comment.id)}
              >
                Yes
              </span>
              <span className="text-muted opacity-50">|</span>
              <span 
                className="btn-confirm-no" 
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </span>
            </div>
          )}
        </div>

        {/* INLINE COMPACT REPLY BOX */}
        {isReplying && (
          <div className="inline-reply-compact">
            <div className="inline-reply-avatar">
              {currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="inline-input-group">
              <input 
                type="text" 
                className="inline-input-sm" 
                placeholder={`Replying to @${comment.author_name}...`}
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
                disabled={isSubmitting}
              />
              
              <div className="d-flex align-items-center">
                <button 
                  className="btn-cancel-sm" 
                  onClick={() => setIsReplying(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  className="btn-reply-pill" 
                  onClick={handleReplySubmit}
                  disabled={isSubmitting || !replyText.trim()}
                >
                  {isSubmitting ? '...' : 'Reply'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RETAINED REPLIES RENDERING */}
        {replies.length > 0 && (
          <div className="mt-2">
            {!showReplies ? (
              <div className="view-more-replies" onClick={() => setShowReplies(true)} style={{ cursor: 'pointer', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '500' }}>
                View {replies.length} {replies.length === 1 ? 'reply' : 'more replies'}
              </div>
            ) : (
              <div className="replies-wrapper mt-3 ps-3 border-start">
                {replies.map(reply => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    allComments={allComments} 
                    onSubmitReply={onSubmitReply} // Pass the handler down
                    onDelete={onDelete}
                    currentUser={currentUser}
                  />
                ))}
                <div className="view-more-replies mt-2" onClick={() => setShowReplies(false)} style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>
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