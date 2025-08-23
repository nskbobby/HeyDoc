'use client';
import React, { useEffect, useState } from 'react';
import { Star, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Spinner from '../ui/Spinner';
import api from '../../lib/api';

interface Review {
  id: number;
  patient_name: string;
  rating: number;
  title: string;
  comment: string;
  is_anonymous: boolean;
  created_at: string;
  helpful_count: number;
}

interface ReviewsListProps {
  doctorId: number;
  limit?: number;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ doctorId, limit }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/reviews/?doctor_id=${doctorId}${limit ? `&limit=${limit}` : ''}`);
        const reviewsData = Array.isArray(response.data) ? response.data : (response.data as any)?.results || [];
        setReviews(reviewsData);
      } catch (err) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchReviews();
    }
  }, [doctorId, limit]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Spinner size="sm" />
          <p className="mt-2 text-sm text-gray-500">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Reviews</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Be the first to share your experience with this doctor
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Patient Reviews
          <span className="text-sm font-normal text-gray-500">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {review.patient_name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {review.rating}/5
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(review.created_at)}
              </div>
            </div>

            {review.title && (
              <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
            )}
            
            {review.comment && (
              <p className="text-gray-600 leading-relaxed mb-3">{review.comment}</p>
            )}

            {review.helpful_count > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <span>{review.helpful_count} people found this helpful</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ReviewsList;