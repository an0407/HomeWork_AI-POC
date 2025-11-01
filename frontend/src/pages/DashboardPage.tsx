import { Link } from 'react-router-dom';
import { BookOpen, Award, Brain, Clock, TrendingUp, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatters';

// Mock data - will be replaced with API calls
const mockStats = {
  total_homework: 24,
  total_practice_tests: 8,
  total_flashcard_sets: 5,
  avg_practice_score: 85,
  study_streak_days: 7,
  total_study_time_minutes: 320,
};

const mockRecentActivities = [
  {
    id: '1',
    type: 'homework' as const,
    title: 'Quadratic Equations Problem',
    subject: 'math' as const,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    type: 'practice' as const,
    title: 'Physics Motion Test',
    subject: 'science' as const,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    score: 90,
  },
  {
    id: '3',
    type: 'flashcard' as const,
    title: 'Chemistry Elements',
    subject: 'science' as const,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600">
            Track your learning progress and continue studying
          </p>
        </div>
        <Link to="/scan">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Homework
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Homework Solved
            </CardTitle>
            <BookOpen className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.total_homework}</div>
            <p className="text-xs text-gray-600 mt-1">
              Total problems solved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Practice Tests
            </CardTitle>
            <Award className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.total_practice_tests}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Avg score: {mockStats.avg_practice_score}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Flashcard Sets
            </CardTitle>
            <Brain className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.total_flashcard_sets}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Study sets created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Study Streak
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.study_streak_days} days
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest homework, tests, and study sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {activity.type === 'homework' && (
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'practice' && (
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    {activity.type === 'flashcard' && (
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      {activity.score !== undefined && (
                        <Badge variant="secondary">
                          {activity.score}%
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      {formatDate(activity.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump back into learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/scan">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Scan Homework
              </Button>
            </Link>
            <Link to="/practice">
              <Button className="w-full justify-start" variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Take Practice Test
              </Button>
            </Link>
            <Link to="/flashcards">
              <Button className="w-full justify-start" variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                Study Flashcards
              </Button>
            </Link>
            <Link to="/library">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Library
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Study Time Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>This Week's Progress</CardTitle>
          <CardDescription>
            Total study time: {Math.floor(mockStats.total_study_time_minutes / 60)} hours {mockStats.total_study_time_minutes % 60} minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            <p>Chart visualization will be implemented with Recharts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
