import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

// Base skeleton component
const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = 'md' 
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`bg-gray-200 animate-pulse ${roundedClasses[rounded]} ${className}`}
      style={style}
    />
  );
};

// Text skeleton
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lineHeight?: string;
}> = ({ lines = 1, className = '', lineHeight = 'h-4' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`${lineHeight} ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

// Avatar skeleton
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Skeleton
      className={`${sizeClasses[size]} ${className}`}
      rounded="full"
    />
  );
};

// Button skeleton
export const SkeletonButton: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32'
  };

  return (
    <Skeleton
      className={`${sizeClasses[size]} ${className}`}
      rounded="lg"
    />
  );
};

// Card skeleton
export const SkeletonCard: React.FC<{
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}> = ({ className = '', showAvatar = false, lines = 3 }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        {showAvatar && <SkeletonAvatar size="md" className="flex-shrink-0" />}
        <div className="flex-1 space-y-3">
          <SkeletonText lines={lines} />
        </div>
      </div>
    </div>
  );
};

// Bulletin skeleton
export const SkeletonBulletin: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        {/* Content sections */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              <SkeletonText lines={2} />
              <SkeletonText lines={1} />
            </div>
          </div>
          
          {/* Meetings */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="space-y-2">
              <SkeletonText lines={2} />
            </div>
          </div>
          
          {/* Leadership */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <div className="grid grid-cols-2 gap-2">
              <SkeletonText lines={1} />
              <SkeletonText lines={1} />
              <SkeletonText lines={1} />
              <SkeletonText lines={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form skeleton
export const SkeletonForm: React.FC<{
  className?: string;
  fields?: number;
}> = ({ className = '', fields = 5 }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" rounded="lg" />
        </div>
      ))}
      <div className="flex space-x-3 pt-4">
        <SkeletonButton size="md" />
        <SkeletonButton size="md" />
      </div>
    </div>
  );
};

// List skeleton
export const SkeletonList: React.FC<{
  className?: string;
  items?: number;
  showAvatar?: boolean;
}> = ({ className = '', items = 5, showAvatar = false }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          {showAvatar && <SkeletonAvatar size="sm" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Table skeleton
export const SkeletonTable: React.FC<{
  className?: string;
  rows?: number;
  columns?: number;
}> = ({ className = '', rows = 5, columns = 4 }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal skeleton
export const SkeletonModal: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-6" rounded="full" />
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          <SkeletonText lines={2} />
          <SkeletonForm fields={3} />
        </div>
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4">
          <SkeletonButton size="md" />
          <SkeletonButton size="md" />
        </div>
      </div>
    </div>
  );
};

// Page skeleton
export const SkeletonPage: React.FC<{
  className?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
}> = ({ className = '', showHeader = true, showSidebar = false }) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex items-center space-x-4">
              <SkeletonButton size="sm" />
              <SkeletonButton size="sm" />
              <SkeletonAvatar size="md" />
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-white shadow-sm border-r border-gray-200 p-4">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <SkeletonList items={6} />
            </div>
          </div>
        )}
        
        {/* Content area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <SkeletonBulletin />
            <SkeletonBulletin />
            <SkeletonBulletin />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton; 