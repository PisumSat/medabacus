import React from 'react';
import { Star } from 'lucide-react';
import { useStarredTools } from '../../context/useStarredTools';

interface StarButtonProps {
  toolId: string;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const StarButton: React.FC<StarButtonProps> = ({
  toolId,
  className = '',
  size = 'md',
}) => {
  const { isStarred, toggleStar } = useStarredTools();
  const starred = isStarred(toolId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleStar(toolId);
      }}
      className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer select-none ${
        starred
          ? 'border-amber-400/80 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-2xs'
          : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700/60'
      } ${className}`}
      title={starred ? 'Starred calculator (click to unstar)' : 'Add to Starred calculators'}
      aria-label={starred ? 'Starred' : 'Not starred'}
    >
      <Star
        className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${
          starred ? 'fill-amber-400 text-amber-500' : 'text-slate-400 dark:text-slate-500'
        }`}
      />
    </button>
  );
};
