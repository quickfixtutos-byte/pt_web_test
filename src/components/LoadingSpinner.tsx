import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  if (variant === 'spinner') {
    return (
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-blue-600 ${className}`}
      />
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse ${className}`} />
    );
  }

  return null;
}

interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  success?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  errorText?: string;
  successText?: string;
  className?: string;
}

export function LoadingState({
  loading,
  error,
  success,
  children,
  loadingText = 'Loading...',
  errorText = 'An error occurred',
  successText = 'Success!',
  className = '',
}: LoadingStateProps) {
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 dark:text-red-400 text-center">{errorText}</p>
        {error && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</p>}
      </div>
    );
  }

  if (success) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
        <p className="text-green-600 dark:text-green-400 text-center">{successText}</p>
      </div>
    );
  }

  return <>{children}</>;
}

interface StatusIconProps {
  status: 'loading' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIcon({ status, size = 'md', className = '' }: StatusIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconClasses = {
    loading: 'animate-spin text-blue-600',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  if (status === 'loading') {
    return <Loader2 className={`${sizeClasses[size]} ${iconClasses.loading} ${className}`} />;
  }

  if (status === 'success') {
    return <CheckCircle className={`${sizeClasses[size]} ${iconClasses.success} ${className}`} />;
  }

  if (status === 'error') {
    return <XCircle className={`${sizeClasses[size]} ${iconClasses.error} ${className}`} />;
  }

  if (status === 'warning') {
    return <AlertCircle className={`${sizeClasses[size]} ${iconClasses.warning} ${className}`} />;
  }

  return null;
}
