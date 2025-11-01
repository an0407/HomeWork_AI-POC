import { Link } from 'react-router-dom';
import { BookOpen, Camera, Mic, FileText, Brain, Award, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AI Homework Assistant</span>
          </div>
          <Link to="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Your Personal AI Homework Helper
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Get step-by-step solutions, practice with AI-generated tests, and study with interactive flashcards.
          Supports English, Tamil, and Hindi.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/scan">
            <Button size="lg" className="w-full sm:w-auto">
              Solve Homework Now
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              View Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Multiple Ways to Input Your Questions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Camera className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Image Upload</CardTitle>
              <CardDescription>
                Take a photo or upload an image of your homework
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Camera className="h-12 w-12 text-green-600 mb-2" />
              <CardTitle>Webcam Capture</CardTitle>
              <CardDescription>
                Use your device camera to capture questions instantly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>Text Input</CardTitle>
              <CardDescription>
                Type or paste your question directly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Mic className="h-12 w-12 text-orange-600 mb-2" />
              <CardTitle>Voice Input</CardTitle>
              <CardDescription>
                Speak your question in any supported language
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Comprehensive Learning Tools
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Step-by-Step Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get detailed explanations with formulas and concepts. Listen to audio narrations in your preferred language.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Practice Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Generate unlimited practice tests with MCQs, fill-in-the-blanks, and true/false questions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Smart Flashcards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create AI-powered flashcard sets for any topic and track your study progress.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Language Support */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
          <Globe className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Multilingual Support
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get solutions in English, Tamil (தமிழ்), or Hindi (हिन्दी).
            Input and output in your preferred language.
          </p>
          <Link to="/scan">
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
              Try It Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 AI Homework Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
