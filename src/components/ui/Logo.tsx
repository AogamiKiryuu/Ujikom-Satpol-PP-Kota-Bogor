import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const sizePixels = {
    sm: 32,
    md: 48,
    lg: 64
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center relative`}>
        <Image 
          src="/logo.png" 
          alt="CBT Exam Logo" 
          width={sizePixels[size]}
          height={sizePixels[size]}
          className="object-contain"
          priority
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-bold text-indigo-600 dark:text-indigo-400`}>
            CBT Exam
          </span>
          <span className="text-xs text-gray-500 -mt-1">
            Satpol PP Kota Bogor
          </span>
        </div>
      )}
    </div>
  );
}
