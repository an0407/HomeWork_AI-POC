import { Link } from 'react-router-dom';
import { Award, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function PracticeResultsPage() {
  // Mock data
  const mockResults = {
    score_percentage: 85,
    correct_answers: 17,
    total_questions: 20,
    time_taken: 900, // seconds
    results: [
      {
        question_number: 1,
        question_text: 'What is the derivative of x²?',
        user_answer: '2x',
        correct_answer: '2x',
        is_correct: true,
        explanation: 'The power rule states that d/dx(xⁿ) = nxⁿ⁻¹',
      },
      {
        question_number: 2,
        question_text: 'What is 5 × 7?',
        user_answer: '30',
        correct_answer: '35',
        is_correct: false,
        explanation: '5 multiplied by 7 equals 35',
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Score Card */}
      <Card className="mb-8 border-2 border-blue-600">
        <CardHeader className="text-center">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Award className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-3xl">
            Score: {mockResults.score_percentage}%
          </CardTitle>
          <CardDescription className="text-lg">
            {mockResults.correct_answers} out of {mockResults.total_questions} correct
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {mockResults.correct_answers}
              </p>
              <p className="text-sm text-gray-600">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {mockResults.total_questions - mockResults.correct_answers}
              </p>
              <p className="text-sm text-gray-600">Incorrect</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {Math.floor(mockResults.time_taken / 60)}m
              </p>
              <p className="text-sm text-gray-600">Time</p>
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
          {mockResults.results.map((result) => (
            <Card
              key={result.question_number}
              className={result.is_correct ? 'border-green-200' : 'border-red-200'}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Q{result.question_number}</Badge>
                      {result.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <CardTitle className="text-lg">
                      {result.question_text}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                    <p className={`font-medium ${result.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                      {result.user_answer}
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
