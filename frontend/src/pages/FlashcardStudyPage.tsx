import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function FlashcardStudyPage() {
  const { id } = useParams();
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Mock data
  const mockSet = {
    set_name: 'Algebra Basics',
    cards: [
      {
        card_id: '1',
        question: 'What is the quadratic formula?',
        answer: 'x = (-b ± √(b² - 4ac)) / (2a)',
        hint: 'Used to solve ax² + bx + c = 0',
      },
      {
        card_id: '2',
        question: 'Define a linear equation',
        answer: 'An equation of the form y = mx + b, where m is the slope and b is the y-intercept',
      },
    ],
  };

  const card = mockSet.cards[currentCard];
  const progress = ((currentCard + 1) / mockSet.cards.length) * 100;

  const handleNext = () => {
    if (currentCard < mockSet.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link to="/flashcards">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mockSet.set_name}
            </h1>
            <p className="text-gray-600">
              Card {currentCard + 1} of {mockSet.cards.length}
            </p>
          </div>
          <Badge variant="secondary">
            {Math.round(progress)}% Complete
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="mb-8 perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <Card className="min-h-[400px] cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] p-8">
            {!isFlipped ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">QUESTION</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {card.question}
                </h2>
                {card.hint && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                    <p className="text-sm text-blue-900">
                      <strong>Hint:</strong> {card.hint}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-8">
                  Click to reveal answer
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">ANSWER</p>
                <h2 className="text-2xl font-bold text-green-700 mb-6">
                  {card.answer}
                </h2>
                <p className="text-sm text-gray-500 mt-8">
                  Click to see question
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="text-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(!isFlipped);
            }}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Flip Card
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentCard === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentCard === mockSet.cards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Completion */}
      {currentCard === mockSet.cards.length - 1 && isFlipped && (
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="py-6 text-center">
            <p className="text-green-800 font-medium mb-2">
              You've reviewed all cards!
            </p>
            <Button
              onClick={() => {
                setCurrentCard(0);
                setIsFlipped(false);
              }}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
