import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(content: string): string {
  return DOMPurify.sanitize(content);
}
