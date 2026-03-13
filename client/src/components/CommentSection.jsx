import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CommentItem from './CommentItem';

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isLoggedIn = !!localStorage.getItem('token');
  const currentUser = localStorage.getItem('username'); 

  useEffect(() => {
    fetch(`https://blog-backend-wuzu.onrender.com/api/comments/?post=${postId}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error("Failed to fetch comments", err));
  }, [postId]);

  // Handle Top-Level Comments (Always parent = null)
  const handleTopLevelSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    fetch('https://blog-backend-wuzu.onrender.com/api/comments/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
      body: JSON.stringify({ post: postId, comment_content: newComment, parent: null }) // explicitly null
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to post comment');
        return res.json();
      })
      .then(data => {
        setComments([...comments, data]);
        setNewComment('');
      })
      .catch(err => alert(err.message))
      .finally(() => setIsSubmitting(false));
  };

  // Handle Inline Replies (Passed down to CommentItem)
  const handleInlineReply = async (parentId, content) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to reply.");
      return;
    }

    try {
      const response = await fetch('https://blog-backend-wuzu.onrender.com/api/comments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ post: postId, comment_content: content, parent: parentId })
      });

      if (!response.ok) throw new Error('Failed to post reply');
      const newReply = await response.json();
      setComments(prevComments => [...prevComments, newReply]);
      
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = (commentId) => {
    // if (!window.confirm("Delete this comment?")) return;
    
    const token = localStorage.getItem('token');
    fetch(`https://blog-backend-wuzu.onrender.com/api/comments/${commentId}/`, {
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
      <div className="comment-section-title mb-4">
        Comments <span className="text-muted fw-normal fs-6">({comments.length})</span>
      </div>

      {isLoggedIn ? (
        <div className="saas-card p-4 mb-5 border-0 shadow-sm">
          <textarea 
            className="form-control border-0 bg-light p-3"
            rows="3" 
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ borderRadius: '12px', resize: 'none' }}
          ></textarea>
          
          <div className="text-end mt-3">
            <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleTopLevelSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Send'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted mb-5 py-4 border rounded bg-light">
          <p className="mb-2">Join the conversation</p>
          <Link to="/login" className="btn btn-primary btn-sm rounded-pill px-4 fw-medium">Log in to comment</Link>
        </div>
      )}

      <div>
        {topLevelComments.length === 0 ? (
          <div className="text-center text-muted py-5">
             <i className="bi bi-chat-square-dots fs-1 d-block opacity-25 mb-3"></i>
             No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          topLevelComments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              allComments={comments} 
              onSubmitReply={handleInlineReply} // Pass the new generic submitter down
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