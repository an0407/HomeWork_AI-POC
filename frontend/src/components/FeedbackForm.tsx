import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { feedbackApi, FeedbackIssueType } from '../services/feedbackApi';

interface FeedbackFormProps {
  solutionId: string;
  onSubmitSuccess?: () => void;
}

const ISSUE_OPTIONS: { value: FeedbackIssueType; label: string }[] = [
  { value: 'incorrect_answer', label: 'Incorrect Answer' },
  { value: 'unclear_explanation', label: 'Unclear Explanation' },
  { value: 'too_advanced', label: 'Too Advanced' },
  { value: 'too_simple', label: 'Too Simple' },
  { value: 'language_error', label: 'Language/Grammar Error' },
  { value: 'other', label: 'Other' },
];

export function FeedbackForm({ solutionId, onSubmitSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedIssues, setSelectedIssues] = useState<FeedbackIssueType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || wasHelpful === null) {
      setError('Please provide a rating and indicate if the solution was helpful');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await feedbackApi.submitFeedback({
        solution_id: solutionId,
        rating,
        feedback_text: feedbackText || undefined,
        was_helpful: wasHelpful,
        issues: selectedIssues.length > 0 ? selectedIssues : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleIssue = (issue: FeedbackIssueType) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  if (success) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-green-800 font-medium text-lg">Thank you for your feedback!</p>
            <p className="text-green-600 text-sm mt-1">Your input helps us improve.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Rate This Solution</CardTitle>
        <CardDescription>Help us improve by sharing your feedback</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600 self-center">
                {rating} of 5 stars
              </span>
            )}
          </div>
        </div>

        {/* Helpful/Not Helpful */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Was this solution helpful?
          </label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={wasHelpful === true ? 'default' : 'outline'}
              onClick={() => setWasHelpful(true)}
              className="flex-1"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Yes
            </Button>
            <Button
              type="button"
              variant={wasHelpful === false ? 'default' : 'outline'}
              onClick={() => setWasHelpful(false)}
              className="flex-1"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              No
            </Button>
          </div>
        </div>

        {/* Issues (optional) */}
        {wasHelpful === false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What was the issue? (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {ISSUE_OPTIONS.map((issue) => (
                <button
                  key={issue.value}
                  type="button"
                  onClick={() => toggleIssue(issue.value)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedIssues.includes(issue.value)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {issue.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments (optional)
          </label>
          <Textarea
            placeholder="Tell us more about your experience..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {feedbackText.length}/1000 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0 || wasHelpful === null}
          className="w-full"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
}
