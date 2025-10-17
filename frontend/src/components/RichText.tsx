import React from 'react';
import { PortableText } from '@portabletext/react';

// Transform Payload CMS rich text to Portable Text format
function transformToPortableText(data: any): any[] {
  if (!data) return [];
  
  // Handle root wrapper
  if (data.root && data.root.children) {
    data = data.root.children;
  }
  
  if (!Array.isArray(data)) return [];
  
  const blocks: any[] = [];
  
  data.forEach((block: any) => {
    if (block.type === 'paragraph') {
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36),
        style: 'normal',
        children: block.children?.map((child: any) => transformChild(child)) || []
      });
    } else if (block.type === 'list') {
      // Transform list items into individual blocks with listItem property
      block.children?.forEach((item: any, index: number) => {
        if (item.type === 'listitem') {
          blocks.push({
            _type: 'block',
            _key: Math.random().toString(36),
            style: 'normal',
            listItem: block.tag === 'ul' ? 'bullet' : 'number',
            level: 1,
            children: item.children?.map((child: any) => transformChild(child)) || []
          });
        }
      });
    } else if (block.type?.startsWith('h')) {
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36),
        style: block.type,
        children: block.children?.map((child: any) => transformChild(child)) || []
      });
    }
  });
  
  return blocks;
}

function transformChild(child: any): any {
  if (typeof child === 'string') {
    return {
      _type: 'span',
      _key: Math.random().toString(36),
      text: child,
      marks: []
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

const ptComponents = {
  block: {
    // Render different heading levels and paragraphs
    h1: ({ children }: any) => <h1 className="font-heading font-bold text-2xl my-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="font-heading font-bold text-xl my-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="font-heading font-bold text-lg my-2">{children}</h3>,
    h4: ({ children }: any) => <h4 className="font-heading font-bold text-base my-2">{children}</h4>,
    h5: ({ children }: any) => <h5 className="font-heading font-bold text-sm my-2">{children}</h5>,
    h6: ({ children }: any) => <h6 className="font-heading font-bold text-xs my-2">{children}</h6>,
    normal: ({ children }: any) => <p className="mb-2">{children}</p>,
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc pl-6 mb-2">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal pl-6 mb-2">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li className="mb-1">{children}</li>,
    number: ({ children }: any) => <li className="mb-1">{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => <strong>{children}</strong>,
    em: ({ children }: any) => <em>{children}</em>,
    code: ({ children }: any) => <code className="bg-gray-100 px-1 rounded text-sm">{children}</code>,
    link: ({ value, children }: any) => <a href={value?.href} target="_blank" rel="noreferrer" className="underline text-blue-600 hover:text-blue-800">{children}</a>,
  }
};

export interface RichTextProps {
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