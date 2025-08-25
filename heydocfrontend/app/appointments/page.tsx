'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchAppointments, cancelAppointment } from '../../store/appointmentsSlice';
import AppointmentCard from '../../Components/appointments/AppointmentCard';
import Spinner from '../../Components/ui/Spinner';
import Button from '../../Components/ui/Button';
import {useRouter} from 'next/navigation';

export default function AppointmentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, loading } = useSelector((state: RootState) => state.appointments);
  const { user } = useSelector((state: RootState) => state.auth);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const role = user.is_doctor ? 'doctor' : 'patient';
      dispatch(fetchAppointments({ role }));
    }
  }, [dispatch, user]);

  const handleCancelAppointment = (appointmentId: number) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      dispatch(cancelAppointment(appointmentId));
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status_name?.toLowerCase() === filter;
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Appointments</h1>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap space-x-2">
          {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
          <div className="flex-grow" />
          <Button className='align-items-end' variant="outline" size="sm" onClick={() => router.push('appointments/history')}>
            View History
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={handleCancelAppointment}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {filter === 'all' ? 'No appointments found' : `No ${filter} appointments found`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}