import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/posts/')
      .then(response => response.json()) // convert the response into JSON
      .then(data => setPosts(data))      // put the data into the posts box
      .catch(error => console.error("获取数据失败:", error))
  }, [])
// Display
  return (
    <div className="container">
      <h1>My Posts</h1>
      
      {/* Loop through all posts and display them */}
      {posts.length === 0 ? (
        <p>Loading posts, or there is no data from the backend yet...</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="post-card" style={{ border: '1px solid #ccc', margin: '20px 0', padding: '15px', borderRadius: '8px' }}>
            <h2>{post.post_title}</h2>
            <p style={{ color: '#666', fontSize: '0.9em' }}>
              <strong>Category:</strong> {post.category_name} | <strong>Author:</strong> {post.author_name}
            </p>
            <p>{post.post_content}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default App
