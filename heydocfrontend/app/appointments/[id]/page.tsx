'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  DollarSign,
  Edit,
  X,
  CheckCircle 
} from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { cancelAppointment } from '../../../store/appointmentsSlice';
import { addNotification } from '../../../store/uiSlice';
import { formatDate, formatTime, formatCurrency } from '../../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../../Components/ui/Card';
import Button from '../../../Components/ui/Button';
import Modal from '../../../Components/ui/Modal';
import ReviewModal from '../../../Components/reviews/ReviewModal';
import Spinner from '../../../Components/ui/Spinner';
import api from '../../../lib/api';

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const appointmentId = parseInt(params.id as string);

  useEffect(() => {
    const fetchAppointmentDetail = async () => {
      try {
        const response = await api.get(`/appointments/${appointmentId}/`);
        setAppointment(response.data);
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to load appointment details'
        }));
        router.push('/appointments');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointmentDetail();
    }
  }, [appointmentId, dispatch, router]);

  const handleCancelAppointment = async () => {
    setCancelling(true);
    try {
      await dispatch(cancelAppointment(appointmentId));
      setAppointment({...appointment, status_name: 'cancelled'});
      setShowCancelModal(false);
      dispatch(addNotification({
        type: 'success',
        message: 'Appointment cancelled successfully'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to cancel appointment'
      }));
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canCancelAppointment = () => {
    if (!appointment) return false;
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return ['scheduled', 'confirmed'].includes(appointment.status_name?.toLowerCase() || '') && hoursDiff > 24;
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Not Found</h1>
          <p className="text-gray-600 mb-6">The appointment you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push('/appointments')}>
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
              <p className="text-gray-600">Booking ID: {appointment.booking_id}</p>
            </div>
            <div className={`px-4 py-2 rounded-full border font-medium ${getStatusColor(appointment.status_name)}`}>
              {appointment.status_name.charAt(0).toUpperCase() + appointment.status_name.slice(1)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Appointment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{formatDate(appointment.appointment_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{formatTime(appointment.appointment_time)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Consultation Fee</p>
                      <p className="font-medium">{formatCurrency(appointment.consultation_fee)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">{appointment.duration} minutes</p>
                    </div>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{appointment.symptoms}</p>
                  </div>
                )}

                {appointment.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{appointment.notes}</p>
                  </div>
                )}

                {appointment.prescription && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Prescription</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-200">{appointment.prescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Doctor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {user?.is_doctor ? 'Patient Information' : 'Doctor Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user?.is_doctor ? (
                  /* Show patient info for doctors */
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.patient.first_name} {appointment.patient.last_name}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {appointment.patient.email}
                        </div>
                        {appointment.patient.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {appointment.patient.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Show doctor info for patients */
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {appointment.doctor.specializations?.map((spec: any) => (
                          <span
                            key={spec.id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {spec.name}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>{appointment.doctor.years_of_experience} years experience</p>
                        {appointment.doctor.is_verified && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            Verified Doctor
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clinic Information */}
            {appointment.clinic && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Clinic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.clinic.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <span>{appointment.clinic.address}</span>
                      </div>
                      {appointment.clinic.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {appointment.clinic.phone}
                        </div>
                      )}
                      {appointment.clinic.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {appointment.clinic.email}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canCancelAppointment() && (
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => setShowCancelModal(true)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Appointment
                  </Button>
                )}
                
                {appointment.status_name?.toLowerCase() === 'completed' && !user?.is_doctor && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowReviewModal(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Leave Review
                  </Button>
                )}

                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>

                {user?.is_doctor && ['scheduled', 'confirmed'].includes(appointment.status_name?.toLowerCase() || '') && (
                  <Button className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Appointment
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : appointment.payment_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Amount: {formatCurrency(appointment.consultation_fee)}
                  </p>
                  {appointment.payment_status === 'pending' && (
                    <Button size="sm" className="mt-3">
                      Pay Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(appointment.created_at)}</span>
                </div>
                {appointment.follow_up_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Follow-up:</span>
                    <span className="font-medium">{formatDate(appointment.follow_up_date)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">In-person</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Appointment"
          size="md"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Are you sure you want to cancel this appointment?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. You may be charged a cancellation fee depending on the timing.
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Appointment
              </Button>
              <Button
                onClick={handleCancelAppointment}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Review Modal */}
        {appointment && (
          <ReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            doctor={appointment.doctor}
            appointmentId={appointment.id}
          />
        )}
      </div>
    </div>
  );
}