import axios from "axios";
import { JSDOM } from "jsdom";
import { log } from "@/lib/logger";

const FETCH_TIMEOUT_MS = 10000;
const MAX_CONTENT_LENGTH = 5000; // Limit content to avoid huge prompts

/**
 * Fetches and extracts the main text content from an article URL.
 * Returns the article text or null if fetching fails.
 */
export async function fetchArticleContent(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout: FETCH_TIMEOUT_MS,
      headers: {
        "User-Agent": "Pena-Betica-Escocesa/1.0",
        Accept: "text/html",
      },
      maxRedirects: 3,
    });

    const html = response.data;
    if (typeof html !== "string") {
      return null;
    }

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove script, style, nav, header, footer, aside elements
    const elementsToRemove = document.querySelectorAll(
      "script, style, nav, header, footer, aside, .sidebar, .comments, .advertisement, .social-share",
    );
    elementsToRemove.forEach((el: Element) => el.remove());

    // Try to find article content in common containers
    const articleSelectors = [
      "article",
      '[role="main"]',
      ".article-content",
      ".post-content",
      ".entry-content",
      ".content",
      "main",
    ];

    let content = "";
    for (const selector of articleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        content = element.textContent || "";
        break;
      }
    }

    // Fallback to body if no article container found
    if (!content) {
      content = document.body?.textContent || "";
    }

    // Clean up the text
    content = content
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n\s*\n/g, "\n") // Remove multiple newlines
      .trim();

    // Truncate if too long
    if (content.length > MAX_CONTENT_LENGTH) {
      content = content.substring(0, MAX_CONTENT_LENGTH) + "...";
    }

    return content || null;
  } catch (error) {
    log.error("Failed to fetch article content", error, { url });
    return null;
  }
}
