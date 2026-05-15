import * as https from 'https';
import * as http from 'http';

/**
 * Fetch text content from a URL.
 * Extracts readable text from HTML pages or returns raw text for plain text responses.
 */
export async function fetchURLContent(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;

    client
      .get(url, { timeout: 15000 }, (res) => {
        // Handle redirects
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchURLContent(res.headers.location).then(resolve).catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: 无法访问该链接`));
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');
          const contentType = res.headers['content-type'] || '';

          if (contentType.includes('text/html') || raw.includes('<html')) {
            resolve(extractTextFromHTML(raw));
          } else {
            resolve(raw);
          }
        });
        res.on('error', reject);
      })
      .on('error', (err: Error) => {
        reject(new Error(`无法访问链接: ${err.message}`));
      })
      .on('timeout', function (this: http.ClientRequest) {
        this.destroy();
        reject(new Error('请求超时'));
      });
  });
}

/**
 * Simple HTML-to-text extraction. Strips tags, scripts, styles,
 * and extracts meaningful text content.
 */
function extractTextFromHTML(html: string): string {
  // Remove scripts and styles
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Replace block elements with newlines
    .replace(/<\/(div|p|h[1-6]|li|tr|br|article|section|header|footer|main)[^>]*>/gi, '\n')
    .replace(/<br[^>]*\/?>/gi, '\n')
    // Remove all remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode common entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x?[0-9a-f]+;/gi, ' ')
    .replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Remove empty lines and keep only substantial content
  const lines = text.split('\n').filter((line) => {
    const trimmed = line.trim();
    return trimmed.length > 5 || /^[#\-\d]/.test(trimmed);
  });

  return lines.join('\n');
}
