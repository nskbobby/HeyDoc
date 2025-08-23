'use client';
import React from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">HeyDoc</span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {isAuthenticated ? (
                user?.is_doctor ? (
                  // Doctor Navigation
                  <>
                    <Link href="/dashboard/doctor" className="text-gray-500 hover:text-gray-900">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/doctor/appointments" className="text-gray-500 hover:text-gray-900">
                      My Appointments
                    </Link>
                    <Link href="/dashboard/doctor/schedule" className="text-gray-500 hover:text-gray-900">
                      Schedule
                    </Link>
                  </>
                ) : (
                  // Patient Navigation
                  <>
                    <Link href="/dashboard/patient" className="text-gray-500 hover:text-gray-900">
                      Dashboard
                    </Link>
                    <Link href="/doctors" className="text-gray-500 hover:text-gray-900">
                      Find Doctors
                    </Link>
                    <Link href="/appointments" className="text-gray-500 hover:text-gray-900">
                      Appointments
                    </Link>
                  </>
                )
              ) : (
                // Public Navigation
                <>
                  <Link href="/doctors" className="text-gray-500 hover:text-gray-900">
                    Find Doctors
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">
                  Hello, {user?.first_name}
                </span>
                <Link href={user?.is_doctor ? "/dashboard/doctor/profile" : "/profile"}>
                  <Button variant="ghost" size="sm">
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;