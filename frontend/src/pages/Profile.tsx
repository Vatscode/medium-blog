import { useState, useRef, ChangeEvent } from 'react';
import { Appbar } from "../components/AppBar";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const Profile = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [profileData, setProfileData] = useState({
        name: "",
        bio: "",
        avatarUrl: ""
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("Image size should be less than 5MB");
            return;
        }

        try {
            setLoading(true);
            setError("");
            
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await axios.post(`${BACKEND_URL}/api/v1/user/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: localStorage.getItem("token")
                }
            });

            setProfileData(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
            setSuccess("Profile picture updated successfully!");
        } catch (err) {
            setError("Failed to upload image. Please try again.");
            console.error("Upload error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError("");

            await axios.put(`${BACKEND_URL}/api/v1/user/profile`, {
                name: profileData.name,
                bio: profileData.bio
            }, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError("Failed to update profile. Please try again.");
            console.error("Update error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <Appbar />
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Profile</h1>

                    {error && (
                        <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 animate-shake" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 mb-6 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200" role="alert">
                            {success}
                        </div>
                    )}

                    <div className="mb-8 text-center">
                        <div 
                            onClick={handleImageClick}
                            className="relative inline-block group cursor-pointer"
                        >
                            {profileData.avatarUrl ? (
                                <img 
                                    src={profileData.avatarUrl} 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 group-hover:border-purple-300 transition-all duration-200"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-4xl font-medium border-4 border-purple-200 group-hover:border-purple-300 transition-all duration-200">
                                    {profileData.name?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <p className="text-sm text-gray-500 mt-2">Click to change profile picture</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Enter your display name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bio
                            </label>
                            <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 