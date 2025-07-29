import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  handleError, 
  NetworkError, 
  DatabaseError, 
  withErrorHandling, 
  withRetry,
  ErrorSeverity 
} from '../lib/errorHandler';
import { SkeletonCard, SkeletonList, SkeletonForm } from './SkeletonLoader';
import { NetworkAwareLoader } from './NetworkErrorHandler';

// Example API function that might fail
const fetchExampleData = async (): Promise<any[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate random failures
  if (Math.random() < 0.3) {
    throw new NetworkError('Failed to fetch data from server');
  }
  
  if (Math.random() < 0.2) {
    throw new DatabaseError('Database connection failed');
  }
  
  // Return mock data
  return [
    { id: 1, title: 'Example Item 1', description: 'This is an example item' },
    { id: 2, title: 'Example Item 2', description: 'Another example item' },
    { id: 3, title: 'Example Item 3', description: 'Yet another example' },
  ];
};

// Wrapped version with error handling and retry
const fetchDataWithRetry = withRetry(
  withErrorHandling(fetchExampleData, {
    component: 'ErrorHandlingExample',
    action: 'fetch_data'
  }, ErrorSeverity.MEDIUM),
  3,
  {
    component: 'ErrorHandlingExample',
    action: 'fetch_data_retry'
  }
);

export default function ErrorHandlingExample() {
  const [manualError, setManualError] = useState<string | null>(null);

  // Example query with error handling
  const { 
    data: items = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['example-data'],
    queryFn: fetchDataWithRetry,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Example of manual error handling
  const handleManualError = () => {
    try {
      // Simulate an error
      throw new Error('This is a manually triggered error for demonstration');
    } catch (error) {
      handleError(error as Error, {
        component: 'ErrorHandlingExample',
        action: 'manual_error_demo'
      }, ErrorSeverity.LOW);
    }
  };

  const handleNetworkError = () => {
    handleError(new NetworkError('Simulated network error'), {
      component: 'ErrorHandlingExample',
      action: 'network_error_demo'
    }, ErrorSeverity.HIGH);
  };

  const handleDatabaseError = () => {
    handleError(new DatabaseError('Simulated database error'), {
      component: 'ErrorHandlingExample',
      action: 'database_error_demo'
    }, ErrorSeverity.MEDIUM);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Error Handling & Skeleton Loading Demo
        </h2>
        
        <p className="text-gray-600 mb-6">
          This component demonstrates the new error handling and skeleton loading features.
          Try the buttons below to see different types of error handling in action.
        </p>

        {/* Demo Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleManualError}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Trigger Manual Error
          </button>
          
          <button
            onClick={handleNetworkError}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Simulate Network Error
          </button>
          
          <button
            onClick={handleDatabaseError}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Simulate Database Error
          </button>
        </div>

        {/* Data Display with Skeleton Loading */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Data Loading Example</h3>
          
          <NetworkAwareLoader
            isLoading={isLoading}
            error={error as Error}
            onRetry={() => refetch()}
          >
            {items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available
              </div>
            )}
          </NetworkAwareLoader>
        </div>
      </div>

      {/* Skeleton Examples */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skeleton Loading Examples</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Skeleton */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Card Skeleton</h4>
            <SkeletonCard showAvatar={true} lines={3} />
          </div>
          
          {/* List Skeleton */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">List Skeleton</h4>
            <SkeletonList items={4} showAvatar={true} />
          </div>
          
          {/* Form Skeleton */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Form Skeleton</h4>
            <SkeletonForm fields={4} />
          </div>
          
          {/* Custom Skeleton */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Custom Skeleton</h4>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Handling Features */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Handling Features</h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Automatic Error Catching:</strong> Errors are automatically caught and logged with context information.
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>User-Friendly Messages:</strong> Technical errors are converted to user-friendly messages.
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Retry Logic:</strong> Network errors automatically retry with exponential backoff.
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Error Reporting:</strong> Errors are logged and can be reported to external services.
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Network Awareness:</strong> Components adapt to network status and show appropriate messages.
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Features */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skeleton Loading Features</h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Multiple Skeleton Types:</strong> Cards, lists, forms, tables, and custom skeletons available.
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Customizable:</strong> Adjust size, lines, items, and styling to match your content.
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Smooth Animations:</strong> Built-in pulse animations for better user experience.
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Responsive:</strong> Skeletons adapt to different screen sizes and layouts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 