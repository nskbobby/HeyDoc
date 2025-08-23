import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, MapPin, Phone } from 'lucide-react';
import { Appointment } from '../../lib/types';
import { formatDate, formatTime, formatCurrency } from '../../lib/utils';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: number) => void;
  showPatient?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  showPatient = false,
}) => {
  const router = useRouter();
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">
              {showPatient ? (
                `${appointment.patient.first_name} ${appointment.patient.last_name}`
              ) : (
                `Dr. ${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`
              )}
            </h3>
            <p className="text-sm text-gray-600">
              Booking ID: {appointment.booking_id}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              appointment.status_name
            )}`}
          >
            {appointment.status_name}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(appointment.appointment_date)}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {formatTime(appointment.appointment_time)}
          </div>
          
          {appointment.clinic && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {appointment.clinic.name}
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">
              Fee: {formatCurrency(appointment.consultation_fee)}
            </span>
          </div>
        </div>

        {appointment.symptoms && (
          <div>
            <p className="text-sm font-medium text-gray-700">Symptoms:</p>
            <p className="text-sm text-gray-600">{appointment.symptoms}</p>
          </div>
        )}

        {appointment.notes && (
          <div>
            <p className="text-sm font-medium text-gray-700">Notes:</p>
            <p className="text-sm text-gray-600">{appointment.notes}</p>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          {appointment.status_name === 'scheduled' && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(appointment.id)}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/appointments/${appointment.id}`)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;