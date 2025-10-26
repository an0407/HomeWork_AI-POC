import { CheckCircle, XCircle, SkipForward, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BatchResultItem } from '../services/utilityApi';

interface BatchProgressProps {
  isOpen: boolean;
  onClose: () => void;
  isProcessing: boolean;
  results?: BatchResultItem[];
  totalProcessed?: number;
  successful?: number;
  failed?: number;
  skipped?: number;
}

export function BatchProgress({
  isOpen,
  onClose,
  isProcessing,
  results = [],
  totalProcessed = 0,
  successful = 0,
  failed = 0,
  skipped = 0,
}: BatchProgressProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {isProcessing ? 'Processing Batch...' : 'Batch Complete'}
            </CardTitle>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">
                  Generating solutions...
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  This may take a minute
                </p>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {!isProcessing && totalProcessed > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-900">{totalProcessed}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{successful}</p>
                <p className="text-sm text-gray-600">Success</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{skipped}</p>
                <p className="text-sm text-gray-600">Skipped</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{failed}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>
          )}

          {/* Results List */}
          {!isProcessing && results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Details:</h3>
              {results.map((result, index) => (
                <div
                  key={result.homework_id}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : result.status === 'skipped'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  {result.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  {result.status === 'skipped' && (
                    <SkipForward className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  {result.status === 'failed' && (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      Homework #{index + 1}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    {result.error && (
                      <p className="text-xs text-red-600 mt-1">{result.error}</p>
                    )}
                    {result.solution_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Solution ID: {result.solution_id}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isProcessing && results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No results to display
            </div>
          )}
        </CardContent>

        {/* Footer */}
        {!isProcessing && (
          <div className="border-t p-4">
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
