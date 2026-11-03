import { marked } from "marked";
import DOMPurify from "dompurify";

let hookRegistered = false;

function ensureDOMPurifyHooks() {
  if (typeof window !== "undefined" && !hookRegistered) {
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A" && node.getAttribute("href")) {
        const href = node.getAttribute("href") || "";
        // In README documentation, external and relative web links should open safely in a new tab
        if (!href.startsWith("#")) {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        }
      }
    });
    hookRegistered = true;
  }
}

/**
 * Parses markdown into secure HTML:
 * 1. Converts Markdown to HTML using Marked
 * 2. Sanitizes HTML with DOMPurify against XSS, iframes, script execution
 * 3. Enforces target="_blank" and rel="noopener noreferrer" on all links
 */
export function renderSanitizedMarkdown(content: string): string {
  if (typeof window === "undefined" || !content) {
    return "";
  }

  ensureDOMPurifyHooks();

  const rawHtml = marked.parse(content) as string;
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });
}
