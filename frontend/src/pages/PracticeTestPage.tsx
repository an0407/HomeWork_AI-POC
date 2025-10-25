import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PracticeTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Mock data - will be replaced with API
  const mockTest = {
    questions: [
      {
        question_number: 1,
        question_text: 'What is the derivative of x²?',
        question_type: 'mcq' as const,
        options: ['x', '2x', 'x²', '2'],
      },
      {
        question_number: 2,
        question_text: 'Is the speed of light constant in vacuum?',
        question_type: 'true_false' as const,
      },
    ],
  };

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < mockTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = () => {
    navigate(`/practice/results/${id}`);
  };

  const question = mockTest.questions[currentQuestion];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Practice Test
          </h1>
          <p className="text-gray-600">
            Question {currentQuestion + 1} of {mockTest.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-5 w-5" />
          <span className="font-mono">15:30</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{
              width: `${((currentQuestion + 1) / mockTest.questions.length) * 100}%`,
            }}
          />
        </div>
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
                    answers[currentQuestion] === option
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
                onClick={() => handleAnswer('true')}
                className={`py-4 rounded-lg border-2 font-medium transition-colors ${
                  answers[currentQuestion] === 'true'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                True
              </button>
              <button
                onClick={() => handleAnswer('false')}
                className={`py-4 rounded-lg border-2 font-medium transition-colors ${
                  answers[currentQuestion] === 'false'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                False
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        {currentQuestion < mockTest.questions.length - 1 ? (
          <Button onClick={handleNext}>
            Next Question
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit Test
          </Button>
        )}
      </div>
    </div>
  );
}
