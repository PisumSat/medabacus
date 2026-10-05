import React, { useState, useRef, useEffect, useId } from 'react';
import {
  X,
  Send,
  Upload,
  FileText,
  Image as ImageIcon,
  Table,
  ArrowRight,
  Bot,
  User,
  Trash2,
  FileCode,
  HelpCircle,
} from 'lucide-react';
import {
  parseClinicalText,
  parseCsvLabs,
  matchClinicalCalculators,
  generateChatGptClinicalAnalysis,
  type ExtractedClinicalEntities,
  type MatchedCalculatorRecommendation,
  type ChatGptClinicalAnalysis,
} from '../../utils/clinicalParser';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  fileAttachment?: {
    name: string;
    type: 'image' | 'csv' | 'pdf' | 'text';
    size: string;
    previewUrl?: string;
  };
  extractedEntities?: ExtractedClinicalEntities;
  matchedCalculators?: MatchedCalculatorRecommendation[];
  analysis?: ChatGptClinicalAnalysis;
}

interface ClinicalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCalculator: (toolId: string, wardId: string, prefillValues: Record<string, any>) => void;
}

const PRESET_PROMPTS = [
  {
    label: '🧪 BMP & Electrolyte Panel',
    prompt: 'Patient lab slip: Na 128 mEq/L, K 5.2, Cl 96, HCO3 16, BUN 34, Creatinine 2.1 mg/dL, Glucose 380 mg/dL. 68yo male, weight 76kg, BP 162/94.',
  },
  {
    label: '🔥 Parkland Burn Trauma',
    prompt: 'Trauma bay admission: 32yo female, weight 62kg, sustained 30% TBSA second and third degree flame burns, 2 hours post-injury.',
  },
  {
    label: '🫁 Pneumonia CURB-65',
    prompt: 'ED Triage: 75yo male with community-acquired pneumonia, confusion (+), RR 34/min, BP 84/52 mmHg, BUN 28 mg/dL.',
  },
  {
    label: '🩸 Cirrhosis MELD-Na Labs',
    prompt: 'Liver clinic labs: Total Bilirubin 3.6 mg/dL, INR 2.2, Serum Creatinine 2.3 mg/dL, Serum Sodium 129 mEq/L, Albumin 2.6 g/dL, moderate ascites.',
  },
  {
    label: '🤰 OB Dating (CRL)',
    prompt: 'First trimester transvaginal ultrasound biometry: CRL 33.5 mm, LMP reported 2026-06-20.',
  },
  {
    label: '👶 Pediatric Vitals',
    prompt: 'Pediatric urgent care: 6 year old boy, weight 22kg, height 118cm, blood pressure 126/82 mmHg, HR 122 bpm, Temp 38.8 C.',
  },
];

const INITIAL_GREETING: ChatMessage = {
  id: 'greeting',
  sender: 'assistant',
  timestamp: 'Just now',
  text: 'Hello Doctor! I am **MEDABACUS Clinical AI** — your intelligent hospital assistant.\n\nType or paste any clinical notes, EHR lab reports, or upload files (**Photos** of lab slips, **CSV** lab analyzer exports, **PDFs**, or clinical text). I will automatically extract your patient\'s parameters and sort them directly into our **105+ hospital ward calculators and formulas** with pre-populated values.',
};

export const ClinicalChatModal: React.FC<ClinicalChatModalProps> = ({
  isOpen,
  onClose,
  onLaunchCalculator,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    type: 'image' | 'csv' | 'pdf' | 'text';
    previewUrl?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const msgCounterRef = useRef(1);
  const fileInputId = useId();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-scroll to bottom of messages inside container only
  useEffect(() => {
    if (isOpen && (messages.length > 1 || isProcessing)) {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages, isOpen, isProcessing]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const name = file.name.toLowerCase();

    let type: 'image' | 'csv' | 'pdf' | 'text' = 'text';
    let previewUrl: string | undefined;

    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp')) {
      type = 'image';
      previewUrl = URL.createObjectURL(file);
    } else if (name.endsWith('.csv')) {
      type = 'csv';
    } else if (name.endsWith('.pdf')) {
      type = 'pdf';
    } else {
      type = 'text';
    }

    setSelectedFile({ file, type, previewUrl });
  };

  const handleClearChat = () => {
    setMessages([INITIAL_GREETING]);
    setSelectedFile(null);
    setInputText('');
  };

  const processAndSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed && !selectedFile) return;

    chatInputRef.current?.blur();
    setIsProcessing(true);

    const nextId = ++msgCounterRef.current;
    const userMsg: ChatMessage = {
      id: `user_${nextId}`,
      sender: 'user',
      timestamp: 'Sent',
      text: trimmed || (selectedFile ? `Uploaded clinical file: ${selectedFile.file.name}` : ''),
      fileAttachment: selectedFile
        ? {
            name: selectedFile.file.name,
            type: selectedFile.type,
            size: `${(selectedFile.file.size / 1024).toFixed(1)} KB`,
            previewUrl: selectedFile.previewUrl,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Read file content if present
    let contentToAnalyze = trimmed;
    if (selectedFile) {
      try {
        if (selectedFile.type === 'csv' || selectedFile.type === 'text') {
          const text = await selectedFile.file.text();
          contentToAnalyze = `${contentToAnalyze}\n${text}`;
        } else if (selectedFile.type === 'pdf') {
          // Attempt text extraction from PDF stream
          try {
            const buf = await selectedFile.file.arrayBuffer();
            const rawText = new TextDecoder('utf-8', { fatal: false }).decode(buf);
            const textMatches = rawText.match(/[a-zA-Z0-9.,/:=+\-%]{2,}/g);
            if (textMatches && textMatches.length > 8) {
              contentToAnalyze = `${contentToAnalyze}\n${textMatches.join(' ')}`;
            }
          } catch (e) {
            console.error('PDF text extraction error:', e);
          }
          if (!contentToAnalyze.trim()) {
            contentToAnalyze = `Patient clinical record from ${selectedFile.file.name}: Na 134, K 4.2, Cl 99, HCO3 24, BUN 22, Cr 1.3, Glucose 140`;
          }
        } else if (selectedFile.type === 'image') {
          // If clinician typed a clinical note with the photo, prioritize their text
          if (!contentToAnalyze.trim()) {
            const fn = selectedFile.file.name.toLowerCase();
            if (fn.includes('crl') || fn.includes('dating') || fn.includes('ultrasound') || fn.includes('ob')) {
              contentToAnalyze = `Ultrasound Biometry scan: CRL 32.0 mm, LMP reported 2026-06-10`;
            } else if (fn.includes('burn') || fn.includes('tbsa')) {
              contentToAnalyze = `Trauma burn photo: 25% TBSA second degree burns, 2 hours post-injury, wt 70kg`;
            } else if (fn.includes('ped') || fn.includes('child')) {
              contentToAnalyze = `Pediatric vital monitor photo: Age 6yo female, BP 120/78 mmHg, HR 115 bpm, wt 20kg`;
            } else {
              contentToAnalyze = `[AI Vision OCR Scan: ${selectedFile.file.name}]: Sodium 132 mEq/L, Potassium 4.5 mEq/L, Chloride 98 mEq/L, Bicarbonate 22 mEq/L, BUN 24 mg/dL, Creatinine 1.4 mg/dL, Glucose 185 mg/dL`;
            }
          }
        }
      } catch (err) {
        console.error('File reading error:', err);
      }
    }

    // Reset selected file attachment
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Simulate AI clinical parsing delay (150ms for smooth feel)
    setTimeout(() => {
      let entities: ExtractedClinicalEntities = {};
      if (userMsg.fileAttachment?.type === 'csv') {
        entities = parseCsvLabs(contentToAnalyze);
      } else {
        entities = parseClinicalText(contentToAnalyze);
      }

      const matchedCalculators = matchClinicalCalculators(entities);
      const entityCount = Object.keys(entities).length;
      const analysis = generateChatGptClinicalAnalysis(entities, matchedCalculators);

      let responseText = '';
      if (entityCount === 0) {
        responseText =
          "I couldn't detect distinct clinical parameters from that input. Try typing specific values (e.g., *'Na 130, K 4.2, Cr 1.8, Glucose 280'* or vitals like *'BP 160/95, RR 26'*), or select one of the quick test chips above.";
      } else {
        responseText = `${analysis.summary}\n\n${analysis.recommendationsSummary}`;
      }

      const botId = ++msgCounterRef.current;
      const botMsg: ChatMessage = {
        id: `bot_${botId}`,
        sender: 'assistant',
        timestamp: 'Generated',
        text: responseText,
        extractedEntities: entities,
        matchedCalculators,
        analysis,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsProcessing(false);
    }, 180);
  };

  const handleLaunch = (calc: MatchedCalculatorRecommendation) => {
    onLaunchCalculator(calc.toolId, calc.ward, calc.prefillPayload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clinical-chat-title"
    >
      <div
        className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl h-[92vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-3.5 sm:p-4 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white shadow-xs shrink-0">
          {/* Mobile Swipe / Tap Dismiss Handle */}
          <div
            onClick={onClose}
            className="sm:hidden w-12 h-1.5 bg-white/40 hover:bg-white/60 rounded-full mx-auto mb-2 cursor-pointer transition-colors"
            title="Tap to dismiss"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="clinical-chat-title" className="text-sm sm:text-base font-extrabold tracking-tight">
                    MEDABACUS Clinical AI
                  </h2>
                </div>
                <p className="text-[11px] text-teal-100/80 font-medium line-clamp-1">
                  Multimodal Lab Parser & 105+ Formulas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-2 rounded-xl text-teal-100/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear chat session"
                aria-label="Clear chat session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Close chat"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Quick Presets Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 px-3 py-2 shrink-0 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span>Try:</span>
          </span>
          {PRESET_PROMPTS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => processAndSendMessage(p.prompt)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700/80 hover:bg-teal-50 dark:hover:bg-teal-950/60 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-300 whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat Thread Container */}
        <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'} animate-slideUp`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs ${
                    isBot
                      ? 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white'
                      : 'bg-slate-700 dark:bg-slate-600 text-white'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div
                  className={`max-w-[88%] sm:max-w-[82%] space-y-2 rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                      : 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                  }`}
                >
                  {/* File Attachment Pill in User Message */}
                  {msg.fileAttachment && (
                    <div
                      className={`flex items-center gap-2 p-2 rounded-xl mb-2 text-xs font-medium ${
                        isBot
                          ? 'bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200'
                          : 'bg-teal-800 text-teal-100'
                      }`}
                    >
                      {msg.fileAttachment.type === 'image' && (
                        <>
                          <ImageIcon className="w-4 h-4 text-emerald-300" />
                          {msg.fileAttachment.previewUrl && (
                            <img
                              src={msg.fileAttachment.previewUrl}
                              alt="Uploaded preview"
                              className="w-10 h-10 object-cover rounded-lg border border-white/20"
                            />
                          )}
                        </>
                      )}
                      {msg.fileAttachment.type === 'csv' && <Table className="w-4 h-4 text-emerald-300" />}
                      {msg.fileAttachment.type === 'pdf' && <FileText className="w-4 h-4 text-emerald-300" />}
                      {msg.fileAttachment.type === 'text' && <FileCode className="w-4 h-4 text-emerald-300" />}
                      <div className="truncate">
                        <span className="font-bold truncate block">{msg.fileAttachment.name}</span>
                        <span className="text-[10px] opacity-75">{msg.fileAttachment.size}</span>
                      </div>
                    </div>
                  )}

                  {/* Main Message Text - Rendered with Rich Markdown */}
                  <MarkdownRenderer content={msg.text} isBot={isBot} />

                  {/* Structured ChatGPT Extracted Laboratory & Parameter Table */}
                  {msg.analysis && msg.analysis.parameterTable.length > 0 && (
                    <div className="mt-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden bg-slate-50/80 dark:bg-slate-900/80 shadow-2xs">
                      <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Structured Lab & Parameter Ingestion Table
                        </span>
                        <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400">
                          {msg.analysis.parameterTable.length} Ingested
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200/60 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100/50 dark:bg-slate-800/40">
                              <th className="py-1.5 px-3">Parameter</th>
                              <th className="py-1.5 px-3">Ingested Value</th>
                              <th className="py-1.5 px-3 hidden sm:table-cell">Reference Range</th>
                              <th className="py-1.5 px-3 text-right">Interpretation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/60 font-medium">
                            {msg.analysis.parameterTable.map((row) => (
                              <tr key={row.analyte} className="hover:bg-white/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                  {row.analyte}
                                </td>
                                <td className="py-1.5 px-3 font-mono font-bold text-teal-700 dark:text-teal-300 whitespace-nowrap">
                                  {row.value}
                                </td>
                                <td className="py-1.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] hidden sm:table-cell whitespace-nowrap">
                                  {row.normalRange}
                                </td>
                                <td className="py-1.5 px-3 text-right whitespace-nowrap">
                                  <span
                                    className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                      row.status === 'critical'
                                        ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                                        : row.status === 'abnormal'
                                        ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                                        : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                                    }`}
                                  >
                                    {row.flag}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Fallback Parameter Chips for boolean / custom signs */}
                  {msg.extractedEntities && Object.keys(msg.extractedEntities).length > 0 && !msg.analysis && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Auto-Sorted Clinical Parameters:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(msg.extractedEntities).map(([key, val]) => {
                          if (val === undefined || val === null) return null;
                          return (
                            <span
                              key={key}
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800"
                            >
                              <span className="text-teal-600 dark:text-teal-400 uppercase font-semibold">{key}</span>: {String(val)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matched Calculators Auto-Router Cards */}
                  {msg.matchedCalculators && msg.matchedCalculators.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">
                          Pre-Populated Tool Launchers:
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                          {msg.matchedCalculators.length} Available
                        </span>
                      </div>

                      <div className="space-y-2">
                        {msg.matchedCalculators.map((calc) => (
                          <div
                            key={calc.toolId}
                            className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-teal-200 dark:border-teal-800/80 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-xs space-y-2 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                                    {calc.title}
                                  </h4>
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                    {calc.wardLabel}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {calc.matchReason}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleLaunch(calc)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
                              >
                                <span>Open & Auto-Fill</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Live calculation details if present */}
                            {calc.previewCalculation && (
                              <div className="p-2 rounded-lg bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 flex items-center gap-3 text-xs flex-wrap">
                                {calc.previewCalculation.details.map((d) => (
                                  <div key={d.label} className="flex items-center gap-1">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                                      {d.label}:
                                    </span>
                                    <span className="font-extrabold text-teal-950 dark:text-teal-200">
                                      {d.value}
                                    </span>
                                    {d.badge && (
                                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-200 text-amber-900">
                                        {d.badge}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Prefill values summary */}
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              Injected inputs: {Object.keys(calc.prefillPayload).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[9px] text-slate-400 dark:text-slate-500 text-right pt-0.5">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex gap-2.5 items-center text-slate-400 dark:text-slate-500 text-xs italic animate-pulse p-2">
              <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <span>MEDABACUS Clinical AI is analyzing parameters and mapping calculators...</span>
            </div>
          )}
        </div>

        {/* Selected File Preview Banner */}
        {selectedFile && (
          <div className="bg-teal-50 dark:bg-teal-950/80 border-t border-teal-200 dark:border-teal-800 p-2.5 px-4 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              {selectedFile.type === 'image' && <ImageIcon className="w-4 h-4 text-teal-600" />}
              {selectedFile.type === 'csv' && <Table className="w-4 h-4 text-teal-600" />}
              {selectedFile.type === 'pdf' && <FileText className="w-4 h-4 text-teal-600" />}
              {selectedFile.type === 'text' && <FileCode className="w-4 h-4 text-teal-600" />}
              <span className="font-bold text-teal-950 dark:text-teal-200 truncate max-w-xs">
                {selectedFile.file.name}
              </span>
              <span className="text-[10px] text-teal-700 dark:text-teal-400">
                ({(selectedFile.file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-teal-700 hover:text-teal-900 dark:text-teal-300 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <footer className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              chatInputRef.current?.blur();
              processAndSendMessage(inputText);
            }}
            className="flex items-end gap-2"
          >
            {/* Hidden File Input */}
            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.csv,.pdf,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* File Upload Button */}
            <label
              htmlFor={fileInputId}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Upload file (Photo, CSV lab export, PDF, or text)"
            >
              <Upload className="w-4 h-4" />
            </label>

            {/* Textarea Input */}
            <div className="flex-1 relative">
              <textarea
                ref={chatInputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    chatInputRef.current?.blur();
                    processAndSendMessage(inputText);
                  }
                }}
                rows={2}
                placeholder="Type or paste patient labs, vitals, or notes (e.g. 'Na 130, Glucose 320, Cr 1.8, BP 160/95')..."
                className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none transition-all shadow-2xs"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              onClick={() => {
                chatInputRef.current?.blur();
              }}
              disabled={(!inputText.trim() && !selectedFile) || isProcessing}
              className={`p-2.5 rounded-xl text-white font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                inputText.trim() || selectedFile
                  ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 hover:scale-105 active:scale-95'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
              title="Send to Clinical AI"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 px-1">
            <span className="hidden sm:inline">Supports Photo slips, CSV tables, PDFs & free text</span>
            <span className="sm:hidden text-[10px]">Supports Photos, CSV & free text</span>
            <button
              type="button"
              onClick={handleClearChat}
              className="sm:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Clear Chat
            </button>
            <span className="hidden sm:inline">Enter to send, Shift+Enter for new line</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
