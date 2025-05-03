import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        setLoading(true);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        navigate('/signin');
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <div className="flex justify-center mb-8">
                                    <div className="relative inline-flex items-center justify-center w-20 h-20 overflow-hidden bg-gray-600 rounded-full">
                                        <span className="text-3xl text-gray-300">{localStorage.getItem('username')?.[0]?.toUpperCase() || 'A'}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold mb-2">{localStorage.getItem('username') || 'Anonymous'}</h2>
                                    <p className="text-gray-500 mb-8">Member since 2024</p>
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleLogout}
                                        disabled={loading}
                                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                                    >
                                        {loading ? 'Logging out...' : 'Logout'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 