import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Plus, BookOpen, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { searchApi, FlashcardSearchResult } from '@/services/searchApi';
import { utilityApi } from '@/services/utilityApi';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SUBJECTS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';

export function FlashcardsLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await searchApi.searchFlashcards({
        query: searchTerm || undefined,
        limit: 50,
      });
      setFlashcardSets(response.flashcard_sets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadFlashcards();
  };

  const handleDeleteClick = (setId: string) => {
    setSetToDelete(setId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!setToDelete) return;

    setIsDeleting(true);
    try {
      await utilityApi.deleteFlashcardSet(setToDelete);
      setFlashcardSets((prev) => prev.filter((set) => set.set_id !== setToDelete));
      setDeleteDialogOpen(false);
      setSetToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete flashcard set');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSets = flashcardSets.filter((set) =>
    set.title.toLowerCase().includes(searchTerm.toLowerCase())
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Search flashcard sets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          Search
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading flashcards...</p>
          </div>
        </div>
      )}

      {/* Sets Grid */}
      {!isLoading && filteredSets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <Card key={set.set_id} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Brain className="h-8 w-8 text-purple-600 flex-shrink-0" />
                  <div className="flex gap-2">
                    <Badge variant="secondary">{set.total_cards} cards</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteClick(set.set_id);
                      }}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 h-auto px-2 py-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Link to={`/flashcards/study/${set.set_id}`}>
                  <CardTitle className="text-xl hover:text-blue-600">{set.title}</CardTitle>
                  <CardDescription>
                    {SUBJECTS[set.subject as keyof typeof SUBJECTS]?.name}
                  </CardDescription>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  Created {formatDate(set.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No flashcard sets found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : 'Create flashcards from your homework solutions'}
            </p>
            <Link to="/scan">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Scan Homework
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Flashcard Set"
        message="Are you sure you want to delete this flashcard set? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
