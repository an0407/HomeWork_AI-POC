import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Volume2, RefreshCw, BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { solutionApi } from '@/services/solutionApi';
import { flashcardApi } from '@/services/flashcardApi';
import { FeedbackForm } from '@/components/FeedbackForm';
import { SUBJECTS, LANGUAGES } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import type { Solution } from '@/types/solution';
import type { Language } from '@/types/homework';

export function SolutionPage() {
  const { id } = useParams<{ id: string }>();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Flashcard generation state
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcardSetId, setFlashcardSetId] = useState<string | null>(null);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);

  // Audio generation state
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [selectedAudioLang, setSelectedAudioLang] = useState<Language>('en');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioGenerationError, setAudioGenerationError] = useState<string | null>(null);

  // Audio element ref for playback control
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (id) {
      loadSolution(id);
    }
  }, [id]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

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

  const handlePlayAudio = async () => {
    if (!solution?.audio_url) return;

    try {
      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Create new audio element
      const audio = new Audio(solutionApi.getAudioUrl(solution.audio_url));
      audioRef.current = audio;

      // Setup event handlers
      audio.onended = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        setIsPlayingAudio(false);
        setError('Failed to play audio. Please try regenerating.');
        audioRef.current = null;
      };

      // Play audio (this returns a Promise)
      await audio.play();
      setIsPlayingAudio(true);
    } catch (err) {
      setIsPlayingAudio(false);
      setError(err instanceof Error ? err.message : 'Failed to play audio');
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!solution) return;

    setIsGeneratingFlashcards(true);
    setFlashcardError(null);
    setFlashcardSetId(null);

    try {
      const response = await flashcardApi.generateFlashcards({
        homework_id: solution.homework_id,
        num_cards: 5,
        output_language: solution.output_language,
      });

      setFlashcardSetId(response.set_id);
    } catch (err) {
      setFlashcardError(err instanceof Error ? err.message : 'Failed to generate flashcards');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!solution) return;

    // Stop any playing audio and reset state
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlayingAudio(false); // Reset playing state

    setIsGeneratingAudio(true);
    setAudioGenerationError(null);

    try {
      const response = await solutionApi.regenerateAudio(
        solution.solution_id,
        selectedAudioLang
      );

      // Update solution with new audio URL
      setSolution({ ...solution, audio_url: response.audio_url });
      setShowAudioDialog(false);
    } catch (err) {
      setAudioGenerationError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
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

          {/* Audio Actions */}
          <div className="flex gap-2 flex-wrap">
            {solution.audio_url ? (
              <>
                <Button onClick={handlePlayAudio} disabled={isPlayingAudio}>
                  <Volume2 className="h-4 w-4 mr-2" />
                  {isPlayingAudio ? 'Playing...' : 'Play Audio'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAudioDialog(true)}
                >
                  Regenerate in Different Language
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowAudioDialog(true)}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Generate Audio
              </Button>
            )}
          </div>
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

      {/* Feedback Form */}
      <div className="mb-6">
        <FeedbackForm solutionId={solution.solution_id} />
      </div>

      {/* Flashcard Generation Messages */}
      {flashcardError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {flashcardError}
        </div>
      )}

      {flashcardSetId && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span>Flashcards generated successfully!</span>
          </div>
          <Link to={`/flashcards/study/${flashcardSetId}`}>
            <Button variant="outline" size="sm" className="bg-white">
              <ExternalLink className="h-4 w-4 mr-2" />
              Study Now
            </Button>
          </Link>
        </div>
      )}

      {/* Audio Generation Dialog */}
      {showAudioDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {solution.audio_url ? 'Regenerate Audio' : 'Generate Audio'}
              </CardTitle>
              <CardDescription>
                Choose the language for voice narration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {audioGenerationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {audioGenerationError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio Language
                </label>
                <select
                  value={selectedAudioLang}
                  onChange={(e) => setSelectedAudioLang(e.target.value as Language)}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  disabled={isGeneratingAudio}
                >
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <option key={code} value={code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  The audio will explain the solution in the selected language
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAudioDialog(false);
                    setAudioGenerationError(null);
                  }}
                  disabled={isGeneratingAudio}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                >
                  {isGeneratingAudio ? 'Generating...' : solution.audio_url ? 'Regenerate' : 'Generate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="default"
          className="flex-1"
          onClick={handleGenerateFlashcards}
          disabled={isGeneratingFlashcards || !!flashcardSetId}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGeneratingFlashcards ? 'Generating...' : flashcardSetId ? 'Flashcards Created' : 'Generate Flashcards'}
        </Button>
        <Link to="/scan" className="flex-1">
          <Button variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Solve Another Problem
          </Button>
        </Link>
        <Link to="/practice" className="flex-1">
          <Button variant="outline" className="w-full">
            Practice Similar Questions
          </Button>
        </Link>
      </div>
    </div>
  );
}
