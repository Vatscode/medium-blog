import { Appbar } from "../components/AppBar";
import { FullBlog } from "../components/FullBlog";
import { useParams } from "react-router-dom";
import { useBlog } from "../hooks";
import { Spinner } from "../components/Spinner";

// atomFamilies/selectorFamilies
export const Blog = () => {
    const { id } = useParams();
    const { loading, blog, error } = useBlog({ id: id || "" });

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

    if (error) {
        return <div>
            <Appbar />
            <div className="flex justify-center w-full pt-8">
                <div className="max-w-screen-lg w-full">
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                        {error}
                    </div>
                </div>
            </div>
        </div>
    }

    if (!blog) {
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
        <FullBlog blog={blog} />
    </div>
}