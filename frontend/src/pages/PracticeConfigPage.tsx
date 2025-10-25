import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SUBJECTS, LANGUAGES } from '@/utils/constants';
import type { Subject, Language } from '@/types/homework';
import type { Difficulty } from '@/types/practice';

export function PracticeConfigPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject>('math');
  const [topics, setTopics] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [language, setLanguage] = useState<Language>('en');

  const handleGenerate = () => {
    // Will integrate with API later
    console.log({ subject, topics, numQuestions, difficulty, language });
    navigate('/practice/test/mock-id');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Practice Test
        </h1>
        <p className="text-gray-600">
          Configure your practice test settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Test Configuration
          </CardTitle>
          <CardDescription>
            Customize your practice test based on subject and topics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {Object.entries(SUBJECTS).map(([key, subj]) => (
                <option key={key} value={key}>
                  {subj.icon} {subj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topics (comma-separated)
            </label>
            <Input
              placeholder="e.g., algebra, quadratic equations, graphs"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
            />
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
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
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
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <Button
            size="lg"
            onClick={handleGenerate}
            className="w-full"
            disabled={!topics.trim()}
          >
            Generate Practice Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
