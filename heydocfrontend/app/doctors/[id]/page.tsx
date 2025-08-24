'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store';
import Image from 'next/image';
import { Star, MapPin, Clock, DollarSign, Calendar, Phone, Mail } from 'lucide-react';
import { RootState } from '../../../store';
import { fetchDoctorById, clearSelectedDoctor } from '../../../store/doctorsSlice';
import { formatCurrency } from '../../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../../Components/ui/Card';
import Button from '../../../Components/ui/Button';
import BookingModal from '../../../Components/appointments/BookingModal';
import ReviewsList from '../../../Components/reviews/ReviewsList';
import Spinner from '../../../Components/ui/Spinner';
import { useParams } from 'next/navigation';

const DoctorPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedDoctor, loading } = useSelector((state: RootState) => state.doctors);
  const [showBooking, setShowBooking] = useState(false);
  const params = useParams();

  useEffect(() => {
    dispatch(fetchDoctorById(Number(params.id)));
    return () => {
      dispatch(clearSelectedDoctor());
    };
  }, [dispatch, params.id]);

  if (loading) {
    return (
      <div className="container py-8 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedDoctor) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Doctor not found</h1>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Image
                  src={selectedDoctor.user.profile_picture || '/images/default-avatar.jpg'}
                  alt={`${selectedDoctor.user.first_name} ${selectedDoctor.user.last_name}`}
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {selectedDoctor.user.first_name} {selectedDoctor.user.last_name}
                        {selectedDoctor.is_verified && (
                          <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                      </h1>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedDoctor.specializations.map((spec) => (
                          <span
                            key={spec.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {spec.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-lg font-semibold text-gray-900">
                        {selectedDoctor.rating}
                      </span>
                      <span className="ml-1 text-gray-600">
                        ({selectedDoctor.total_reviews} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      {selectedDoctor.years_of_experience} years experience
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-5 w-5 mr-2" />
                      {formatCurrency(selectedDoctor.consultation_fee)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          {selectedDoctor.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{selectedDoctor.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Clinics */}
          {selectedDoctor.clinics && selectedDoctor.clinics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Clinic Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDoctor.clinics.map((clinic) => (
                  <div key={clinic.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{clinic.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {clinic.address}
                      </div>
                      {clinic.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {clinic.phone}
                        </div>
                      )}
                      {clinic.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {clinic.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <ReviewsList doctorId={selectedDoctor.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card>
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(selectedDoctor.consultation_fee)}
                  </span>
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => setShowBooking(true)}
                  disabled={!selectedDoctor.is_available}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {selectedDoctor.is_available ? 'Book Appointment' : 'Currently Unavailable'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium">{selectedDoctor.years_of_experience} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Patients:</span>
                <span className="font-medium">{selectedDoctor.total_reviews}+ treated</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating:</span>
                <span className="font-medium">{selectedDoctor.rating}/5</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
          doctor={selectedDoctor}
        />
      )}
    </div>
  );
};

export default DoctorPage;