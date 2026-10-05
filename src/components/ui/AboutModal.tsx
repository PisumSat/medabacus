import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Check, Heart, ShieldCheck, Hospital } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = 'noraseth23@gmail.com';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API unavailable
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-500 flex items-center justify-center text-white shadow-xs">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>MEDABACUS</span>
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-200/60 dark:border-teal-800">
                  Multi-Ward Suite
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hospital Clinical Calculator Suite (105+ Evidence-Based Formulas across 4 Wards)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Hospital Services Covered */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
            <span className="font-bold text-blue-900 dark:text-blue-300 block">Internal Medicine</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">KDIGO 2024, AHA/ACC, CHEST, UNOS</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
            <span className="font-bold text-amber-900 dark:text-amber-300 block">General Surgery</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">ABA Burns, WSES, RCRI, Caprini</span>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40">
            <span className="font-bold text-teal-900 dark:text-teal-300 block">OB / GYN</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">ACOG CO 700, PB 222, CMQCC, SMFM</span>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40">
            <span className="font-bold text-sky-900 dark:text-sky-300 block">Pediatrics</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">AAP Red Book, PALS, Holliday-Segar</span>
          </div>
        </div>

        {/* Creator & Contact Details */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Architecture & Development
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              Crafted by <span className="text-teal-700 dark:text-teal-400 font-extrabold">Pisum</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Origin & Brand
            </span>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="font-bold text-teal-700 dark:text-teal-400">MEDABACUS</span> &bull; Medical Abacus Clinical Decision Suite
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Contact & Feedback
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${email}`}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                title="Send email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{email}</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 cursor-pointer"
                title="Copy email address"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Evidence Guidelines Note */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Clinical Standards & Evidence Base</span>
          </div>
          <p>
            Calculations and decision trees reflect peer-reviewed consensus from KDIGO, AHA/ACC, CHEST, UNOS, ATS/IDSA, ABA, WSES, ACOG, SMFM, FIGO, RCOG, CMQCC, and AAP/PALS standards. Designed for bedside hospital reference, rapid triage, and instant EHR note generation.
          </p>
        </div>

        {/* Dismiss Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Return to Workstation
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
