import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Brain, Calendar, Loader2, Filter as FilterIcon, Trash2, CheckSquare, Square, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchApi, HomeworkSearchResult, FlashcardSearchResult } from '@/services/searchApi';
import { utilityApi, BatchGenerateResponse } from '@/services/utilityApi';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { BatchProgress } from '@/components/BatchProgress';
import { SUBJECTS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import type { Subject } from '@/types/homework';

type LibraryView = 'homework' | 'flashcards';

export function LibraryPage() {
  const [activeView, setActiveView] = useState<LibraryView>('homework');
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<Subject | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [homeworkResults, setHomeworkResults] = useState<HomeworkSearchResult[]>([]);
  const [flashcardResults, setFlashcardResults] = useState<FlashcardSearchResult[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'homework' | 'flashcard' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Batch operations state
  const [selectedHomework, setSelectedHomework] = useState<Set<string>>(new Set());
  const [batchProgressOpen, setBatchProgressOpen] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchGenerateResponse | null>(null);

  useEffect(() => {
    if (activeView === 'homework') {
      searchHomework();
    } else {
      searchFlashcards();
    }
  }, [activeView, currentPage]);

  const searchHomework = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await searchApi.searchHomework({
        query: searchTerm || undefined,
        subject: subjectFilter !== 'all' ? subjectFilter : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: pageSize,
        skip: (currentPage - 1) * pageSize,
      });

      setHomeworkResults(response.homework);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search homework');
    } finally {
      setIsLoading(false);
    }
  };

  const searchFlashcards = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await searchApi.searchFlashcards({
        query: searchTerm || undefined,
        subject: subjectFilter !== 'all' ? subjectFilter : undefined,
        limit: 50, // Show more flashcards since they're smaller items
      });

      setFlashcardResults(response.flashcard_sets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page
    if (activeView === 'homework') {
      searchHomework();
    } else {
      searchFlashcards();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSubjectFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string, type: 'homework' | 'flashcard') => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      if (itemToDelete.type === 'homework') {
        await utilityApi.deleteHomework(itemToDelete.id);
        setHomeworkResults((prev) => prev.filter((item) => item.homework_id !== itemToDelete.id));
        // Remove from selection if it was selected
        setSelectedHomework((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemToDelete.id);
          return newSet;
        });
      } else {
        await utilityApi.deleteFlashcardSet(itemToDelete.id);
        setFlashcardResults((prev) => prev.filter((item) => item.set_id !== itemToDelete.id));
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  // Batch operations handlers
  const toggleHomeworkSelection = (homeworkId: string) => {
    setSelectedHomework((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(homeworkId)) {
        newSet.delete(homeworkId);
      } else {
        newSet.add(homeworkId);
      }
      return newSet;
    });
  };

  const selectAllUnsolved = () => {
    const unsolvedIds = homeworkResults
      .filter((item) => !item.has_solution)
      .map((item) => item.homework_id);
    setSelectedHomework(new Set(unsolvedIds));
  };

  const clearSelection = () => {
    setSelectedHomework(new Set());
  };

  const handleBatchGenerate = async () => {
    if (selectedHomework.size === 0) return;

    setBatchProgressOpen(true);
    setIsBatchProcessing(true);
    setBatchResults(null);

    try {
      const results = await utilityApi.batchGenerateSolutions(Array.from(selectedHomework));
      setBatchResults(results);

      // Refresh homework list to show newly generated solutions
      await searchHomework();

      // Clear selection
      clearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate solutions');
      setBatchProgressOpen(false);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const unsolvedCount = homeworkResults.filter((item) => !item.has_solution).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Library
        </h1>
        <p className="text-gray-600">
          Browse and search your homework solutions and flashcards
        </p>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeView === 'homework' ? 'default' : 'outline'}
          onClick={() => {
            setActiveView('homework');
            setCurrentPage(1);
          }}
          className="flex-1 sm:flex-none"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Homework
        </Button>
        <Button
          variant={activeView === 'flashcards' ? 'default' : 'outline'}
          onClick={() => {
            setActiveView('flashcards');
            setCurrentPage(1);
          }}
          className="flex-1 sm:flex-none"
        >
          <Brain className="h-4 w-4 mr-2" />
          Flashcards
        </Button>
      </div>

      {/* Batch Operations Controls */}
      {activeView === 'homework' && unsolvedCount > 0 && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Batch Solution Generation
                </h3>
                <p className="text-sm text-blue-700">
                  {selectedHomework.size > 0
                    ? `${selectedHomework.size} homework selected • Max 10 at a time`
                    : `${unsolvedCount} unsolved homework available`}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedHomework.size > 0 ? (
                  <>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear Selection
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleBatchGenerate}
                      disabled={selectedHomework.size === 0 || selectedHomework.size > 10}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate {selectedHomework.size} Solution{selectedHomework.size !== 1 ? 's' : ''}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={selectAllUnsolved}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Select All Unsolved
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                Search
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Subject Filter */}
              <div className="flex-1">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value as any)}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">All Subjects</option>
                  {Object.entries(SUBJECTS).map(([code, subject]) => (
                    <option key={code} value={code}>
                      {subject.icon} {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filters (Homework only) */}
              {activeView === 'homework' && (
                <>
                  <div className="flex-1">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="From date"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="To date"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button variant="outline" onClick={clearFilters}>
                <FilterIcon className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Searching...</p>
          </div>
        </div>
      )}

      {/* Results - Homework */}
      {!isLoading && activeView === 'homework' && (
        <>
          {homeworkResults.length > 0 ? (
            <div className="space-y-4">
              {homeworkResults.map((item) => (
                <Card key={item.homework_id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Checkbox for unsolved homework */}
                        {!item.has_solution && (
                          <button
                            onClick={() => toggleHomeworkSelection(item.homework_id)}
                            className="flex-shrink-0 mt-1 text-blue-600 hover:text-blue-700"
                          >
                            {selectedHomework.has(item.homework_id) ? (
                              <CheckSquare className="h-5 w-5" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        )}

                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            item.subject === 'math' ? 'bg-blue-100' :
                            item.subject === 'science' ? 'bg-green-100' :
                            'bg-purple-100'
                          }`}>
                            <BookOpen className={`h-6 w-6 ${
                              item.subject === 'math' ? 'text-blue-600' :
                              item.subject === 'science' ? 'text-green-600' :
                              'text-purple-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <CardTitle className="truncate">
                              {item.extracted_text.substring(0, 60)}...
                            </CardTitle>
                            <Badge variant="secondary">
                              {SUBJECTS[item.subject as keyof typeof SUBJECTS]?.name}
                            </Badge>
                            {item.has_solution && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Solved
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Created {formatDate(item.created_at)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {item.has_solution && item.solution_id && (
                          <Link to={`/solution/${item.solution_id}`}>
                            <Button variant="outline" size="sm">
                              View Solution
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteClick(item.homework_id, 'homework');
                          }}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No homework found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || subjectFilter !== 'all' || dateFrom || dateTo
                    ? 'Try adjusting your filters'
                    : 'Start by scanning some homework'}
                </p>
                <Link to="/scan">
                  <Button>Scan Homework</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Results - Flashcards */}
      {!isLoading && activeView === 'flashcards' && (
        <>
          {flashcardResults.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcardResults.map((set) => (
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
                            handleDeleteClick(set.set_id, 'flashcard');
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
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No flashcard sets found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || subjectFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create flashcards from your homework solutions'}
                </p>
                <Link to="/scan">
                  <Button>Scan Homework</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        message={
          itemToDelete?.type === 'homework'
            ? 'Are you sure you want to delete this homework? This will also delete the solution, practice tests, and flashcards associated with it.'
            : 'Are you sure you want to delete this flashcard set? This action cannot be undone.'
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Batch Progress Dialog */}
      <BatchProgress
        isOpen={batchProgressOpen}
        onClose={() => {
          setBatchProgressOpen(false);
          setBatchResults(null);
        }}
        isProcessing={isBatchProcessing}
        results={batchResults?.results}
        totalProcessed={batchResults?.total_processed}
        successful={batchResults?.successful}
        failed={batchResults?.failed}
        skipped={batchResults?.skipped}
      />
    </div>
  );
}
