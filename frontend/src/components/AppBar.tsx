import { Link, useNavigate } from "react-router-dom"
import { Avatar } from "./BlogCard"
import { ProfileDropdown } from "./ProfileDropdown"
import { useState } from "react"

export const Appbar = () => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Get the first letter of the username
    const userInitial = username ? username[0].toUpperCase() : '';

    return (
        <div className="border-b flex justify-between px-10 py-4 items-center bg-white">
            <Link to="/" className="flex items-center gap-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                    Medium
                </div>
            </Link>
            <div className="flex gap-4 items-center">
                {token ? (
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
                            <div className="relative inline-block text-left">
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                                >
                                    <Avatar size="small" name={userInitial} />
                                    {username && <span className="text-sm font-medium text-gray-700">{username}</span>}
                                </button>
                                <ProfileDropdown 
                                    isOpen={isDropdownOpen} 
                                    onClose={() => setIsDropdownOpen(false)} 
                                />
                            </div>
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