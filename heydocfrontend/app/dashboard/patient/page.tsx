'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Plus, User } from 'lucide-react';
import { RootState } from '../../../store';
import { fetchAppointments } from '../../../store/appointmentsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../../Components/ui/Card';
import Button from '../../../Components/ui/Button';
import ReviewModal from '../../../Components/reviews/ReviewModal';
import { formatDate, formatTime } from '../../../lib/utils';

const PatientDashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, loading } = useSelector((state: RootState) => state.appointments);
  const { user } = useSelector((state: RootState) => state.auth);
  const [reviewAppointment, setReviewAppointment] = useState<any>(null);

  useEffect(() => {
    if (user?.is_patient) {
      dispatch(fetchAppointments({ role: 'patient' }));
    }
  }, [dispatch, user]);

  // Refresh appointments when the window gains focus (user returns to the tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.is_patient) {
        dispatch(fetchAppointments({ role: 'patient' }));
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch, user]);

  const upcomingAppointments = (appointments || []).filter(apt => {
    if (!apt.status_name || !apt.appointment_date) return false;
    const today = new Date();
    const aptDate = new Date(apt.appointment_date);
    return aptDate >= today && ['scheduled', 'confirmed'].includes(apt.status_name.toLowerCase());
  });

  const recentAppointments = (appointments || []).filter(apt => {
    return apt.status_name?.toLowerCase() === 'completed';
  }).slice(0, 3);

  const totalAppointments = appointments?.length || 0;
  const completedAppointments = (appointments || []).filter(apt => 
    apt.status_name?.toLowerCase() === 'completed'
  ).length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}
        </h1>
        <p className="text-gray-600">Manage your health appointments and medical records.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Link href="/doctors">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Book New
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status_name === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status_name || 'Pending'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(appointment.appointment_date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatTime(appointment.appointment_time)}
                      </div>
                      {appointment.clinic && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {appointment.clinic.name}
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <Link href={`/appointments/${appointment.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                
                {upcomingAppointments.length > 3 && (
                  <div className="text-center">
                    <Link href="/appointments">
                      <Button variant="outline" size="sm">
                        View All Appointments
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Link href="/doctors">
                  <Button>Book Your First Appointment</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Appointments</CardTitle>
              <Link href="/appointments">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}
                      </h4>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Completed
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(appointment.appointment_date)}
                      </div>
                      {appointment.doctor.specializations.map((spec) => (
                        <span key={spec.id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                          {spec.name}
                        </span>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setReviewAppointment(appointment)}
                    >
                      Leave Review
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No completed appointments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/doctors" className="block">
              <div className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                <Plus className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Book Appointment</p>
                <p className="text-sm text-gray-600">Find and book with doctors</p>
              </div>
            </Link>
            
            <Link href="/appointments" className="block">
              <div className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">My Appointments</p>
                <p className="text-sm text-gray-600">View all appointments</p>
              </div>
            </Link>
            
            <Link href="/profile" className="block">
              <div className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                <User className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">My Profile</p>
                <p className="text-sm text-gray-600">Update personal info</p>
              </div>
            </Link>
            
            <Link href="/hospitals" className="block">
              <div className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                <MapPin className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Find Hospitals</p>
                <p className="text-sm text-gray-600">Locate nearby hospitals</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      {reviewAppointment && (
        <ReviewModal
          isOpen={!!reviewAppointment}
          onClose={() => setReviewAppointment(null)}
          doctor={reviewAppointment.doctor}
          appointmentId={reviewAppointment.id}
        />
      )}
    </div>
  );
};

export default PatientDashboardPage;