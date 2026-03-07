import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePostPage from './pages/CreatePostPage';

function App() {
  return (
    <Router>
      {/* Navbar component will go here later */}
      <Navbar />
      {/* <div className="container mt-4 mb-5"> */}
        <Routes>
          {/* When the path is "/", render the HomePage component */}
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/my-posts" element={<h2>This will become the user dashboard soon...</h2>} />
        </Routes>
      {/* </div> */}
    </Router>
  );
}

export default App;

