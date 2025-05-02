import { Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useState } from "react";

interface BlogCardProps {
    id: string;
    authorId: string;
    authorName: string;
    title: string;
    content: string;
    publishedDate: string;
    onDelete?: () => void;
}

export const Avatar = ({ name, size = "small" }: { name: string, size?: "small" | "big" }) => {
    const colors = [
        "bg-red-500", "bg-yellow-500", "bg-green-500", "bg-blue-500", 
        "bg-indigo-500", "bg-purple-500", "bg-pink-500"
    ];
    
    // Generate consistent color based on name
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const bgColor = colors[colorIndex];
    
    return (
        <div className={`
            ${size === "small" ? "w-8 h-8 text-sm" : "w-12 h-12 text-lg"}
            ${bgColor} rounded-full flex items-center justify-center text-white font-medium
            transform transition-transform duration-200 hover:scale-110
        `}>
            {name[0]?.toUpperCase() || 'A'}
        </div>
    );
};

export const BlogCard = ({
    id,
    authorId,
    authorName,
    title,
    content,
    publishedDate,
    onDelete
}: BlogCardProps) => {
    const truncatedContent = content.length > 150 ? content.slice(0, 150) + "..." : content;
    const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
    const currentUserId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const isOwner = currentUserId === authorId;
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        if (!window.confirm("Are you sure you want to delete this blog?")) {
            return;
        }

        try {
            setIsDeleting(true);
            const response = await axios.delete(`${BACKEND_URL}/api/v1/blog/delete/${id}`, {
                headers: {
                    Authorization: token
                }
            });

            if (response.data.message === "Blog deleted successfully") {
                // Show success message
                const notification = document.createElement('div');
                notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
                notification.textContent = 'Blog deleted successfully';
                document.body.appendChild(notification);
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                    notification.remove();
                }, 3000);

                // Refresh the page
                window.location.reload();
            }
        } catch (err: any) {
            console.error("Error deleting blog:", err);
            const errorMessage = err.response?.data?.message || "Failed to delete blog. Please try again.";
            
            // Show error message
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
            notification.textContent = errorMessage;
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.remove();
            }, 3000);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Link to={`/blog/${id}`}>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Avatar name={authorName} />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{authorName}</p>
                                <p className="text-xs text-gray-500">{publishedDate}</p>
                            </div>
                        </div>
                        {isOwner && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-200 transition-all duration-200 shadow-md hover:shadow-lg ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-purple-700 transition-colors duration-200">
                        {title}
                    </h2>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {truncatedContent}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                        <span>{readingTime} min read</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};