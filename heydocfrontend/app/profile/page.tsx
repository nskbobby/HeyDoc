'use client';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '../../store';
import { updateProfile } from '../../store/authSlice';
import { addNotification } from '../../store/uiSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/ui/Card';
import Input from '../../Components/ui/Input';
import Button from '../../Components/ui/Button';
import { User } from '../../lib/types';

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    defaultValues: user || undefined,
  });

  const onSubmit = async (data: User) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      setEditing(false);
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

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    {...register('first_name', { required: 'First name is required' })}
                    error={errors.first_name?.message}
                    disabled={!editing}
                  />
                  <Input
                    label="Last Name"
                    {...register('last_name', { required: 'Last name is required' })}
                    error={errors.last_name?.message}
                    disabled={!editing}
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  {...register('email')}
                  disabled={true}
                  className="bg-gray-50"
                />

                <Input
                  label="Phone"
                  type="tel"
                  {...register('phone')}
                  disabled={!editing}
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  {...register('date_of_birth')}
                  disabled={!editing}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    {...register('gender')}
                    disabled={!editing}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50"
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>

                {editing && (
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-medium">
                  {user.is_doctor ? 'Doctor' : 'Patient'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </CardContent>
          </Card>

          {user.is_patient && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => router.push('/doctors')}
                >
                  Book Appointment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => router.push('/appointments')}
                >
                  View Appointments
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => alert('Medical history feature coming soon!')}
                >
                  Medical History
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}