import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { practiceApi, PracticeResults } from '@/services/practiceApi';

export function PracticeResultsPage() {
  const { testId, submissionId } = useParams<{ testId: string; submissionId: string }>();
  const [results, setResults] = useState<PracticeResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      if (!testId || !submissionId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await practiceApi.getPracticeResults(testId, submissionId);
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [testId, submissionId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error || 'Results not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const scorePercentage = Math.round((results.correct / results.total) * 100);
  const minutesTaken = Math.floor(results.time_taken_seconds / 60);
  const secondsTaken = results.time_taken_seconds % 60;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Score Card */}
      <Card className="mb-8 border-2 border-blue-600">
        <CardHeader className="text-center">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Award className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-3xl">
            Score: {scorePercentage}%
          </CardTitle>
          <CardDescription className="text-lg">
            {results.correct} out of {results.total} correct
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {results.correct}
              </p>
              <p className="text-sm text-gray-600">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {results.total - results.correct}
              </p>
              <p className="text-sm text-gray-600">Incorrect</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {minutesTaken}m {secondsTaken}s
              </p>
              <p className="text-sm text-gray-600">Time Taken</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Test Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Subject</p>
              <p className="font-semibold text-gray-900">{results.subject}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Topic</p>
              <p className="font-semibold text-gray-900">{results.topic}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="font-semibold text-gray-900">
                {new Date(results.submitted_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Results */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Question Review
        </h2>
        <div className="space-y-4">
          {results.detailed_results.map((result, index) => (
            <Card
              key={index}
              className={result.is_correct ? 'border-green-200' : 'border-red-200'}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Q{index + 1}</Badge>
                      {result.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      {result.question_type && (
                        <Badge variant="outline" className="text-xs">
                          {result.question_type.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">
                      {result.question}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                    <p className={`font-medium ${result.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                      {result.user_answer || '(Not answered)'}
                    </p>
                  </div>
                  {!result.is_correct && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
                      <p className="font-medium text-green-600">
                        {result.correct_answer}
                      </p>
                    </div>
                  )}
                  {result.options && result.options.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Options:</p>
                      <div className="space-y-1">
                        {result.options.map((option, idx) => (
                          <p key={idx} className="text-sm text-gray-700">
                            • {option}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Explanation:
                    </p>
                    <p className="text-sm text-blue-800">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/practice" className="flex-1">
          <Button variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Take Another Test
          </Button>
        </Link>
        <Link to="/dashboard" className="flex-1">
          <Button className="w-full">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
