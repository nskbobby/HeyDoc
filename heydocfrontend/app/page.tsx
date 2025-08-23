'use client';
import React from 'react';
import Link from 'next/link';
import { Search, Calendar, Shield, Star } from 'lucide-react';
import SearchBar from '../Components/common/SearchBar';
import Button from '../Components/ui/Button';
import { Card, CardContent } from '../Components/ui/Card';

export default function HomePage() {
  const handleSearch = (searchTerm: string, location: string) => {
    // Redirect to doctors page with search params
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (location) params.append('location', location);
    window.location.href = `/doctors?${params.toString()}`;
  };

  const features = [
    {
      icon: Search,
      title: 'Find Doctors',
      description: 'Search for qualified doctors by specialty, location, and availability.',
    },
    {
      icon: Calendar,
      title: 'Book Appointments',
      description: 'Schedule appointments with your preferred doctors at convenient times.',
    },
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All doctors are verified and licensed healthcare professionals.',
    },
    {
      icon: Star,
      title: 'Patient Reviews',
      description: 'Read genuine reviews from patients to make informed decisions.',
    },
  ];

  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="container text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find & Book Appointments with 
            <span className="text-blue-600"> Top Doctors</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with qualified healthcare professionals in your area. Book appointments online and manage your healthcare journey with ease.
          </p>
          
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/doctors">
              <Button size="lg" className="px-8">
                Browse Doctors
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="px-8">
                Join as Doctor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose HeyDoc?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We make healthcare accessible and convenient for everyone
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-50 py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Verified Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50000+</div>
              <div className="text-gray-600">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">25+</div>
              <div className="text-gray-600">Specializations</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}