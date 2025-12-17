import React from 'react';
import { PortableText } from '@portabletext/react';

// Types for Payload CMS rich text structure
interface PayloadRichTextNode {
  type?: string;
  tag?: string;
  children?: PayloadRichTextNode[];
  text?: string;
  format?: number;
}

interface PayloadRichTextData {
  root?: {
    children: PayloadRichTextNode[];
  };
}

// Transform Payload CMS rich text to Portable Text format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformToPortableText(data: PayloadRichTextData | PayloadRichTextNode[] | any): any[] {
  if (!data) return [];

  // Handle root wrapper
  if (data.root && data.root.children) {
    data = data.root.children;
  }

  if (!Array.isArray(data)) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((block: any) => {
    if (block.type === 'paragraph') {
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36),
        style: 'normal',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: block.children?.map((child: any) => transformChild(child)) || []
      });
    } else if (block.type === 'list') {
      // Transform list items into individual blocks with listItem property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      block.children?.forEach((item: any, _index: number) => {
        if (item.type === 'listitem') {
          blocks.push({
            _type: 'block',
            _key: Math.random().toString(36),
            style: 'normal',
            listItem: block.tag === 'ul' ? 'bullet' : 'number',
            level: 1,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            children: item.children?.map((child: any) => transformChild(child)) || []
          });
        }
      });
    } else if (block.type?.startsWith('h')) {
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36),
        style: block.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: block.children?.map((child: any) => transformChild(child)) || []
      });
    }
  });

  return blocks;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformChild(child: any): any {
  if (typeof child === 'string') {
    return {
      _type: 'span',
      _key: Math.random().toString(36),
      text: child,
      marks: []
    };
  }

  // Handle links
  if (child.type === 'link') {
    return {
      ...child,
      _type: 'payloadLink',
      _key: Math.random().toString(36),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      children: child.children?.map((c: any) => transformChild(c)) || []
    };
  }

  if (child.text !== undefined) {
    const marks: string[] = [];
    if (child.format) {
      if (child.format & 1) marks.push('strong'); // bold
      if (child.format & 2) marks.push('em'); // italic
    }

    return {
      _type: 'span',
      _key: Math.random().toString(36),
      text: child.text,
      marks
    };
  }

  return {
    _type: 'span',
    _key: Math.random().toString(36),
    text: String(child),
    marks: []
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ptComponents: any = {
  block: {
    // Render different heading levels and paragraphs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h1: ({ children }: any) => <h1 className="font-heading font-bold text-2xl my-2">{children}</h1>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h2: ({ children }: any) => <h2 className="font-heading font-bold text-xl my-2">{children}</h2>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h3: ({ children }: any) => <h3 className="font-heading font-bold text-lg my-2">{children}</h3>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h4: ({ children }: any) => <h4 className="font-heading font-bold text-base my-2">{children}</h4>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h5: ({ children }: any) => <h5 className="font-heading font-bold text-sm my-2">{children}</h5>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h6: ({ children }: any) => <h6 className="font-heading font-bold text-xs my-2">{children}</h6>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    normal: ({ children }: any) => <p className="mb-2">{children}</p>,
  },
  list: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bullet: ({ children }: any) => <ul className="list-disc pl-6 mb-2">{children}</ul>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    number: ({ children }: any) => <ol className="list-decimal pl-6 mb-2">{children}</ol>,
  },
  listItem: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bullet: ({ children }: any) => <li className="mb-1">{children}</li>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    number: ({ children }: any) => <li className="mb-1">{children}</li>,
  },
  marks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    strong: ({ children }: any) => <strong>{children}</strong>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    em: ({ children }: any) => <em>{children}</em>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: ({ children }: any) => <code className="bg-gray-100 px-1 rounded text-sm">{children}</code>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    link: ({ value, children }: any) => <a href={value?.href} target="_blank" rel="noreferrer" className="underline text-blue-600 hover:text-blue-800">{children}</a>,
  },
  types: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payloadLink: ({ value }: any) => {
      const { fields } = value;
      let href = "";

      if (fields?.linkType === 'custom') {
        href = fields.url;
      } else if (fields?.linkType === 'internal' && fields.doc?.value) {
        // Handle internal links - assuming default generic structure for now
        // This might need adjustment based on collection type ('trips', 'pages' etc)
        const slug = fields.doc.value.slug || fields.doc.value.id;
        const relationTo = fields.doc.relationTo;

        if (relationTo === 'trips') {
          href = `/trips/${slug}`;
        } else {
          href = `/${slug}`;
        }
      } else {
        // Fallback for older structure or direct mapping
        href = value.url || value.href || "#";
      }

      const newTab = fields?.newTab || value.newTab;
      const target = newTab ? "_blank" : undefined;
      const rel = newTab ? "noreferrer" : undefined;

      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className="underline text-[#2A9D8F] hover:text-[#F57D50] transition-colors"
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {value.children?.map((child: any) => {
            if (child._type === 'span') {
              const isBold = child.marks?.includes('strong');
              const isItalic = child.marks?.includes('em');
              const classes = [
                isBold ? 'font-bold' : '',
                isItalic ? 'italic' : ''
              ].filter(Boolean).join(' ');

              return (
                <span key={child._key} className={classes}>
                  {child.text}
                </span>
              );
            }
            return null;
          })}
        </a>
      );
    }
  }
};

export interface RichTextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable RichText component that handles Payload CMS rich text content
 * and renders it using PortableText with proper formatting.
 */
export default function RichText({ content, className = "", style }: RichTextProps) {
  if (!content) return null;

  // Handle plain strings
  if (typeof content === 'string') {
    return <div className={className} style={style}>{content}</div>;
  }

  // Use PortableText for rich content
  return (
    <div className={className} style={style}>
      <PortableText value={transformToPortableText(content)} components={ptComponents} />
    </div>
  );
}