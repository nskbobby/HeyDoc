'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
import { updateProfile } from '../../../../store/authSlice';
import { addNotification } from '../../../../store/uiSlice';
import { User, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../../../../Components/ui/Card';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';

export default function DoctorProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      dispatch(addNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      }));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to update profile'
      }));
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your professional information and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-600 mb-4">Medical Professional</p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center justify-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {user.phone}
                </div>
              )}
              <div className="flex items-center justify-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Member since {new Date(user.created_at).getFullYear()}
              </div>
            </div>

            {!isEditing && (
              <Button 
                className="mt-6 w-full" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      label="Last Name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <Input
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />

                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-900">{user.first_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-900">{user.last_name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Information - Coming Soon */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg mb-2">Professional Details</p>
                <p className="text-sm">Specializations, experience, and clinic information will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}