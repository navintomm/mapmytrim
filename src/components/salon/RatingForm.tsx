import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { submitSalonRating } from '@/lib/firebase/functions';

interface RatingFormProps {
  salonId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const RatingForm: React.FC<RatingFormProps> = ({ salonId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await submitSalonRating({ salonId, rating, review });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rate your experience
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-4xl transition-all ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:scale-110`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review (Optional)
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Share your experience..."
        />
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="flex gap-3">
        <Button type="submit" loading={loading} className="flex-1">
          Submit Rating
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};