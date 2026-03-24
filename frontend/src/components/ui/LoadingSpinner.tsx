import { cn } from '@/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
}

const sizeStyles = {
  sm: 'w-5 h-5 border-2',
  md: 'w-10 h-10 border-3',
  lg: 'w-16 h-16 border-4',
};

export function LoadingSpinner({
  size = 'md',
  label = 'Loading, please wait...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen && 'fixed inset-0 bg-gray-900/50 z-50',
        !fullScreen && 'w-full h-full min-h-[120px]',
      )}
      role="status"
      aria-label={label ?? 'Loading'}
    >
      <div
        className={cn(
          'rounded-full border-gray-300 border-t-indigo-500 animate-spin',
          sizeStyles[size],
        )}
      />
      {label && <span className="text-sm text-gray-500 font-medium">{label}</span>}
    </div>
  );
}
