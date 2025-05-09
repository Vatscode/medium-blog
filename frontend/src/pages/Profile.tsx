import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [name, setName] = useState(localStorage.getItem('username') || '');
    const [bio, setBio] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch user profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Token from localStorage:', token);
                
                if (!token) {
                    console.log('No token found in localStorage');
                    toast.error('Please sign in to view your profile');
                    navigate('/signin');
                    return;
                }

                console.log('Fetching profile with token:', token);
                const response = await axios.get(`${BACKEND_URL}/api/v1/user/profile`, {
                    headers: {
                        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                    }
                });

                console.log('Profile fetch response:', response.data);
                if (response.data) {
                    setName(response.data.name || '');
                    setBio(response.data.bio || '');
                    setProfileImage(response.data.profileImage || null);
                }
            } catch (error: any) {
                console.error('Error fetching profile:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    headers: error.response?.headers
                });
                
                if (error.response?.status === 403) {
                    toast.error('Please sign in to view your profile');
                    navigate('/signin');
                } else {
                    toast.error(error.response?.data?.message || 'Failed to fetch profile');
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        setLoading(true);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        navigate('/signin');
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please sign in to upload an image');
                return;
            }

            console.log('Uploading image with token:', token);
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/user/profile-image`,
                formData,
                {
                    headers: {
                        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                    }
                }
            );

            console.log('Image upload response:', response.data);
            setProfileImage(response.data.imageUrl);
            toast.success('Profile image updated successfully');
        } catch (error: any) {
            console.error('Error uploading image:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            const errorMessage = error.response?.data?.message || 'Failed to upload image';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please sign in to update profile');
                return;
            }

            console.log('Updating profile with token:', token);
            const response = await axios.put(
                `${BACKEND_URL}/api/v1/user/profile`,
                { name, bio },
                {
                    headers: {
                        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Profile update response:', response.data);
            if (response.data) {
                localStorage.setItem('username', response.data.name || name);
                toast.success('Profile updated successfully');
            }
        } catch (error: any) {
            console.error('Error updating profile:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <div className="flex justify-center mb-8">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                                            {profileImage ? (
                                                <img 
                                                    src={profileImage} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-600">
                                                    <span className="text-4xl text-gray-300">
                                                        {name?.[0]?.toUpperCase() || 'A'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                                        >
                                            <span className="text-white text-sm">Change Photo</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center space-x-4 pt-4">
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={loading}
                                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
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