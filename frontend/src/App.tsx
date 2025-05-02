import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Blog } from './pages/Blog'
import { Blogs } from "./pages/Blogs";

function App() {
  const isLoggedIn = localStorage.getItem("token") !== null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/blog/:id" element={isLoggedIn ? <Blog /> : <Navigate to="/signup" />} />
        <Route path="/" element={isLoggedIn ? <Blogs /> : <Navigate to="/signup" />} />
        <Route path="*" element={<Navigate to="/signup" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App