'use client';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchDoctors, fetchSpecializations } from '../../store/doctorsSlice';
import DoctorCard from '../../Components/doctors/DoctorCard';
import DoctorFilters from '../../Components/doctors/DoctorFilter';
import SearchBar from '../../Components/common/SearchBar';
import Spinner from '../../Components/ui/Spinner';

export default function DoctorsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { doctors, loading, filters } = useSelector((state: RootState) => state.doctors);

  useEffect(() => {
    dispatch(fetchDoctors({}));
    dispatch(fetchSpecializations());
  }, [dispatch]);

  useEffect(() => {
    // Fetch doctors with filters when filters change
    const params = Object.entries(filters)
      .filter(([_, value]) => value && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    dispatch(fetchDoctors(params));
  }, [dispatch, filters]);

  const handleSearch = (searchTerm: string, location: string) => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (location) params.city = location;
    dispatch(fetchDoctors(params));
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Doctors</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <DoctorFilters />
        </aside>

        <main className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  {doctors.length} doctors found
                </p>
              </div>
              
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
              
              {doctors.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No doctors found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}