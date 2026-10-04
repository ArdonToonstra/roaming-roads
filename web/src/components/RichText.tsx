import React from 'react'

/**
 * Renders the small Markdown subset the content YAML actually uses:
 * paragraphs, bullet/numbered lists (one nesting level), bold, italic,
 * inline code, strikethrough and links.
 */

// ponytail: hand-rolled instead of a markdown dependency because the exporter
// only ever emits these constructs. Swap in `marked` if the YAML grows tables,
// images or block quotes.
const INLINE =
  /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|(?<!\*)\*([^*]+)\*(?!\*)|`([^`]+)`|~~([^~]+)~~/g

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = `${keyPrefix}-${m.index}`
    const [, linkText, href, bold, italic, code, strike] = m
    if (href !== undefined) {
      const external = /^https?:\/\//.test(href)
      out.push(
        <a
          key={key}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          className="underline text-[#2A9D8F] hover:text-[#F57D50] transition-colors"
        >
          {linkText}
        </a>,
      )
    } else if (bold !== undefined) out.push(<strong key={key}>{bold}</strong>)
    else if (italic !== undefined) out.push(<em key={key}>{italic}</em>)
    else if (code !== undefined)
      out.push(
        <code key={key} className="bg-gray-100 px-1 rounded text-sm">
          {code}
        </code>,
      )
    else if (strike !== undefined) out.push(<s key={key}>{strike}</s>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

const HEADING = /^(#{1,6})\s+(.*)$/
const BULLET = /^(\s*)[-*]\s+(.*)$/
const NUMBER = /^(\s*)\d+\.\s+(.*)$/

type Item = { text: string; indent: number }

function List({ items, ordered, k }: { items: Item[]; ordered: boolean; k: string }) {
  const Tag = ordered ? 'ol' : 'ul'
  const className = ordered
    ? 'list-decimal pl-6 mb-2 space-y-1'
    : 'list-disc pl-6 mb-2 space-y-1'
  const base = items[0].indent
  const nodes: React.ReactNode[] = []
  for (let i = 0; i < items.length; i++) {
    const nested: Item[] = []
    while (i + 1 < items.length && items[i + 1].indent > base) nested.push(items[++i])
    nodes.push(
      <li key={`${k}-${i}`} className="mb-1">
        {inline(items[i].text, `${k}-${i}`)}
        {nested.length > 0 && <List items={nested} ordered={ordered} k={`${k}-${i}-n`} />}
      </li>,
    )
  }
  return <Tag className={className}>{nodes}</Tag>
}

function render(markdown: string): React.ReactNode[] {
  const lines = markdown.split('\n')
  const blocks: React.ReactNode[] = []
  let paragraph: string[] = []

  const flush = () => {
    if (!paragraph.length) return
    const text = paragraph.join('\n')
    blocks.push(
      <p key={`p-${blocks.length}`} className="mb-2 whitespace-pre-line">
        {inline(text, `p-${blocks.length}`)}
      </p>,
    )
    paragraph = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const heading = HEADING.exec(line)
    const listMatch = BULLET.exec(line) ?? NUMBER.exec(line)

    if (!line.trim()) {
      flush()
    } else if (heading) {
      flush()
      const Tag = `h${heading[1].length}` as 'h1'
      blocks.push(
        <Tag key={`h-${i}`} className="font-heading font-bold text-xl my-2">
          {inline(heading[2], `h-${i}`)}
        </Tag>,
      )
    } else if (listMatch) {
      flush()
      const ordered = BULLET.exec(line) === null
      const items: Item[] = []
      while (i < lines.length) {
        const m = ordered ? NUMBER.exec(lines[i]) : BULLET.exec(lines[i])
        if (!m) break
        items.push({ text: m[2], indent: m[1].length })
        i++
      }
      i--
      blocks.push(<List key={`l-${i}`} items={items} ordered={ordered} k={`l-${i}`} />)
    } else {
      paragraph.push(line)
    }
  }
  flush()
  return blocks
}

export interface RichTextProps {
  content: string | null | undefined
  className?: string
  style?: React.CSSProperties
}

export default function RichText({ content, className = '', style }: RichTextProps) {
  if (!content) return null
  return (
    <div className={className} style={style}>
      {render(content)}
    </div>
  )
}
