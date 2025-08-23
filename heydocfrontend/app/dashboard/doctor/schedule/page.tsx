'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { RootState, AppDispatch } from '../../../../store';
import { fetchAppointments } from '../../../../store/appointmentsSlice';
import { Card, CardHeader, CardContent, CardTitle } from '../../../../Components/ui/Card';
import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';

export default function DoctorSchedule() {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, loading } = useSelector((state: RootState) => state.appointments);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [showBlockTimeModal, setShowBlockTimeModal] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useEffect(() => {
    if (user?.is_doctor) {
      dispatch(fetchAppointments({ role: 'doctor' }));
    }
  }, [dispatch, user]);


  // Generate next 7 days starting from today
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(apt => {
      const dateMatch = apt.appointment_date === date;
      const statusMatch = ['scheduled', 'confirmed'].includes(apt.status_name?.toLowerCase() || '');
      return dateMatch && statusMatch;
    });
  };

  // Get appointments for a specific time slot
  const getAppointmentForSlot = (date: string, time: string) => {
    return appointments.find(apt => {
      const dateMatch = apt.appointment_date === date;
      
      // Normalize time format - Django TimeField comes as HH:MM:SS, slots are HH:MM
      const normalizeTime = (timeStr: string) => {
        if (timeStr.includes(':')) {
          return timeStr.split(':').slice(0, 2).join(':');
        }
        return timeStr;
      };
      
      const timeMatch = normalizeTime(apt.appointment_time) === normalizeTime(time);
      const statusMatch = ['scheduled', 'confirmed'].includes(apt.status_name?.toLowerCase() || '');
      
      return dateMatch && timeMatch && statusMatch;
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
        <p className="text-gray-600">Manage your appointments and availability</p>
      </div>

      {/* View Controls */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week View
          </Button>
          <Button 
            variant={viewMode === 'day' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day View
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {viewMode === 'week' ? (
        /* Week View */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Week Header */}
                <div className="grid grid-cols-8 gap-2 mb-4">
                  <div className="text-sm font-medium text-gray-500 p-2">Time</div>
                  {weekDates.map((date, index) => (
                    <div 
                      key={index} 
                      className={`text-center p-2 rounded ${
                        isToday(date) ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <div className="text-sm font-medium">{formatDate(date)}</div>
                      <div className="text-xs text-gray-500">
                        {getAppointmentsForDate(date.toISOString().split('T')[0]).length} apt
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Time Slots */}
                <div className="space-y-1">
                  {timeSlots.map((time) => (
                    <div key={time} className="grid grid-cols-8 gap-2">
                      <div className="text-sm text-gray-600 p-2 font-medium">{time}</div>
                      {weekDates.map((date, dateIndex) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const appointment = getAppointmentForSlot(dateStr, time);
                        return (
                          <div key={dateIndex} className="min-h-12 border border-gray-200 rounded p-1">
                            {appointment ? (
                              <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded h-full flex flex-col justify-center">
                                <div className="font-medium truncate">
                                  {appointment.patient.first_name} {appointment.patient.last_name}
                                </div>
                                <div className="text-blue-600 capitalize">{appointment.status_name}</div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                Available
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Today's Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Appointments</span>
                    <span className="font-medium">
                      {getAppointmentsForDate(new Date().toISOString().split('T')[0]).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Slots</span>
                    <span className="font-medium text-green-600">
                      {timeSlots.length - getAppointmentsForDate(new Date().toISOString().split('T')[0]).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowBlockTimeModal(true)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Block Time Slot
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowUnavailableModal(true)}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Set Unavailable
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowEmergencyModal(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Emergency Hours
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Day View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const appointment = getAppointmentForSlot(selectedDate, time);
                    return (
                      <div key={time} className="flex items-center p-3 border border-gray-200 rounded">
                        <div className="w-16 text-sm font-medium text-gray-600 mr-4">
                          {time}
                        </div>
                        <div className="flex-1">
                          {appointment ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {appointment.patient.first_name} {appointment.patient.last_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {appointment.symptoms || 'General consultation'}
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
                          ) : (
                            <div className="text-gray-400 italic">Available</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Day Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Appointments</span>
                    <span className="font-medium">{selectedDateAppointments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Slots</span>
                    <span className="font-medium text-green-600">
                      {timeSlots.length - selectedDateAppointments.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilization</span>
                    <span className="font-medium text-blue-600">
                      {Math.round((selectedDateAppointments.length / timeSlots.length) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateAppointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="border-l-4 border-blue-500 pl-3">
                        <p className="font-medium text-sm">
                          {apt.appointment_time} - {apt.patient.first_name} {apt.patient.last_name}
                        </p>
                        <p className="text-xs text-gray-600">{apt.symptoms || 'General consultation'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No appointments for this day</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Quick Action Modals */}
      <Modal
        isOpen={showBlockTimeModal}
        onClose={() => setShowBlockTimeModal(false)}
        title="Block Time Slot"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Select a time slot to block from patient bookings. This is useful for breaks, meetings, or personal appointments.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
              <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option value="">Select time</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
            <textarea
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Meeting, Break, Personal appointment..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowBlockTimeModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => alert('Block time slot functionality coming soon!')}>
              Block Time Slot
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showUnavailableModal}
        onClose={() => setShowUnavailableModal(false)}
        title="Set Unavailable Period"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Mark yourself as unavailable for a specific period. This will block all appointment bookings during this time.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="">Select reason</option>
              <option value="vacation">Vacation</option>
              <option value="sick_leave">Sick Leave</option>
              <option value="conference">Conference/Training</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Additional details..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowUnavailableModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => alert('Set unavailable functionality coming soon!')}>
              Set Unavailable
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        title="Emergency Hours"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Configure emergency hours for urgent patient consultations outside regular schedule.
          </p>
          
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Note:</strong> Emergency hours are for urgent medical situations only. 
              Additional fees may apply.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
            <input
              type="tel"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Available Times</label>
            <div className="space-y-2">
              {['After Hours (6 PM - 10 PM)', 'Weekend (Saturday/Sunday)', '24/7 Emergency Line'].map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">{option}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Consultation Fee</label>
            <input
              type="number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="150"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowEmergencyModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => alert('Emergency hours functionality coming soon!')}>
              Save Emergency Hours
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}