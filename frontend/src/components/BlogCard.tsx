import { Link } from "react-router-dom";
import { Blog } from "../hooks";
import { TrashIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface BlogCardProps {
    blog: Blog;
    currentUserId: string | null;
    isAdmin: boolean;
}

export const Avatar = ({ name, size = "small" }: { name: string, size?: "small" | "big" }) => {
    const colors = [
        "bg-red-500", "bg-yellow-500", "bg-green-500", "bg-blue-500", 
        "bg-indigo-500", "bg-purple-500", "bg-pink-500"
    ];
    
    const colorIndex = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;
    const bgColor = colors[colorIndex];
    const firstLetter = name && name.length > 0 ? name[0].toUpperCase() : '?';
    
    return (
        <div className={`
            ${size === "small" ? "w-8 h-8 text-sm" : "w-12 h-12 text-lg"}
            ${bgColor} rounded-full flex items-center justify-center text-white font-medium
            transform transition-transform duration-200 hover:scale-110
        `}>
            {firstLetter}
        </div>
    );
};

export const BlogCard = ({ blog, currentUserId, isAdmin }: BlogCardProps) => {
    const queryClient = useQueryClient();
    const isOwner = currentUserId === blog.authorId;
    const canDelete = isOwner || isAdmin;

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please sign in to delete blogs');
                return;
            }

            const response = await fetch(`https://medium-blog.vatsworks.workers.dev/api/v1/blog/delete/${blog.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete blog');
            }

            await queryClient.invalidateQueries({ queryKey: ['blogs'] });
            toast.success('Blog deleted successfully');
        } catch (error) {
            console.error('Error deleting blog:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete blog');
        }
    };

    return (
        <div className="blog-card p-4 rounded-lg shadow-md mb-4 bg-white dark:bg-white">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <Link to={`/blog/${blog.id}`} className="text-xl font-semibold hover:text-blue-600 transition-colors">
                        {blog.title}
                    </Link>
                    <div className="text-sm text-gray-600 mt-1">
                        By {blog.user.name} • {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                </div>
                {canDelete && (
                    <button
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete blog"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
            <p className="text-gray-700 line-clamp-3">
                {blog.content}
            </p>
            <Link
                to={`/blog/${blog.id}`}
                className="inline-block mt-3 text-blue-600 hover:text-blue-800 transition-colors"
            >
                Read more →
            </Link>
        </div>
    );
};