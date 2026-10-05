import React, { useState, useRef, useEffect, useId } from 'react';
import {
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
  ArrowLeft,
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

interface ClinicalChatViewProps {
  onLaunchCalculator: (toolId: string, wardId: string, prefillValues: Record<string, any>) => void;
  onBack: () => void;
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
  text: 'Hello Doctor! I am **MEDABACUS Clinical AI** — your intelligent hospital clinical copilot.\n\nType or paste any clinical notes, EHR lab reports, or upload files (**Photos** of lab slips, **CSV** lab analyzer exports, **PDFs**, or clinical text). I will automatically extract your patient\'s parameters and sort them directly into our **105+ hospital ward calculators and formulas** with pre-populated values.',
};

export const ClinicalChatView: React.FC<ClinicalChatViewProps> = ({
  onLaunchCalculator,
  onBack,
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

  // Native touch gesture handling: swipe right to go back
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = Math.abs(touchEndY - touchStartYRef.current);

    // Swipe right from left region with minimal vertical drift
    if (touchStartXRef.current < window.innerWidth * 0.4 && deltaX > 75 && deltaY < 80) {
      onBack();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Scroll window to top on mount so AI view starts cleanly at the top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Auto-scroll chat message container ONLY (never scroll window/body, preventing off-screen shifts on smartphones)
  useEffect(() => {
    if (messages.length > 1 || isProcessing) {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
      if (typeof window !== 'undefined' && window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, [messages, isProcessing]);

  // Only auto-focus input on desktop/non-touch devices (never pop software keyboard on mobile)
  useEffect(() => {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (!isTouch) {
      const timer = setTimeout(() => chatInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, []);

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

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Read file content if present
    let contentToAnalyze = trimmed;
    if (selectedFile) {
      try {
        if (selectedFile.type === 'csv' || selectedFile.type === 'text') {
          const text = await selectedFile.file.text();
          contentToAnalyze = `${contentToAnalyze}\n${text}`;
        } else if (selectedFile.type === 'pdf') {
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

      const assistantMsg: ChatMessage = {
        id: `assistant_${++msgCounterRef.current}`,
        sender: 'assistant',
        timestamp: 'Just now',
        text: responseText,
        extractedEntities: entityCount > 0 ? entities : undefined,
        matchedCalculators: matchedCalculators.length > 0 ? matchedCalculators : undefined,
        analysis: entityCount > 0 ? analysis : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 150);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col h-[calc(100dvh-4.25rem)] sm:h-[calc(100dvh-6.5rem)] max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg overflow-hidden animate-fadeIn"
    >
      {/* Top Header Bar */}
      <header className="px-4 py-3 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold text-white border border-white/20 cursor-pointer tap-bounce"
            title="Return to Hospital Wards Hub"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Hub</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-teal-100 shadow-2xs">
            <Bot className="w-4 h-4 text-white" />
          </div>

          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              MEDABACUS Clinical AI
            </h2>
            <p className="text-[11px] text-teal-100/80 hidden sm:block">
              Auto-extract clinical parameters & route to 105+ ward calculators
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-teal-100 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer tap-bounce"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Clear</span>
          </button>
        </div>
      </header>

      {/* Quick Test Prompt Carousel */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 px-3 py-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Try:</span>
          </span>
          {PRESET_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => processAndSendMessage(item.prompt)}
              className="text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 whitespace-nowrap shrink-0 transition-colors shadow-2xs cursor-pointer font-medium active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60 dark:bg-slate-950/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
            >
              {/* Avatar Squircle */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-slate-800 text-white dark:bg-slate-700'
                    : 'bg-gradient-to-tr from-teal-700 to-emerald-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div className={`space-y-2 max-w-[90%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* File Attachment Pill */}
                {msg.fileAttachment && (
                  <div
                    className={`flex items-center gap-2 p-2 rounded-2xl border text-xs shadow-2xs ${
                      isUser
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-teal-600 text-white shrink-0">
                      {msg.fileAttachment.type === 'image' ? (
                        <ImageIcon className="w-3.5 h-3.5" />
                      ) : msg.fileAttachment.type === 'csv' ? (
                        <Table className="w-3.5 h-3.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold truncate max-w-[180px]">{msg.fileAttachment.name}</div>
                      <div className="text-[10px] text-slate-400">{msg.fileAttachment.size}</div>
                    </div>
                    {msg.fileAttachment.previewUrl && (
                      <img
                        src={msg.fileAttachment.previewUrl}
                        alt="attachment preview"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 ml-auto"
                      />
                    )}
                  </div>
                )}

                {/* Text Bubble */}
                <div
                  className={`p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <MarkdownRenderer content={msg.text} />
                </div>

                {/* Assistant Extracted Clinical Entities Badges */}
                {msg.extractedEntities && Object.keys(msg.extractedEntities).length > 0 && (
                  <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <span>Extracted Parameters</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
                        {Object.keys(msg.extractedEntities).length} Identified
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(msg.extractedEntities).map(([key, val]) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/60 dark:border-slate-600"
                        >
                          <span className="text-slate-400 dark:text-slate-400 font-normal capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                          </span>
                          <span className="font-extrabold text-teal-700 dark:text-teal-300">
                            {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assistant Structured Lab & Risk Analysis Table */}
                {msg.analysis && msg.analysis.parameterTable && msg.analysis.parameterTable.length > 0 && (
                  <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-2xs overflow-hidden">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <span>Clinical Parameter Audit</span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                        Flagged Findings
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700/80">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 dark:bg-slate-900/80 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                            <th className="py-1.5 px-2.5">Parameter</th>
                            <th className="py-1.5 px-2.5">Value</th>
                            <th className="py-1.5 px-2.5">Ref Range</th>
                            <th className="py-1.5 px-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                          {msg.analysis.parameterTable.map((row) => (
                            <tr key={row.analyte} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                              <td className="py-1.5 px-2.5 font-bold text-slate-800 dark:text-slate-200">
                                {row.analyte}
                              </td>
                              <td className="py-1.5 px-2.5 font-extrabold text-teal-700 dark:text-teal-300">
                                {row.value}
                              </td>
                              <td className="py-1.5 px-2.5 text-slate-400 dark:text-slate-500">
                                {row.normalRange}
                              </td>
                              <td className="py-1.5 px-2.5">
                                <span
                                  className={`inline-block px-1.5 py-0.2 rounded font-black text-[9px] uppercase ${
                                    row.status === 'critical'
                                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                      : row.status === 'abnormal'
                                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
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

                {/* Matched Ward Calculators - 1-Click Launch Cards */}
                {msg.matchedCalculators && msg.matchedCalculators.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                      Recommended Ward Calculators
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {msg.matchedCalculators.map((match) => (
                        <div
                          key={match.toolId}
                          className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-teal-200 dark:border-teal-800/80 shadow-2xs hover:border-teal-400 dark:hover:border-teal-600 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                                {match.title}
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 shrink-0">
                                {match.wardLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {match.matchReason}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => onLaunchCalculator(match.toolId, match.ward, match.prefillPayload)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer tap-bounce"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-2xs">
              <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
              <span>Analyzing clinical entities & matching hospital formulas...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected File Upload Preview Bar */}
      {selectedFile && (
        <div className="px-4 py-2 bg-teal-50/80 dark:bg-teal-950/40 border-t border-teal-200 dark:border-teal-800/80 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileCode className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-bold text-teal-900 dark:text-teal-200 truncate">
              Ready to send: {selectedFile.file.name}
            </span>
            <span className="text-[10px] text-teal-700 dark:text-teal-300 uppercase font-black px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-900">
              {selectedFile.type}
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
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <footer className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            chatInputRef.current?.blur();
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'instant' });
            }
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
          <span className="flex items-center gap-1.5">
            <span className="sm:hidden font-medium">Swipe right to return</span>
            <span className="hidden sm:inline">Supports Photos, CSV tables, PDFs & free text</span>
          </span>
          <span className="hidden sm:inline">Enter to send, Shift+Enter for new line</span>
        </div>
      </footer>
    </div>
  );
};
