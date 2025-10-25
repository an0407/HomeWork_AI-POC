import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Plus, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatters';

// Mock data
const mockSets = [
  {
    set_id: '1',
    set_name: 'Algebra Basics',
    subject: 'math' as const,
    topic: 'Algebra',
    num_cards: 15,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    set_id: '2',
    set_name: 'Physics: Motion',
    subject: 'science' as const,
    topic: 'Physics',
    num_cards: 20,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    set_id: '3',
    set_name: 'Chemistry Elements',
    subject: 'science' as const,
    topic: 'Chemistry',
    num_cards: 12,
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

export function FlashcardsLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSets = mockSets.filter(set =>
    set.set_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Flashcard Library
          </h1>
          <p className="text-gray-600">
            Study and manage your flashcard sets
          </p>
        </div>
        <Button size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create Set
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search flashcard sets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Sets Grid */}
      {filteredSets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <Link key={set.set_id} to={`/flashcards/study/${set.set_id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Brain className="h-8 w-8 text-purple-600 flex-shrink-0" />
                    <Badge variant="secondary">
                      {set.num_cards} cards
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{set.set_name}</CardTitle>
                  <CardDescription>
                    {set.topic}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    Created {formatDate(set.created_at)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No flashcard sets found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try a different search term' : 'Create your first flashcard set to get started'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Set
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
