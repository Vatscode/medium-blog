import { Blog } from "../hooks"
import { Appbar } from "./AppBar"
import { Avatar } from "./BlogCard"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

export const FullBlog = ({ blog }: {blog: Blog}) => {
    const [likeCount, setLikeCount] = useState(blog.likeCount || 0);
    const [isLiked, setIsLiked] = useState(blog.hasLiked || false);
    const queryClient = useQueryClient();

    const handleLike = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/blog/like/${blog.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                setLikeCount((prev: number) => prev + 1);
                setIsLiked(true);
                queryClient.invalidateQueries({ queryKey: ['blog', blog.id] });
                queryClient.invalidateQueries({ queryKey: ['blogs'] });
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    return <div className="min-h-screen bg-gray-50">
        <Appbar />
        <div className="flex justify-center">
            <div className="grid grid-cols-12 gap-8 px-4 md:px-10 w-full max-w-screen-xl pt-8 md:pt-12">
                <div className="col-span-12 md:col-span-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                            {blog.title}
                        </h1>
                        <div className="flex items-center justify-between gap-2 text-gray-500 pt-3 text-sm md:text-base">
                            <span>Posted on {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                            <button 
                                onClick={handleLike}
                                disabled={isLiked}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                                    isLiked 
                                    ? 'bg-pink-100 text-pink-500' 
                                    : 'bg-gray-100 hover:bg-pink-100 hover:text-pink-500'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                </svg>
                                <span>{likeCount}</span>
                            </button>
                        </div>
                        <div className="prose prose-lg max-w-none pt-6 text-gray-700 whitespace-pre-wrap">
                            {blog.content}
                        </div>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-4">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-gray-900 text-lg font-semibold mb-4">
                            About the Author
                        </div>
                        <div className="flex w-full">
                            <div className="pr-4 flex flex-col justify-center">
                                <Avatar size="big" name={blog.user.name || "Anonymous"} />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-gray-900">
                                    {blog.user.name || "Anonymous"}
                                </div>
                                <div className="pt-2 text-gray-600 text-sm">
                                    Passionate writer sharing insights and experiences
                                </div>
                            </div>
                        </div>  
                    </div>
                </div>
            </div>
        </div>
    </div>
}