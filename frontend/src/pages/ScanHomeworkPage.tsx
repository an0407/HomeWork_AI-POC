import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, FileText, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [isRecording, setIsRecording] = useState(false);

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
        generate_audio: true,
        output_language: outputLanguage,
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
            <div className="border-2 border-gray-300 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Webcam capture coming soon!</p>
              <p className="text-sm text-gray-500">
                For now, please use the image upload option
              </p>
            </div>
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="max-w-xs mx-auto"
              />
              {audioFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {audioFile.name}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-4">
                Or record audio (coming soon)
              </p>
            </div>
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
