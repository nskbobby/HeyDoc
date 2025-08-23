'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store';
import { fetchDoctorById } from '../../../../store/doctorsSlice';
import BookingModal from '../../../../Components/appointments/BookingModal';
import DoctorCard from '../../../../Components/doctors/DoctorCard';
import Spinner from '../../../../Components/ui/Spinner';

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedDoctor, loading } = useSelector((state: RootState) => state.doctors);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const doctorId = parseInt(params.doctorId as string);

  useEffect(() => {
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (doctorId) {
      dispatch(fetchDoctorById(doctorId));
      setShowBookingModal(true);
    }
  }, [dispatch, doctorId, isAuthenticated, router]);

  const handleCloseModal = () => {
    setShowBookingModal(false);
    router.back();
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

  if (!selectedDoctor) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-gray-500">Doctor not found.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h1>
        <DoctorCard doctor={selectedDoctor} />
        
        {selectedDoctor && (
          <BookingModal
            isOpen={showBookingModal}
            onClose={handleCloseModal}
            doctor={selectedDoctor}
          />
        )}
      </div>
    </div>
  );
}