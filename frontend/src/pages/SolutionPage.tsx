import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Volume2, RefreshCw, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { solutionApi } from '@/services/solutionApi';
import { SUBJECTS, LANGUAGES } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import type { Solution } from '@/types/solution';

export function SolutionPage() {
  const { id } = useParams<{ id: string }>();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (id) {
      loadSolution(id);
    }
  }, [id]);

  const loadSolution = async (solutionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await solutionApi.getSolution(solutionId);
      setSolution(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load solution');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (solution?.audio_url) {
      const audio = new Audio(solutionApi.getAudioUrl(solution.audio_url));
      audio.play();
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading solution...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Solution not found'}
        </div>
        <Link to="/dashboard" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const subject = SUBJECTS[solution.subject as keyof typeof SUBJECTS];
  const language = LANGUAGES[solution.output_language as keyof typeof LANGUAGES];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {subject?.icon} {subject?.name}
              </Badge>
              <Badge variant="outline">
                {language?.nativeName}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Solution
            </h1>
            <p className="text-sm text-gray-500">
              {formatDate(solution.created_at)}
            </p>
          </div>

          {solution.audio_url && (
            <Button onClick={handlePlayAudio} disabled={isPlayingAudio}>
              <Volume2 className="h-4 w-4 mr-2" />
              {isPlayingAudio ? 'Playing...' : 'Play Audio'}
            </Button>
          )}
        </div>
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-900">{solution.question}</p>
        </CardContent>
      </Card>

      {/* Solution Steps */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Step-by-Step Solution
        </h2>
        <div className="space-y-4">
          {solution.solution_steps.map((step) => (
            <Card key={step.step_number}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step_number}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 leading-relaxed">
                      {step.explanation}
                    </p>
                    {step.formula_used && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Formula:</p>
                        <code className="text-sm font-mono text-blue-600">
                          {step.formula_used}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Final Answer */}
      <Card className="mb-6 bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Final Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-green-900">
            {solution.final_answer}
          </p>
        </CardContent>
      </Card>

      {/* Concepts Covered */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Concepts Covered</CardTitle>
          <CardDescription>
            Key concepts used in this solution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {solution.concepts_covered.map((concept, index) => (
              <Badge key={index} variant="secondary">
                {concept}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/scan" className="flex-1">
          <Button variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Solve Another Problem
          </Button>
        </Link>
        <Link to="/practice" className="flex-1">
          <Button className="w-full">
            Practice Similar Questions
          </Button>
        </Link>
      </div>
    </div>
  );
}
