import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Blog } from './pages/Blog'
import { Blogs } from "./pages/Blogs";
import { Profile } from './pages/Profile'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient()

function App() {
  const isLoggedIn = localStorage.getItem("token") !== null;

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/blog/:id" element={isLoggedIn ? <Blog /> : <Navigate to="/signin" />} />
          <Route path="/blogs" element={isLoggedIn ? <Blogs /> : <Navigate to="/signin" />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/signin" />} />
          <Route path="/" element={<Navigate to={isLoggedIn ? "/blogs" : "/signup"} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App