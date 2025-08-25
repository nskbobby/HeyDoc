'use client';
import { useEffect, useState } from 'react';
import {fetchAppointments} from '../../../store/appointmentsSlice';
import { useDispatch,useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';

export default function AppointmentHistory() {
  
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const appointments = useSelector((state: RootState) => 
    state.appointments.appointments);
  const [filteredAppointments, setFilteredAppointments] = useState(appointments);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
     if (!appointments.length) return;

  const filtered = appointments.filter((appointment) => {
    if (appointment.status_name?.toLowerCase() === 'scheduled' || appointment.status_name?.toLowerCase() === 'confirmed') return false;
    if (statusFilter && statusFilter !== 'all' &&
        appointment.status_name?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (dateFilter && appointment.appointment_date !== dateFilter) return false;
    return true; 
  });
    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, dateFilter]);

  useEffect(() => {
    if (user) {
      const role = user.is_doctor ? 'doctor' : 'patient';
      dispatch(fetchAppointments({ role }))
        .unwrap() // returns the resolved payload
        .then((data) => {
          console.log('Fetched appointments from API:', data);
        })
        .catch((err) => {
          console.error('Error fetching appointments:', err);
        });
    }
  }, [dispatch, user]);

  useEffect(() => {
    console.log('Appointments in Redux store:', appointments);
  }, [appointments]);


  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Appointment History</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Past Appointments</h2>
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                <option value={""}>All Status</option>
                <option>completed</option>
                <option>Cancelled</option>
                <option>No Show</option>
              </select>
              <input
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                type="date"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.appointment_time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.appointment_date}</div>
                    <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.symptoms}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      appointment.status_name === 'Completed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status_name === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">
                      View Details
                    </button>
                    {appointment.status_name === 'Completed' && (
                      <button className="text-secondary-600 hover:text-secondary-900">
                        Book Again
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}