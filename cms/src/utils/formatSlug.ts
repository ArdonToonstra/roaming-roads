const format = (val: string): string =>
  val
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase();

const formatSlug = (fallback: string) => ({ value, data }: { value?: string; data?: { title?: string } }) => {
  if (typeof value === 'string' && value.trim().length) {
    return format(value);
  }

  if (data?.title && typeof data.title === 'string' && data.title.trim().length) {
    return format(data.title);
  }

  // If no value or title is present, use the fallback string but format it
  // so we never return raw input that could be invalid as a slug.
  return format(String(fallback || 'untitled'));
};

export default formatSlug;
