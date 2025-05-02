import { useBlogs } from "../hooks"
import { Appbar } from "../components/AppBar"
import { BlogCard } from "../components/BlogCard"
import { Spinner } from "../components/Spinner"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import { BACKEND_URL } from "../config"

export const Blogs = () => {
    const isLoggedIn = localStorage.getItem("token") !== null;
    const { loading, blogs, error } = useBlogs();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [publishing, setPublishing] = useState(false);
    const [publishError, setPublishError] = useState("");

    useEffect(() => {
        const handleShowForm = () => setShowCreateForm(true);
        window.addEventListener('showCreateForm', handleShowForm);
        return () => window.removeEventListener('showCreateForm', handleShowForm);
    }, []);

    const handlePublish = async () => {
        try {
            setPublishing(true);
            setPublishError("");

            if (!title.trim() || !content.trim()) {
                setPublishError("Title and content are required");
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                setPublishError("Please sign in to publish a blog");
                return;
            }

            console.log('Creating blog with token:', token);
            
            try {
                const response = await axios.post(`${BACKEND_URL}/api/v1/blog/create`, {
                    title,
                    content
                }, {
                    headers: {
                        Authorization: token
                    }
                });
                
                console.log('Blog created:', response.data);

                // Publish the blog immediately
                const publishResponse = await axios.post(`${BACKEND_URL}/api/v1/blog/publish`, {
                    id: response.data.id
                }, {
                    headers: {
                        Authorization: token
                    }
                });

                console.log('Blog published:', publishResponse.data);

                // Reset form and refresh page to show new blog
                setTitle("");
                setContent("");
                setShowCreateForm(false);
                window.location.reload();
            } catch (err: any) {
                console.error('Full error object:', err);
                console.error('Error response:', err.response?.data);
                console.error('Error status:', err.response?.status);
                setPublishError(err.response?.data?.message || "Failed to publish blog. Please try again.");
            }
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return <div>
            <Appbar />
            <div className="h-screen flex flex-col justify-center">
                <div className="flex justify-center">
                    <Spinner />
                </div>
            </div>
        </div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <Appbar />
            <div className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
                <div className="flex justify-between items-center mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Featured Stories
                        </h1>
                        <p className="text-gray-600">Discover amazing stories from our writers</p>
                    </div>
                    {isLoggedIn ? (
                        <button 
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Write a Story
                        </button>
                    ) : (
                        <Link 
                            to="/signup"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    )}
                </div>

                {/* Blog Creation Form */}
                {showCreateForm && (
                    <div className="mb-8 bg-white rounded-xl shadow-lg p-6 md:p-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Create Your Story</h2>
                            <button 
                                onClick={() => setShowCreateForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {publishError && (
                            <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
                                {publishError}
                            </div>
                        )}

                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent text-3xl font-bold border-0 border-b border-gray-200 pb-4 mb-6 focus:ring-0 focus:border-purple-500"
                            placeholder="Enter your title..."
                        />

                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={12}
                            className="w-full p-4 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Write your story..."
                        />

                        <div className="flex justify-end gap-4 mt-6">
                            <button 
                                onClick={() => setShowCreateForm(false)}
                                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handlePublish}
                                disabled={publishing}
                                className={`px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200 ${publishing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {publishing ? 'Publishing...' : 'Publish Story'}
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 animate-shake" role="alert">
                        {error}
                    </div>
                )}

                {blogs.length === 0 ? (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories yet</h3>
                        <p className="text-gray-600 mb-6">Be the first one to share your story!</p>
                        {isLoggedIn ? (
                            <button 
                                onClick={() => setShowCreateForm(true)}
                                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Write a Story
                            </button>
                        ) : (
                            <Link 
                                to="/signup"
                                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog, index) => (
                            <div 
                                key={blog.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <BlogCard
                                    id={blog.id}
                                    authorId={blog.authorId}
                                    authorName={blog.user.name || "Anonymous"}
                                    title={blog.title}
                                    content={blog.content}
                                    publishedDate={new Date(blog.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
