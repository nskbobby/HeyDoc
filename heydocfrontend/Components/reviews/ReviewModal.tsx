'use client';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Star, Send } from 'lucide-react';
import { AppDispatch } from '../../store';
import { addNotification } from '../../store/uiSlice';
import { DoctorProfile } from '../../lib/types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../lib/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfile;
  appointmentId: number;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  doctor,
  appointmentId
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please select a rating'
      }));
      return;
    }

    setSubmitting(true);
    
    try {
      await api.post('/reviews/', {
        doctor: doctor.id,
        appointment: appointmentId,
        rating,
        comment: comment.trim() || '',
        title: '',
        is_anonymous: isAnonymous
      });

      dispatch(addNotification({
        type: 'success',
        message: 'Thank you for your review!'
      }));

      // Reset form
      setRating(0);
      setComment('');
      setIsAnonymous(false);
      onClose();
    } catch (error: any) {
      let errorMessage = 'Failed to submit review';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        // Handle specific HTTP status codes
        if (status === 404) {
          errorMessage = 'Review endpoint not found. Please try again later.';
        } else if (status === 401) {
          errorMessage = 'Please log in to submit a review.';
        } else if (status === 403) {
          errorMessage = 'You are not authorized to submit this review.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data && typeof data === 'object' && !data.toString().includes('<html')) {
          // Handle JSON error responses
          if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            errorMessage = data.non_field_errors[0];
          } else if (data.detail) {
            errorMessage = data.detail;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.doctor && Array.isArray(data.doctor)) {
            errorMessage = `Doctor: ${data.doctor[0]}`;
          } else if (data.appointment && Array.isArray(data.appointment)) {
            errorMessage = `Appointment: ${data.appointment[0]}`;
          } else if (data.rating && Array.isArray(data.rating)) {
            errorMessage = `Rating: ${data.rating[0]}`;
          }
        }
      } else if (error.message && !error.message.includes('Network Error')) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      dispatch(addNotification({
        type: 'error',
        message: errorMessage
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setIsAnonymous(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Leave a Review" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Doctor Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">
            Dr. {doctor.user.first_name} {doctor.user.last_name}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {doctor.specializations?.map((spec) => (
              <span
                key={spec.id}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
              >
                {spec.name}
              </span>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rate your experience
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-600">
              {rating === 0 && 'Select rating'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Share your experience (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Tell others about your experience with this doctor..."
            maxLength={500}
          />
          <p className="mt-1 text-xs text-gray-500">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
            Submit this review anonymously
          </label>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Review Guidelines:</strong> Please be respectful and provide honest feedback. 
            Reviews help other patients make informed decisions.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;