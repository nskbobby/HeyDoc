'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch, RootState } from '../../store';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { DoctorProfile } from '../../lib/types';
import { createAppointment, fetchAppointments, fetchAvailableSlots, checkDateAvailability } from '../../store/appointmentsSlice';
import { addNotification } from '../../store/uiSlice';
import { formatCurrency } from '../../lib/utils';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import DatePicker from '../ui/DatePicker';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfile;
}

interface BookingFormData {
  appointment_date: string;
  appointment_time: string;
  symptoms: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, doctor }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { appointments, availableSlots, slotsLoading, dateAvailability } = useSelector((state: RootState) => state.appointments);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Check authentication status
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BookingFormData>();

  // Handle date change to fetch available slots
  const handleDateChange = async (date: string) => {
    if (date && date !== selectedDate) {
      setSelectedDate(date);
      setValue('appointment_date', date); // Update form value
      
      // Fetch available slots for this date and doctor
      dispatch(fetchAvailableSlots({ 
        doctorId: doctor.id, 
        date: date 
      }));
    }
  };

  // Reset form and state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      reset();
      setSelectedDate('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: BookingFormData) => {
    
    // Check if user is authenticated
    if (!authToken) {
      setError('Please log in to book an appointment');
      dispatch(addNotification({
        type: 'error',
        message: 'Please log in to book an appointment'
      }));
      router.push('/auth/login');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const appointmentData = {
        doctor: doctor.id,
        clinic: doctor.primary_clinic?.id,
        consultation_fee: doctor.consultation_fee,
        ...data,
      };
      
      
      // Since we're showing only available slots, we don't need frontend validation
      // The backend will handle any conflicts that might occur
      
      const result = await dispatch(createAppointment(appointmentData));
      
      if (createAppointment.fulfilled.match(result)) {
        
        // Immediately refresh the appointments list from the server
        dispatch(fetchAppointments({ role: 'patient' }));
        
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          message: 'Appointment booked successfully! You will receive a confirmation email.'
        }));
        
        setSuccess(true);
        reset();
        
        // Navigate to appropriate dashboard after a short delay
        setTimeout(() => {
          setSuccess(false);
          onClose();
          router.push('/dashboard/patient');
        }, 1500);
      } else {
        // Handle validation errors from backend
        const backendError = result.payload;
        let errorMessage = 'Failed to book appointment. Please try again.';
        
        if (typeof backendError === 'object' && backendError) {
          const error = backendError as any;
          if (error.appointment_time) {
            errorMessage = error.appointment_time[0] || error.appointment_time;
          } else if (error.appointment_date) {
            errorMessage = error.appointment_date[0] || error.appointment_date;
          } else if (error.non_field_errors) {
            errorMessage = error.non_field_errors[0] || error.non_field_errors;
          } else if (error.detail) {
            errorMessage = error.detail;
          }
        }
        
        setError(errorMessage);
        dispatch(addNotification({
          type: 'error',
          message: errorMessage
        }));
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to book appointment. Please try again.';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        message: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Appointment" size="md">
      <div className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-green-800 font-medium">Appointment Booked Successfully!</h3>
              <p className="text-green-700 text-sm">Redirecting to your appointments...</p>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">
            Dr. {doctor.user.first_name} {doctor.user.last_name}
          </h3>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Specializations: {doctor.specializations.map(s => s.name).join(', ')}</p>
            <p>Consultation Fee: {formatCurrency(doctor.consultation_fee)}</p>
            {doctor.primary_clinic && (
              <p>Location: {doctor.primary_clinic.name}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DatePicker
            doctorId={doctor.id}
            value={selectedDate}
            onChange={handleDateChange}
            error={errors.appointment_date?.message}
            label="Appointment Date"
          />
          <input
            type="hidden"
            {...register('appointment_date', {
              required: 'Please select a date',
            })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Time
            </label>
            {selectedDate ? (
              slotsLoading ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <div className="animate-spin h-4 w-4 border-2 border-primary-600 rounded-full border-t-transparent"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading available times...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <select
                  {...register('appointment_time', {
                    required: 'Please select a time',
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select available time</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full p-3 border rounded-md bg-gray-50 text-gray-500 text-sm">
                  No available time slots for this date
                </div>
              )
            ) : (
              <div className="w-full p-3 border rounded-md bg-gray-50 text-gray-500 text-sm">
                Please select a date first
              </div>
            )}
            {errors.appointment_time && (
              <p className="mt-1 text-sm text-red-600">{errors.appointment_time.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptoms (Optional)
            </label>
            <textarea
              {...register('symptoms')}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Describe your symptoms..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedDate || availableSlots.length === 0}
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BookingModal;