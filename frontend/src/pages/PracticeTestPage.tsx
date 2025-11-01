import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { practiceApi, PracticeTest } from '@/services/practiceApi';

export function PracticeTestPage() {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<PracticeTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load test
  useEffect(() => {
    const loadTest = async () => {
      if (!testId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await practiceApi.getPracticeTest(testId);
        setTest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test');
      } finally {
        setIsLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  const handleAnswer = (answer: string) => {
    if (!test) return;
    const questionId = test.questions[currentQuestion].question_id;
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (!test || currentQuestion >= test.questions.length - 1) return;
    setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevious = () => {
    setCurrentQuestion(Math.max(0, currentQuestion - 1));
  };

  const handleSubmit = async () => {
    if (!test || !testId) return;

    setIsSubmitting(true);

    try {
      const submittedAnswers = test.questions.map((q) => ({
        question_id: q.question_id,
        user_answer: answers[q.question_id] || '',
      }));

      const response = await practiceApi.submitPracticeTest(testId, {
        answers: submittedAnswers,
        time_taken_seconds: timeElapsed,
      });

      navigate(`/practice/results/${testId}/${response.submission_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error || 'Test not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  const answered = Object.keys(answers).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Practice Test</h1>
          <p className="text-gray-600">
            Question {currentQuestion + 1} of {test.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-5 w-5" />
          <span className="font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{
              width: `${((currentQuestion + 1) / test.questions.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {answered} of {test.questions.length} questions answered
        </p>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{question.question_text}</CardTitle>
        </CardHeader>
        <CardContent>
          {question.question_type === 'mcq' && question.options && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                    answers[question.question_id] === option
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {question.question_type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer('True')}
                className={`py-4 rounded-lg border-2 font-medium transition-colors ${
                  answers[question.question_id] === 'True'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                True
              </button>
              <button
                onClick={() => handleAnswer('False')}
                className={`py-4 rounded-lg border-2 font-medium transition-colors ${
                  answers[question.question_id] === 'False'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                False
              </button>
            </div>
          )}

          {question.question_type === 'fill_blank' && (
            <div>
              <input
                type="text"
                placeholder="Enter your answer..."
                value={answers[question.question_id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        {currentQuestion < test.questions.length - 1 ? (
          <Button onClick={handleNext}>Next Question</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </Button>
        )}
      </div>
    </div>
  );
}
