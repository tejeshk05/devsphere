import { marked } from "marked";
import DOMPurify from "dompurify";

let hookRegistered = false;

function ensureDOMPurifyHooks() {
  if (typeof window !== "undefined" && !hookRegistered) {
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      // 1. External & internal web links open safely in a new tab
      if (node.tagName === "A" && node.getAttribute("href")) {
        const href = node.getAttribute("href") || "";
        if (!href.startsWith("#")) {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        }
      }

      // 2. Images: smooth lazy loading and graceful broken image hiding
      if (node.tagName === "IMG") {
        node.setAttribute("loading", "lazy");
        // Hide broken image placeholder boxes if raw asset 404s
        node.setAttribute("onerror", "this.style.opacity='0';this.style.display='none';");
      }
    });
    hookRegistered = true;
  }
}

/**
 * Parses markdown into secure, mobile-optimized HTML:
 * 1. Resolves relative GitHub image URLs to raw.githubusercontent.com
 * 2. Converts Markdown to HTML using Marked
 * 3. Sanitizes HTML with DOMPurify against XSS and unsafe script injection
 * 4. Enforces target="_blank" and rel="noopener noreferrer" on all links
 */
export function renderSanitizedMarkdown(
  content: string,
  owner?: string,
  repo?: string,
  defaultBranch: string = "main"
): string {
  if (typeof window === "undefined" || !content) {
    return "";
  }

  ensureDOMPurifyHooks();

  let processed = content;

  // Resolve relative GitHub image links to official raw content CDN
  if (owner && repo) {
    const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch || "main"}`;

    // Markdown relative images: ![alt](images/banner.png) -> ![alt](https://raw.githubusercontent.com/...)
    processed = processed.replace(
      /!\[([^\]]*)\]\((?!https?:\/\/|data:image\/|\/)([^)]+)\)/g,
      (match, alt, path) => {
        const cleanPath = path.trim().replace(/^\.?\//, "");
        return `![${alt}](${rawBase}/${cleanPath})`;
      }
    );

    // HTML relative images: <img src="images/banner.png" ... />
    processed = processed.replace(
      /<img\s+([^>]*?)src=["'](?!https?:\/\/|data:image\/|\/)([^"']+)["']([^>]*?)>/gi,
      (match, prefix, src, suffix) => {
        const cleanPath = src.trim().replace(/^\.?\//, "");
        return `<img ${prefix}src="${rawBase}/${cleanPath}"${suffix}>`;
      }
    );
  }

  const rawHtml = marked.parse(processed) as string;

  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel", "loading", "onerror", "style"],
  });
}
