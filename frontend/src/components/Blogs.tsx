import { useQuery } from "@tanstack/react-query";
import { BlogCard } from "./BlogCard";
import { BlogSkeleton } from "./BlogSkeleton";
import { BlogsResponse } from "../hooks";

export const Blogs = () => {
    const { data, isLoading, error } = useQuery<BlogsResponse>({
        queryKey: ['blogs'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await fetch('https://medium-blog.vatsworks.workers.dev/api/v1/blog/bulk', {
                headers
            });
            if (!response.ok) {
                throw new Error('Failed to fetch blogs');
            }
            return response.json();
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <BlogSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error loading blogs</div>;
    }

    if (!data?.blogs.length) {
        return <div className="text-gray-500">No blogs found</div>;
    }

    return (
        <div className="space-y-4">
            {data.blogs.map(blog => (
                <BlogCard 
                    key={blog.id} 
                    blog={blog} 
                    currentUserId={data.currentUserId}
                    isAdmin={data.isAdmin}
                />
            ))}
        </div>
    );
}; 