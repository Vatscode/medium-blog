import { Link, useNavigate } from "react-router-dom"
import { Avatar } from "./BlogCard"

export const Appbar = () => {
    const username = localStorage.getItem("username");
    const navigate = useNavigate();

    return (
        <div className="border-b flex justify-between px-10 py-4 items-center bg-white">
            <Link to="/" className="flex items-center gap-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                    Medium
                </div>
            </Link>
            <div className="flex gap-4 items-center">
                {username ? (
                    <>
                        <button 
                            onClick={() => {
                                navigate('/');
                                // Give time for navigation to complete before showing form
                                setTimeout(() => {
                                    window.dispatchEvent(new CustomEvent('showCreateForm'));
                                }, 100);
                            }}
                            className="text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg px-4 py-2 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                        >
                            Write a Story
                        </button>
                        <div className="flex items-center gap-2">
                            <Avatar size="small" name={username} />
                            <span className="text-sm font-medium text-gray-700">{username}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <Link 
                            to="/signin"
                            className="text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            Sign In
                        </Link>
                        <Link 
                            to="/signup"
                            className="text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg px-4 py-2 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                        >
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}