import React from 'react';
import Link from 'next/link';
import Button from '../Components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="text-primary-600 text-8xl font-bold mb-4">404</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="space-x-4">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/doctors">
            <Button variant="outline">Find Doctors</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}