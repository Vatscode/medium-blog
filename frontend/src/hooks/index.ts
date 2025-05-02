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
        
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`)
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

    useEffect(() => {
        setLoading(true);
        setError(undefined);

        axios.get(`${BACKEND_URL}/api/v1/blog/bulk`)
            .then(response => {
                setBlogs(response.data.blogs);
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
        error
    }
}