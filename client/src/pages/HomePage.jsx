import { timeAgo } from '../utils/formatters';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);

  // NEW INTERACTIVE STATES
  const [expandedPosts, setExpandedPosts] = useState({});
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(API_BASE_URL + '/api/posts/').then(res => res.json()),
      fetch(API_BASE_URL + '/api/categories/').then(res => res.json())
    ])
      .then(([postsData, categoriesData]) => {
        setPosts(postsData);
        setCategories(categoriesData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch data:", error);
        setIsLoading(false);
      });
  }, []);

  const handleLike = (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to like this post.");
      navigate('/login');
      return;
    }
    fetch(`${API_BASE_URL}/api/posts/${postId}/like/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      setPosts(currentPosts => currentPosts.map(post => 
        post.id === postId ? { ...post, likes_count: data.likes_count } : post
      ));
    })
    .catch(err => console.error(err));
  };

  // TOGGLE LOGIC
  const toggleReadMore = (postId) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleCommentBox = (postId) => {
    setActiveCommentBox(prev => prev === postId ? null : postId);
  };

  // HANDLE INLINE COMMENT SUBMISSION
  const handlePostComment = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to comment.");
      navigate('/login');
      return;
    }

    const content = commentTexts[postId];
    if (!content || !content.trim()) return;

    setIsSubmittingComment(true);

    try {
      const response = await fetch(API_BASE_URL + '/api/comments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ post: postId, comment_content: content, parent: null })
      });

      if (!response.ok) throw new Error('Failed to post comment');

      // Optimistically update comment count
      setPosts(currentPosts => currentPosts.map(post => 
        post.id === postId ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post
      ));

      // Show Toast Notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Reset and close box
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      setActiveCommentBox(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const displayedPosts = activeFilter 
    ? posts.filter(post => post.category_name === activeFilter)
    : posts;

  return (
    <>
      {/* TOAST NOTIFICATION */}
      <div className={`toast-top-center ${showToast ? 'show' : ''}`}>
        <i className="bi bi-check-circle-fill"></i> Comment posted successfully
      </div>

      <div className="container mt-4 mb-4">
        <div className="py-4 px-5 rounded-4 text-center saas-card" style={{ boxShadow: 'none' }}>
          <h1 className="hero-title">Explore Ideas & Technology</h1>
          <p className="hero-subtitle">Insights, tutorials, and stories from our IT community.</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4 g-xl-5">
          
          <div className="col-lg-3 d-none d-lg-block">
            <div className="sticky-top" style={{ top: '80px' }}>
              <div className="nav-sidebar">
                <div className="nav-sidebar-title">ALL CATEGORIES</div>
                <div className="d-flex flex-column mb-1">
                  
                  {/* All Posts */}
                  <div 
                    className={`cat-nav-item ${activeFilter === null ? 'active' : ''}`}
                    onClick={() => setActiveFilter(null)}
                    style={{ cursor: 'pointer' }}
                    // apply Keyboard Accessibility
                    tabIndex="0"
                    role="button"
                    onKeyDown={(e) => { if (e.key === 'Enter') setActiveFilter(null); }}
                  >
                    <span>All Posts</span>
                    <span className="cat-badge">{posts.length}</span>
                  </div>
                  
                  {/* categories button */}
                  {categories.map(cat => {
                    const postCount = posts.filter(p => p.category_name === cat.category_name).length;
                    return (
                      <div 
                        key={cat.id}
                        className={`cat-nav-item ${activeFilter === cat.category_name ? 'active' : ''}`}
                        onClick={() => setActiveFilter(cat.category_name)}
                        style={{ cursor: 'pointer' }}
                        // apply Keyboard Accessibility
                        tabIndex="0"
                        role="button"
                        onKeyDown={(e) => { if (e.key === 'Enter') setActiveFilter(cat.category_name); }}
                      >
                        <span>{cat.category_name}</span>
                        <span className="cat-badge">{postCount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="public-feed">
              {isLoading ? (
                <div className="text-center py-5 text-muted"><div className="spinner-border text-primary mb-3"></div><br/>Loading feed...</div>
              ) : displayedPosts.length === 0 ? (
                <div className="saas-card p-5 text-center text-muted border-0 shadow-sm">
                  <i className="bi bi-journal-x fs-1 d-block mb-3 opacity-25"></i>
                  No articles found in this category yet.
                </div>
              ) : (
                displayedPosts.map(post => (
                  <article key={post.id} className="saas-card homepage-feed-card">
                    
                    <header className="author-header">
                      <div className="author-avatar">
                        {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="author-name">
                          <Link to={`/profile/${post.author_name}`} className="text-dark text-decoration-none hover-primary">
                            {post.author_name}
                          </Link>
                          <i className="bi bi-patch-check-fill text-primary ms-1" style={{ fontSize: '0.85rem' }} title="Verified"></i> 
                          <button className="btn-follow-pill">Follow</button>
                        </div>
                        <div className="author-meta">
                          {post.author_bio || "Tech Enthusiast"} <span className="opacity-50 mx-1">·</span> {timeAgo(post.created_at)}
                        </div>
                      </div>
                    </header>
                    
                    {/* SMALLER TITLE */}
                    <Link to={`/posts/${post.id}`} className="post-title-sm">
                      {post.post_title}
                    </Link>
                    
                    {/* EXPANDABLE EXCERPT */}
                    <div className="post-content-wrapper">
                      <p className={`post-excerpt-rich ${expandedPosts[post.id] ? '' : 'clamped'}`}>
                        {post.post_content}
                      </p>
                    </div>
                    <div className="toggle-view-btn" onClick={() => toggleReadMore(post.id)}>
                      {expandedPosts[post.id] ? (
                        <>Show less <i className="bi bi-chevron-up"></i></>
                      ) : (
                        <>View more <i className="bi bi-chevron-down"></i></>
                      )}
                    </div>
                    
                    <footer className="post-footer-rich">
                      <div className="interaction-group-rich">
                        <div className="interaction-item-rich like" onClick={() => handleLike(post.id)} role="button" aria-label="Like this post">
                          <i className={post.likes_count > 0 ? "bi bi-heart-fill text-danger" : "bi bi-heart"}></i> {post.likes_count} Likes
                        </div>
                        
                        {/* INLINE COMMENT TOGGLE */}
                        <div 
                          className={`interaction-item-rich comment ${activeCommentBox === post.id ? 'active-comment' : ''}`} 
                          onClick={() => toggleCommentBox(post.id)}
                        >
                          <i className="bi bi-chat"></i> {post.comments_count} Comments
                        </div>
                      </div>
                      <i className="bi bi-bookmark bookmark-btn-rich" title="Save for later"></i>
                    </footer>

                    {/* INLINE COMMENT BOX */}
                    <div className={`inline-comment-section ${activeCommentBox === post.id ? 'show' : ''}`}>
                      <div className="comment-input-wrapper">
                        <textarea 
                          className="comment-textarea" 
                          placeholder="Share your thoughts..."
                          value={commentTexts[post.id] || ''}
                          onChange={(e) => setCommentTexts({...commentTexts, [post.id]: e.target.value})}
                          disabled={isSubmittingComment}
                        ></textarea>
                        <div className="comment-action-row">
                          <button 
                            className="btn-post-comment" 
                            onClick={() => handlePostComment(post.id)}
                            disabled={isSubmittingComment || !(commentTexts[post.id]?.trim())}
                          >
                            {isSubmittingComment ? 'Posting...' : 'Send'}
                          </button>
                        </div>
                      </div>
                    </div>

                  </article>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}

export default HomePage;