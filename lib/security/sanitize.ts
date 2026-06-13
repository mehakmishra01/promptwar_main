import DOMPurify from "dompurify";

/**
 * Sanitize AI-generated HTML/text before rendering in the DOM.
 */
export function sanitizeAiOutput(dirty: string): string {
  if (typeof window === "undefined") {
    return dirty
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
