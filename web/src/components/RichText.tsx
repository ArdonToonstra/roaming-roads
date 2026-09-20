import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';

// Content fields (activities, preparations, descriptions, visa info) are
// authored as plain Markdown strings in the content/ JSON files.
const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="font-heading font-bold text-2xl my-2">{children}</h1>,
  h2: ({ children }) => <h2 className="font-heading font-bold text-xl my-2">{children}</h2>,
  h3: ({ children }) => <h3 className="font-heading font-bold text-lg my-2">{children}</h3>,
  h4: ({ children }) => <h4 className="font-heading font-bold text-base my-2">{children}</h4>,
  h5: ({ children }) => <h5 className="font-heading font-bold text-sm my-2">{children}</h5>,
  h6: ({ children }) => <h6 className="font-heading font-bold text-xs my-2">{children}</h6>,
  p: ({ children }) => <p className="mb-2">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-6 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ children }) => <code className="bg-gray-100 px-1 rounded text-sm">{children}</code>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline text-[#2A9D8F] hover:text-[#F57D50] transition-colors"
    >
      {children}
    </a>
  ),
};

export interface RichTextProps {
  content?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

export default function RichText({ content, className = '', style }: RichTextProps) {
  if (!content) return null;

  return (
    <div className={className} style={style}>
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}
