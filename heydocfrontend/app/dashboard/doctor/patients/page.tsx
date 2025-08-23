'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock,
  FileText,
  MoreVertical
} from 'lucide-react';
import { RootState, AppDispatch } from '../../../../store';
import { fetchAppointments } from '../../../../store/appointmentsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../Components/ui/Card';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import EmptyState from '../../../../Components/ui/EmptyState';
import { formatDate, formatTime } from '../../../../lib/utils';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  totalAppointments: number;
  lastAppointment: string;
  upcomingAppointments: number;
  completedAppointments: number;
  status: 'active' | 'inactive';
}

export default function DoctorPatients() {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, loading } = useSelector((state: RootState) => state.appointments);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (user?.is_doctor) {
      dispatch(fetchAppointments({ role: 'doctor' }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Process appointments to extract unique patients
    if (appointments.length > 0) {
      const patientMap = new Map<number, Patient>();
      
      appointments.forEach(appointment => {
        const patient = appointment.patient;
        const patientId = patient.id;
        
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email,
            phone: patient.phone,
            totalAppointments: 0,
            lastAppointment: appointment.appointment_date,
            upcomingAppointments: 0,
            completedAppointments: 0,
            status: 'active'
          });
        }
        
        const existingPatient = patientMap.get(patientId)!;
        existingPatient.totalAppointments++;
        
        // Update last appointment if this one is more recent
        if (appointment.appointment_date > existingPatient.lastAppointment) {
          existingPatient.lastAppointment = appointment.appointment_date;
        }
        
        // Count by status
        if (['scheduled', 'confirmed'].includes(appointment.status_name.toLowerCase())) {
          existingPatient.upcomingAppointments++;
        } else if (appointment.status_name.toLowerCase() === 'completed') {
          existingPatient.completedAppointments++;
        }
      });
      
      // Determine patient status
      patientMap.forEach((patient) => {
        const lastAppointmentDate = new Date(patient.lastAppointment);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        patient.status = lastAppointmentDate > threeMonthsAgo ? 'active' : 'inactive';
      });
      
      setPatients(Array.from(patientMap.values()));
    }
  }, [appointments]);

  const getPatientAppointments = (patientId: number) => {
    return appointments.filter(apt => apt.patient.id === patientId);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-600">Manage your patient records and appointments</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Patients</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => ['scheduled', 'confirmed'].includes(apt.status_name.toLowerCase())).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <EmptyState
          icon={User}
          title="No patients found"
          description={searchTerm ? "No patients match your search criteria" : "You haven't seen any patients yet"}
          action={searchTerm ? {
            label: "Clear Search",
            onClick: () => setSearchTerm('')
          } : undefined}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {filteredPatients.length} patients found
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            patient.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {patient.status}
                          </span>
                        </div>
                        
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {patient.email}
                          </div>
                          {patient.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              {patient.phone}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Last visit: {formatDate(patient.lastAppointment)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <p className="font-medium text-gray-900">{patient.totalAppointments} total</p>
                        <p className="text-gray-600">{patient.upcomingAppointments} upcoming</p>
                        <p className="text-gray-600">{patient.completedAppointments} completed</p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        View History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Patient Detail Modal - Simple implementation */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {selectedPatient.first_name} {selectedPatient.last_name} - Appointment History
                </h2>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {getPatientAppointments(selectedPatient.id).map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {appointment.symptoms || 'General consultation'}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Notes:</strong> {appointment.notes}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status_name === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status_name === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status_name === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}