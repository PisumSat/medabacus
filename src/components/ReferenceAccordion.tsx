import React, { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

interface ReferenceAccordionProps {
  references: {
    source: string;
    title: string;
    details?: string;
  }[];
}

export const ReferenceAccordion: React.FC<ReferenceAccordionProps> = ({ references }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!references || references.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-xs font-medium text-slate-500 hover:text-teal-700 transition-colors py-1 group"
      >
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          <span>Evidence & Guidelines ({references.length})</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-2.5 space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/70 animate-fadeIn">
          {references.map((ref, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>{ref.source}: {ref.title}</span>
              </div>
              {ref.details && <div className="text-slate-600 pl-2.5 text-[11px] leading-relaxed">{ref.details}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
