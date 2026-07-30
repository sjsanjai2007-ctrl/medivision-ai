'use client';

// ============================================================
// MediVision AI – High-Contrast Formatted Markdown Renderer
// Guaranteed 100% visible deep dark text (#0f172a) for Headings,
// Bold (**text**), Bullet Lists (* • -), and Dividers (---).
// ============================================================

import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export default function FormattedMarkdown({ content, className = '' }: FormattedMarkdownProps) {
  if (!content) return null;

  const lines = content.split('\n');

  const renderedBlocks: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      renderedBlocks.push(
        <ul key={`ul-${renderedBlocks.length}`} className="my-2 space-y-1.5 pl-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      const italicMatch = remaining.match(/(\*|_)(.*?)\1/);

      let firstMatch: { type: 'bold' | 'italic'; index: number; length: number; content: string } | null = null;

      if (boldMatch && boldMatch.index !== undefined) {
        firstMatch = { type: 'bold', index: boldMatch.index, length: boldMatch[0].length, content: boldMatch[1] };
      }
      if (italicMatch && italicMatch.index !== undefined) {
        if (!firstMatch || italicMatch.index < firstMatch.index) {
          firstMatch = { type: 'italic', index: italicMatch.index, length: italicMatch[0].length, content: italicMatch[2] };
        }
      }

      if (!firstMatch) {
        parts.push(remaining);
        break;
      }

      if (firstMatch.index > 0) {
        parts.push(remaining.substring(0, firstMatch.index));
      }

      if (firstMatch.type === 'bold') {
        parts.push(
          <strong key={`b-${key++}`} className="font-extrabold text-[#0f172a]">
            {firstMatch.content}
          </strong>
        );
      } else {
        parts.push(
          <em key={`i-${key++}`} className="italic text-[#1e293b]">
            {firstMatch.content}
          </em>
        );
      }

      remaining = remaining.substring(firstMatch.index + firstMatch.length);
    }

    return parts;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Divider line ---
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      renderedBlocks.push(
        <hr key={`hr-${index}`} className="my-3 border-t border-slate-300" />
      );
      return;
    }

    // Headings: ### Heading, ## Heading, # Heading
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const headingText = headingMatch[2];

      renderedBlocks.push(
        <div key={`h-${index}`} className="mt-3.5 mb-1.5 font-black text-base text-[#0f172a] flex items-center gap-1.5">
          {parseInline(headingText)}
        </div>
      );
      return;
    }

    // Bullet points: * text, • text, - text
    const bulletMatch = trimmed.match(/^([\*\-\•])\s+(.+)$/);
    if (bulletMatch) {
      currentList.push(
        <li key={`li-${index}`} className="flex items-start gap-2 text-sm leading-relaxed text-[#1e293b]">
          <span className="text-[#0ea5e9] font-bold select-none mt-1">•</span>
          <span className="flex-1 min-w-0">{parseInline(bulletMatch[2])}</span>
        </li>
      );
      return;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // Standard paragraph line
    flushList();
    renderedBlocks.push(
      <p key={`p-${index}`} className="text-sm leading-relaxed my-1 text-[#1e293b]">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 ${className}`}>{renderedBlocks}</div>;
}
