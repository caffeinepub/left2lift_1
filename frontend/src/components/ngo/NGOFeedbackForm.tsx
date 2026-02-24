import React, { useState } from 'react';
import { useSubmitFeedback } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Star, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NGOFeedbackFormProps {
  donationId: bigint;
  onSubmitted: () => void;
}

export default function NGOFeedbackForm({ donationId, onSubmitted }: NGOFeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitFeedback = useSubmitFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await submitFeedback.mutateAsync({
        donationId,
        rating: BigInt(rating),
        comment,
      });
      toast.success('Feedback submitted! Thank you.');
      onSubmitted();
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-medium text-sm text-foreground">Rate this donation</h4>

      {/* Star rating */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-secondary-500 text-secondary-500'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-muted-foreground ml-2 self-center">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Comment (optional)</Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this donation..."
          rows={2}
          className="text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitFeedback.isPending || rating === 0}
        className="flex items-center gap-1.5 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60"
      >
        {submitFeedback.isPending ? (
          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
        Submit Feedback
      </button>
    </form>
  );
}
