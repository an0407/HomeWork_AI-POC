import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SUBJECTS, LANGUAGES } from '@/utils/constants';
import { practiceApi } from '@/services/practiceApi';
import type { Subject, Language } from '@/types/homework';
import type { Difficulty } from '@/types/practice';

interface RecentSolution {
  homework_id: string;
  extracted_text: string;
  subject: string;
}

export function PracticeConfigPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject>('math');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string>('');
  const [recentSolutions, setRecentSolutions] = useState<RecentSolution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load recent solutions
  useEffect(() => {
    const loadSolutions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://192.168.5.99:8000/api/dashboard/recent-homework?limit=10');
        if (response.ok) {
          const data = await response.json();
          setRecentSolutions(data.recent_homework || []);
        }
      } catch (err) {
        console.error('Failed to load solutions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSolutions();
  }, []);

  const handleGenerate = async () => {
    if (!selectedHomeworkId) {
      setError('Please select a homework/solution to practice');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await practiceApi.generatePracticeTest({
        homework_id: selectedHomeworkId,
        question_count: numQuestions,
        difficulty,
        output_language: language,
      });

      navigate(`/practice/test/${response.test_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate practice test');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Practice Test
        </h1>
        <p className="text-gray-600">
          Select a solution and configure your practice test settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Test Configuration
          </CardTitle>
          <CardDescription>
            Customize your practice test based on selected homework
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recent Solutions Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Homework/Solution
            </label>
            {isLoading ? (
              <p className="text-sm text-gray-600">Loading solutions...</p>
            ) : recentSolutions.length > 0 ? (
              <select
                value={selectedHomeworkId}
                onChange={(e) => {
                  setSelectedHomeworkId(e.target.value);
                  const selected = recentSolutions.find((s) => s.homework_id === e.target.value);
                  if (selected) {
                    setSubject(selected.subject as Subject);
                  }
                }}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">-- Select a solution --</option>
                {recentSolutions.map((solution) => (
                  <option key={solution.homework_id} value={solution.homework_id}>
                    {solution.extracted_text.substring(0, 50)}... ({solution.subject})
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
                No recent homework found. Please solve a homework problem first to create a practice test.
              </div>
            )}
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions: {numQuestions}
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full"
              disabled={!selectedHomeworkId}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5</span>
              <span>20</span>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  disabled={!selectedHomeworkId}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    difficulty === level
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              disabled={!selectedHomeworkId}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            size="lg"
            onClick={handleGenerate}
            className="w-full"
            disabled={!selectedHomeworkId || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Practice Test'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
