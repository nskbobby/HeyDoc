'use client';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateFilters } from '../../store/doctorsSlice';
import Input from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const DoctorFilters: React.FC = () => {
  const { filters, specializations } = useSelector((state: RootState) => state.doctors);
  const dispatch = useDispatch();

  const handleFilterChange = (key: string, value: any) => {
    dispatch(updateFilters({ [key]: value }));
  };

  const specializationsList = Array.isArray(specializations) ? specializations : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialization
          </label>
          <select
            value={filters.specialization}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All Specializations</option>
            {specializationsList.map((spec) => (
              <option key={spec.id} value={spec.name}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="City"
          value={filters.city || ''}
          onChange={(e) => handleFilterChange('city', e.target.value)}
          placeholder="Enter city name"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consultation Fee Range
          </label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minFee || ''}
              onChange={(e) => handleFilterChange('minFee', Number(e.target.value) || 0)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxFee || ''}
              onChange={(e) => handleFilterChange('maxFee', Number(e.target.value) || 1000)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Rating
          </label>
          <select
            value={filters.rating || 0}
            onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value={0}>Any Rating</option>
            <option value={4}>4+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorFilters;