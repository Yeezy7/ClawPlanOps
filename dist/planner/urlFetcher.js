"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchURLContent = fetchURLContent;
const https = __importStar(require("https"));
const http = __importStar(require("http"));
/**
 * Fetch text content from a URL.
 * Extracts readable text from HTML pages or returns raw text for plain text responses.
 */
async function fetchURLContent(url) {
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
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const raw = Buffer.concat(chunks).toString('utf-8');
                const contentType = res.headers['content-type'] || '';
                if (contentType.includes('text/html') || raw.includes('<html')) {
                    resolve(extractTextFromHTML(raw));
                }
                else {
                    resolve(raw);
                }
            });
            res.on('error', reject);
        })
            .on('error', (err) => {
            reject(new Error(`无法访问链接: ${err.message}`));
        })
            .on('timeout', function () {
            this.destroy();
            reject(new Error('请求超时'));
        });
    });
}
/**
 * Simple HTML-to-text extraction. Strips tags, scripts, styles,
 * and extracts meaningful text content.
 */
function extractTextFromHTML(html) {
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
//# sourceMappingURL=urlFetcher.js.map