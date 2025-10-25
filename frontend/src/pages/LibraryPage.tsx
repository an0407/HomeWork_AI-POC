import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, Award, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatters';

// Mock data
const mockItems = [
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
    title: 'Chemistry Elements Set',
    subject: 'science' as const,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'homework' | 'practice' | 'flashcard'>('all');

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Library
        </h1>
        <p className="text-gray-600">
          Browse all your homework solutions, practice tests, and flashcards
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'homework' ? 'default' : 'outline'}
            onClick={() => setFilterType('homework')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Homework
          </Button>
          <Button
            variant={filterType === 'practice' ? 'default' : 'outline'}
            onClick={() => setFilterType('practice')}
          >
            <Award className="h-4 w-4 mr-2" />
            Tests
          </Button>
          <Button
            variant={filterType === 'flashcard' ? 'default' : 'outline'}
            onClick={() => setFilterType('flashcard')}
          >
            <Brain className="h-4 w-4 mr-2" />
            Flashcards
          </Button>
        </div>
      </div>

      {/* Results */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {item.type === 'homework' && (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      {item.type === 'practice' && (
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                      {item.type === 'flashcard' && (
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Brain className="h-6 w-6 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="truncate">{item.title}</CardTitle>
                        {item.type === 'practice' && item.score !== undefined && (
                          <Badge variant="secondary">{item.score}%</Badge>
                        )}
                      </div>
                      <CardDescription>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {formatDate(item.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <Link
                    to={
                      item.type === 'homework' ? `/solution/${item.id}` :
                      item.type === 'practice' ? `/practice/results/${item.id}` :
                      `/flashcards/study/${item.id}`
                    }
                  >
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try a different search term' : 'Start by solving some homework or taking a practice test'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
