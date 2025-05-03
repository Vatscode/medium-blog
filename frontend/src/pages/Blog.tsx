import { Appbar } from "../components/AppBar";
import { FullBlog } from "../components/FullBlog";
import { useParams } from "react-router-dom";
import { useBlog } from "../hooks";
import { Spinner } from "../components/Spinner";

export const Blog = () => {
    const { id } = useParams();
    const { data, isLoading, error } = useBlog(id || "");

    if (isLoading) {
        return <div>
            <Appbar />
            <div className="h-screen flex flex-col justify-center">
                <div className="flex justify-center">
                    <Spinner />
                </div>
            </div>
        </div>
    }

    if (error) {
        return <div>
            <Appbar />
            <div className="flex justify-center w-full pt-8">
                <div className="max-w-screen-lg w-full">
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                        {error instanceof Error ? error.message : 'An error occurred while loading the blog'}
                    </div>
                </div>
            </div>
        </div>
    }

    if (!data?.blog) {
        return <div>
            <Appbar />
            <div className="flex justify-center w-full pt-8">
                <div className="max-w-screen-lg w-full">
                    <div className="p-4 mb-4 text-sm text-gray-800 rounded-lg bg-gray-50" role="alert">
                        Blog not found
                    </div>
                </div>
            </div>
        </div>
    }

    return <div>
        <Appbar />
        <FullBlog blog={data.blog} />
    </div>
}