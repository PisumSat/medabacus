import React, { useState } from 'react';
import { Check, Copy, AlertCircle, Info, AlertTriangle, Lightbulb } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isBot?: boolean;
}

// Tokenize inline markdown elements
function parseInlineMarkdown(text: string): React.ReactNode[] {
  // Regex to match inline code, bold, italic, strikethrough, and links
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/80 text-teal-800 dark:text-teal-300 font-mono text-[11px] font-semibold border border-slate-200/60 dark:border-slate-600/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold: **bold** or __bold__
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-extrabold text-slate-900 dark:text-white">
          {inner}
        </strong>
      );
    }

    // Italic: *italic* or _italic_
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      const inner = part.slice(1, -1);
      return (
        <em key={idx} className="italic text-slate-700 dark:text-slate-300">
          {inner}
        </em>
      );
    }

    // Strikethrough: ~~strike~~
    if (part.startsWith('~~') && part.endsWith('~~')) {
      const inner = part.slice(2, -2);
      return (
        <span key={idx} className="line-through text-slate-400 dark:text-slate-500">
          {inner}
        </span>
      );
    }

    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 dark:text-teal-400 underline font-semibold hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-100 shadow-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-[10px] font-mono text-slate-400 border-b border-slate-700/80">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 text-xs font-mono overflow-x-auto text-emerald-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isBot = true }) => {
  if (!content) return null;

  // Split content into blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code block ```
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <CodeBlock key={`code-${i}`} code={codeLines.join('\n')} language={language} />
      );
      continue;
    }

    // 2. Headings (# H1, ## H2, ### H3, #### H4)
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const parsed = parseInlineMarkdown(text);

        if (level === 1) {
          elements.push(
            <h1 key={`h1-${i}`} className="text-base font-black text-slate-900 dark:text-white mt-3 mb-1.5">
              {parsed}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2 key={`h2-${i}`} className="text-sm font-extrabold text-slate-900 dark:text-white mt-2.5 mb-1">
              {parsed}
            </h2>
          );
        } else if (level === 3) {
          elements.push(
            <h3 key={`h3-${i}`} className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 mt-2 mb-1">
              {parsed}
            </h3>
          );
        } else {
          elements.push(
            <h4 key={`h4-${i}`} className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 mb-0.5">
              {parsed}
            </h4>
          );
        }
        i++;
        continue;
      }
    }

    // 3. Blockquotes & GitHub-style Alerts (> [!NOTE], > [!WARNING], > quote)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      let alertType: 'note' | 'warning' | 'tip' | 'important' | null = null;

      while (i < lines.length && lines[i].trim().startsWith('>')) {
        let clean = lines[i].trim().slice(1).trim();
        if (clean.startsWith('[!NOTE]')) {
          alertType = 'note';
          clean = clean.replace('[!NOTE]', '').trim();
        } else if (clean.startsWith('[!WARNING]') || clean.startsWith('[!CAUTION]')) {
          alertType = 'warning';
          clean = clean.replace(/\[!(WARNING|CAUTION)\]/, '').trim();
        } else if (clean.startsWith('[!TIP]')) {
          alertType = 'tip';
          clean = clean.replace('[!TIP]', '').trim();
        } else if (clean.startsWith('[!IMPORTANT]')) {
          alertType = 'important';
          clean = clean.replace('[!IMPORTANT]', '').trim();
        }
        if (clean) quoteLines.push(clean);
        i++;
      }

      const alertStyle =
        alertType === 'warning'
          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : alertType === 'tip'
          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          : alertType === 'important'
          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          : alertType === 'note'
          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200'
          : 'bg-slate-50 dark:bg-slate-800/80 border-teal-400 dark:border-teal-700 text-slate-700 dark:text-slate-300';

      elements.push(
        <div
          key={`quote-${i}`}
          className={`my-2 p-2.5 rounded-xl border-l-4 text-xs space-y-1 shadow-2xs ${alertStyle}`}
        >
          {alertType && (
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
              {alertType === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
              {alertType === 'tip' && <Lightbulb className="w-3.5 h-3.5" />}
              {alertType === 'important' && <AlertCircle className="w-3.5 h-3.5" />}
              {alertType === 'note' && <Info className="w-3.5 h-3.5" />}
              <span>{alertType}</span>
            </div>
          )}
          {quoteLines.map((ql, qidx) => (
            <p key={qidx} className="leading-relaxed">
              {parseInlineMarkdown(ql)}
            </p>
          ))}
        </div>
      );
      continue;
    }

    // 4. Horizontal rule: --- or ***
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      elements.push(
        <hr key={`hr-${i}`} className="my-2.5 border-slate-200 dark:border-slate-700/80" />
      );
      i++;
      continue;
    }

    // 5. Markdown Tables: | col | col |
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      const tableRows: string[][] = [];

      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        const rowText = lines[i].trim();
        // Skip separator line: | --- | --- |
        if (/^\|(\s*[-:]+\s*\|)+$/.test(rowText)) {
          i++;
          continue;
        }

        const cols = rowText
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        tableRows.push(cols);
        i++;
      }

      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1);

        elements.push(
          <div
            key={`table-${i}`}
            className="my-2 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-2xs"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  {headerRow.map((col, cidx) => (
                    <th key={cidx} className="py-1.5 px-2.5 font-bold whitespace-nowrap">
                      {parseInlineMarkdown(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bodyRows.map((row, ridx) => (
                  <tr key={ridx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="py-1.5 px-2.5 whitespace-nowrap font-medium">
                        {parseInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 6. Bullet lists (- item or * item)
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-1.5 space-y-1 pl-1">
          {listItems.map((item, lidx) => (
            <li key={lidx} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
              <span>{parseInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 7. Numbered lists (1. item, 2. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: { num: string; text: string }[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const match = lines[i].trim().match(/^(\d+)\.\s+(.+)$/);
        if (match) {
          listItems.push({ num: match[1], text: match[2] });
        }
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-1.5 space-y-1 pl-1">
          {listItems.map((item, lidx) => (
            <li key={lidx} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="font-bold text-teal-700 dark:text-teal-300 font-mono text-[11px] shrink-0 min-w-4">
                {item.num}.
              </span>
              <span>{parseInlineMarkdown(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Empty lines
    if (!trimmed) {
      elements.push(<div key={`spacer-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // 9. Standard paragraphs
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {parseInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return (
    <div
      className={`space-y-1.5 text-xs sm:text-sm leading-relaxed ${
        isBot ? 'text-slate-800 dark:text-slate-100' : 'text-white'
      }`}
    >
      {elements}
    </div>
  );
};
