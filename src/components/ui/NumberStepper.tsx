import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  label?: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  helperText?: string;
  className?: string;
  isFloat?: boolean;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit,
  helperText,
  className = '',
  isFloat = false,
}) => {
  const [localText, setLocalText] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = isFocused ? localText : String(value);

  const handleDecrement = () => {
    const next = isFloat ? Math.round((value - step) * 10) / 10 : value - step;
    if (next >= min) {
      onChange(next);
      setLocalText(String(next));
    }
  };

  const handleIncrement = () => {
    const next = isFloat ? Math.round((value + step) * 10) / 10 : value + step;
    if (next <= max) {
      onChange(next);
      setLocalText(String(next));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalText(raw);

    // Allow intermediate states while typing (empty string, minus, trailing decimal)
    if (raw === '' || raw === '-' || raw.endsWith('.')) {
      return;
    }

    const num = isFloat ? parseFloat(raw) : parseInt(raw, 10);
    if (!isNaN(num)) {
      // Notify parent immediately if it is within bounds so calculations update live
      if (num <= max && num >= min) {
        onChange(num);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = isFloat ? parseFloat(localText) : parseInt(localText, 10);
    if (isNaN(num) || localText.trim() === '') {
      // Revert to current valid value if blank
      setLocalText(String(value));
    } else {
      const clamped = Math.min(max, Math.max(min, num));
      const formatted = isFloat ? Math.round(clamped * 10) / 10 : clamped;
      setLocalText(String(formatted));
      onChange(formatted);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex justify-between items-baseline">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
          {unit && <span className="text-[10px] text-slate-400 font-medium">{unit}</span>}
        </div>
      )}

      <div className="flex items-stretch rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label="Decrease"
          className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center shrink-0 min-w-[42px] min-h-[42px]"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Numeric Input */}
        <input
          type="text"
          inputMode={isFloat ? 'decimal' : 'numeric'}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          value={displayValue}
          onFocus={(e) => {
            setIsFocused(true);
            setLocalText(String(value));
            e.target.select();
          }}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full text-center font-bold text-sm text-slate-900 dark:text-white bg-transparent border-none focus:outline-none px-2 py-2"
        />

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label="Increase"
          className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center shrink-0 min-w-[42px] min-h-[42px]"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {helperText && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
          {helperText}
        </span>
      )}
    </div>
  );
};

