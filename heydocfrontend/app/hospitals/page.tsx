'use client';
import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Clock, Star, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/ui/Card';
import Input from '../../Components/ui/Input';
import Button from '../../Components/ui/Button';
import EmptyState from '../../Components/ui/EmptyState';

interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  specialties: string[];
  emergency: boolean;
  rating: number;
  distance: string;
}

// Mock data for demonstration
const mockHospitals: Hospital[] = [
  {
    id: 1,
    name: "City General Hospital",
    address: "123 Medical Center Drive",
    city: "Downtown",
    phone: "+1 (555) 123-4567",
    specialties: ["Emergency", "Cardiology", "Surgery", "Pediatrics"],
    emergency: true,
    rating: 4.5,
    distance: "1.2 km"
  },
  {
    id: 2,
    name: "Sunrise Medical Center",
    address: "456 Health Plaza",
    city: "Midtown",
    phone: "+1 (555) 234-5678",
    specialties: ["Neurology", "Orthopedics", "Radiology"],
    emergency: false,
    rating: 4.2,
    distance: "2.8 km"
  },
  {
    id: 3,
    name: "St. Mary's Healthcare",
    address: "789 Wellness Avenue",
    city: "Uptown",
    phone: "+1 (555) 345-6789",
    specialties: ["Maternity", "Oncology", "Dermatology", "Emergency"],
    emergency: true,
    rating: 4.7,
    distance: "3.5 km"
  },
  {
    id: 4,
    name: "Metro Clinic Network",
    address: "321 Care Street",
    city: "Central",
    phone: "+1 (555) 456-7890",
    specialties: ["Family Medicine", "Internal Medicine", "Diagnostic"],
    emergency: false,
    rating: 4.0,
    distance: "4.1 km"
  }
];

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmergency, setFilterEmergency] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setHospitals(mockHospitals);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEmergency = !filterEmergency || hospital.emergency;
    
    return matchesSearch && matchesEmergency;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Finding hospitals near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Hospitals & Clinics</h1>
        <p className="text-gray-600">Discover healthcare facilities in your area</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search hospitals, specialties, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filterEmergency}
                  onChange={(e) => setFilterEmergency(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Emergency services only</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredHospitals.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No hospitals found"
          description="Try adjusting your search criteria or location"
          action={{
            label: "Reset Filters",
            onClick: () => {
              setSearchTerm('');
              setFilterEmergency(false);
            }
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {filteredHospitals.length} hospitals found
            </p>
            <div className="text-sm text-gray-500">
              Sorted by distance
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {hospital.name}
                        {hospital.emergency && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            24/7 Emergency
                          </span>
                        )}
                      </CardTitle>
                      <div className="flex items-center mt-2">
                        {renderStars(hospital.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          {hospital.rating} rating
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary-600">{hospital.distance}</p>
                      <p className="text-xs text-gray-500">away</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">{hospital.address}</p>
                      <p className="text-sm text-gray-600">{hospital.city}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{hospital.phone}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}