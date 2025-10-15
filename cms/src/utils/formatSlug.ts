const format = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase();

const formatSlug = (fallback: string) => ({ value, data }: { value?: string; data?: { title?: string } }) => {
  if (value) {
    return format(value);
  }

  if (data?.title) {
    return format(data.title);
  }

  return fallback;
};

export default formatSlug;
