import { Blog } from "../hooks"
import { Appbar } from "./AppBar"
import { Avatar } from "./BlogCard"

export const FullBlog = ({ blog }: {blog: Blog}) => {
    return <div className="min-h-screen bg-gray-50">
        <Appbar />
        <div className="flex justify-center">
            <div className="grid grid-cols-12 gap-8 px-4 md:px-10 w-full max-w-screen-xl pt-8 md:pt-12">
                <div className="col-span-12 md:col-span-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                            {blog.title}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-500 pt-3 text-sm md:text-base">
                            <span>Posted on {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
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