import { useQuery } from "@tanstack/react-query";

export type Blog = {
    id: string;
    title: string;
    content: string;
    published: boolean;
    authorId: string;
    createdAt: string;
    likeCount: number;
    hasLiked: boolean;
    user: {
        id: string;
        name: string | null;
    };
}

export interface BlogsResponse {
    blogs: Blog[];
    currentUserId: string | null;
    isAdmin: boolean;
}

export interface SigninResponse {
    token: string;
    userId: string;
    name: string;
    isAdmin: boolean;
}

export interface User {
    id: string;
    name: string | null;
    email: string;
}

interface BlogResponse {
    blog: Blog;
}

interface BlogsHookReturn {
    blogs: Blog[];
    currentUserId: string | null;
    isAdmin: boolean;
    loading: boolean;
    error: Error | undefined;
}

export const useBlogs = (): BlogsHookReturn => {
    const { data, isLoading, error } = useQuery<BlogsResponse>({
        queryKey: ['blogs'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            console.log('Token from localStorage:', token);

            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            if (token) {
                const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                headers.Authorization = authToken;
                console.log('Using Authorization header:', headers.Authorization);
            }
            
            const response = await fetch('https://medium-blog.vatsworks.workers.dev/api/v1/blog/bulk', {
                headers
            });

            if (!response.ok) {
                throw new Error('Failed to fetch blogs');
            }

            const responseData = await response.json();
            console.log('API Response:', responseData);
            return responseData;
        }
    });

    return {
        blogs: data?.blogs || [],
        currentUserId: data?.currentUserId || null,
        isAdmin: data?.isAdmin || false,
        loading: isLoading,
        error: error as Error | undefined
    };
};

export const useBlog = (id: string) => {
    return useQuery<BlogResponse>({
        queryKey: ['blog', id],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await fetch(`https://medium-blog.vatsworks.workers.dev/api/v1/blog/${id}`, {
                headers
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch blog');
            }
            
            return response.json();
        }
    });
}; 