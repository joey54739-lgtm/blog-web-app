import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommentItem from './CommentItem';

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState({ id: null, name: '' }); 
  
  const isLoggedIn = !!localStorage.getItem('token');
  const currentUser = localStorage.getItem('username'); 

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/comments/?post=${postId}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error("Failed to fetch comments", err));
  }, [postId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    fetch('http://127.0.0.1:8000/api/comments/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
      body: JSON.stringify({ post: postId, comment_content: newComment, parent: replyingTo.id })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to post comment');
        return res.json();
      })
      .then(data => {
        setComments([...comments, data]);
        setNewComment('');
        setReplyingTo({ id: null, name: '' });
      })
      .catch(err => alert(err.message))
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    
    const token = localStorage.getItem('token');
    fetch(`http://127.0.0.1:8000/api/comments/${commentId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => {
      if (res.ok) {
        setComments(currentComments => currentComments.filter(c => c.id !== commentId && c.parent !== commentId));
      } else {
        throw new Error('Failed to delete comment');
      }
    })
    .catch(err => alert(err.message));
  };

  const topLevelComments = comments.filter(c => c.parent === null);

  return (
    <section className="comment-section">
      <div className="comment-section-title">
        Comments <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '1.1rem' }}>({comments.length})</span>
      </div>

      {isLoggedIn ? (
        <div className="comment-input-box">
          {replyingTo.id && (
            <div className="mb-2 d-flex align-items-center gap-2">
              <span className="badge bg-light text-primary border rounded-pill px-3 py-2">
                Replying to @{replyingTo.name}
              </span>
              <button type="button" className="btn-close" style={{ fontSize: '0.6rem' }} onClick={() => setReplyingTo({ id: null, name: '' })}></button>
            </div>
          )}
          
          <textarea 
            rows="2" 
            placeholder={replyingTo.id ? "Write a reply..." : "Share your thoughts..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          
          <div className="text-end mt-2">
            <button className="btn btn-primary btn-sm rounded-pill px-4 fw-bold" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted mb-5 py-4 border rounded-4 bg-light">
          <p className="mb-2">Join the conversation</p>
          <Link to="/login" className="btn btn-primary btn-sm rounded-pill px-4 fw-medium">Log in to comment</Link>
        </div>
      )}

      <div>
        {topLevelComments.length === 0 ? (
          <div className="text-center text-muted py-4">No comments yet. Be the first!</div>
        ) : (
          topLevelComments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              allComments={comments} 
              onReply={(id, name) => setReplyingTo({ id, name })} 
              onDelete={handleDelete}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default CommentSection;