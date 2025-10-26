import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, FileText, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WebcamCapture } from '@/components/WebcamCapture';
import { AudioRecorder } from '@/components/AudioRecorder';
import { homeworkApi } from '@/services/homeworkApi';
import { solutionApi } from '@/services/solutionApi';
import { INPUT_TYPES, LANGUAGES } from '@/utils/constants';
import { validateImageFile, validateTextInput, validateAudioFile } from '@/utils/validators';
import type { InputType, Language } from '@/types/homework';

export function ScanHomeworkPage() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<InputType | null>(null);
  const [inputLanguage, setInputLanguage] = useState<Language>('en');
  const [outputLanguage, setOutputLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Capture/Recording mode states
  const [showWebcamCapture, setShowWebcamCapture] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  // Audio generation settings
  const [generateAudio, setGenerateAudio] = useState(false);
  const [audioLanguage, setAudioLanguage] = useState<Language>('en');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      setImageFile(file);
      setError(null);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateAudioFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      setAudioFile(file);
      setError(null);
    }
  };

  // Handle webcam capture
  const handleWebcamCapture = (file: File) => {
    setImageFile(file);
    setShowWebcamCapture(false);
    setError(null);
  };

  // Handle audio recording
  const handleAudioRecording = (file: File) => {
    setAudioFile(file);
    setShowAudioRecorder(false);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!selectedMethod) {
        throw new Error('Please select an input method');
      }

      // Validate inputs based on method
      if (selectedMethod === 'image' && !imageFile) {
        throw new Error('Please upload an image');
      }
      if (selectedMethod === 'text') {
        const validation = validateTextInput(textInput);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }
      if (selectedMethod === 'audio' && !audioFile) {
        throw new Error('Please upload or record audio');
      }

      // Upload homework
      const homeworkData = await homeworkApi.uploadHomework({
        input_type: selectedMethod,
        input_language: inputLanguage,
        output_language: outputLanguage,
        file: imageFile || undefined,
        text_input: textInput || undefined,
        audio_file: audioFile || undefined,
      });

      // Generate solution
      const solution = await solutionApi.generateSolution({
        homework_id: homeworkData.homework_id,
        generate_audio: generateAudio,
        output_language: outputLanguage,
        audio_language: generateAudio ? audioLanguage : undefined,
      });

      // Navigate to solution page
      navigate(`/solution/${solution.solution_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputMethod = () => {
    switch (selectedMethod) {
      case 'image':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="max-w-xs mx-auto"
              />
              {imageFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>
          </div>
        );

      case 'webcam':
        return (
          <div className="space-y-4">
            {showWebcamCapture ? (
              <WebcamCapture
                onCapture={handleWebcamCapture}
                onCancel={() => setShowWebcamCapture(false)}
              />
            ) : imageFile ? (
              <div className="space-y-4">
                <div className="border-2 border-green-300 rounded-lg p-6 bg-green-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        Photo captured successfully!
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageFile(null);
                        setShowWebcamCapture(true);
                      }}
                    >
                      Retake
                    </Button>
                  </div>
                  <p className="text-sm text-green-700">{imageFile.name}</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Capture a photo of your homework</p>
                <Button onClick={() => setShowWebcamCapture(true)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Type or paste your homework question here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[200px]"
            />
            <p className="text-sm text-gray-500">
              {textInput.length} / 5000 characters
            </p>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            {showAudioRecorder ? (
              <AudioRecorder
                onRecordingComplete={handleAudioRecording}
                onCancel={() => setShowAudioRecorder(false)}
                maxDurationSeconds={120}
              />
            ) : audioFile ? (
              <div className="space-y-4">
                <div className="border-2 border-green-300 rounded-lg p-6 bg-green-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Mic className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        Audio ready!
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAudioFile(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="text-sm text-green-700">{audioFile.name}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Record Audio Option */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Record your question</p>
                  <Button onClick={() => setShowAudioRecorder(true)}>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or upload audio file</span>
                  </div>
                </div>

                {/* Upload Audio Option */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Scan Your Homework
        </h1>
        <p className="text-gray-600">
          Choose your preferred input method and get instant solutions
        </p>
      </div>

      {/* Input Method Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {(Object.entries(INPUT_TYPES) as [InputType, typeof INPUT_TYPES[InputType]][]).map(([key, method]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all ${
              selectedMethod === key
                ? 'border-blue-600 ring-2 ring-blue-600'
                : 'hover:border-gray-400'
            }`}
            onClick={() => setSelectedMethod(key)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{method.icon}</div>
                <div>
                  <CardTitle className="text-lg">{method.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {method.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Language Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Language
          </label>
          <select
            value={inputLanguage}
            onChange={(e) => setInputLanguage(e.target.value as Language)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <option key={code} value={code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output Language
          </label>
          <select
            value={outputLanguage}
            onChange={(e) => setOutputLanguage(e.target.value as Language)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <option key={code} value={code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audio Generation Settings */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Generate Audio Explanation
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Add voice narration to the solution (can be generated later if needed)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={generateAudio}
                onChange={(e) => setGenerateAudio(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Audio Language Selector - Only shown if generateAudio is true */}
          {generateAudio && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio Language
              </label>
              <select
                value={audioLanguage}
                onChange={(e) => setAudioLanguage(e.target.value as Language)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Choose the language for voice narration (can be different from answer language)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input Area */}
      {selectedMethod && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Your Question</CardTitle>
            <CardDescription>
              {INPUT_TYPES[selectedMethod].description}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderInputMethod()}</CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedMethod || isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? 'Processing...' : 'Get Solution'}
        </Button>
      </div>
    </div>
  );
}
