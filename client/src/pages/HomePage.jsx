import { useState, useEffect } from 'react';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/posts/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/categories/').then(res => res.json())
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

  return (
    <div className="container mt-4 mb-5">
    {/* <div className="container-fluid px-5 mt-4 mb-5"> */}
      
      {/* Hero Banner Section using extracted CSS class */}
      <div className="hero-banner p-4 p-md-5 rounded-4 text-center border mb-5">
        <h2 className="fw-bold text-dark mb-2">Explore Ideas & Technology</h2>
        <p className="text-muted mb-0">Insights, tutorials, and stories from our IT community.</p>
      </div>

      <div className="row g-4 g-lg-5">
        
        {/* Left side: Dynamic Posts List */}
        <div className="col-lg-8">
          <h5 className="fw-bold text-dark mb-3">Latest Posts</h5>
          
          <div className="saas-card px-4 py-2 mb-4">
            {isLoading ? (
              <p className="text-muted p-3">Loading content...</p>
            ) : posts.length === 0 ? (
              <p className="text-muted p-3">No posts yet. Check back later!</p>
            ) : (
              posts.map(post => (
                <article key={post.id} className="post-item d-flex gap-3 align-items-center">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      {/* Using extracted utility classes text-xs, text-sm */}
                      <span className="badge bg-light text-primary border px-2 py-1 text-xs">
                        {post.category_name || "Uncategorized"}
                      </span>
                      <span className="text-muted text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <a href="#" className="text-decoration-none">
                      <h3 className="post-title fw-bold text-dark h5 mb-2">{post.post_title}</h3>
                    </a>
                    
                    <p className="text-muted text-truncate-2 mb-2 text-md">
                      {post.post_content}
                    </p>
                    
                    <div className="d-flex align-items-center">
                      {/* Using extracted avatar-sm class */}
                      <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold me-2 avatar-sm">
                        {post.author_name ? post.author_name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="text-dark fw-medium text-sm">
                        {post.author_name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="d-none d-sm-block flex-shrink-0">
                    <div className="post-thumbnail d-flex align-items-center justify-content-center text-muted">
                      <i className="bi bi-image fs-3 opacity-50"></i>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {/* Right side: Dynamic Categories List */}
        <div className="col-lg-4">
          {/* Using extracted sticky-sidebar class */}
          <div className="sticky-top sticky-sidebar">
            <h5 className="fw-bold text-dark mb-3">Explore Topics</h5>
            
            <div className="saas-card p-3 mb-4">
              <div className="d-flex flex-column gap-1">
                {isLoading ? (
                  <span className="text-muted text-sm p-2">Loading categories...</span>
                ) : categories.length === 0 ? (
                  <span className="text-muted text-sm p-2">No categories created yet.</span>
                ) : (
                  categories.map((category) => (
                    /* Using extracted sidebar-link class */
                    <a key={category.id} href="#" className="text-decoration-none d-flex justify-content-between align-items-center p-2 rounded text-dark hover-bg-light sidebar-link">
                      <span className="fw-medium">
                        <i className="bi bi-folder2 me-2 text-primary"></i> 
                        {category.category_name}
                      </span>
                      <i className="bi bi-chevron-right text-muted text-xs"></i>
                    </a>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

export default HomePage;