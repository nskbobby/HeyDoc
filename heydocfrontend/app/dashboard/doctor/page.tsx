'use client';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { fetchAppointments } from '../../../store/appointmentsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../../Components/ui/Card';
import AppointmentCard from '../../../Components/appointments/AppointmentCard';
import Button from '../../../Components/ui/Button';

export default function DoctorDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { appointments, loading } = useSelector((state: RootState) => state.appointments);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.is_doctor) {
      dispatch(fetchAppointments({ role: 'doctor' }));
    }
  }, [dispatch, user]);

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.appointment_date === today;
  });

  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.appointment_date > today && ['scheduled', 'confirmed'].includes(apt.status_name.toLowerCase());
  });

  const completedThisMonth = appointments.filter(apt => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const aptDate = new Date(apt.appointment_date);
    return aptDate.getMonth() === currentMonth && 
           aptDate.getFullYear() === currentYear && 
           apt.status_name.toLowerCase() === 'completed';
  });

  const monthlyRevenue = completedThisMonth.reduce((total, apt) => {
    return total + parseFloat(apt.consultation_fee);
  }, 0);

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Patients',
      value: new Set(appointments.map(apt => apt.patient.id)).size,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Completed This Month',
      value: completedThisMonth.length,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Monthly Revenue',
      value: `${monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}
        </h1>
        <p className="text-gray-600">Here's what's happening with your practice today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Appointments */}
        <Card>
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
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {appointment.patient.first_name} {appointment.patient.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.appointment_time} - {appointment.symptoms || 'General consultation'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status_name === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status_name}
                      </span>
                    </div>
                  </div>
                ))}
                {todayAppointments.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{todayAppointments.length - 3} more appointments
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No appointments today</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
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
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="border-l-4 border-green-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {appointment.patient.first_name} {appointment.patient.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.appointment_date} at {appointment.appointment_time}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {appointment.status_name}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingAppointments.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{upcomingAppointments.length - 3} more appointments
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => router.push('/dashboard/doctor/schedule')}
            >
              <Calendar className="w-6 h-6 mb-2" />
              Manage Schedule
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => router.push('/dashboard/doctor/appointments')}
            >
              <Users className="w-6 h-6 mb-2" />
              View Patients
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => alert('Analytics feature coming soon!')}
            >
              <TrendingUp className="w-6 h-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}