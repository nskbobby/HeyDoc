import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { DoctorProfile } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import BookingModal from '../appointments/BookingModal';

interface DoctorCardProps {
  doctor: DoctorProfile;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <>
    <BookingModal
      isOpen={showBookingModal}
      onClose={() => setShowBookingModal(false)}
      doctor={doctor}
    />
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Image
              src={doctor.user.profile_picture || '/images/default-avatar.jpg'}
              alt={`${doctor.user.first_name} ${doctor.user.last_name}`}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {doctor.user.first_name} {doctor.user.last_name}
                  {doctor.is_verified && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {doctor.specializations.map((spec) => (
                    <span
                      key={spec.id}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {spec.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-600">
                  {doctor.rating} ({doctor.total_reviews})
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {doctor.years_of_experience} years experience
              </div>
              
              {doctor.primary_clinic && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {doctor.primary_clinic.area_name}, {doctor.primary_clinic.city_name}
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                Consultation: {formatCurrency(doctor.consultation_fee)}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <Link href={`/doctors/${doctor.id}`}>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
              
              <Button 
                size="sm"
                onClick={() => setShowBookingModal(true)}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default DoctorCard;