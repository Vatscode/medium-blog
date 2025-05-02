import { useBlogs } from "../hooks"
import { Appbar } from "../components/AppBar"
import { BlogCard } from "../components/BlogCard"
import { BlogSkeleton } from "../components/BlogSkeleton"
import { Link, Navigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { toast } from 'react-hot-toast'

interface BlogError {
    message: string;
}

export const Blogs = () => {
    const token = localStorage.getItem("token");
    const isLoggedIn = token !== null;

    const { blogs, currentUserId, isAdmin, loading, error } = useBlogs();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [publishing, setPublishing] = useState(false);

    const handlePublish = async () => {
        try {
            setPublishing(true);

            if (!title.trim() || !content.trim()) {
                toast.error("Title and content are required");
                return;
            }

            if (!token) {
                toast.error("Please sign in to publish a blog");
                return;
            }

            const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            
            // First create the blog
            const createResponse = await axios.post(`${BACKEND_URL}/api/v1/blog/create`, {
                title: title.trim(),
                content: content.trim()
            }, {
                headers: {
                    Authorization: authToken,
                    'Content-Type': 'application/json'
                }
            });

            if (!createResponse.data.id) {
                throw new Error('No blog ID received from create');
            }

            // Then publish it
            await axios.post(`${BACKEND_URL}/api/v1/blog/publish`, {
                id: createResponse.data.id,
                published: true
            }, {
                headers: {
                    Authorization: authToken,
                    'Content-Type': 'application/json'
                }
            });

            toast.success('Blog published successfully!');

            // Reset form
            setTitle("");
            setContent("");
            setShowCreateForm(false);
            
            // Refresh the page to show new blog
            window.location.reload();
        } catch (err: any) {
            console.error('Error publishing blog:', err);
            toast.error(err.response?.data?.message || "Failed to publish blog. Please try again.");
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
                <Appbar />
                <div className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-64"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <BlogSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
                <Appbar />
                <div className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
                    <div className="text-red-500">Error loading blogs: {error.message}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
            <Appbar />
            <div className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
                <div className="flex justify-between items-center mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Featured Stories
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">Discover amazing stories from our writers</p>
                    </div>
                    <div className="flex gap-4">
                        {isLoggedIn && (
                            <button 
                                onClick={() => setShowCreateForm(true)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Write a Story
                            </button>
                        )}
                    </div>
                </div>

                {/* Blog Creation Form */}
                {showCreateForm && (
                    <div className="mb-8 bg-white dark:bg-[#272727] rounded-xl shadow-lg p-6 md:p-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Story</h2>
                            <button 
                                onClick={() => setShowCreateForm(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your story title"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                            />
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your story..."
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                onClick={handlePublish}
                                disabled={publishing}
                                className="w-full px-4 py-2 text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 disabled:opacity-50 transition-all duration-200"
                            >
                                {publishing ? 'Publishing...' : 'Publish Story'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Blog List */}
                <div className="space-y-6">
                    {blogs.map(blog => (
                        <BlogCard 
                            key={blog.id} 
                            blog={blog}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
