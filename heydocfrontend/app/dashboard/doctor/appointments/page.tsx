'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, History } from 'lucide-react';
import { RootState, AppDispatch } from '../../../../store';
import { fetchAppointments } from '../../../../store/appointmentsSlice';
import { Card, CardHeader, CardContent, CardTitle } from '../../../../Components/ui/Card';
import Button from '../../../../Components/ui/Button';

export default function DoctorAppointments() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { appointments, loading } = useSelector((state: RootState) => state.appointments);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.is_doctor) {
      dispatch(fetchAppointments({ role: 'doctor' }));
    }
  }, [dispatch, user]);

  const today = new Date().toISOString().split('T')[0];

  const todayAppointments = appointments.filter(
    (apt) => apt.appointment_date === today
  );

  const upcomingAppointments = appointments.filter(
    (apt) =>
      apt.appointment_date > today &&
      ['scheduled', 'confirmed'].includes(apt.status_name.toLowerCase())
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      apt.appointment_date < today ||
      ['completed', 'cancelled'].includes(apt.status_name.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-600">Track and manage your appointments</p>
      </div>

      {/* Today's Appointments */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Today's Appointments</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/doctor/schedule')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              View Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading appointments...</p>
          ) : todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">
                        {appointment.patient.first_name} {appointment.patient.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.appointment_time} –{' '}
                        {appointment.symptoms || 'General consultation'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status_name.toLowerCase() === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {appointment.status_name}
                      </span>
                      <Link href={`/appointments/${appointment.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No appointments today</p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Upcoming Appointments</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/doctor/appointments')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading appointments...</p>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border-l-4 border-green-500 pl-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">
                        {appointment.patient.first_name} {appointment.patient.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.appointment_date} at {appointment.appointment_time}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {appointment.status_name}
                      </span>
                      <Link href={`/appointments/${appointment.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No upcoming appointments
            </p>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Past Appointments</CardTitle>
            <Button
              variant="outline"
              size="sm"
              disabled
              onClick={() => router.push('/dashboard/doctor/history')}
            >
              <History className="w-4 h-4 mr-2" />
              View History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading past appointments...</p>
          ) : pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="border-l-4 border-gray-400 pl-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">
                        {appointment.patient.first_name} {appointment.patient.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.appointment_date} at {appointment.appointment_time}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status_name.toLowerCase() === 'completed'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {appointment.status_name}
                      </span>
                      <Link href={`/appointments/${appointment.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {pastAppointments.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{pastAppointments.length - 5} more past appointments
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No past appointments found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
