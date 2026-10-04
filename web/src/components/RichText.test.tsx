import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import RichText from './RichText'

const html = (md: string) => renderToStaticMarkup(<RichText content={md} />)

test('renders the markdown subset the content YAML uses', () => {
  expect(html('Hello **bold** and *italic* and ~~gone~~.')).toContain(
    '<p class="mb-2 whitespace-pre-line">Hello <strong>bold</strong> and <em>italic</em> and <s>gone</s>.</p>',
  )

  const link = html('See [CAB car rental](https://cab.kg/) first.')
  expect(link).toContain('href="https://cab.kg/"')
  expect(link).toContain('target="_blank"')
  expect(link).toContain('CAB car rental')

  const list = html('- one\n- two\n  - nested\n- three')
  expect(list).toContain('<ul')
  expect(list.match(/<li/g)).toHaveLength(4)
  expect(list).toContain('nested')

  expect(html('1. first\n2. second')).toContain('<ol')

  // Two paragraphs separated by a blank line, as the exporter writes them.
  expect(html('para one\n\npara two').match(/<p /g)).toHaveLength(2)

  expect(html('')).toBe('')
})
