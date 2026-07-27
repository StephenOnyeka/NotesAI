import { decode } from 'html-entities';

/**
 * Converts HTML content into clean plain text by decoding HTML entities
 * (such as &nbsp;, &amp;, &quot;, &lt;, &gt;) and removing all HTML tags.
 */
export function stripHtmlAndDecode(html: string): string {
  if (!html) return '';
  const decoded = decode(html);
  return decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
