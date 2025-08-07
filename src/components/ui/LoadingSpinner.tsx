import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function LoadingSpinner({ size = 'md', color = 'text-blue-500' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} ${color} animate-spin`}
        style={{
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTop: '2px solid currentColor',
        }}
      />
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-bounce-slow mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xl">CBT</span>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse-slow">Memuat...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  );
}
