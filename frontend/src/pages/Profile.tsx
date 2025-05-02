import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { Appbar } from '../components/AppBar';
import { Avatar } from '../components/BlogCard';

export const Profile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: localStorage.getItem('username') || '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert("New passwords don't match!");
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const authToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
            const response = await axios.put(
                `${BACKEND_URL}/api/v1/user/profile`,
                {
                    name: formData.name,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword || undefined
                },
                {
                    headers: {
                        Authorization: authToken
                    }
                }
            );

            if (response.data.name) {
                localStorage.setItem('username', response.data.name);
            }
            
            alert('Profile updated successfully!');
            navigate('/blogs');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error updating profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Appbar />
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <Avatar name={formData.name} size="big" />
                    <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">New Password (Optional)</label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                    </div>

                    {formData.newPassword && (
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                required
                            />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`inline-flex justify-center rounded-md border border-transparent bg-gradient-to-r from-purple-600 to-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 