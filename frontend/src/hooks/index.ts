import { useEffect, useState } from "react"
import axios from "axios";
import { BACKEND_URL } from "../config.ts";

export interface Blog {
    id: string;
    title: string;
    content: string;
    published: boolean;
    authorId: string;
    createdAt: string;
    user: {
        name: string | null;
    }
}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();
    const [error, setError] = useState<string>();

    useEffect(() => {
        setLoading(true);
        setError(undefined);
        
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please sign in to view this blog");
            setLoading(false);
            return;
        }
        
        // Ensure token has Bearer prefix
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: authToken
            }
        })
            .then(response => {
                setBlog(response.data.blog);
            })
            .catch(err => {
                console.error("Error fetching blog:", err);
                setError("Failed to load blog. Please try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id])

    return {
        loading,
        blog,
        error
    }
}

export const useBlogs = () => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [error, setError] = useState<string>();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            setBlogs([]);
            return;
        }

        // Ensure token has Bearer prefix
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        setLoading(true);
        setError(undefined);

        axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
            headers: {
                Authorization: authToken
            }
        })
            .then(response => {
                console.log('Response from bulk:', response.data);
                setBlogs(response.data.blogs);
                setCurrentUserId(response.data.currentUserId);
                // Store the current user ID in localStorage
                if (response.data.currentUserId) {
                    localStorage.setItem("userId", response.data.currentUserId);
                }
            })
            .catch(err => {
                console.error("Error fetching blogs:", err);
                setError("Failed to load blogs. Please try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [])

    return {
        loading,
        blogs,
        error,
        currentUserId
    }
}